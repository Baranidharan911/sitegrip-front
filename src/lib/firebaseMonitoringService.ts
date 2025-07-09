import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Monitor, 
  CheckResult, 
  Incident, 
  MonitorSummary,
  RegionalCheckResult,
  BrowserCheckResult,
  AnomalyRecord,
  PerformanceDataPoint,
  LiveIncidentMap,
  DetailedUptimeReport,
  NotificationConfig,
  AutoRemediationAttempt
} from '../types/uptime';

// ============================
// 🔥 FIREBASE MONITORING SERVICE
// ============================

export class FirebaseMonitoringService {
  private listeners: Map<string, () => void> = new Map();
  private realTimeListeners: Map<string, () => void> = new Map();

  // ============================
  // 📊 MONITOR MANAGEMENT
  // ============================

  async createMonitor(userId: string, monitorData: Omit<Monitor, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Monitor> {
    const monitorRef = doc(collection(db, 'monitors'));
    const monitor: Monitor = {
      id: monitorRef.id,
      ...monitorData,
      userId,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      lastCheck: null,
      uptime: 100,
      lastResponseTime: null,
      ssl_cert_days_until_expiry: null,
      isActive: true,
      status: true
    };
    await setDoc(monitorRef, monitor);
    return monitor;
  }

  async getAllMonitors(userId: string): Promise<Monitor[]> {
    const monitorsRef = collection(db, 'monitors');
    const q = query(monitorsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Monitor[];
  }

  async getMonitorById(userId: string, id: string): Promise<Monitor | null> {
    const monitorRef = doc(db, 'monitors', id);
    const snapshot = await getDoc(monitorRef);
    if (snapshot.exists() && snapshot.data().userId === userId) {
      return { id: snapshot.id, ...snapshot.data() } as Monitor;
    }
    return null;
  }

  async updateMonitor(userId: string, id: string, updates: Partial<Monitor>): Promise<Monitor> {
    const monitorRef = doc(db, 'monitors', id);
    const docSnap = await getDoc(monitorRef);
    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      throw new Error('Monitor not found or access denied');
    }
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    await updateDoc(monitorRef, updateData);
    const updatedDoc = await getDoc(monitorRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Monitor;
  }

  async deleteMonitor(userId: string, id: string): Promise<void> {
    const monitorRef = doc(db, 'monitors', id);
    const docSnap = await getDoc(monitorRef);
    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      throw new Error('Monitor not found or access denied');
    }
    await deleteDoc(monitorRef);
  }

  // ============================
  // 🔍 CHECK RESULTS
  // ============================

  async saveCheckResult(userId: string, checkResult: Omit<CheckResult, 'id' | 'timestamp' | 'userId'>): Promise<CheckResult> {
    const checkRef = doc(collection(db, 'checkResults'));
    const check: CheckResult = {
      id: checkRef.id,
      ...checkResult,
      userId,
      timestamp: serverTimestamp() as any
    };
    await setDoc(checkRef, check);
    // Update monitor with latest check info
    const monitorRef = doc(db, 'monitors', checkResult.monitorId);
    const docSnap = await getDoc(monitorRef);
    if (docSnap.exists() && docSnap.data().userId === userId) {
      await updateDoc(monitorRef, {
        lastCheck: serverTimestamp(),
        status: checkResult.status,
        responseTime: checkResult.responseTime,
        updatedAt: serverTimestamp()
      });
    }
    return check;
  }

  async getMonitorChecks(userId: string, monitorId: string, limitCount: number = 100): Promise<CheckResult[]> {
    const checksRef = collection(db, 'checkResults');
    const q = query(
      checksRef,
      where('userId', '==', userId),
      where('monitorId', '==', monitorId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CheckResult[];
  }

  async saveBrowserCheckResult(result: Omit<BrowserCheckResult, 'id' | 'timestamp'> & { monitorId: string }): Promise<BrowserCheckResult> {
    const browserRef = doc(collection(db, 'browserChecks'));
    const { monitorId, ...browserResult } = result;
    const browserCheck: BrowserCheckResult = {
      id: browserRef.id,
      ...browserResult,
      timestamp: serverTimestamp() as any
    };

    await setDoc(browserRef, browserCheck);
    return browserCheck;
  }

  // ============================
  // ⚠️ INCIDENT MANAGEMENT
  // ============================

  async createIncident(incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    const incidentRef = doc(collection(db, 'incidents'));
    const incident: Incident = {
      id: incidentRef.id,
      ...incidentData,
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      status: 'open'
    };

    await setDoc(incidentRef, incident);
    return incident;
  }

  async getIncidents(monitorId?: string, userId?: string): Promise<Incident[]> {
    const incidentsRef = collection(db, 'incidents');
    let q = query(incidentsRef, orderBy('createdAt', 'desc'));
    
    if (monitorId && userId) {
      q = query(incidentsRef, where('monitorId', '==', monitorId), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    } else if (monitorId) {
      q = query(incidentsRef, where('monitorId', '==', monitorId), orderBy('createdAt', 'desc'));
    } else if (userId) {
      q = query(incidentsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Incident[];
  }

  async getIncidentById(id: string): Promise<Incident | null> {
    const incidentRef = doc(db, 'incidents', id);
    const snapshot = await getDoc(incidentRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Incident;
    }
    return null;
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    const incidentRef = doc(db, 'incidents', id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(incidentRef, updateData);
    
    const updatedDoc = await getDoc(incidentRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Incident;
  }

  async resolveIncident(id: string): Promise<Incident> {
    return this.updateIncident(id, {
      status: 'resolved',
      resolvedAt: serverTimestamp() as any
    });
  }

  async acknowledgeIncident(id: string): Promise<Incident> {
    return this.updateIncident(id, {
      status: 'acknowledged',
      acknowledgedAt: serverTimestamp() as any
    });
  }

  // ============================
  // 📈 MONITOR SUMMARY
  // ============================

  async getMonitorSummary(userId: string): Promise<MonitorSummary> {
    const monitors = await this.getAllMonitors(userId);
    const incidents = await this.getIncidents(undefined, userId); // Pass userId here
    
    const totalMonitors = monitors.length;
    const onlineMonitors = monitors.filter(m => m.status).length;
    const offlineMonitors = monitors.filter(m => !m.status).length;
    
    // Calculate average uptime
    const totalUptime = monitors.reduce((sum, m) => sum + (m.uptime || 0), 0);
    const averageUptime = totalMonitors > 0 ? totalUptime / totalMonitors : 0;
    
    // Calculate average response time
    const monitorsWithResponseTime = monitors.filter(m => m.lastResponseTime !== null);
    const totalResponseTime = monitorsWithResponseTime.reduce((sum, m) => sum + (m.lastResponseTime || 0), 0);
    const averageResponseTime = monitorsWithResponseTime.length > 0 ? totalResponseTime / monitorsWithResponseTime.length : 0;
    
    // Get recent incidents
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const incidentsLast24h = incidents.filter(i => 
      i.createdAt && new Date(i.createdAt) > oneDayAgo
    ).length;
    
    const resolvedToday = incidents.filter(i => 
      i.status === 'resolved' && 
      i.resolvedAt && 
      new Date(i.resolvedAt) > oneDayAgo
    ).length;

    return {
      totalMonitors,
      upMonitors: onlineMonitors,
      downMonitors: offlineMonitors,
      pausedMonitors: 0, // TODO: Calculate from monitor data
      avgResponseTime: averageResponseTime,
      activeIncidents: incidentsLast24h,
      uptime: `${averageUptime.toFixed(2)}%`,
      
      // Enhanced metrics
      regionalStats: [],
      protocolStats: [],
      slaCompliance: {
        target: 99.9,
        actual: averageUptime,
        compliance: averageUptime / 99.9,
        violations: 0,
        penalties: 0
      },
      anomalyAlerts: 0,
      autoRemediations: 0
    };
  }

  // ============================
  // 🔄 REAL-TIME LISTENERS
  // ============================

  subscribeToMonitors(userId: string, callback: (monitors: Monitor[]) => void): () => void {
    const monitorsRef = collection(db, 'monitors');
    const q = query(monitorsRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const monitors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Monitor[];
      callback(monitors);
    });

    this.realTimeListeners.set('monitors', unsubscribe);
    return unsubscribe;
  }

  subscribeToIncidents(userId: string, callback: (incidents: Incident[]) => void): () => void {
    const incidentsRef = collection(db, 'incidents');
    const q = query(incidentsRef, where('userId', '==', userId), where('status', '==', 'open'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      callback(incidents);
    });

    this.realTimeListeners.set('incidents', unsubscribe);
    return unsubscribe;
  }

  // ============================
  // 🧹 CLEANUP
  // ============================

  unsubscribeAll(): void {
    this.realTimeListeners.forEach(unsubscribe => unsubscribe());
    this.realTimeListeners.clear();
  }
}

// Export singleton instance
export const firebaseMonitoringService = new FirebaseMonitoringService(); 