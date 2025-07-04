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
  summary: {
    total_monitors: number;
    up_monitors: number;
    down_monitors: number;
    ssl_issues: number;
    average_uptime: number;
  } | null;
}

interface UseUptimeReturn extends UseUptimeState {
  // Computed values
  criticalMonitors: Monitor[];
  recentlyDownMonitors: Monitor[];
  expiringSSLMonitors: Monitor[];
  
  // Actions
  refreshMonitors: () => Promise<void>;
  createMonitor: (data: CreateMonitorRequest) => Promise<string>;
  updateMonitor: (id: string, data: UpdateMonitorRequest) => Promise<void>;
  deleteMonitor: (id: string) => Promise<void>;
  selectMonitor: (monitor: Monitor | null) => void;
  getMonitorHistory: (monitorId: string, timeRange?: number) => Promise<UptimeLog[]>;
  getMonitorStats: (monitorId: string) => Promise<MonitorStats>;
  getSSLInfo: (monitorId: string) => Promise<SSLInfoResponse>;
  triggerCheck: (monitorId: string) => Promise<void>;
  exportMonitorData: (monitorId: string, format: 'csv' | 'json', timeRange?: number) => Promise<Blob>;
  clearError: () => void;
  getUptimeSummary: () => Promise<void>;
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
    summary: null,
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

  // Get uptime summary
  const getUptimeSummary = useCallback(async () => {
    try {
      console.log('📊 Getting uptime summary...');
      
      const summary = await uptimeApi.getUptimeSummary();
      console.log('✅ Loaded uptime summary', summary);
      
      setStateIfMounted(prev => ({
        ...prev,
        summary
      }));
    } catch (error) {
      handleError(error, 'getUptimeSummary');
    }
  }, [setStateIfMounted, handleError]);

  // Refresh all monitors with real-time data
  const refreshMonitors = useCallback(async () => {
    try {
      console.log('🔄 Refreshing monitors...');
      setStateIfMounted(prev => ({ ...prev, loading: true, error: null }));
      
      const monitors = await uptimeApi.getAllMonitors();
      console.log(`✅ Loaded ${monitors.length} monitors`);
      
      // Also refresh the summary
      await getUptimeSummary();
      
      setStateIfMounted(prev => ({
        ...prev,
        monitors,
        loading: false,
        lastRefresh: new Date(),
      }));
    } catch (error) {
      handleError(error, 'refreshMonitors');
    }
  }, [setStateIfMounted, handleError, getUptimeSummary]);

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
      
      // Update summary
      await getUptimeSummary();
    } catch (error) {
      handleError(error, 'deleteMonitor');
      throw error;
    }
  }, [setStateIfMounted, handleError, getUptimeSummary]);

  // Select monitor for detailed view
  const selectMonitor = useCallback((monitor: Monitor | null) => {
    setStateIfMounted(prev => ({ ...prev, selectedMonitor: monitor }));
  }, [setStateIfMounted]);

  // Get monitor history
  const getMonitorHistory = useCallback(async (monitorId: string, timeRange?: number): Promise<UptimeLog[]> => {
    try {
      console.log('📊 Getting monitor history...', monitorId, timeRange ? `for ${timeRange}h` : '');
      
      const history = await uptimeApi.getMonitorHistory(monitorId, timeRange);
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
  }, [setStateIfMounted, handleError]);

  // Get monitor statistics
  const getMonitorStats = useCallback(async (monitorId: string): Promise<MonitorStats> => {
    try {
      console.log('📈 Getting monitor stats...', monitorId);
      
      const stats = await uptimeApi.getMonitorStats(monitorId);
      console.log('✅ Loaded monitor stats');
      
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
  }, [setStateIfMounted, handleError]);

  // Get SSL certificate information
  const getSSLInfo = useCallback(async (monitorId: string): Promise<SSLInfoResponse> => {
    try {
      console.log('🔒 Getting SSL info...', monitorId);
      
      const sslInfo = await uptimeApi.getSSLInfo(monitorId);
      console.log('✅ Loaded SSL info');
      
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
  }, [setStateIfMounted, handleError]);

  // Trigger a manual check
  const triggerCheck = useCallback(async (monitorId: string): Promise<void> => {
    try {
      console.log('🔄 Triggering manual check...', monitorId);
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
  const exportMonitorData = useCallback(async (monitorId: string, format: 'csv' | 'json', timeRange?: number): Promise<Blob> => {
    try {
      console.log('📥 Exporting monitor data...', { monitorId, format, timeRange });
      
      const blob = await uptimeApi.exportMonitorData(monitorId, format, timeRange);
      console.log('✅ Exported monitor data');
      
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

  // Setup auto-refresh
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await refreshMonitors();
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
    
    if (autoRefresh && refreshInterval > 0) {
      console.log(`🔄 Setting up auto-refresh every ${refreshInterval}ms`);
      refreshIntervalRef.current = setInterval(refreshMonitors, refreshInterval);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshMonitors]);

  // Compute derived values
  const criticalMonitors = state.monitors.filter(monitor => 
    monitor.status === 'down'
  );
  
  const recentlyDownMonitors = state.monitors.filter(monitor => 
    monitor.status === 'up' && monitor.failedChecks && monitor.failedChecks > 0
  );
  
  const expiringSSLMonitors = state.monitors.filter(monitor => 
    monitor.sslMonitoringEnabled && 
    monitor.sslInfo && 
    monitor.sslInfo.daysUntilExpiry !== undefined && 
    monitor.sslInfo.daysUntilExpiry < 30
  );

  return {
    ...state,
    criticalMonitors,
    recentlyDownMonitors,
    expiringSSLMonitors,
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
    getUptimeSummary
  };
};

export default useUptime;
