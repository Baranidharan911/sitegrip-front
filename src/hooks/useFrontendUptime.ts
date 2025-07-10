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

  // Fetch all monitors from Firebase Firestore
  const refreshMonitors = useCallback(async () => {
    if (!user?.uid) {
      console.log('No user, skipping monitor refresh');
      return;
    }

    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 Fetching monitors from Firebase...');
      
      const monitors = await firebaseMonitoringService.getAllMonitors(user.uid);
      console.log(`✅ Fetched ${monitors.length} monitors from Firebase`);

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

  // Create new monitor using Firebase
  const createMonitor = useCallback(async (data: CreateMonitorRequest): Promise<Monitor> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 Creating monitor in Firebase...');
      
      const monitor = await firebaseMonitoringService.createMonitor(user.uid, {
        name: data.name,
        url: data.url,
        type: data.type,
        status: true, // Default to active status
        interval: data.interval || 300, // 5 minutes
        timeout: data.timeout || 30,
        retries: data.retries || 3,
        tags: data.tags || [],
        notifications: data.notifications || [],
        threshold: data.threshold || { responseTime: 5000, statusCode: 200 },
        description: data.description || '',
        isActive: data.isActive !== false,
        expectedStatusCode: data.expectedStatusCode || 200,
        retryInterval: data.retryInterval || 60,
      });
      
      console.log('✅ Monitor created successfully');
      await refreshMonitors();
      return monitor;
    } catch (error) {
      handleError(error, 'createMonitor');
      throw error;
    }
  }, [user?.uid, setStateIfMounted, handleError, refreshMonitors]);

  // Update monitor using Firebase
  const updateMonitor = useCallback(async (id: string, data: UpdateMonitorRequest): Promise<Monitor> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 Updating monitor in Firebase...');
      
      const monitor = await firebaseMonitoringService.updateMonitor(user.uid, id, data);
      console.log('✅ Monitor updated successfully');
      await refreshMonitors();
      return monitor;
    } catch (error) {
      handleError(error, 'updateMonitor');
      throw error;
    }
  }, [user?.uid, setStateIfMounted, handleError, refreshMonitors]);

  // Delete monitor using Firebase
  const deleteMonitor = useCallback(async (id: string): Promise<void> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      console.log('🔄 Deleting monitor from Firebase...');
      
      await firebaseMonitoringService.deleteMonitor(user.uid, id);
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

  // Get monitor checks from Firebase
  const getMonitorChecks = useCallback(async (monitorId: string, limit: number = 50): Promise<CheckResult[]> => {
    if (!user?.uid) return [];
    
    try {
      console.log(`🔄 Fetching checks for monitor ${monitorId}...`);
      const checks = await firebaseMonitoringService.getMonitorChecks(user.uid, monitorId, limit);
      console.log(`✅ Fetched ${checks.length} checks`);
      return checks;
    } catch (error) {
      handleError(error, 'getMonitorChecks');
      return [];
    }
  }, [user?.uid, handleError]);

  // Get monitor incidents from Firebase
  const getMonitorIncidents = useCallback(async (monitorId: string, limit: number = 20): Promise<Incident[]> => {
    if (!user?.uid) return [];
    
    try {
      console.log(`🔄 Fetching incidents for monitor ${monitorId}...`);
      const incidents = await firebaseMonitoringService.getIncidents(monitorId, user.uid);
      console.log(`✅ Fetched ${incidents.length} incidents`);
      return incidents.slice(0, limit);
    } catch (error) {
      handleError(error, 'getMonitorIncidents');
      return [];
    }
  }, [user?.uid, handleError]);

  // Get monitor stats from Firebase
  const getMonitorStats = useCallback(async (monitorId: string): Promise<MonitorStats> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      console.log(`🔄 Fetching stats for monitor ${monitorId}...`);
      const monitor = await firebaseMonitoringService.getMonitorById(user.uid, monitorId);
      if (!monitor) throw new Error('Monitor not found');
      
      // Get recent checks for stats calculation
      const checks = await firebaseMonitoringService.getMonitorChecks(user.uid, monitorId, 100);
      const incidents = await firebaseMonitoringService.getIncidents(monitorId, user.uid);
      
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

  // Perform manual monitor check
  const performMonitorCheck = useCallback(async (monitorId: string): Promise<CheckResult> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    try {
      console.log(`🔄 Performing manual check for monitor ${monitorId}...`);
      
      // Get monitor details
      const monitor = await firebaseMonitoringService.getMonitorById(user.uid, monitorId);
      if (!monitor) throw new Error('Monitor not found');
      
      // Perform HTTP check
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await fetch(monitor.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebWatch/1.0)',
          },
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        const status = response.ok;
        
        // Save check result to Firebase
        const checkResult = await firebaseMonitoringService.saveCheckResult(user.uid, {
          monitorId,
          status,
          responseTime,
          statusCode: response.status,
          message: status ? 'Manual check successful' : `HTTP ${response.status}`,
          createdAt: new Date(),
        });
        
        console.log('✅ Manual check completed');
        return checkResult;
      } catch (error: any) {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        // Save failed check result
        const checkResult = await firebaseMonitoringService.saveCheckResult(user.uid, {
          monitorId,
          status: false,
          responseTime,
          statusCode: undefined,
          message: error.message || 'Manual check failed',
          error: error.message,
          createdAt: new Date(),
        });
        
        console.log('❌ Manual check failed');
        return checkResult;
      }
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

  // Bulk update monitors
  const bulkUpdateMonitors = useCallback(async (data: BulkUpdateRequest): Promise<BulkUpdateResponse> => {
    if (!user?.uid) throw new Error('User not authenticated');
    
    const results = [];
    let successful = 0;
    let failed = 0;
    
    for (const monitorId of data.monitorIds) {
      try {
        if (data.action === 'pause') {
          await firebaseMonitoringService.updateMonitor(user.uid, monitorId, { isActive: false });
        } else if (data.action === 'resume') {
          await firebaseMonitoringService.updateMonitor(user.uid, monitorId, { isActive: true });
        } else if (data.action === 'delete') {
          await firebaseMonitoringService.deleteMonitor(user.uid, monitorId);
        }
        
        results.push({ id: monitorId, success: true });
        successful++;
      } catch (error) {
        results.push({ id: monitorId, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        failed++;
      }
    }
    
    return {
      action: data.action,
      results,
      summary: { total: data.monitorIds.length, successful, failed }
    };
  }, [user?.uid]);

  // Resolve incident
  const resolveIncident = useCallback(async (incidentId: string): Promise<void> => {
    try {
      await firebaseMonitoringService.resolveIncident(incidentId);
      console.log('✅ Incident resolved');
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
    
    const checks = await firebaseMonitoringService.getMonitorChecks(user.uid, monitorId, 1000);
    const incidents = await firebaseMonitoringService.getIncidents(monitorId, user.uid);
    
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
        ...checks.map(check => 
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

  // Real-time subscription setup
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 Setting up real-time Firebase listeners...');
    
    // Subscribe to monitors
    const unsubscribeMonitors = firebaseMonitoringService.subscribeToMonitors(user.uid, (monitors) => {
      console.log('📡 Real-time monitors update:', monitors.length);
      setStateIfMounted(prev => ({ ...prev, monitors }));
    });

    // Subscribe to incidents
    const unsubscribeIncidents = firebaseMonitoringService.subscribeToIncidents(user.uid, (incidents) => {
      console.log('📡 Real-time incidents update:', incidents.length);
      setStateIfMounted(prev => ({ ...prev, monitorIncidents: { [user.uid]: incidents } }));
    });

    // Store unsubscribe functions
    unsubscribeRef.current = () => {
      unsubscribeMonitors();
      unsubscribeIncidents();
    };

    return () => {
      unsubscribeMonitors();
      unsubscribeIncidents();
    };
  }, [user?.uid, setStateIfMounted]);

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
    getMonitorSummary: () => {},
    getMonitorTypes: () => {},
    getNotificationTypes: () => {},
    triggerCheck,
  };
}; 