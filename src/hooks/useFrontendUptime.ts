/**
 * useFrontendUptime - React hook for managing uptime/monitoring state and actions using Firestore backend.
 * Handles monitors, incidents, checks, SSL info, and provides all CRUD and utility actions.
 * @param autoRefresh - Whether to auto-refresh monitors (default: true)
 * @param refreshInterval - Interval for auto-refresh in ms (default: 30000)
 * @returns All state, computed values, and actions for uptime monitoring.
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Monitor, 
  CheckResult, 
  Incident, 
  MonitorSummary,
  MonitorStats, 
  SSLInfoResponse, 
  CreateMonitorRequest, 
  UpdateMonitorRequest,
  BulkUpdateRequest,
  BulkUpdateResponse,
  TestResult,
  MonitorType,
  NotificationType
} from '../types/uptime';
import { firebaseMonitoringService } from '../lib/firebaseMonitoringService';
import useAuth from './useAuth';

/**
 * State managed by useFrontendUptime
 */
interface UseFrontendUptimeState {
  monitors: Monitor[];
  selectedMonitor: Monitor | null;
  monitorChecks: Record<string, CheckResult[]>;
  monitorIncidents: Record<string, Incident[]>;
  monitorStats: Record<string, MonitorStats>;
  sslInfo: Record<string, SSLInfoResponse>;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  summary: MonitorSummary | null;
  monitorTypes: MonitorType[];
  notificationTypes: NotificationType[];
}

/**
 * Return type for useFrontendUptime
 */
interface UseFrontendUptimeReturn extends UseFrontendUptimeState {
  // Computed values
  criticalMonitors: Monitor[];
  recentlyDownMonitors: Monitor[];
  pausedMonitors: Monitor[];
  expiringSSLMonitors: Monitor[];
  
  // Actions
  refreshMonitors: () => Promise<void>;
  createMonitor: (data: CreateMonitorRequest) => Promise<Monitor>;
  updateMonitor: (id: string, data: UpdateMonitorRequest) => Promise<Monitor>;
  deleteMonitor: (id: string) => Promise<void>;
  selectMonitor: (monitor: Monitor | null) => void;
  getMonitorChecks: (monitorId: string, limit?: number) => Promise<CheckResult[]>;
  getMonitorIncidents: (monitorId: string, limit?: number) => Promise<Incident[]>;
  getMonitorStats: (monitorId: string) => Promise<MonitorStats>;
  getSSLInfo: (monitorId: string) => Promise<SSLInfoResponse>;
  performMonitorCheck: (monitorId: string) => Promise<CheckResult>;
  testMonitor: (url: string, timeout?: number) => Promise<TestResult>;
  bulkUpdateMonitors: (data: BulkUpdateRequest) => Promise<BulkUpdateResponse>;
  resolveIncident: (incidentId: string) => Promise<void>;
  exportMonitorData: (monitorId: string, format: 'csv' | 'json', timeRange?: number) => Promise<Blob>;
  clearError: () => void;
  getMonitorSummary: () => void;
  getMonitorTypes: () => void;
  getNotificationTypes: () => void;
  triggerCheck: (monitorId: string) => Promise<void>;
}

