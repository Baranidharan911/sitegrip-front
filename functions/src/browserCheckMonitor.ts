import * as functions from 'firebase-functions/v2';
import { chromium } from 'playwright';
import { db } from './admin';
import { createIncident, resolveIncidents, updateMonitor, now } from './utils';

const MONITORS_COLLECTION = 'monitors';
const INCIDENTS_COLLECTION = 'incidents';
const BROWSER_CHECKS_COLLECTION = 'browserChecks';

export const scheduledBrowserCheckMonitor = functions.scheduler.onSchedule({
  schedule: 'every 15 minutes',
  timeZone: 'UTC',
  memory: '1GiB', // Playwright needs more memory
  timeoutSeconds: 300,
  minInstances: 0,
  maxInstances: 1,
}, async (event) => {
  console.log('Starting scheduled browser-based monitoring...');
  const monitorsSnapshot = await db.collection(MONITORS_COLLECTION)
    .where('browserCheck.enabled', '==', true)
    .get();
  const current = now();

  for (const docSnap of monitorsSnapshot.docs) {
    const monitor = docSnap.data();
    const monitorId = docSnap.id;
    if (!monitor.url || !monitor.isActive) continue;
    let status = true;
    let errorMsg = '';
    let loadTime: number | null = null;
    let domReadyTime: number | null = null;
    let foundSelector = false;
    let checkStart = Date.now();
    try {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();
      const navRes = await page.goto(monitor.url, { timeout: 20000 });
      loadTime = Date.now() - checkStart;
      // @ts-ignore - Browser-only code runs in browser context
      domReadyTime = await page.evaluate(() => {
        // @ts-ignore - These are available in browser context
        if (document.readyState === 'complete' && performance.timing) {
          // @ts-ignore
          return performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        }
        return null;
      });
      if (monitor.browserCheck.waitForSelector) {
        try {
          await page.waitForSelector(monitor.browserCheck.waitForSelector, { timeout: 10000 });
          foundSelector = true;
        } catch (e) {
          foundSelector = false;
        }
      }
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      status = !!(navRes && navRes.ok() && (!monitor.browserCheck.waitForSelector || foundSelector));
      await browser.close();
    } catch (err: any) {
      status = false;
      errorMsg = err.message || 'Unknown error';
    }

    // Update monitor status in Firestore
    await updateMonitor(monitorId, {
      status,
      last_status: status ? 'up' : 'down', // Add this field for frontend compatibility
      lastBrowserCheck: current,
      lastUp: status ? current : monitor.lastUp,
      lastDown: !status ? current : monitor.lastDown,
      failures_in_a_row: status ? 0 : (monitor.failures_in_a_row || 0) + 1,
    });

    // Save browser check result
    await db.collection(BROWSER_CHECKS_COLLECTION).add({
      monitorId,
      userId: monitor.userId, // Add userId for frontend filtering
      status,
      loadTime,
      domReadyTime,
      foundSelector,
      message: errorMsg,
      createdAt: current,
      timestamp: current, // Add timestamp field for frontend compatibility
    });

    // Incident management
    if (!status) {
      await createIncident(INCIDENTS_COLLECTION, monitorId, {
        monitorId, // Add monitorId field
        userId: monitor.userId, // Add userId for frontend filtering
        title: `Browser Check Failed: ${monitor.name || monitor.url}`,
        description: `Browser check failed. Last checked at ${current.toISOString()}`,
        status: 'open',
        severity: 'high',
        startTime: current,
        createdAt: current,
        updatedAt: current,
      });
    } else {
      await resolveIncidents(INCIDENTS_COLLECTION, monitorId);
    }
    console.log(`Browser checked ${monitor.url}: ${status ? 'UP' : 'DOWN'}, loadTime=${loadTime}ms, foundSelector=${foundSelector}`);
  }
  console.log('Browser-based monitoring complete.');
}); 