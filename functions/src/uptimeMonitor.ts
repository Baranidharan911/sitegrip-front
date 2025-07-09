import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import { db } from './admin';
import { createIncident, resolveIncidents, updateMonitor, now } from './utils';

const MONITORS_COLLECTION = 'monitors';
const INCIDENTS_COLLECTION = 'incidents';
const CHECK_RESULTS_COLLECTION = 'checkResults';
const CHECK_TIMEOUT_MS = 10000;

export const scheduledUptimeMonitor = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Starting scheduled uptime monitoring...');
    const monitorsSnapshot = await db.collection(MONITORS_COLLECTION).get();
    const current = now();

    for (const docSnap of monitorsSnapshot.docs) {
      const monitor = docSnap.data();
      const monitorId = docSnap.id;
      if (!monitor.url || !monitor.isActive) continue;
      let status = true;
      let responseTime: number | null = null;
      let httpStatus: number | null = null;
      let errorMsg = '';
      let checkStart = Date.now();
      try {
        if (monitor.type === 'http' || monitor.type === 'https') {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
          const res = await fetch(monitor.url, { method: 'GET', signal: controller.signal });
          clearTimeout(timeout);
          responseTime = Date.now() - checkStart;
          httpStatus = res.status;
          status = res.ok;
        } else if (monitor.type === 'ping') {
          // For demo: treat ping as HTTP GET (real ping requires backend or 3rd party)
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
          const res = await fetch(monitor.url, { method: 'GET', signal: controller.signal });
          clearTimeout(timeout);
          responseTime = Date.now() - checkStart;
          httpStatus = res.status;
          status = res.ok;
        } else {
          // Other types can be added here
          continue;
        }
      } catch (err: any) {
        status = false;
        responseTime = Date.now() - checkStart;
        errorMsg = err.message || 'Unknown error';
      }

      // Update monitor status in Firestore
      await updateMonitor(monitorId, {
        status,
        last_status: status ? 'up' : 'down', // Add this field for frontend compatibility
        lastCheck: current,
        lastResponseTime: responseTime,
        http_status: httpStatus,
        lastUp: status ? current : monitor.lastUp,
        lastDown: !status ? current : monitor.lastDown,
        failures_in_a_row: status ? 0 : (monitor.failures_in_a_row || 0) + 1,
      });

      // Save check result
      await db.collection(CHECK_RESULTS_COLLECTION).add({
        monitorId,
        userId: monitor.userId, // Add userId for frontend filtering
        status,
        responseTime,
        httpStatus,
        message: errorMsg,
        createdAt: current,
        timestamp: current, // Add timestamp field for frontend compatibility
      });

      // Incident management
      if (!status) {
        // If down and no open incident, create one
        await createIncident(INCIDENTS_COLLECTION, monitorId, {
          monitorId, // Add monitorId field
          userId: monitor.userId, // Add userId for frontend filtering
          title: `Monitor Down: ${monitor.name || monitor.url}`,
          description: `Monitor is DOWN. Last checked at ${current.toISOString()}`,
          status: 'open',
          severity: 'high',
          startTime: current,
          createdAt: current,
          updatedAt: current,
        });
      } else {
        // If up and there is an open incident, resolve it
        await resolveIncidents(INCIDENTS_COLLECTION, monitorId);
      }
      console.log(`Checked ${monitor.url}: ${status ? 'UP' : 'DOWN'}, responseTime=${responseTime}ms, httpStatus=${httpStatus}`);
    }
    console.log('Uptime monitoring complete.');
  }); 