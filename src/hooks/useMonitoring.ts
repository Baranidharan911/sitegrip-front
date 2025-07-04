'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { API_CONFIG, MONITORING_ENDPOINTS } from '../lib/config';
import { getStoredAuthToken } from '../utils/auth';

interface Monitor {
  id: string;
  name: string;
  url: string;
  type: 'http' | 'ping' | 'tcp' | 'dns' | 'ssl' | 'keyword' | 'port';
  status: 'up' | 'down' | 'paused' | 'maintenance' | 'unknown';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  interval: number;
  timeout: number;
  retries: number;
  tags?: string[];
  notifications: boolean;
  description?: string;
  region: string;
  incidents?: number;
  createdAt: Date;
  sslInfo?: {
    valid: boolean;
    daysUntilExpiry: number;
    issuer: string;
  };
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  monitorId: string;
  monitorName: string;
  createdAt: Date;
  resolvedAt?: Date;
  duration?: number;
}

interface MonitoringStats {
  totalMonitors: number;
  upMonitors: number;
  downMonitors: number;
  overallUptime: number;
  avgResponseTime: number;
  activeIncidents: number;
  totalIncidents: number;
}

// API base URL from configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

export const useMonitoring = () => {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // API helper functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const authToken = getStoredAuthToken();

    // Convert headers to a plain object if needed
    let extraHeaders: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          extraHeaders[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          extraHeaders[key] = value;
        });
      } else {
        extraHeaders = { ...options.headers } as Record<string, string>;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  const calculateStats = useCallback((monitors: Monitor[], incidents: Incident[]): MonitoringStats => {
    const upMonitors = monitors.filter(m => m.status === 'up').length;
    const downMonitors = monitors.filter(m => m.status === 'down').length;
    const avgUptime = monitors.length > 0 ? monitors.reduce((acc, m) => acc + m.uptime, 0) / monitors.length : 0;
    const avgResponseTime = monitors.length > 0 ? monitors.reduce((acc, m) => acc + m.responseTime, 0) / monitors.length : 0;
    const activeIncidents = incidents.filter(i => i.status === 'open').length;

    return {
      totalMonitors: monitors.length,
      upMonitors,
      downMonitors,
      overallUptime: Math.round(avgUptime * 10) / 10,
      avgResponseTime: Math.round(avgResponseTime),
      activeIncidents,
      totalIncidents: incidents.length
    };
  }, []);

  const refreshData = useCallback(async () => {
    // Only fetch data if we have monitors or if this is the first initialization
    if (!hasInitialized) {
      setHasInitialized(true);
      return; // Don't fetch anything on first load
    }

    if (monitors.length === 0) {
      return; // Don't fetch if no monitors exist
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch monitors from backend
      const monitorsData = await apiCall(MONITORING_ENDPOINTS.MONITORS);
      const incidentsData = await apiCall(MONITORING_ENDPOINTS.INCIDENTS);
      
      // Transform backend data to frontend format
      const transformedMonitors: Monitor[] = monitorsData.map((monitor: any) => ({
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
        type: monitor.type,
        status: monitor.status,
        uptime: monitor.uptime || 0,
        responseTime: monitor.responseTime || 0,
        lastCheck: new Date(monitor.lastCheck),
        interval: monitor.interval,
        timeout: monitor.timeout,
        retries: monitor.retries,
        tags: monitor.tags || [],
        notifications: monitor.notifications !== false,
        description: monitor.description || '',
        region: monitor.region || 'us-east-1',
        incidents: monitor.incidents || 0,
        createdAt: new Date(monitor.createdAt),
        sslInfo: monitor.sslInfo
      }));

      const transformedIncidents: Incident[] = incidentsData.map((incident: any) => ({
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        monitorId: incident.monitorId,
        monitorName: incident.monitorName,
        createdAt: new Date(incident.createdAt),
        resolvedAt: incident.resolvedAt ? new Date(incident.resolvedAt) : undefined,
        duration: incident.duration
      }));

      const calculatedStats = calculateStats(transformedMonitors, transformedIncidents);

      setMonitors(transformedMonitors);
      setIncidents(transformedIncidents);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Failed to load monitoring data:', err);
      setError('Failed to load monitoring data');
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  }, [calculateStats, hasInitialized, monitors.length]);

  const createMonitor = useCallback(async (monitorData: Partial<Monitor>) => {
    try {
      const response = await apiCall(MONITORING_ENDPOINTS.MONITORS, {
        method: 'POST',
        body: JSON.stringify({
          name: monitorData.name,
          url: monitorData.url,
          type: monitorData.type,
          interval: (monitorData.interval || 5) * 1000, // Convert seconds to milliseconds
          timeout: (monitorData.timeout || 30) * 1000, // Convert seconds to milliseconds
          description: monitorData.description,
          notifications: monitorData.notifications ? [] : [] // Backend expects array of notification IDs
        })
      });

      // After creating the first monitor, start fetching data
      if (monitors.length === 0) {
        setHasInitialized(true);
        // Add the new monitor to local state immediately
        const newMonitor: Monitor = {
          id: response.id || Date.now().toString(),
          name: monitorData.name || '',
          url: monitorData.url || '',
          type: monitorData.type || 'http',
          status: 'unknown',
          uptime: 0,
          responseTime: 0,
          lastCheck: new Date(),
          interval: monitorData.interval || 5,
          timeout: monitorData.timeout || 30,
          retries: monitorData.retries || 3,
          tags: monitorData.tags || [],
          notifications: monitorData.notifications !== false,
          description: monitorData.description || '',
          region: monitorData.region || 'us-east-1',
          incidents: 0,
          createdAt: new Date(),
          ...monitorData
        };
        setMonitors([newMonitor]);
        setStats(calculateStats([newMonitor], []));
      } else {
        // Refresh data to get the updated list
        await refreshData();
      }
      
      toast.success('Monitor created successfully');
    } catch (err) {
      console.error('Failed to create monitor:', err);
      toast.error('Failed to create monitor');
      throw err;
    }
  }, [refreshData, monitors.length, calculateStats]);

  const updateMonitor = useCallback(async (id: string, updates: Partial<Monitor>) => {
    try {
      await apiCall(`${MONITORING_ENDPOINTS.MONITORS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });

      // Refresh data to get the updated list
      await refreshData();
      toast.success('Monitor updated successfully');
    } catch (err) {
      console.error('Failed to update monitor:', err);
      toast.error('Failed to update monitor');
      throw err;
    }
  }, [refreshData]);

  const deleteMonitor = useCallback(async (id: string) => {
    try {
      await apiCall(`${MONITORING_ENDPOINTS.MONITORS}/${id}`, {
        method: 'DELETE'
      });

      // Refresh data to get the updated list
      await refreshData();
      toast.success('Monitor deleted successfully');
    } catch (err) {
      console.error('Failed to delete monitor:', err);
      toast.error('Failed to delete monitor');
      throw err;
    }
  }, [refreshData]);

  const triggerCheck = useCallback(async (id: string) => {
    try {
      await apiCall(`${MONITORING_ENDPOINTS.MONITORS}/${id}/check`, {
        method: 'POST'
      });

      // Refresh data to get the updated status
      await refreshData();
      toast.success('Check triggered successfully');
    } catch (err) {
      console.error('Failed to trigger check:', err);
      toast.error('Failed to trigger check');
      throw err;
    }
  }, [refreshData]);

  const pauseMonitor = useCallback(async (id: string) => {
    try {
      await apiCall(`${MONITORING_ENDPOINTS.MONITORS}/${id}/pause`, {
        method: 'POST'
      });

      // Refresh data to get the updated status
      await refreshData();
      toast.success('Monitor paused');
    } catch (err) {
      console.error('Failed to pause monitor:', err);
      toast.error('Failed to pause monitor');
      throw err;
    }
  }, [refreshData]);

  const resumeMonitor = useCallback(async (id: string) => {
    try {
      await apiCall(`${MONITORING_ENDPOINTS.MONITORS}/${id}/resume`, {
        method: 'POST'
      });

      // Refresh data to get the updated status
      await refreshData();
      toast.success('Monitor resumed');
    } catch (err) {
      console.error('Failed to resume monitor:', err);
      toast.error('Failed to resume monitor');
      throw err;
    }
  }, [refreshData]);

  const resolveIncident = useCallback(async (id: string) => {
    try {
      await apiCall(`${MONITORING_ENDPOINTS.INCIDENTS}/${id}/resolve`, {
        method: 'POST'
      });

      // Refresh data to get the updated incidents
      await refreshData();
      toast.success('Incident resolved');
    } catch (err) {
      console.error('Failed to resolve incident:', err);
      toast.error('Failed to resolve incident');
      throw err;
    }
  }, [refreshData]);

  // Initial data load - only set initialized, don't fetch data
  useEffect(() => {
    setHasInitialized(true);
  }, []);

  return {
    monitors,
    incidents,
    stats,
    loading,
    error,
    refreshData,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    triggerCheck,
    pauseMonitor,
    resumeMonitor,
    resolveIncident,
    hasInitialized
  };
}; 