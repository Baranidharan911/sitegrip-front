import { useState, useEffect, useCallback, useRef } from 'react';
import { Monitor, UptimeLog, MonitorStats, SSLInfoResponse, CreateMonitorRequest, UpdateMonitorRequest } from '../types/uptime';
import { uptimeApi } from '../lib/uptimeApi';

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

interface UseUptimeReturn extends UseUptimeState {
  // Computed values
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
  
  // Actions
  refreshMonitors: () => Promise<void>;
  createMonitor: (data: CreateMonitorRequest) => Promise<string>;
  updateMonitor: (id: string, data: UpdateMonitorRequest) => Promise<void>;
  deleteMonitor: (id: string) => Promise<void>;
  selectMonitor: (monitor: Monitor | null) => void;
  getMonitorHistory: (monitorId: string) => Promise<UptimeLog[]>;
  getMonitorStats: (monitorId: string) => Promise<MonitorStats>;
  getSSLInfo: (monitorId: string) => Promise<SSLInfoResponse>;
  triggerCheck: (monitorId: string) => Promise<void>;
  exportMonitorData: (monitorId: string, format: 'csv' | 'json') => Promise<Blob>;
  clearError: () => void;
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
    console.error(`❌ Uptime API Error [${context}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    setStateIfMounted(prev => ({ ...prev, error: errorMessage, loading: false }));
  }, [setStateIfMounted]);

  // Refresh all monitors with real-time data
  const refreshMonitors = useCallback(async () => {
    try {
      console.log('🔄 Refreshing monitors...');
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitors = await uptimeApi.getAllMonitors();
      console.log(`✅ Loaded ${monitors.length} monitors`);
      
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
      console.log('✏️ Updating monitor...', { id, data });
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
      console.log('🗑️ Deleting monitor...', id);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await uptimeApi.deleteMonitor(id);
      console.log(`✅ Deleted monitor: ${id}`);
      
      // Remove from local state
      setStateIfMounted(prev => ({
        ...prev,
        monitors: prev.monitors.filter(m => m.id !== id),
        selectedMonitor: prev.selectedMonitor?.id === id ? null : prev.selectedMonitor,
        loading: false,
      }));
    } catch (error) {
      handleError(error, 'deleteMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError]);

  // Select monitor for detailed view
  const selectMonitor = useCallback((monitor: Monitor | null) => {
    setStateIfMounted(prev => ({ ...prev, selectedMonitor: monitor }));
  }, [setStateIfMounted]);

  // Get monitor history
  const getMonitorHistory = useCallback(async (monitorId: string): Promise<UptimeLog[]> => {
    try {
      console.log('📊 Getting monitor history...', monitorId);
      
      // Check if we already have it cached
      if (state.monitorHistory[monitorId]) {
        return state.monitorHistory[monitorId];
      }
      
      const history = await uptimeApi.getMonitorHistory(monitorId);
      console.log(`✅ Loaded ${history.length} history entries`);
      
      // Cache the result
      setStateIfMounted(prev => ({
        ...prev,
        monitorHistory: {
          ...prev.monitorHistory,
          [monitorId]: history
        }
      }));
      
      return history;
    } catch (error) {
      handleError(error, 'getMonitorHistory');
      throw error;
    }
  }, [state.monitorHistory, setStateIfMounted, handleError]);

  // Get monitor statistics
  const getMonitorStats = useCallback(async (monitorId: string): Promise<MonitorStats> => {
    try {
      console.log('📈 Getting monitor stats...', monitorId);
      
      // Check if we already have it cached
      if (state.monitorStats[monitorId]) {
        return state.monitorStats[monitorId];
      }
      
      const stats = await uptimeApi.getMonitorStats(monitorId);
      console.log('✅ Loaded monitor stats:', stats);
      
      // Cache the result
      setStateIfMounted(prev => ({
        ...prev,
        monitorStats: {
          ...prev.monitorStats,
          [monitorId]: stats
        }
      }));
      
      return stats;
    } catch (error) {
      handleError(error, 'getMonitorStats');
      throw error;
    }
  }, [state.monitorStats, setStateIfMounted, handleError]);

  // Get SSL information
  const getSSLInfo = useCallback(async (monitorId: string): Promise<SSLInfoResponse> => {
    try {
      console.log('🔒 Getting SSL info...', monitorId);
      
      // Check if we already have it cached
      if (state.sslInfo[monitorId]) {
        return state.sslInfo[monitorId];
      }
      
      const sslInfo = await uptimeApi.getSSLInfo(monitorId);
      console.log('✅ Loaded SSL info:', sslInfo);
      
      // Cache the result
      setStateIfMounted(prev => ({
        ...prev,
        sslInfo: {
          ...prev.sslInfo,
          [monitorId]: sslInfo
        }
      }));
      
      return sslInfo;
    } catch (error) {
      handleError(error, 'getSSLInfo');
      throw error;
    }
  }, [state.sslInfo, setStateIfMounted, handleError]);

  // Trigger manual check
  const triggerCheck = useCallback(async (monitorId: string): Promise<void> => {
    try {
      console.log('🔍 Triggering manual check...', monitorId);
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      await uptimeApi.triggerCheck(monitorId);
      console.log('✅ Manual check triggered');
      
      // Refresh monitors to get updated status
      await refreshMonitors();
    } catch (error) {
      handleError(error, 'triggerCheck');
      throw error;
    }
  }, [refreshMonitors, setStateIfMounted, handleError]);

  // Export monitor data
  const exportMonitorData = useCallback(async (monitorId: string, format: 'csv' | 'json'): Promise<Blob> => {
    try {
      console.log('📁 Exporting monitor data...', { monitorId, format });
      
      const blob = await uptimeApi.exportMonitorData(monitorId, format);
      console.log('✅ Monitor data exported');
      
      return blob;
    } catch (error) {
      handleError(error, 'exportMonitorData');
      throw error;
    }
  }, [handleError]);

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
      ? state.monitors.reduce((sum, m) => sum + (m.uptime_stats?.['24h'] || 0), 0) / state.monitors.length
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

  // Real-time auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      console.log(`🔄 Setting up auto-refresh every ${refreshInterval}ms`);
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
  }, [autoRefresh, refreshInterval, refreshMonitors]);

  // Initial load
  useEffect(() => {
    console.log('🚀 Initial monitor load...');
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
    triggerCheck,
    exportMonitorData,
    clearError,
  };
};

export default useUptime;
