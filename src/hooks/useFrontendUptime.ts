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
// import { firebaseMonitoringService } from '../lib/firebaseMonitoringService'; // Removed - using UptimeRobot
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

// Static monitor types
const MONITOR_TYPES: MonitorType[] = [
  { type: 'http', label: 'HTTP', description: 'Monitor HTTP endpoints' },
  { type: 'ping', label: 'Ping', description: 'Ping a server or device' },
  { type: 'port', label: 'Port', description: 'Check if a port is open' },
  { type: 'ssl', label: 'SSL', description: 'Monitor SSL certificate status' },
  { type: 'pagespeed', label: 'PageSpeed', description: 'Measure web page speed' },
  { type: 'hardware', label: 'Hardware', description: 'Monitor hardware health' },
  { type: 'docker', label: 'Docker', description: 'Monitor Docker containers' },
];

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
    monitorTypes: MONITOR_TYPES,
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

  // Fetch all monitors from the new API
  const refreshMonitors = useCallback(async () => {
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      const res = await fetch('/api/monitoring?action=monitors');
      const data = await res.json();
      
      if (!data.success || !Array.isArray(data.monitors)) {
        throw new Error(data.message || 'Failed to fetch monitors');
      }

      // Map UptimeRobot monitors to our Monitor format
      const mappedMonitors: Monitor[] = data.monitors.map((monitor: any) => ({
        id: monitor.id,
        name: monitor.friendly_name,
        url: monitor.url,
        type: 'http',
        status: monitor.status === 2, // 2 = up, 9 = down, 0 = paused
        interval: monitor.interval || 5,
        timeout: 30,
        retries: 3,
        userId: '',
        createdAt: new Date(monitor.create_datetime * 1000),
        updatedAt: new Date(),
        lastCheck: monitor.last_check_datetime ? new Date(monitor.last_check_datetime * 1000) : null,
        lastResponseTime: monitor.response_times ? monitor.response_times[0] : null,
        lastStatusCode: monitor.http_status_code,
        uptime: monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
        downtime: 100 - (monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100),
        tags: monitor.tags || [],
        notifications: [],
        threshold: { responseTime: 0, statusCode: 200 },
        regions: [],
        protocol: 'http',
        port: undefined,
        expectedContent: [],
        contentChecksum: '',
        browserCheck: undefined,
        redirectTracing: false,
        sslMonitoring: undefined,
        adaptiveFrequency: undefined,
        slaTracking: undefined,
        anomalyDetection: undefined,
        dependencyChain: [],
        impactCalculator: undefined,
        last_status: monitor.status === 2 ? 'up' : monitor.status === 9 ? 'down' : 'unknown',
        failures_in_a_row: monitor.failures_in_a_row || 0,
        ssl_status: 'valid',
        ssl_monitoring_enabled: false,
        ssl_cert_expires_at: '',
        ssl_cert_issuer: '',
        ssl_cert_days_until_expiry: null,
        ssl_last_checked: '',
        is_public: true,
        frequency: monitor.interval || 5,
        http_status: monitor.http_status_code,
        uptime_stats: {
          '24h': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
          '7d': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
          '30d': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
        },
        lastDown: monitor.last_down_datetime ? new Date(monitor.last_down_datetime * 1000).toISOString() : '',
        lastUp: monitor.last_up_datetime ? new Date(monitor.last_up_datetime * 1000).toISOString() : '',
        isActive: monitor.status !== 0, // 0 = paused
        description: monitor.friendly_name,
        expectedStatusCode: 200,
        retryInterval: 5,
      }));

      setStateIfMounted(prev => ({
        ...prev,
        monitors: mappedMonitors,
        loading: false,
        lastRefresh: new Date(),
      }));
    } catch (error) {
      handleError(error, 'refreshMonitors');
    }
  }, [setStateIfMounted, handleError]);

  // Create new monitor
  const createMonitor = useCallback(async (data: CreateMonitorRequest): Promise<Monitor> => {
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      const res = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_monitor', data })
      });
      const monitor = await res.json();
      await refreshMonitors();
      return monitor;
    } catch (error) {
      handleError(error, 'createMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors]);

  // Update monitor (delete + create)
  const updateMonitor = useCallback(async (id: string, data: UpdateMonitorRequest): Promise<Monitor> => {
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      const res = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_monitor', data: { ...data, id } })
      });
      const monitor = await res.json();
      await refreshMonitors();
      return monitor;
    } catch (error) {
      handleError(error, 'updateMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors]);

  // Delete monitor
  const deleteMonitor = useCallback(async (id: string): Promise<void> => {
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_monitor', data: { id } })
      });
      await refreshMonitors();
    } catch (error) {
      handleError(error, 'deleteMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, refreshMonitors]);

  // Select monitor
  const selectMonitor = useCallback((monitor: Monitor | null) => {
    setStateIfMounted(prev => ({ ...prev, selectedMonitor: monitor }));
  }, [setStateIfMounted]);

  // Get monitor checks (logs)
  const getMonitorChecks = useCallback(async (monitorId: string, limit: number = 50): Promise<CheckResult[]> => {
    try {
      // UptimeRobot: get logs for the monitor
      const res = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_logs', data: { monitorId, limit } })
      });
      const data = await res.json();
      
      if (!data.success || !Array.isArray(data.logs)) {
        return [];
      }
      
      // Map UptimeRobot logs to CheckResult format
      return data.logs.map((log: any) => ({
        id: log.id || `log_${Date.now()}_${Math.random()}`,
        monitorId: monitorId,
        status: log.type === 1, // 1 = up, 2 = down
        responseTime: log.duration || 0,
        statusCode: log.response_code,
        message: log.type === 1 ? 'Monitor is up' : 'Monitor is down',
        createdAt: new Date(log.datetime * 1000),
        error: log.type === 2 ? log.details : undefined,
        timestamp: new Date(log.datetime * 1000),
      })) as CheckResult[];
    } catch (error) {
      handleError(error, 'getMonitorChecks');
      return [];
    }
  }, [handleError]);

  // Get monitor incidents (not directly supported, use logs for downtime)
  const getMonitorIncidents = useCallback(async (monitorId: string, limit: number = 20): Promise<Incident[]> => {
    // Not directly supported; return empty for now
    return [];
  }, []);

  // Get monitor stats (summary)
  const getMonitorStats = useCallback(async (monitorId: string): Promise<MonitorStats> => {
    try {
      const response = await fetch(`/api/monitoring?action=get&monitorId=${monitorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch monitor stats: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.monitor) {
        throw new Error(data.message || 'Failed to fetch monitor data');
      }

      const monitor = data.monitor;
      
      // Convert UptimeRobot data to our MonitorStats format
      return {
        monitor: {
          id: monitor.id,
          name: monitor.friendly_name,
          url: monitor.url,
          type: 'http',
          status: monitor.status === 2, // 2 = up, 9 = down
          interval: monitor.interval || 5,
          timeout: 30,
          retries: 3,
          userId: '',
          createdAt: new Date(monitor.create_datetime * 1000),
          updatedAt: new Date(),
          lastCheck: monitor.last_check_datetime ? new Date(monitor.last_check_datetime * 1000) : null,
          lastResponseTime: monitor.response_times ? monitor.response_times[0] : null,
          lastStatusCode: monitor.http_status_code,
          uptime: monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
          downtime: 100 - (monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100),
          tags: monitor.tags || [],
          notifications: [],
          threshold: { responseTime: 0, statusCode: 200 },
          regions: [],
          protocol: 'http',
          port: undefined,
          expectedContent: [],
          contentChecksum: '',
          browserCheck: undefined,
          redirectTracing: false,
          sslMonitoring: undefined,
          adaptiveFrequency: undefined,
          slaTracking: undefined,
          anomalyDetection: undefined,
          dependencyChain: [],
          impactCalculator: undefined,
          last_status: monitor.status === 2 ? 'up' : 'down',
          failures_in_a_row: monitor.failures_in_a_row || 0,
          ssl_status: 'valid',
          ssl_monitoring_enabled: false,
          ssl_cert_expires_at: '',
          ssl_cert_issuer: '',
          ssl_cert_days_until_expiry: null,
          ssl_last_checked: '',
          is_public: true,
          frequency: monitor.interval || 5,
          http_status: monitor.http_status_code,
          uptime_stats: {
            '24h': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
            '7d': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
            '30d': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
          },
          lastDown: monitor.last_down_datetime ? new Date(monitor.last_down_datetime * 1000).toISOString() : '',
          lastUp: monitor.last_up_datetime ? new Date(monitor.last_up_datetime * 1000).toISOString() : '',
          isActive: monitor.status !== 0, // 0 = paused
          description: monitor.friendly_name,
          expectedStatusCode: 200,
          retryInterval: 5,
        },
        stats: {
          uptime: {
            '24h': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
            '7d': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
            '30d': monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
          },
          average_response_time: monitor.response_times ? monitor.response_times[0] : 0,
          total_checks: monitor.total_checks || 0,
          regional_performance: [],
          protocol_performance: [],
          anomaly_history: [],
          sla_metrics: {
            targetUptime: 100,
            actualUptime: monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
            compliance: monitor.uptime_ratio ? parseFloat(monitor.uptime_ratio) * 100 : 100,
            violations: 0,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching monitor stats:', error);
      throw error;
    }
  }, []);

  // Perform monitor check (fetch status)
  const performMonitorCheck = useCallback(async (monitorId: string): Promise<CheckResult> => {
    try {
      const res = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_check', data: { monitorId } })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to check monitor');
      
      // Map UptimeRobot response to CheckResult format
      return {
        id: data.id || `check_${Date.now()}`,
        monitorId: monitorId,
        status: data.status === 2, // 2 = up, 9 = down
        responseTime: data.response_times ? data.response_times[0] : 0,
        statusCode: data.http_status_code,
        message: data.status === 2 ? 'Monitor is up' : 'Monitor is down',
        createdAt: new Date(),
        error: data.status !== 2 ? 'Monitor check failed' : undefined,
        timestamp: new Date(),
      } as CheckResult;
    } catch (error) {
      handleError(error, 'performMonitorCheck');
      throw error;
    }
  }, [handleError]);

  // Bulk update monitors (implement as needed, placeholder for now)
  const bulkUpdateMonitors = useCallback(async (data: BulkUpdateRequest): Promise<BulkUpdateResponse> => {
    // TODO: Implement Firestore-based bulk update if needed
    throw new Error('bulkUpdateMonitors not implemented');
  }, []);

  // Resolve incident - Placeholder for UptimeRobot
  const resolveIncident = useCallback(async (incidentId: string): Promise<void> => {
    // TODO: Implement with UptimeRobot API if needed
    console.log('Resolve incident not implemented with UptimeRobot:', incidentId);
  }, []);

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

  // Real-time monitor subscription - Disabled since we're using UptimeRobot
  // useEffect(() => {
  //   if (!user?.uid) return;
  //   // Firebase subscriptions removed - using UptimeRobot API instead
  // }, [user?.uid]);

  // Real-time incident subscription - Disabled since we're using UptimeRobot
  // useEffect(() => {
  //   if (!user?.uid) return;
  //   // Firebase subscriptions removed - using UptimeRobot API instead
  // }, [user?.uid, state.monitors]);

  // Real-time SSL info subscription - Disabled since we're using UptimeRobot
  // useEffect(() => {
  //   if (!user?.uid) return;
  //   // Firebase subscriptions removed - using UptimeRobot API instead
  // }, [user?.uid]);

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

  // testMonitor implementation
  const testMonitor = useCallback(async (url: string, timeout?: number): Promise<TestResult> => {
    const res = await fetch('/api/monitoring/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, timeout }),
    });
    const data = await res.json();
    if (!res.ok || !data) {
      throw new Error(data?.message || 'Test failed');
    }
    return {
      id: '',
      monitorId: '',
      status: data.status,
      responseTime: data.responseTime,
      message: data.message,
      createdAt: new Date(),
    };
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