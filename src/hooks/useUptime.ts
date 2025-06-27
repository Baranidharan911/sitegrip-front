import { useState, useEffect, useCallback, useRef } from 'react';
import { Monitor, UptimeLog, MonitorStats, SSLInfoResponse, CreateMonitorRequest, UpdateMonitorRequest } from '../types/uptime';
import { uptimeApi } from '../lib/uptimeApi';
import { useAuth } from './useAuth';

interface UseUptimeState {
  monitors: Monitor[];
  selectedMonitor: Monitor | null;
  monitorHistory: Record<string, UptimeLog[]>;
  monitorStats: Record<string, MonitorStats>;
  sslInfo: Record<string, SSLInfoResponse>;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

interface UseUptimeActions {
  refreshMonitors: () => Promise<void>;
  createMonitor: (data: CreateMonitorRequest) => Promise<string>;
  updateMonitor: (id: string, data: UpdateMonitorRequest) => Promise<void>;
  deleteMonitor: (id: string) => Promise<void>;
  selectMonitor: (monitor: Monitor | null) => void;
  getMonitorHistory: (id: string, hours?: number) => Promise<UptimeLog[]>;
  getMonitorStats: (id: string) => Promise<MonitorStats>;
  getSSLInfo: (id: string) => Promise<SSLInfoResponse>;
  triggerCheck: (id: string) => Promise<void>;
  exportMonitorData: (id: string, format?: 'json' | 'csv', hours?: number) => Promise<void>;
  clearError: () => void;
}

interface UseUptimeReturn extends UseUptimeState, UseUptimeActions {
  summary: {
    total: number;
    up: number;
    down: number;
    sslIssues: number;
    averageUptime: number;
    averageResponseTime: number;
  };
  criticalMonitors: Monitor[];
  recentlyDownMonitors: Monitor[];
  expiringSSLMonitors: Monitor[];
}

export const useUptime = (autoRefresh: boolean = true, refreshInterval: number = 30000): UseUptimeReturn => {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<UseUptimeState>({
    monitors: [],
    selectedMonitor: null,
    monitorHistory: {},
    monitorStats: {},
    sslInfo: {},
    loading: false,
    error: null,
    lastRefresh: null,
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

  const setStateIfMounted = useCallback((updater: (prev: UseUptimeState) => UseUptimeState) => {
    if (mountedRef.current) {
      setState(updater);
    }
  }, []);

  const handleError = useCallback((error: any, context: string) => {
    console.error(`❌ Uptime API Error [${context}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    setStateIfMounted(prev => ({ ...prev, error: errorMessage, loading: false }));
  }, [setStateIfMounted]);

  // Refresh all monitors with real-time data
  const refreshMonitors = useCallback(async () => {
    // Don't fetch data if user is not authenticated
    if (!user) {
      console.log('📵 Not authenticated, skipping monitor refresh');
      setStateIfMounted(prev => ({ 
        ...prev, 
        monitors: [], 
        loading: false, 
        error: 'Please log in to view your monitors' 
      }));
      return;
    }

    try {
      console.log('🔄 Refreshing monitors for authenticated user...');
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitors = await uptimeApi.getAllMonitors();
      console.log(`✅ Loaded ${monitors.length} monitors for user ${user.uid}`);
      
      setStateIfMounted(prev => ({
        ...prev,
        monitors,
        loading: false,
        lastRefresh: new Date(),
      }));
    } catch (error) {
      handleError(error, 'refreshMonitors');
    }
  }, [user, setStateIfMounted, handleError]);

  // Create new monitor
  const createMonitor = useCallback(async (data: CreateMonitorRequest): Promise<string> => {
    try {
      console.log('🚀 Creating monitor...', data);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitorId = await uptimeApi.createMonitor(data);
      console.log(`✅ Created monitor: ${monitorId}`);
      
      // Refresh monitors to get the new one
      await refreshMonitors();
      
      return monitorId;
    } catch (error) {
      handleError(error, 'createMonitor');
      throw error;
    }
  }, [refreshMonitors, setStateIfMounted, handleError]);

  // Update existing monitor
  const updateMonitor = useCallback(async (id: string, data: UpdateMonitorRequest): Promise<void> => {
    try {
      console.log(`🔄 Updating monitor ${id}...`, data);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await uptimeApi.updateMonitor(id, data);
      console.log(`✅ Updated monitor: ${id}`);
      
      // Refresh monitors to get updated data
      await refreshMonitors();
    } catch (error) {
      handleError(error, 'updateMonitor');
      throw error;
    }
  }, [refreshMonitors, setStateIfMounted, handleError]);

  // Delete monitor
  const deleteMonitor = useCallback(async (id: string): Promise<void> => {
    try {
      console.log(`🗑️ Deleting monitor ${id}...`);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await uptimeApi.deleteMonitor(id);
      console.log(`✅ Deleted monitor: ${id}`);
      
      // Update state immediately and clean up related data
      setStateIfMounted(prev => {
        const newMonitorHistory = { ...prev.monitorHistory };
        const newMonitorStats = { ...prev.monitorStats };
        const newSSLInfo = { ...prev.sslInfo };
        delete newMonitorHistory[id];
        delete newMonitorStats[id];
        delete newSSLInfo[id];

        return {
          ...prev,
          monitors: prev.monitors.filter(m => m.id !== id),
          selectedMonitor: prev.selectedMonitor?.id === id ? null : prev.selectedMonitor,
          monitorHistory: newMonitorHistory,
          monitorStats: newMonitorStats,
          sslInfo: newSSLInfo,
          loading: false,
        };
      });
    } catch (error) {
      handleError(error, 'deleteMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // Select monitor
  const selectMonitor = useCallback((monitor: Monitor | null) => {
    setStateIfMounted(prev => ({ ...prev, selectedMonitor: monitor }));
  }, [setStateIfMounted]);

  // Get monitor history
  const getMonitorHistory = useCallback(async (id: string, hours: number = 24): Promise<UptimeLog[]> => {
    try {
      console.log(`📊 Getting history for monitor ${id} (${hours}h)...`);
      const history = await uptimeApi.getMonitorHistory(id, hours);
      console.log(`✅ Loaded ${history.length} log entries for monitor ${id}`);
      
      setStateIfMounted(prev => ({
        ...prev,
        monitorHistory: { ...prev.monitorHistory, [id]: history }
      }));
      
      return history;
    } catch (error) {
      handleError(error, 'getMonitorHistory');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // Get monitor stats
  const getMonitorStats = useCallback(async (id: string): Promise<MonitorStats> => {
    try {
      console.log(`📈 Getting stats for monitor ${id}...`);
      const stats = await uptimeApi.getMonitorStats(id);
      console.log(`✅ Loaded stats for monitor ${id}`);
      
      setStateIfMounted(prev => ({
        ...prev,
        monitorStats: { ...prev.monitorStats, [id]: stats }
      }));
      
      return stats;
    } catch (error) {
      handleError(error, 'getMonitorStats');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // Get SSL info
  const getSSLInfo = useCallback(async (id: string): Promise<SSLInfoResponse> => {
    try {
      console.log(`🔒 Getting SSL info for monitor ${id}...`);
      const sslInfo = await uptimeApi.getSSLInfo(id);
      console.log(`✅ Loaded SSL info for monitor ${id}`);
      
      setStateIfMounted(prev => ({
        ...prev,
        sslInfo: { ...prev.sslInfo, [id]: sslInfo }
      }));
      
      return sslInfo;
    } catch (error) {
      handleError(error, 'getSSLInfo');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // Trigger immediate check
  const triggerCheck = useCallback(async (id: string): Promise<void> => {
    try {
      console.log(`⚡ Triggering check for monitor ${id}...`);
      const result = await uptimeApi.triggerCheck(id);
      console.log(`✅ Check completed for monitor ${id}:`, result);
      
      // Refresh monitors to get updated status
      await refreshMonitors();
    } catch (error) {
      handleError(error, 'triggerCheck');
      throw error;
    }
  }, [refreshMonitors, handleError]);

  // Export monitor data
  const exportMonitorData = useCallback(async (
    id: string, 
    format: 'json' | 'csv' = 'json', 
    hours: number = 168
  ): Promise<void> => {
    try {
      console.log(`📁 Exporting data for monitor ${id}...`);
      const blob = await uptimeApi.exportMonitorData(id, format, hours);
      const monitor = state.monitors.find(m => m.id === id);
      const filename = `${monitor?.name || 'monitor'}-${id}-${format === 'csv' ? 'data.csv' : 'data.json'}`;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Exported data for monitor ${id}`);
    } catch (error) {
      handleError(error, 'exportMonitorData');
      throw error;
    }
  }, [state.monitors, handleError]);

  // Clear error
  const clearError = useCallback(() => {
    setStateIfMounted(prev => ({ ...prev, error: null }));
  }, [setStateIfMounted]);

  // Computed values with real-time calculations
  const summary = {
    total: state.monitors.length,
    up: state.monitors.filter(m => m.last_status === 'up').length,
    down: state.monitors.filter(m => m.last_status === 'down').length,
    sslIssues: state.monitors.filter(m => 
      m.ssl_status === 'expired' || 
      m.ssl_status === 'expiring_soon' ||
      m.ssl_status === 'invalid'
    ).length,
    averageUptime: state.monitors.length > 0 
      ? state.monitors.reduce((sum, m) => sum + (m.uptime_stats['24h'] || 0), 0) / state.monitors.length 
      : 0,
    averageResponseTime: state.monitors.length > 0 
      ? state.monitors.reduce((sum, m) => sum + (m.last_response_time || 0), 0) / state.monitors.length 
      : 0,
  };

  const criticalMonitors = state.monitors.filter(m => 
    m.last_status === 'down' || m.failures_in_a_row >= 3
  );

  const recentlyDownMonitors = state.monitors.filter(m => 
    m.last_status === 'up' && m.failures_in_a_row > 0
  );

  const expiringSSLMonitors = state.monitors.filter(m => 
    m.ssl_status === 'expiring_soon' && 
    m.ssl_cert_days_until_expiry !== null &&
    m.ssl_cert_days_until_expiry !== undefined &&
    m.ssl_cert_days_until_expiry <= 30
  );

  // Real-time auto-refresh setup - only when authenticated
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0 && user && !authLoading) {
      console.log(`🔄 Setting up auto-refresh every ${refreshInterval}ms for user ${user.uid}`);
      refreshIntervalRef.current = setInterval(() => {
        refreshMonitors();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          console.log('🛑 Clearing auto-refresh interval');
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, user, authLoading, refreshMonitors]);

  // Initial load - only when user is available and not loading
  useEffect(() => {
    if (!authLoading) {
      console.log('🚀 Initial monitor load...');
      refreshMonitors();
    }
  }, [authLoading, refreshMonitors]);

  return {
    // State
    ...state,
    
    // Computed values
    summary,
    criticalMonitors,
    recentlyDownMonitors,
    expiringSSLMonitors,
    
    // Actions
    refreshMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    selectMonitor,
    getMonitorHistory,
    getMonitorStats,
    getSSLInfo,
    triggerCheck,
    exportMonitorData,
    clearError,
  };
};

export default useUptime;
