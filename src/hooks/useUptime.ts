import { useState, useEffect, useCallback, useRef } from 'react';
import { Monitor, UptimeLog, MonitorStats, SSLInfoResponse, CreateMonitorRequest, UpdateMonitorRequest } from '../types/uptime';
import uptimeApi from '../lib/uptimeApi';

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
  exportMonitorData: (id: string, format?: 'json' | 'csv', hours?: number) => Promise<void>;
  refreshMonitor: (id: string) => Promise<void>;
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
    console.error(`Uptime API Error [${context}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    setStateIfMounted(prev => ({ ...prev, error: errorMessage, loading: false }));
  }, [setStateIfMounted]);

  // Refresh all monitors
  const refreshMonitors = useCallback(async () => {
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitors = await uptimeApi.getAllMonitors();
      
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

  // Create new monitor
  const createMonitor = useCallback(async (data: CreateMonitorRequest): Promise<string> => {
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitorId = await uptimeApi.createMonitor(data);
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
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await uptimeApi.updateMonitor(id, data);
      await refreshMonitors();
    } catch (error) {
      handleError(error, 'updateMonitor');
      throw error;
    }
  }, [refreshMonitors, setStateIfMounted, handleError]);

  // Delete monitor
  const deleteMonitor = useCallback(async (id: string): Promise<void> => {
    try {
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await uptimeApi.deleteMonitor(id);
      
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
      const history = await uptimeApi.getMonitorHistory(id, hours);
      
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
      const stats = await uptimeApi.getMonitorStats(id);
      
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
      const sslInfo = await uptimeApi.getSSLInfo(id);
      
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

  // Export monitor data
  const exportMonitorData = useCallback(async (
    id: string, 
    format: 'json' | 'csv' = 'json', 
    hours: number = 168
  ): Promise<void> => {
    try {
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
    } catch (error) {
      handleError(error, 'exportMonitorData');
      throw error;
    }
  }, [state.monitors, handleError]);

  // Refresh single monitor
  const refreshMonitor = useCallback(async (id: string): Promise<void> => {
    try {
      await uptimeApi.refreshMonitor(id);
      // Refresh the specific monitor data
      await Promise.all([
        getMonitorStats(id),
        getMonitorHistory(id, 24),
        getSSLInfo(id)
      ]);
    } catch (error) {
      handleError(error, 'refreshMonitor');
      throw error;
    }
  }, [getMonitorStats, getMonitorHistory, getSSLInfo, handleError]);

  // Clear error
  const clearError = useCallback(() => {
    setStateIfMounted(prev => ({ ...prev, error: null }));
  }, [setStateIfMounted]);

  // Computed values
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
    m.ssl_cert_days_until_expiry && 
    m.ssl_cert_days_until_expiry <= 30
  );

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshMonitors();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshMonitors]);

  // Initial load
  useEffect(() => {
    refreshMonitors();
  }, [refreshMonitors]);

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
    exportMonitorData,
    refreshMonitor,
    clearError,
  };
};

export default useUptime;
