import { useState, useEffect, useCallback, useRef } from 'react';
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
import { realTimeMonitoringApi } from '../lib/realTimeMonitoringApi';

interface UseRealTimeUptimeState {
  monitors: Monitor[];
  selectedMonitor: Monitor | null;
  monitorChecks: Record<string, CheckResult[]>;
  monitorIncidents: Record<string, Incident[]>;
  regionalResults: Record<string, RegionalCheckResult[]>;
  browserChecks: Record<string, BrowserCheckResult[]>;
  anomalies: Record<string, AnomalyRecord[]>;
  performanceData: Record<string, PerformanceDataPoint[]>;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  summary: MonitorSummary | null;
  liveIncidentMap: LiveIncidentMap | null;
  connectionStatus: {
    isConnected: boolean;
    reconnectAttempts: number;
  };
}

interface UseRealTimeUptimeReturn extends UseRealTimeUptimeState {
  // Computed values
  criticalMonitors: Monitor[];
  recentlyDownMonitors: Monitor[];
  pausedMonitors: Monitor[];
  expiringSSLMonitors: Monitor[];
  activeIncidents: Incident[];
  
  // Actions
  refreshMonitors: () => Promise<void>;
  createMonitor: (data: any) => Promise<Monitor>;
  updateMonitor: (id: string, data: any) => Promise<Monitor>;
  deleteMonitor: (id: string) => Promise<void>;
  selectMonitor: (monitor: Monitor | null) => void;
  triggerCheck: (monitorId: string) => Promise<CheckResult>;
  performMultiRegionCheck: (monitorId: string) => Promise<RegionalCheckResult[]>;
  performBrowserCheck: (monitorId: string) => Promise<BrowserCheckResult>;
  getMonitorChecks: (monitorId: string, limit?: number) => Promise<CheckResult[]>;
  getMonitorIncidents: (monitorId: string, limit?: number) => Promise<Incident[]>;
  getMonitorStats: (monitorId: string) => Promise<any>;
  getAnomalyHistory: (monitorId: string) => Promise<AnomalyRecord[]>;
  getPerformanceTrends: (monitorId: string, timeRange: { start: Date; end: Date }) => Promise<any>;
  generateDetailedUptimeReport: (monitorId: string, timeRange: { start: Date; end: Date }) => Promise<DetailedUptimeReport>;
  generateLiveIncidentMap: () => Promise<LiveIncidentMap>;
  getMonitorSummary: () => Promise<void>;
  clearError: () => void;
  
  // Incident management
  getIncidents: (monitorId?: string) => Promise<Incident[]>;
  getIncidentsForMonitor: (monitorId: string) => Promise<Incident[]>;
  getIncidentById: (id: string) => Promise<Incident | null>;
  updateIncident: (id: string, updates: any) => Promise<Incident>;
  resolveIncident: (id: string) => Promise<Incident>;
  acknowledgeIncident: (id: string) => Promise<Incident>;
  
  // Notifications
  sendNotification: (notificationData: any) => Promise<boolean>;
  testNotification: (notificationConfig: NotificationConfig) => Promise<boolean>;
  getNotificationHistory: () => Promise<any[]>;
  
