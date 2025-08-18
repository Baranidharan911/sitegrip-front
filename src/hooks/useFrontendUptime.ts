/**
 * useFrontendUptime - React hook for managing uptime/monitoring state and actions using Firebase Firestore.
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
import {
  listMonitors,
  createMonitor as apiCreateMonitor,
  updateMonitor as apiUpdateMonitor,
  deleteMonitor as apiDeleteMonitor,
  triggerCheck as apiTriggerCheck,
  bulkUpdate as apiBulkUpdate,
  getSummary as apiGetSummary,
  listMonitorsWithChecks,
  testEndpoint as apiTestEndpoint,
  checkSSLStatus,
  getMonitorDiagnostics,
  getMonitorIncidents as apiGetMonitorIncidents,
  getMonitorChecks as apiGetMonitorChecks,
} from '../lib/monitoringApi';
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
  getMonitorSummary: () => Promise<any>;
  getMonitorTypes: () => MonitorType[];
  getNotificationTypes: () => NotificationType[];
  triggerCheck: (monitorId: string) => Promise<void>;
  checkSSLStatus: (monitorId: string) => Promise<any>;
  getMonitorDiagnostics: (monitorId: string) => Promise<any>;
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

// Static notification types
const NOTIFICATION_TYPES: NotificationType[] = [
  { type: 'email', label: 'Email', description: 'Send email notifications' },
  { type: 'webhook', label: 'Webhook', description: 'HTTP webhook notifications' },
  { type: 'slack', label: 'Slack', description: 'Slack channel notifications' },
  { type: 'discord', label: 'Discord', description: 'Discord channel notifications' },
  { type: 'telegram', label: 'Telegram', description: 'Telegram bot notifications' },
  { type: 'sms', label: 'SMS', description: 'SMS text notifications' },
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

  // Fetch all monitors from backend API
  const refreshMonitors = useCallback(async () => {
    if (!user?.uid) {
      console.log('No user, skipping monitor refresh');
      return;
    }

    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 Fetching monitors from backend...');
      const monitors = await listMonitors();
      console.log(`✅ Fetched ${monitors.length} monitors from backend`);

      setStateIfMounted(prev => ({
        ...prev,
        monitors,
        loading: false,
        lastRefresh: new Date(),
      }));
    } catch (error) {
      handleError(error, 'refreshMonitors');
    }
  }, [user?.uid, setStateIfMounted, handleError]);

  // Create new monitor via backend
  const createMonitor = useCallback(async (data: CreateMonitorRequest): Promise<Monitor> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 Creating monitor via backend...');
      const monitor = await apiCreateMonitor(data);
      console.log('✅ Monitor created successfully');
      await refreshMonitors();
      return monitor;
    } catch (error) {
      handleError(error, 'createMonitor');
      throw error;
    }
  }, [user?.uid, setStateIfMounted, handleError, refreshMonitors]);

  // Update monitor via backend
  const updateMonitor = useCallback(async (id: string, data: UpdateMonitorRequest): Promise<Monitor> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 Updating monitor via backend...');
      await apiUpdateMonitor(id, data);
      console.log('✅ Monitor updated successfully');
      await refreshMonitors();
      // Return updated monitor from current state
      const updated = state.monitors.find(m => m.id === id) as Monitor;
      return updated;
    } catch (error) {
      handleError(error, 'updateMonitor');
      throw error;
    }
  }, [user?.uid, setStateIfMounted, handleError, refreshMonitors, state.monitors]);

  // Delete monitor via backend
  const deleteMonitor = useCallback(async (id: string): Promise<void> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 Deleting monitor via backend...');
      await apiDeleteMonitor(id);
      console.log('✅ Monitor deleted successfully');
      await refreshMonitors();
    } catch (error) {
      handleError(error, 'deleteMonitor');
      throw error;
    }
  }, [user?.uid, setStateIfMounted, handleError, refreshMonitors]);

  // Select monitor
  const selectMonitor = useCallback((monitor: Monitor | null) => {
    setStateIfMounted(prev => ({ ...prev, selectedMonitor: monitor }));
  }, [setStateIfMounted]);

  // Get monitor checks – use dedicated backend endpoint
  const getMonitorChecks = useCallback(async (monitorId: string, limit: number = 50): Promise<CheckResult[]> => {
    if (!user?.uid) return [];
    
    try {
      console.log(`🔄 Fetching checks for monitor ${monitorId} (backend)...`);
      const checks = await apiGetMonitorChecks(monitorId, limit);
      console.log(`✅ Fetched ${checks.length} checks`);
      return checks;
    } catch (error) {
      handleError(error, 'getMonitorChecks');
      return [];
    }
  }, [user?.uid, handleError]);

  // Get monitor incidents – use dedicated backend endpoint
  const getMonitorIncidents = useCallback(async (monitorId: string, limit: number = 20): Promise<Incident[]> => {
    if (!user?.uid) return [];
    
    try {
      console.log(`🔄 Fetching incidents for monitor ${monitorId} (backend)...`);
      const incidents = await apiGetMonitorIncidents(monitorId, limit);
      console.log(`✅ Fetched ${incidents.length} incidents`);
      return incidents;
    } catch (error) {
      handleError(error, 'getMonitorIncidents');
      return [];
    }
  }, [user?.uid, handleError]);

  // Get monitor stats – derive from backend combined data
  const getMonitorStats = useCallback(async (monitorId: string): Promise<MonitorStats> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      console.log(`🔄 Fetching stats for monitor ${monitorId}...`);
      const withChecks = await listMonitorsWithChecks({ limit: 25 });
      const target = (withChecks || []).find((m: any) => m.id === monitorId);
      if (!target) throw new Error('Monitor not found');
      const monitor = target as Monitor;
      const checks: CheckResult[] = target.recentChecks || [];
      const incidents: Incident[] = target.incidents || [];
      
      // Calculate stats
      const avgResponseTime = checks.length > 0 
        ? checks.reduce((sum, check) => sum + check.responseTime, 0) / checks.length 
        : 0;
      
      const uptime24h = checks.length > 0 
        ? (checks.filter(check => check.status).length / checks.length) * 100 
        : 100;
      
      return {
        monitor,
        stats: {
          uptime: {
            '24h': uptime24h,
            '7d': uptime24h, // Simplified for now
            '30d': uptime24h, // Simplified for now
          },
          average_response_time: avgResponseTime,
          total_checks: checks.length,
          current_incident: incidents.find(inc => inc.status === 'open') || undefined,
          regional_performance: [],
          protocol_performance: [],
          anomaly_history: [],
          sla_metrics: {
            targetUptime: 99.9,
            actualUptime: uptime24h,
            compliance: uptime24h >= 99.9 ? 100 : (uptime24h / 99.9) * 100,
            violations: incidents.filter(inc => inc.status === 'resolved').length,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching monitor stats:', error);
      throw error;
    }
  }, [user?.uid, handleError]);

  // Perform manual monitor check via backend
  const performMonitorCheck = useCallback(async (monitorId: string): Promise<CheckResult> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      console.log(`🔄 Performing manual check for monitor ${monitorId} (backend)...`);
      const result = await apiTriggerCheck(monitorId);
      console.log('✅ Manual check completed');
      return result;
    } catch (error) {
      handleError(error, 'performMonitorCheck');
      throw error;
    }
  }, [user?.uid, handleError]);

  // getSSLInfo implementation using Firebase
  const getSSLInfo = useCallback(async (monitorId: string): Promise<SSLInfoResponse> => {
    try {
      // First get the monitor to get its URL
      const monitor = state.monitors.find(m => m.id === monitorId);
      if (!monitor) {
        throw new Error('Monitor not found');
      }
      
      const res = await fetch(`/api/ssl?url=${encodeURIComponent(monitor.url)}`);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch SSL info');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching SSL info:', error);
      return {
        ssl_monitoring_enabled: false,
        ssl_cert_expires_at: '',
        ssl_cert_issuer: '',
        ssl_cert_days_until_expiry: 0,
        message: error instanceof Error ? error.message : 'SSL check failed',
      };
    }
  }, [state.monitors]);

  // testMonitor via backend test endpoint
  const testMonitor = useCallback(async (url: string, timeout?: number): Promise<TestResult> => {
    const data = await apiTestEndpoint(url, 'http', timeout);
    return {
      id: '',
      monitorId: '',
      status: data.status,
      responseTime: data.responseTime,
      message: data.message,
      statusCode: data.statusCode,
      createdAt: new Date(),
    };
  }, []);

  // Bulk update monitors via backend
  const bulkUpdateMonitors = useCallback(async (data: BulkUpdateRequest): Promise<BulkUpdateResponse> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    const result = await apiBulkUpdate(data.action, data.monitorIds);
    await refreshMonitors();
    return result.data || result;
  }, [user?.uid, refreshMonitors]);

  // Resolve incident – placeholder (would need backend incident management endpoints)
  const resolveIncident = useCallback(async (incidentId: string): Promise<void> => {
    try {
      // TODO: Implement when backend incident resolution endpoints are available
      console.log('ℹ️ Resolve incident functionality pending backend endpoint implementation');
      throw new Error('Incident resolution not yet implemented');
    } catch (error) {
      handleError(error, 'resolveIncident');
      throw error;
    }
  }, [handleError]);

  // Export monitor data
  const exportMonitorData = useCallback(async (
    monitorId: string, 
    format: 'csv' | 'json' = 'json', 
    timeRange: number = 168
  ): Promise<Blob> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    const withChecks = await listMonitorsWithChecks({ limit: 25 });
    const target = (withChecks || []).find((m: any) => m.id === monitorId);
    const checks: CheckResult[] = target?.recentChecks || [];
    const incidents: Incident[] = target?.incidents || [];
    
    const data = {
      monitorId,
      checks,
      incidents,
      exportDate: new Date().toISOString(),
    };
    
    if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else {
      // Simple CSV export
      const csvContent = [
        'Timestamp,Status,ResponseTime,StatusCode,Message',
        ...checks.map((check: CheckResult) => 
          `${check.createdAt},${check.status},${check.responseTime},${check.statusCode || ''},${check.message}`
        ).join('\n')
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv' });
    }
  }, [user?.uid]);

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

  // Polling-based refresh (backend source of truth)
  useEffect(() => {
    if (!user?.uid || !autoRefresh) return;
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(() => {
      refreshMonitors().catch(() => {});
    }, refreshInterval);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [user?.uid, autoRefresh, refreshInterval, refreshMonitors]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('🚀 Loading initial uptime data...', { user: user?.uid, hasUser: !!user });
        setStateIfMounted(prev => ({ ...prev, loading: true }));
        
        if (user?.uid) {
          await refreshMonitors();
        }
        
        console.log('✅ Initial uptime data loaded successfully');
        setStateIfMounted(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('❌ Failed to load initial uptime data:', error);
        handleError(error, 'loadInitialData');
      }
    };

    console.log('🔄 useFrontendUptime: User state changed', { user: user?.uid, hasUser: !!user });
    loadInitialData();
  }, [refreshMonitors, handleError, setStateIfMounted, user?.uid]);

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
    getMonitorSummary: async () => {
      try {
        return await apiGetSummary();
      } catch (error) {
        console.error('Failed to get monitor summary:', error);
        return null;
      }
    },
    getMonitorTypes: () => MONITOR_TYPES,
    getNotificationTypes: () => NOTIFICATION_TYPES,
    triggerCheck,
    checkSSLStatus,
    getMonitorDiagnostics,
  };
}; 