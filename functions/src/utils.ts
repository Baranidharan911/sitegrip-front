import { db } from './admin';

// Incident/alert management
export async function createIncident(collection: string, monitorId: string, data: any) {
  return db.collection(collection).add({
    monitorId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function resolveIncidents(collection: string, monitorId: string) {
  const openIncidents = await db.collection(collection)
    .where('monitorId', '==', monitorId)
    .where('status', '==', 'open')
    .get();
  for (const incidentDoc of openIncidents.docs) {
    await db.collection(collection).doc(incidentDoc.id).update({
      status: 'resolved',
      resolvedAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// Monitor status update
export async function updateMonitor(monitorId: string, data: any) {
  return db.collection('monitors').doc(monitorId).update({
    ...data,
    updatedAt: new Date(),
  });
}

// Date helpers
export function now() {
  return new Date();
}

export function daysBetween(date1: Date, date2: Date) {
  return Math.ceil((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
} 