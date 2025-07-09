import * as functions from 'firebase-functions';
import * as tls from 'tls';
import * as net from 'net';
import { db } from './admin';
import { updateMonitor, now } from './utils';

const MONITORS_COLLECTION = 'monitors';
const SSL_ALERTS_COLLECTION = 'ssl_alerts';
const EXPIRY_WARNING_DAYS = 30;

function checkSSLCert(host: string): Promise<{ valid: boolean, validTo: string, issuer: string, daysLeft: number }> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(443, host, { servername: host, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      if (!cert || !cert.valid_to) {
        socket.end();
        return reject(new Error('No certificate'));
      }
      const validTo = cert.valid_to;
      const issuer = cert.issuer && cert.issuer.O ? cert.issuer.O : (cert.issuer && cert.issuer.CN ? cert.issuer.CN : 'Unknown');
      const expiryDate = new Date(validTo);
      const nowDate = new Date();
      const daysLeft = Math.ceil((expiryDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
      resolve({
        valid: expiryDate > nowDate,
        validTo,
        issuer,
        daysLeft
      });
      socket.end();
    });
    socket.on('error', (err) => {
      reject(err);
    });
    socket.setTimeout(10000, () => {
      socket.destroy();
      reject(new Error('Timeout'));
    });
  });
}

export const scheduledSSLMonitor = functions.pubsub
  .schedule('every 60 minutes')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Starting scheduled SSL monitoring...');
    const monitorsSnapshot = await db.collection(MONITORS_COLLECTION)
      .where('url', '>=', 'https://')
      .get();

    const current = now();
    for (const docSnap of monitorsSnapshot.docs) {
      const monitor = docSnap.data();
      const monitorId = docSnap.id;
      if (!monitor.url || !monitor.url.startsWith('https://')) continue;
      try {
        const host = monitor.url.replace(/^https:\/\//, '').replace(/\/$/, '').split('/')[0];
        const ssl = await checkSSLCert(host);
        const daysUntilExpiry = ssl.daysLeft;
        const status = ssl.valid
          ? (daysUntilExpiry < 0 ? 'expired' : daysUntilExpiry < EXPIRY_WARNING_DAYS ? 'expiring_soon' : 'valid')
          : 'invalid';
        const update: any = {
          ssl_status: status,
          ssl_cert_days_until_expiry: daysUntilExpiry,
          ssl_cert_expires_at: ssl.validTo,
          ssl_cert_issuer: ssl.issuer,
          last_ssl_check: current,
        };
        await updateMonitor(monitorId, update);
        // Create or update alert for expiring/expired certs
        if (status === 'expired' || status === 'expiring_soon') {
          const alertQuery = await db.collection(SSL_ALERTS_COLLECTION)
            .where('monitor_id', '==', monitorId)
            .where('ssl_status', 'in', ['expired', 'expiring_soon'])
            .get();
          if (alertQuery.empty) {
            await db.collection(SSL_ALERTS_COLLECTION).add({
              monitor_id: monitorId,
              userId: monitor.userId, // Add userId for frontend filtering
              monitor_name: monitor.name,
              monitor_url: monitor.url,
              ssl_status: status,
              days_until_expiry: daysUntilExpiry,
              expiry_date: ssl.validTo,
              severity: status === 'expired' ? 'critical' : 'warning',
              description: `SSL certificate for ${monitor.name} is ${status.replace('_', ' ')}.`,
              created_at: current,
              updated_at: current,
            });
          }
        }
        console.log(`Checked SSL for ${monitor.url}: ${status}, ${daysUntilExpiry} days left.`);
      } catch (err) {
        console.error(`Error checking SSL for ${monitor.url}:`, err);
        await updateMonitor(monitorId, {
          ssl_status: 'invalid',
          last_ssl_check: current,
        });
      }
    }
    console.log('SSL monitoring complete.');
    return null;
  }); 