export const useFrontendUptime = (autoRefresh: boolean = true, refreshInterval: number = 30000): UseFrontendUptimeReturn => {
  const { user } = useAuth();
  const [state, setState] = useState<UseFrontendUptimeState>({
    monitors: [],
    selectedMonitor: null,
    monitorChecks: {},
    monitorIncidents: {},
    monitorStats: {},
    sslInfo: {},
    loading: false,
    error: null,
    lastRefresh: null,
    summary: null,
    monitorTypes: [],
    notificationTypes: [],
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const unsubscribeRef = useRef<null | (() => void)>(null);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const setStateIfMounted = useCallback((updater: (prev: UseFrontendUptimeState) => UseFrontendUptimeState) => {
    if (mountedRef.current) {
      setState(updater);
    }
  }, []);

  const handleError = useCallback((error: any, context: string) => {
    console.error(`❌ Frontend Uptime Error [${context}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    setStateIfMounted(prev => ({ ...prev, error: errorMessage, loading: false }));
  }, [setStateIfMounted]);

  // Refresh all monitors with real-time data
  const refreshMonitors = useCallback(async () => {
    if (!user || typeof user.uid !== 'string') {
      setStateIfMounted(prev => ({ ...prev, loading: false }));
      return;
    }
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      const monitors = await firebaseMonitoringService.getAllMonitors(user.uid);
      setStateIfMounted(prev => ({
        ...prev,
        monitors,
        loading: false,
        lastRefresh: new Date(),
      }));
    } catch (error) {
      handleError(error, 'refreshMonitors');
    }
  }, [setStateIfMounted, handleError, user]);

  // Create new monitor
  const createMonitor = useCallback(async (data: CreateMonitorRequest): Promise<Monitor> => {
    if (!user?.uid) throw new Error('User not authenticated');
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      // Fill in required fields for Monitor
      const monitorData = {
        ...data,
        status: true,
        interval: data.interval ?? 60,
        timeout: data.timeout ?? 10,
        retries: data.retries ?? 3,
        isActive: data.isActive ?? true,
      };
      const monitor = await firebaseMonitoringService.createMonitor(user.uid, monitorData);
      await refreshMonitors();
      return monitor;
    } catch (error) {
      handleError(error, 'createMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors, user?.uid]);

  // Update existing monitor
  const updateMonitor = useCallback(async (id: string, data: UpdateMonitorRequest): Promise<Monitor> => {
    if (!user?.uid) throw new Error('User not authenticated');
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      const monitor = await firebaseMonitoringService.updateMonitor(user.uid, id, data);
      await refreshMonitors();
      return monitor;
    } catch (error) {
      handleError(error, 'updateMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors, user?.uid]);

  // Delete monitor
  const deleteMonitor = useCallback(async (id: string): Promise<void> => {
    if (!user?.uid) throw new Error('User not authenticated');
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      await firebaseMonitoringService.deleteMonitor(user.uid, id);
      await refreshMonitors();
    } catch (error) {
      handleError(error, 'deleteMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors, user?.uid]);

  // Select monitor
  const selectMonitor = useCallback((monitor: Monitor | null) => {
    setStateIfMounted(prev => ({ ...prev, selectedMonitor: monitor }));
  }, [setStateIfMounted]);

  // Get monitor checks
  const getMonitorChecks = useCallback(async (monitorId: string, limit: number = 30): Promise<CheckResult[]> => {
    if (!user?.uid) return [];
    try {
      const checks = await firebaseMonitoringService.getMonitorChecks(user.uid, monitorId, limit);
      setStateIfMounted(prev => ({
        ...prev,
        monitorChecks: { ...prev.monitorChecks, [monitorId]: checks }
      }));
      return checks;
    } catch (error) {
      handleError(error, 'getMonitorChecks');
      return [];
    }
  }, [setStateIfMounted, handleError, user?.uid]);

  // Get monitor incidents
  const getMonitorIncidents = useCallback(async (monitorId: string, limit: number = 50): Promise<Incident[]> => {
    if (!user?.uid) return [];
    try {
      const incidents = await firebaseMonitoringService.getIncidents(monitorId, user.uid);
      setStateIfMounted(prev => ({
        ...prev,
        monitorIncidents: { ...prev.monitorIncidents, [monitorId]: incidents }
      }));
      return incidents;
    } catch (error) {
      handleError(error, 'getMonitorIncidents');
      return [];
    }
  }, [setStateIfMounted, handleError, user?.uid]);

  // Get monitor stats (implement as needed, placeholder for now)
  const getMonitorStats = useCallback(async (monitorId: string): Promise<MonitorStats> => {
    // TODO: Implement Firestore-based stats if needed
    throw new Error('getMonitorStats not implemented');
  }, []);

  // Perform monitor check (implement as needed, placeholder for now)
  const performMonitorCheck = useCallback(async (monitorId: string): Promise<CheckResult> => {
    // TODO: Implement Firestore-based check if needed
    throw new Error('performMonitorCheck not implemented');
  }, []);

  // Bulk update monitors (implement as needed, placeholder for now)
  const bulkUpdateMonitors = useCallback(async (data: BulkUpdateRequest): Promise<BulkUpdateResponse> => {
    // TODO: Implement Firestore-based bulk update if needed
    throw new Error('bulkUpdateMonitors not implemented');
  }, []);

  // Resolve incident
  const resolveIncident = useCallback(async (incidentId: string): Promise<void> => {
    if (!user?.uid) return;
    try {
      await firebaseMonitoringService.resolveIncident(incidentId);
      setStateIfMounted(prev => {
        const updatedIncidents = { ...prev.monitorIncidents };
        for (const monitorId in updatedIncidents) {
          updatedIncidents[monitorId] = updatedIncidents[monitorId].map(incident =>
            incident.id === incidentId
              ? { ...incident, status: 'resolved', resolvedAt: new Date() }
              : incident
          );
        }
        return { ...prev, monitorIncidents: updatedIncidents };
      });
    } catch (error) {
      handleError(error, 'resolveIncident');
      throw error;
    }
  }, [setStateIfMounted, handleError, user?.uid]);

  // Export monitor data (implement as needed, placeholder for now)
  const exportMonitorData = useCallback(async (
    monitorId: string, 
    format: 'csv' | 'json' = 'json', 
    timeRange: number = 168
  ): Promise<Blob> => {
    // TODO: Implement Firestore-based export if needed
    throw new Error('exportMonitorData not implemented');
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setStateIfMounted(prev => ({ ...prev, error: null }));
  }, [setStateIfMounted]);

  // Trigger manual check
  const triggerCheck = useCallback(async (monitorId: string): Promise<void> => {
    try {
      // realtimeMonitoring.triggerCheck(monitorId); // This line was removed as per the edit hint
      await performMonitorCheck(monitorId);
    } catch (error) {
      handleError(error, 'triggerCheck');
      throw error;
    }
  }, [handleError, performMonitorCheck]);

  // Computed values
  const criticalMonitors = state.monitors.filter(monitor => 
    monitor.status === false
  );

  const recentlyDownMonitors = state.monitors.filter(monitor => 
    monitor.lastDown && 
    new Date(monitor.lastDown).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );

  const pausedMonitors = state.monitors.filter(monitor => !monitor.isActive);

  const expiringSSLMonitors = state.monitors.filter(m =>
    (typeof m.ssl_cert_days_until_expiry === 'number' && m.ssl_cert_days_until_expiry < 30) ||
    m.ssl_status === 'expiring_soon' ||
    m.ssl_status === 'expired'
  );

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(async () => {
        if (mountedRef.current) {
          console.log('🔄 Auto-refreshing monitors...');
          await refreshMonitors();
        }
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, refreshMonitors]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🚀 Loading initial uptime data...', { user: user?.uid, hasUser: !!user });
        setStateIfMounted(prev => ({ ...prev, loading: true }));
        
        await Promise.all([
          refreshMonitors(),
          // getMonitorTypes(), // Removed
          // getNotificationTypes(), // Removed
        ]);
        
        console.log('✅ Initial uptime data loaded successfully');
        
        // Ensure loading is set to false after initial load
        setStateIfMounted(prev => ({ ...prev, loading: false }));
        
        // Start monitoring service if there are existing monitors
        if (user?.uid) {
          console.log('🚀 Starting real-time monitoring service for existing monitors...');
          // realtimeMonitoring.start(); // This line was removed as per the edit hint
        }
      } catch (error) {
        console.error('❌ Failed to load initial uptime data:', error);
        handleError(error, 'loadInitialData');
      }
    };

    console.log('🔄 useFrontendUptime: User state changed', { user: user?.uid, hasUser: !!user });
    loadInitialData();
  }, [refreshMonitors, // getMonitorTypes, // Removed
    // getNotificationTypes, // Removed
    handleError, setStateIfMounted, user?.uid]);

  // Real-time monitor subscription
  useEffect(() => {
    if (!user?.uid) return;
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    unsubscribeRef.current = firebaseMonitoringService.subscribeToMonitors(user.uid, (monitors) => {
      setStateIfMounted(prev => ({ ...prev, monitors, loading: false, lastRefresh: new Date() }));
    });
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.uid]);

  // Real-time incident subscription
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribeIncidents = firebaseMonitoringService.subscribeToIncidents(user.uid, (incidents) => {
      // Filter incidents by user's monitors
      setStateIfMounted(prev => {
        const userMonitorIds = prev.monitors.map(m => m.id);
        const userIncidents = incidents.filter(i => userMonitorIds.includes(i.monitorId));
        // Group by monitorId
        const monitorIncidents: Record<string, Incident[]> = {};
        userIncidents.forEach(incident => {
          if (!monitorIncidents[incident.monitorId]) monitorIncidents[incident.monitorId] = [];
          monitorIncidents[incident.monitorId].push(incident);
        });
        return { ...prev, monitorIncidents };
      });
    });
    return () => {
      unsubscribeIncidents();
    };
  }, [user?.uid, state.monitors]);

  // Real-time SSL info subscription
  useEffect(() => {
    if (!user?.uid) return;
    // Listen to all monitors for this user
    const unsubscribe = firebaseMonitoringService.subscribeToMonitors(user.uid, (monitors) => {
      // Update SSL info state for all monitors
      const sslInfo: Record<string, SSLInfoResponse> = {};
      monitors.forEach(monitor => {
        if (monitor.ssl_status || monitor.ssl_cert_days_until_expiry !== undefined) {
          sslInfo[monitor.id] = {
            ssl_monitoring_enabled: true,
            ssl_info: {
              valid: monitor.ssl_status === 'valid',
              days_until_expiry: monitor.ssl_cert_days_until_expiry ?? undefined,
              expires_at: monitor.ssl_cert_expires_at ?? undefined,
              is_valid: monitor.ssl_status === 'valid',
              is_self_signed: false,
              issuer: monitor.ssl_cert_issuer ?? undefined,
              subject: monitor.name ?? monitor.url,
            },
            monitor_ssl_status: monitor.ssl_status,
            ssl_cert_expires_at: monitor.ssl_cert_expires_at,
            ssl_cert_days_until_expiry: monitor.ssl_cert_days_until_expiry ?? undefined,
            ssl_cert_issuer: monitor.ssl_cert_issuer,
            message: undefined,
          };
        }
      });
      setStateIfMounted(prev => ({ ...prev, sslInfo }));
    });
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // Compute summary from real-time state
  const summary = useMemo(() => {
    const totalMonitors = state.monitors.length;
    const upMonitors = state.monitors.filter(m => m.status).length;
    const downMonitors = state.monitors.filter(m => !m.status).length;
    const pausedMonitors = state.monitors.filter(m => !m.isActive).length;
    const avgResponseTime = state.monitors.reduce((sum, m) => sum + (m.lastResponseTime || 0), 0) / (totalMonitors || 1);
    const uptime = `${(
      state.monitors.reduce((sum, m) => sum + (m.uptime || 0), 0) / (totalMonitors || 1)
    ).toFixed(2)}%`;
    const activeIncidents = Object.values(state.monitorIncidents).flat().filter(i => i.status === 'open').length;
    return {
      totalMonitors,
      upMonitors,
      downMonitors,
      pausedMonitors,
      avgResponseTime,
      activeIncidents,
      uptime,
      regionalStats: [],
      protocolStats: [],
      slaCompliance: { target: 99.9, actual: 0, compliance: 0, violations: 0, penalties: 0 },
      anomalyAlerts: 0,
      autoRemediations: 0
    };
  }, [state.monitors, state.monitorIncidents]);

  // Set up real-time monitoring event listeners
  useEffect(() => {
    const handleMonitorStatusChanged = (data: any) => {
      console.log('🔄 Monitor status changed:', data);
      setStateIfMounted(prev => {
        const updatedMonitors = prev.monitors.map(monitor => 
          monitor.id === data.monitorId 
            ? { 
                ...monitor, 
                status: data.newStatus === true,
                lastCheck: data.checkResult.createdAt,
                responseTime: data.checkResult.responseTime,
                updatedAt: data.checkResult.createdAt,
                ...(data.newStatus === true ? { lastUp: data.checkResult.createdAt } : { lastDown: data.checkResult.createdAt })
              }
            : monitor
        );
        
        return {
          ...prev,
          monitors: updatedMonitors,
          monitorChecks: {
            ...prev.monitorChecks,
            [data.monitorId]: [data.checkResult, ...(prev.monitorChecks[data.monitorId] || []).slice(0, 99)]
          }
        };
      });
    };

    const handleMonitorCheckCompleted = (data: any) => {
      console.log('✅ Monitor check completed:', data);
      setStateIfMounted(prev => {
        const updatedMonitors = prev.monitors.map(monitor => 
          monitor.id === data.monitorId 
            ? { 
                ...monitor, 
                status: data.checkResult.status === true,
                lastCheck: data.checkResult.createdAt,
                responseTime: data.checkResult.responseTime,
                updatedAt: data.checkResult.createdAt,
                ...(data.checkResult.status === true ? { lastUp: data.checkResult.createdAt } : { lastDown: data.checkResult.createdAt })
              }
            : monitor
        );
        
        return {
          ...prev,
          monitors: updatedMonitors,
          monitorChecks: {
            ...prev.monitorChecks,
            [data.monitorId]: [data.checkResult, ...(prev.monitorChecks[data.monitorId] || []).slice(0, 99)]
          }
        };
      });
    };

    const handleError = (data: any) => {
      console.error('❌ Real-time monitoring error:', data);
      setStateIfMounted(prev => ({ ...prev, error: data.error?.message || 'Real-time monitoring error' }));
    };

    // Register event listeners
    // realtimeMonitoring.on(realtimeMonitoring.EVENTS.MONITOR_STATUS_CHANGED, handleMonitorStatusChanged); // This line was removed as per the edit hint
    // realtimeMonitoring.on(realtimeMonitoring.EVENTS.MONITOR_CHECK_COMPLETED, handleMonitorCheckCompleted); // This line was removed as per the edit hint
    // realtimeMonitoring.on(realtimeMonitoring.EVENTS.ERROR_OCCURRED, handleError); // This line was removed as per the edit hint

    // Cleanup event listeners on unmount
    return () => {
      // realtimeMonitoring.off(realtimeMonitoring.EVENTS.MONITOR_STATUS_CHANGED, handleMonitorStatusChanged); // This line was removed as per the edit hint
      // realtimeMonitoring.off(realtimeMonitoring.EVENTS.MONITOR_CHECK_COMPLETED, handleMonitorCheckCompleted); // This line was removed as per the edit hint
      // realtimeMonitoring.off(realtimeMonitoring.EVENTS.ERROR_OCCURRED, handleError); // This line was removed as per the edit hint
    };
  }, [setStateIfMounted]);

  // getSSLInfo placeholder
  const getSSLInfo = useCallback(async (monitorId: string): Promise<SSLInfoResponse> => {
    return Promise.reject({
      ssl_monitoring_enabled: false,
      message: 'SSL info not implemented'
    });
  }, []);

  // testMonitor placeholder
  const testMonitor = useCallback(async (url: string, timeout?: number): Promise<TestResult> => {
    return Promise.reject({
      id: '',
      monitorId: '',
      status: false,
      responseTime: 0,
      message: 'Monitor test not implemented',
      createdAt: new Date()
    });
  }, []);

  // Return object
  return {
    ...state,
    criticalMonitors,
    recentlyDownMonitors,
    pausedMonitors,
    expiringSSLMonitors,
    refreshMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    selectMonitor,
    getMonitorChecks,
    getMonitorIncidents,
    getMonitorStats,
    getSSLInfo,
    performMonitorCheck,
    testMonitor,
    bulkUpdateMonitors,
    resolveIncident,
    exportMonitorData,
    clearError,
    getMonitorSummary: () => {},
    getMonitorTypes: () => {},
    getNotificationTypes: () => {},
    triggerCheck,
  };
}; 