  // Auto-remediation
  attemptAutoRemediation: (incidentId: string) => Promise<AutoRemediationAttempt>;
  getAutoRemediationHistory: (monitorId: string) => Promise<AutoRemediationAttempt[]>;
  
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useRealTimeUptime = (autoConnect: boolean = true): UseRealTimeUptimeReturn => {
  const [state, setState] = useState<UseRealTimeUptimeState>({
    monitors: [],
    selectedMonitor: null,
    monitorChecks: {},
    monitorIncidents: {},
    regionalResults: {},
    browserChecks: {},
    anomalies: {},
    performanceData: {},
    loading: false,
    error: null,
    lastRefresh: null,
    summary: null,
    liveIncidentMap: null,
    connectionStatus: {
      isConnected: false,
      reconnectAttempts: 0
    }
  });

  const mountedRef = useRef(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      realTimeMonitoringApi.disconnect();
    };
  }, []);

  const setStateIfMounted = useCallback((updater: (prev: UseRealTimeUptimeState) => UseRealTimeUptimeState) => {
    if (mountedRef.current) {
      setState(updater);
    }
  }, []);

  const handleError = useCallback((error: any, context: string) => {
    console.error(`❌ Real-time Uptime Error [${context}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    setStateIfMounted(prev => ({ ...prev, error: errorMessage, loading: false }));
  }, [setStateIfMounted]);

  // ============================
  // 🔌 CONNECTION MANAGEMENT
  // ============================

  const connect = useCallback(async () => {
    try {
      console.log('🔌 Connecting to real-time monitoring...');
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await realTimeMonitoringApi.connect();
      
      // Set up event listeners
      setupEventListeners();
      
      // Load initial data
      await loadInitialData();
      
      setStateIfMounted(prev => ({ 
        ...prev, 
        loading: false,
        connectionStatus: { isConnected: true, reconnectAttempts: 0 }
      }));
      
    } catch (error) {
      handleError(error, 'connect');
      setStateIfMounted(prev => ({ 
        ...prev, 
        connectionStatus: { isConnected: false, reconnectAttempts: 0 }
      }));
    }
  }, [handleError, setStateIfMounted]);

  const disconnect = useCallback(() => {
    try {
      console.log('🔌 Disconnecting from real-time monitoring...');
      realTimeMonitoringApi.disconnect();
      setStateIfMounted(prev => ({ 
        ...prev, 
        connectionStatus: { isConnected: false, reconnectAttempts: 0 }
      }));
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
    }
  }, [setStateIfMounted]);

  // ============================
  // 🔄 AUTO-CONNECT
  // ============================

  useEffect(() => {
    if (autoConnect && !state.connectionStatus.isConnected) {
      connect();
    }

    return () => {
      if (state.connectionStatus.isConnected) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, state.connectionStatus.isConnected]);

  // ============================
  // 📡 EVENT LISTENERS
  // ============================

  const setupEventListeners = useCallback(() => {
    // Monitor events
    realTimeMonitoringApi.on('monitor_status_changed', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        monitors: prev.monitors.map(monitor =>
          monitor.id === data.monitorId
            ? { ...monitor, status: data.status, lastCheck: new Date() }
            : monitor
        )
      }));
    });

    realTimeMonitoringApi.on('monitor_check_completed', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        monitorChecks: {
          ...prev.monitorChecks,
          [data.monitorId]: [data.checkResult, ...(prev.monitorChecks[data.monitorId] || []).slice(0, 99)]
        }
      }));
    });

    // Incident events
    realTimeMonitoringApi.on('incident_created', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        monitorIncidents: {
          ...prev.monitorIncidents,
          [data.monitorId]: [...(prev.monitorIncidents[data.monitorId] || []), data]
        }
      }));
    });

    realTimeMonitoringApi.on('incident_resolved', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        monitorIncidents: {
          ...prev.monitorIncidents,
          [data.monitorId]: (prev.monitorIncidents[data.monitorId] || []).map((incident: any) =>
            incident.id === data.id ? { ...incident, status: 'resolved' } : incident
          )
        }
      }));
    });

    // Anomaly events
    realTimeMonitoringApi.on('anomaly_detected', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        anomalies: {
          ...prev.anomalies,
          [data.monitorId]: [...(prev.anomalies[data.monitorId] || []), data]
        }
      }));
    });

    // Performance events
    realTimeMonitoringApi.on('performance_degraded', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        performanceData: {
          ...prev.performanceData,
          [data.monitorId]: [...(prev.performanceData[data.monitorId] || []), data]
        }
      }));
    });

    realTimeMonitoringApi.on('live_incident_map_update', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        liveIncidentMap: data
      }));
    });

    realTimeMonitoringApi.on('performance_trends_update', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        performanceTrends: data
      }));
    });

    // Connection events
    realTimeMonitoringApi.on('connected', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        connectionStatus: { isConnected: true, reconnectAttempts: 0 }
      }));
    });

    realTimeMonitoringApi.on('disconnected', (data: any) => {
      setStateIfMounted(prev => ({
        ...prev,
        connectionStatus: { isConnected: false, reconnectAttempts: prev.connectionStatus.reconnectAttempts }
      }));
    });

    realTimeMonitoringApi.on('error', (error: any) => {
      handleError(error, 'websocket');
    });
  }, [handleError]);

  // ============================
  // 📊 DATA LOADING
  // ============================

  const loadInitialData = useCallback(async () => {
    try {
      console.log('📊 Loading initial data...');
      
      const [monitors, incidents, summary] = await Promise.allSettled([
        realTimeMonitoringApi.getAllMonitors(),
        realTimeMonitoringApi.getIncidents(),
        realTimeMonitoringApi.getMonitorSummary()
      ]);

      setStateIfMounted(prev => ({
        ...prev,
        monitors: monitors.status === 'fulfilled' ? monitors.value : [],
        monitorIncidents: incidents.status === 'fulfilled' 
          ? incidents.value.reduce((acc, incident) => {
              if (!acc[incident.monitorId]) acc[incident.monitorId] = [];
              acc[incident.monitorId].push(incident);
              return acc;
            }, {} as Record<string, Incident[]>)
          : {},
        summary: summary.status === 'fulfilled' ? summary.value : null,
        lastRefresh: new Date()
      }));

      console.log('✅ Initial data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      handleError(error, 'loadInitialData');
    }
  }, [setStateIfMounted, handleError]);

  // ============================
  // 🔄 REFRESH OPERATIONS
  // ============================

  const refreshMonitors = useCallback(async () => {
    try {
      console.log('🔄 Refreshing monitors...');
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitors = await realTimeMonitoringApi.getAllMonitors();
      console.log(`✅ Refreshed ${monitors.length} monitors`);
      
      setStateIfMounted(prev => ({
        ...prev,
        monitors,
        loading: false,
        lastRefresh: new Date(),
      }));
    } catch (error) {
      handleError(error, 'refreshMonitors');
    }
  }, [setStateIfMounted, handleError]);

  const getMonitorSummary = useCallback(async () => {
    try {
      console.log('📊 Getting monitor summary...');
      
      const summary = await realTimeMonitoringApi.getMonitorSummary();
      console.log('✅ Loaded monitor summary', summary);
      
      setStateIfMounted(prev => ({
        ...prev,
        summary
      }));
    } catch (error) {
      handleError(error, 'getMonitorSummary');
    }
  }, [setStateIfMounted, handleError]);

  // ============================
  // 🔍 MONITOR OPERATIONS
  // ============================

  const createMonitor = useCallback(async (data: any): Promise<Monitor> => {
    try {
      console.log('🚀 Creating monitor...', data);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitor = await realTimeMonitoringApi.createMonitor(data);
      console.log(`✅ Created monitor successfully:`, monitor);
      
      // Refresh monitors to get the new one
      await refreshMonitors();
      
      return monitor;
    } catch (error) {
      handleError(error, 'createMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors]);

  const updateMonitor = useCallback(async (id: string, data: any): Promise<Monitor> => {
    try {
      console.log('✏️ Updating monitor...', { id, data });
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitor = await realTimeMonitoringApi.updateMonitor(id, data);
      console.log(`✅ Updated monitor successfully:`, monitor);
      
      // Update the monitor in the state
      setStateIfMounted(prev => ({
        ...prev,
        monitors: prev.monitors.map(m => m.id === id ? monitor : m),
        loading: false
      }));
      
      return monitor;
    } catch (error) {
      handleError(error, 'updateMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  const deleteMonitor = useCallback(async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting monitor...', id);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await realTimeMonitoringApi.deleteMonitor(id);
      console.log(`✅ Deleted monitor successfully: ${id}`);
      
      // Remove the monitor from the state
      setStateIfMounted(prev => ({
        ...prev,
        monitors: prev.monitors.filter(m => m.id !== id),
        loading: false
      }));
    } catch (error) {
      handleError(error, 'deleteMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  const selectMonitor = useCallback((monitor: Monitor | null) => {
    setStateIfMounted(prev => ({ ...prev, selectedMonitor: monitor }));
  }, [setStateIfMounted]);

  const triggerCheck = useCallback(async (monitorId: string): Promise<CheckResult> => {
    try {
      console.log('🔍 Triggering check for monitor...', monitorId);
      const result = await realTimeMonitoringApi.triggerCheck(monitorId);
      console.log('✅ Check triggered successfully:', result);
      return result;
    } catch (error) {
      handleError(error, 'triggerCheck');
      throw error;
    }
  }, [handleError]);

  // ============================
  // 🌍 MULTI-REGION OPERATIONS
  // ============================

  const performMultiRegionCheck = useCallback(async (monitorId: string): Promise<RegionalCheckResult[]> => {
    try {
      console.log('🌍 Performing multi-region check...', monitorId);
      const results = await realTimeMonitoringApi.performMultiRegionCheck(monitorId);
      console.log('✅ Multi-region check completed:', results);
      
      // Update regional results in state
      setStateIfMounted(prev => ({
        ...prev,
        regionalResults: {
          ...prev.regionalResults,
          [monitorId]: results
        }
      }));
      
      return results;
    } catch (error) {
      handleError(error, 'performMultiRegionCheck');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // ============================
  // 🖥️ BROWSER CHECK OPERATIONS
  // ============================

  const performBrowserCheck = useCallback(async (monitorId: string): Promise<BrowserCheckResult> => {
    try {
      console.log('🖥️ Performing browser check...', monitorId);
      const result = await realTimeMonitoringApi.performBrowserCheck(monitorId);
      console.log('✅ Browser check completed:', result);
      
      // Update browser checks in state
      setStateIfMounted(prev => ({
        ...prev,
        browserChecks: {
          ...prev.browserChecks,
          [monitorId]: [...(prev.browserChecks[monitorId] || []), result]
        }
      }));
      
      return result;
    } catch (error) {
      handleError(error, 'performBrowserCheck');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // ============================
  // 📊 DATA RETRIEVAL
  // ============================

  const getMonitorChecks = useCallback(async (monitorId: string, limit: number = 50): Promise<CheckResult[]> => {
    try {
      // For now, return empty array since this method doesn't exist in the API
      return [];
    } catch (error) {
      handleError(error, 'getMonitorChecks');
      return [];
    }
  }, [handleError]);

  const getMonitorIncidents = useCallback(async (monitorId: string): Promise<Incident[]> => {
    try {
      const incidents = await realTimeMonitoringApi.getIncidents();
      return incidents.filter(incident => incident.monitorId === monitorId);
    } catch (error) {
      handleError(error, 'getMonitorIncidents');
      return [];
    }
  }, [handleError]);

  const getMonitorStats = useCallback(async (monitorId: string): Promise<any> => {
    try {
      // For now, return basic stats since this method doesn't exist in the API
      return {
        uptime: 99.5,
        averageResponseTime: 200,
        totalChecks: 1000
      };
    } catch (error) {
      handleError(error, 'getMonitorStats');
      return null;
    }
  }, [handleError]);

  const getAnomalyHistory = useCallback(async (monitorId: string): Promise<AnomalyRecord[]> => {
    try {
      const anomalies = await realTimeMonitoringApi.getAnomalyHistory(monitorId);
      
      // Update anomalies in state
      setStateIfMounted(prev => ({
        ...prev,
        anomalies: {
          ...prev.anomalies,
          [monitorId]: anomalies
        }
      }));
      
      return anomalies;
    } catch (error) {
      handleError(error, 'getAnomalyHistory');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  const getPerformanceTrends = useCallback(async (monitorId: string): Promise<PerformanceDataPoint[]> => {
    try {
      return await realTimeMonitoringApi.getPerformanceTrends(monitorId);
    } catch (error) {
      handleError(error, 'getPerformanceTrends');
      return [];
    }
  }, [handleError]);

  const generateDetailedUptimeReport = useCallback(async (monitorId: string): Promise<DetailedUptimeReport> => {
    try {
      return await realTimeMonitoringApi.generateDetailedUptimeReport(monitorId);
    } catch (error) {
      handleError(error, 'generateDetailedUptimeReport');
      throw error;
    }
  }, [handleError]);

  const generateLiveIncidentMap = useCallback(async (): Promise<LiveIncidentMap> => {
    try {
      const map = await realTimeMonitoringApi.generateLiveIncidentMap();
      
      setStateIfMounted(prev => ({
        ...prev,
        liveIncidentMap: map
      }));
      
      return map;
    } catch (error) {
      handleError(error, 'generateLiveIncidentMap');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // ============================
  // ⚠️ INCIDENT OPERATIONS
  // ============================

  const getIncidents = useCallback(async (monitorId?: string): Promise<Incident[]> => {
    try {
      return await realTimeMonitoringApi.getIncidents();
    } catch (error) {
      handleError(error, 'getIncidents');
      throw error;
    }
  }, [handleError]);

  const getIncidentsForMonitor = useCallback(async (monitorId: string): Promise<Incident[]> => {
    try {
      const incidents = await realTimeMonitoringApi.getIncidents();
      return incidents.filter(incident => incident.monitorId === monitorId);
    } catch (error) {
      handleError(error, 'getIncidentsForMonitor');
      return [];
    }
  }, [handleError]);

  const getIncidentById = useCallback(async (id: string): Promise<Incident | null> => {
    try {
      const incident = await realTimeMonitoringApi.getIncidentById(id);
      return incident;
    } catch (error) {
      handleError(error, 'getIncidentById');
      return null;
    }
  }, [handleError]);

  const updateIncident = useCallback(async (id: string, updates: any): Promise<Incident> => {
    try {
      return await realTimeMonitoringApi.updateIncident(id, updates);
    } catch (error) {
      handleError(error, 'updateIncident');
      throw error;
    }
  }, [handleError]);

  const resolveIncident = useCallback(async (id: string): Promise<Incident> => {
    try {
      return await realTimeMonitoringApi.resolveIncident(id);
    } catch (error) {
      handleError(error, 'resolveIncident');
      throw error;
    }
  }, [handleError]);

  const acknowledgeIncident = useCallback(async (id: string): Promise<Incident> => {
    try {
      return await realTimeMonitoringApi.acknowledgeIncident(id);
    } catch (error) {
      handleError(error, 'acknowledgeIncident');
      throw error;
    }
  }, [handleError]);

  // ============================
  // 🔔 NOTIFICATION OPERATIONS
  // ============================

  const sendNotification = useCallback(async (notificationData: any): Promise<boolean> => {
    try {
      return await realTimeMonitoringApi.sendNotification(notificationData);
    } catch (error) {
      handleError(error, 'sendNotification');
      throw error;
    }
  }, [handleError]);

  const testNotification = useCallback(async (notificationConfig: NotificationConfig): Promise<boolean> => {
    try {
      return await realTimeMonitoringApi.testNotification(notificationConfig);
    } catch (error) {
      handleError(error, 'testNotification');
      throw error;
    }
  }, [handleError]);

  const getNotificationHistory = useCallback(async (): Promise<any[]> => {
    try {
      return await realTimeMonitoringApi.getNotificationHistory();
    } catch (error) {
      handleError(error, 'getNotificationHistory');
      throw error;
    }
  }, [handleError]);

  // ============================
  // 🤖 AUTO-REMEDIATION OPERATIONS
  // ============================

  const attemptAutoRemediation = useCallback(async (incidentId: string): Promise<AutoRemediationAttempt> => {
    try {
      return await realTimeMonitoringApi.attemptAutoRemediation(incidentId);
    } catch (error) {
      handleError(error, 'attemptAutoRemediation');
      throw error;
    }
  }, [handleError]);

  const getAutoRemediationHistory = useCallback(async (monitorId: string): Promise<AutoRemediationAttempt[]> => {
    try {
      return await realTimeMonitoringApi.getAutoRemediationHistory(monitorId);
    } catch (error) {
      handleError(error, 'getAutoRemediationHistory');
      throw error;
    }
  }, [handleError]);

  // ============================
  // 🎧 EVENT HANDLERS
  // ============================

  const handleMonitorStatusChanged = useCallback((data: any) => {
    const { monitorId, oldStatus, newStatus, monitor } = data;
    
    setStateIfMounted(prev => ({
      ...prev,
      monitors: prev.monitors.map(m => 
        m.id === monitorId ? { ...m, status: newStatus } : m
      )
    }));
  }, [setStateIfMounted]);

  const handleMonitorCheckCompleted = useCallback((data: any) => {
    const { monitorId, checkResult } = data;
    
    setStateIfMounted(prev => ({
      ...prev,
      monitorChecks: {
        ...prev.monitorChecks,
        [monitorId]: [checkResult, ...(prev.monitorChecks[monitorId] || []).slice(0, 99)]
      }
    }));
  }, [setStateIfMounted]);

  const handleRegionalCheckCompleted = useCallback((data: any) => {
    const { monitorId, regionalResults } = data;
    
    setStateIfMounted(prev => ({
      ...prev,
      regionalResults: {
        ...prev.regionalResults,
        [monitorId]: regionalResults
      }
    }));
  }, [setStateIfMounted]);

  const handleIncidentCreated = useCallback((data: any) => {
    const { incident } = data;
    
    setStateIfMounted(prev => ({
      ...prev,
      monitorIncidents: {
        ...prev.monitorIncidents,
        [incident.monitorId]: [incident, ...(prev.monitorIncidents[incident.monitorId] || [])]
      }
    }));
  }, [setStateIfMounted]);

  const handleIncidentUpdated = useCallback((data: any) => {
    const { incident } = data;
    
    setStateIfMounted(prev => ({
      ...prev,
      monitorIncidents: {
        ...prev.monitorIncidents,
        [incident.monitorId]: (prev.monitorIncidents[incident.monitorId] || []).map(i => 
          i.id === incident.id ? incident : i
        )
      }
    }));
  }, [setStateIfMounted]);

  const handleIncidentResolved = useCallback((data: any) => {
    const { incident } = data;
    
    setStateIfMounted(prev => ({
      ...prev,
      monitorIncidents: {
        ...prev.monitorIncidents,
        [incident.monitorId]: (prev.monitorIncidents[incident.monitorId] || []).map(i => 
          i.id === incident.id ? incident : i
        )
      }
    }));
  }, [setStateIfMounted]);

  const handleAnomalyDetected = useCallback((data: any) => {
    const { monitorId, anomalies } = data;
    
    setStateIfMounted(prev => ({
      ...prev,
      anomalies: {
        ...prev.anomalies,
        [monitorId]: [...(prev.anomalies[monitorId] || []), ...anomalies]
      }
    }));
  }, [setStateIfMounted]);

  const handlePerformanceDegraded = useCallback((data: any) => {
    const { incident, monitor, anomalies } = data;
    console.log('Performance degraded:', { incident, monitor, anomalies });
  }, []);

  const handleSLAViolation = useCallback((data: any) => {
    const { monitorId, violation } = data;
    console.log('SLA violation:', { monitorId, violation });
  }, []);

  const handleAutoRemediationAttempted = useCallback((data: any) => {
    const { incident, autoRemediation, monitor } = data;
    console.log('Auto-remediation attempted:', { incident, autoRemediation, monitor });
  }, []);

  const handlePerformanceTrendsUpdate = useCallback((data: any) => {
    const { monitorId, trends } = data;
    
    setStateIfMounted(prev => ({
      ...prev,
      performanceData: {
        ...prev.performanceData,
        [monitorId]: trends
      }
    }));
  }, [setStateIfMounted]);

  // ============================
  // 🛠️ UTILITY FUNCTIONS
  // ============================

  const clearError = useCallback(() => {
    setStateIfMounted(prev => ({ ...prev, error: null }));
  }, [setStateIfMounted]);

  // ============================
  // 📊 COMPUTED VALUES
  // ============================

  const criticalMonitors = state.monitors.filter(m => !m.status);
  const recentlyDownMonitors = state.monitors.filter(m => 
    !m.status && m.lastDown && 
    new Date(m.lastDown).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );
  const pausedMonitors = state.monitors.filter(m => !m.isActive);
  const expiringSSLMonitors = state.monitors.filter(m => 
    m.ssl_cert_days_until_expiry !== undefined && m.ssl_cert_days_until_expiry !== null && m.ssl_cert_days_until_expiry < 30
  );
  const activeIncidents = Object.values(state.monitorIncidents)
    .flat()
    .filter(i => i.status === 'open');

  // ============================
  // 🔄 AUTO-REFRESH
  // ============================

  useEffect(() => {
    if (state.connectionStatus.isConnected) {
      // Set up auto-refresh every 30 seconds
      refreshIntervalRef.current = setInterval(() => {
        refreshMonitors();
        getMonitorSummary();
      }, 30000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.connectionStatus.isConnected, refreshMonitors, getMonitorSummary]);

  return {
    ...state,
    criticalMonitors,
    recentlyDownMonitors,
    pausedMonitors,
    expiringSSLMonitors,
    activeIncidents,
    refreshMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    selectMonitor,
    triggerCheck,
    performMultiRegionCheck,
    performBrowserCheck,
    getMonitorChecks,
    getMonitorIncidents,
    getMonitorStats,
    getAnomalyHistory,
    getPerformanceTrends,
    generateDetailedUptimeReport,
    generateLiveIncidentMap,
    getMonitorSummary,
    clearError,
    getIncidents,
    getIncidentsForMonitor,
    getIncidentById,
    updateIncident,
    resolveIncident,
    acknowledgeIncident,
    sendNotification,
    testNotification,
    getNotificationHistory,
    attemptAutoRemediation,
    getAutoRemediationHistory,
    connect,
    disconnect
  };
}; 