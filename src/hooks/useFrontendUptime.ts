import { useState, useEffect, useCallback, useRef } from 'react';
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
import { frontendUptimeApi } from '../lib/frontendUptimeApi';
import { realtimeMonitoring } from '../lib/realtimeMonitoring';

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
  getMonitorSummary: () => Promise<void>;
  getMonitorTypes: () => Promise<void>;
  getNotificationTypes: () => Promise<void>;
  triggerCheck: (monitorId: string) => Promise<void>;
}

export const useFrontendUptime = (autoRefresh: boolean = true, refreshInterval: number = 30000): UseFrontendUptimeReturn => {
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

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
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

  // Get monitor summary
  const getMonitorSummary = useCallback(async () => {
    try {
      console.log('📊 Getting monitor summary...');
      
      const summary = await frontendUptimeApi.getMonitorSummary();
      console.log('✅ Loaded monitor summary', summary);
      
      setStateIfMounted(prev => ({
        ...prev,
        summary
      }));
    } catch (error) {
      handleError(error, 'getMonitorSummary');
    }
  }, [setStateIfMounted, handleError]);

  // Get monitor types
  const getMonitorTypes = useCallback(async () => {
    try {
      console.log('📋 Getting monitor types...');
      
      const monitorTypes = await frontendUptimeApi.getMonitorTypes();
      console.log('✅ Loaded monitor types', monitorTypes);
      
      setStateIfMounted(prev => ({
        ...prev,
        monitorTypes
      }));
    } catch (error) {
      handleError(error, 'getMonitorTypes');
    }
  }, [setStateIfMounted, handleError]);

  // Get notification types
  const getNotificationTypes = useCallback(async () => {
    try {
      console.log('🔔 Getting notification types...');
      
      const notificationTypes = await frontendUptimeApi.getNotificationTypes();
      console.log('✅ Loaded notification types', notificationTypes);
      
      setStateIfMounted(prev => ({
        ...prev,
        notificationTypes
      }));
    } catch (error) {
      handleError(error, 'getNotificationTypes');
    }
  }, [setStateIfMounted, handleError]);

  // Refresh all monitors with real-time data
  const refreshMonitors = useCallback(async () => {
    try {
      console.log('🔄 Refreshing monitors...');
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitors = await frontendUptimeApi.getAllMonitors();
      console.log(`✅ Loaded ${monitors.length} monitors`);
      
      // Also refresh the summary
      await getMonitorSummary();
      
      setStateIfMounted(prev => ({
        ...prev,
        monitors,
        loading: false,
        lastRefresh: new Date(),
      }));
    } catch (error) {
      handleError(error, 'refreshMonitors');
    }
  }, [setStateIfMounted, handleError, getMonitorSummary]);

  // Create new monitor
  const createMonitor = useCallback(async (data: CreateMonitorRequest): Promise<Monitor> => {
    try {
      console.log('🚀 useFrontendUptime: Creating monitor...', data);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitor = await frontendUptimeApi.createMonitor(data);
      console.log(`✅ useFrontendUptime: Created monitor successfully:`, monitor);
      
      // Start monitoring service if this is the first monitor
      const currentMonitors = await frontendUptimeApi.getAllMonitors();
      if (currentMonitors.length === 1) {
        console.log('🚀 Starting real-time monitoring service...');
        await realtimeMonitoring.start();
      }
      
      // Add to real-time monitoring service
      await realtimeMonitoring.addMonitor(monitor);
      
      // Refresh monitors to get the new one
      await refreshMonitors();
      
      return monitor;
    } catch (error) {
      console.error('❌ useFrontendUptime: Error in createMonitor:', error);
      handleError(error, 'createMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors]);

  // Update existing monitor
  const updateMonitor = useCallback(async (id: string, data: UpdateMonitorRequest): Promise<Monitor> => {
    try {
      console.log('🔄 useFrontendUptime: Updating monitor...', { id, data });
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitor = await frontendUptimeApi.updateMonitor(id, data);
      console.log(`✅ useFrontendUptime: Updated monitor successfully:`, monitor);
      
      // Refresh monitors to get the updated one
      await refreshMonitors();
      
      return monitor;
    } catch (error) {
      console.error('❌ useFrontendUptime: Error in updateMonitor:', error);
      handleError(error, 'updateMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors]);

  // Delete monitor
  const deleteMonitor = useCallback(async (id: string): Promise<void> => {
    try {
      console.log('🗑️ useFrontendUptime: Deleting monitor...', id);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await frontendUptimeApi.deleteMonitor(id);
      console.log(`✅ useFrontendUptime: Deleted monitor successfully:`, id);
      
      // Remove from real-time monitoring service
      realtimeMonitoring.removeMonitor(id);
      
      // Refresh monitors to remove the deleted one
      await refreshMonitors();
      
      // Stop monitoring service if no monitors remain
      const remainingMonitors = await frontendUptimeApi.getAllMonitors();
      if (remainingMonitors.length === 0) {
        console.log('🛑 Stopping real-time monitoring service - no monitors remaining');
        realtimeMonitoring.stop();
      }
    } catch (error) {
      console.error('❌ useFrontendUptime: Error in deleteMonitor:', error);
      handleError(error, 'deleteMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors]);

  // Select monitor
  const selectMonitor = useCallback((monitor: Monitor | null) => {
    setStateIfMounted(prev => ({ ...prev, selectedMonitor: monitor }));
  }, [setStateIfMounted]);

  // Get monitor checks
  const getMonitorChecks = useCallback(async (monitorId: string, limit: number = 30): Promise<CheckResult[]> => {
    try {
      const checks = await frontendUptimeApi.getMonitorChecks(monitorId, limit);
      setStateIfMounted(prev => ({
        ...prev,
        monitorChecks: { ...prev.monitorChecks, [monitorId]: checks }
      }));
      return checks;
    } catch (error) {
      handleError(error, 'getMonitorChecks');
      return [];
    }
  }, [setStateIfMounted, handleError]);

  // Get monitor incidents
  const getMonitorIncidents = useCallback(async (monitorId: string, limit: number = 50): Promise<Incident[]> => {
    try {
      const incidents = await frontendUptimeApi.getMonitorIncidents(monitorId, limit);
      setStateIfMounted(prev => ({
        ...prev,
        monitorIncidents: { ...prev.monitorIncidents, [monitorId]: incidents }
      }));
      return incidents;
    } catch (error) {
      handleError(error, 'getMonitorIncidents');
      return [];
    }
  }, [setStateIfMounted, handleError]);

  // Get monitor stats
  const getMonitorStats = useCallback(async (monitorId: string): Promise<MonitorStats> => {
    try {
      const stats = await frontendUptimeApi.getMonitorStats(monitorId);
      setStateIfMounted(prev => ({
        ...prev,
        monitorStats: { ...prev.monitorStats, [monitorId]: stats }
      }));
      return stats;
    } catch (error) {
      handleError(error, 'getMonitorStats');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // Get SSL info
  const getSSLInfo = useCallback(async (monitorId: string): Promise<SSLInfoResponse> => {
    try {
      const sslInfo = await frontendUptimeApi.getSSLInfo(monitorId);
      setStateIfMounted(prev => ({
        ...prev,
        sslInfo: { ...prev.sslInfo, [monitorId]: sslInfo }
      }));
      return sslInfo;
    } catch (error) {
      handleError(error, 'getSSLInfo');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // Perform monitor check
  const performMonitorCheck = useCallback(async (monitorId: string): Promise<CheckResult> => {
    try {
      const result = await frontendUptimeApi.performMonitorCheck(monitorId);
      
      // Update the monitor in the state
      setStateIfMounted(prev => {
        const updatedMonitors = prev.monitors.map(monitor => 
          monitor.id === monitorId 
            ? { 
                ...monitor, 
                status: result.status === true,
                lastCheck: result.createdAt,
                responseTime: result.responseTime,
                updatedAt: result.createdAt,
                ...(result.status === true ? { lastUp: result.createdAt } : { lastDown: result.createdAt })
              }
            : monitor
        );
        
        return {
          ...prev,
          monitors: updatedMonitors,
          monitorChecks: {
            ...prev.monitorChecks,
            [monitorId]: [result, ...(prev.monitorChecks[monitorId] || []).slice(0, 99)]
          }
        };
      });
      
      return result;
    } catch (error) {
      handleError(error, 'performMonitorCheck');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // Test monitor
  const testMonitor = useCallback(async (url: string, timeout?: number): Promise<TestResult> => {
    try {
      return await frontendUptimeApi.testMonitor(url, timeout);
    } catch (error) {
      handleError(error, 'testMonitor');
      throw error;
    }
  }, [handleError]);

  // Bulk update monitors
  const bulkUpdateMonitors = useCallback(async (data: BulkUpdateRequest): Promise<BulkUpdateResponse> => {
    try {
      const result = await frontendUptimeApi.bulkUpdateMonitors(data);
      await refreshMonitors();
      return result;
    } catch (error) {
      handleError(error, 'bulkUpdateMonitors');
      throw error;
    }
  }, [handleError, refreshMonitors]);

  // Resolve incident
  const resolveIncident = useCallback(async (incidentId: string): Promise<void> => {
    try {
      await frontendUptimeApi.resolveIncident(incidentId);
      
      // Update incidents in state
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
  }, [setStateIfMounted, handleError]);

  // Export monitor data
  const exportMonitorData = useCallback(async (
    monitorId: string, 
    format: 'csv' | 'json' = 'json', 
    timeRange: number = 168
  ): Promise<Blob> => {
    try {
      return await frontendUptimeApi.exportMonitorData(monitorId, format, timeRange);
    } catch (error) {
      handleError(error, 'exportMonitorData');
      throw error;
    }
  }, [handleError]);

  // Clear error
  const clearError = useCallback(() => {
    setStateIfMounted(prev => ({ ...prev, error: null }));
  }, [setStateIfMounted]);

  // Trigger manual check
  const triggerCheck = useCallback(async (monitorId: string): Promise<void> => {
    try {
      await realtimeMonitoring.triggerCheck(monitorId);
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
        console.log('🚀 Loading initial uptime data...');
        setStateIfMounted(prev => ({ ...prev, loading: true }));
        
        await Promise.all([
          refreshMonitors(),
          getMonitorTypes(),
          getNotificationTypes(),
        ]);
        
        console.log('✅ Initial uptime data loaded successfully');
        
        // Start monitoring service if there are existing monitors
        const existingMonitors = await frontendUptimeApi.getAllMonitors();
        if (existingMonitors.length > 0) {
          console.log('🚀 Starting real-time monitoring service for existing monitors...');
          await realtimeMonitoring.start();
        }
      } catch (error) {
        console.error('❌ Failed to load initial uptime data:', error);
        handleError(error, 'loadInitialData');
      }
    };

    loadInitialData();
  }, [refreshMonitors, getMonitorTypes, getNotificationTypes, handleError, setStateIfMounted]);

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
    realtimeMonitoring.on(realtimeMonitoring.EVENTS.MONITOR_STATUS_CHANGED, handleMonitorStatusChanged);
    realtimeMonitoring.on(realtimeMonitoring.EVENTS.MONITOR_CHECK_COMPLETED, handleMonitorCheckCompleted);
    realtimeMonitoring.on(realtimeMonitoring.EVENTS.ERROR_OCCURRED, handleError);

    // Cleanup event listeners on unmount
    return () => {
      realtimeMonitoring.off(realtimeMonitoring.EVENTS.MONITOR_STATUS_CHANGED, handleMonitorStatusChanged);
      realtimeMonitoring.off(realtimeMonitoring.EVENTS.MONITOR_CHECK_COMPLETED, handleMonitorCheckCompleted);
      realtimeMonitoring.off(realtimeMonitoring.EVENTS.ERROR_OCCURRED, handleError);
    };
  }, [setStateIfMounted]);

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
    getMonitorSummary,
    getMonitorTypes,
    getNotificationTypes,
    triggerCheck,
  };
}; 