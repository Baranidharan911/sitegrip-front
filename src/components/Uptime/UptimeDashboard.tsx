'use client';

import React, { useState, useEffect } from 'react';
import { useFrontendUptime } from '../../hooks/useFrontendUptime';
import { Monitor } from '../../types/uptime';
import UptimeStatsCard from './UptimeStatsCard';
import MonitorForm from './MonitorForm';
import UptimeHistory from './UptimeHistory';
import IncidentList from './IncidentList';
import MonitoringStatus from './MonitoringStatus';

// Icons (using Heroicons or similar)
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

interface TabType {
  id: string;
  name: string;
  icon: React.ReactNode;
  count?: number;
}

const UptimeDashboard: React.FC = () => {
  const {
    monitors,
    selectedMonitor,
    loading,
    error,
    summary,
    criticalMonitors,
    expiringSSLMonitors,
    monitorTypes,
    notificationTypes,
    lastRefresh,
    refreshMonitors,
    selectMonitor,
    deleteMonitor,
    triggerCheck,
    clearError,
    getMonitorSummary,
  } = useFrontendUptime(true, 30000); // Auto-refresh every 30 seconds

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAddMonitor, setShowAddMonitor] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'up' | 'down' | 'ssl-issues'>('all');
  const [deletingMonitor, setDeletingMonitor] = useState<string | null>(null);

  // Filter monitors based on search and status filter
  const filteredMonitors = monitors.filter(monitor => {
    const matchesSearch = monitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         monitor.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'up' && monitor.status === true) ||
                         (filterStatus === 'down' && monitor.status === false) ||
                         (filterStatus === 'ssl-issues' && (
                           monitor.ssl_status === 'expired' ||
                           monitor.ssl_status === 'expiring_soon' ||
                           monitor.ssl_status === 'invalid' ||
                           (monitor.ssl_cert_days_until_expiry !== undefined && monitor.ssl_cert_days_until_expiry < 30)
                         ));
    
    return matchesSearch && matchesFilter;
  });

  const tabs: TabType[] = [
    { id: 'overview', name: 'Overview', icon: <ChartIcon /> },
    { id: 'monitors', name: 'Monitors', icon: <RefreshIcon />, count: monitors?.length || 0 },
    { id: 'incidents', name: 'Incidents', icon: <AlertIcon />, count: criticalMonitors?.length || 0 },
    { id: 'ssl', name: 'SSL Certificates', icon: <ShieldIcon />, count: expiringSSLMonitors?.length || 0 },
  ];

  const handleRefresh = async () => {
    try {
      await refreshMonitors();
    } catch (error) {
      console.error('Failed to refresh monitors:', error);
    }
  };

  const handleEditMonitor = (monitor: Monitor) => {
    setEditingMonitor(monitor);
  };

  const handleDeleteMonitor = async (monitorId: string) => {
    if (window.confirm('Are you sure you want to delete this monitor? This action cannot be undone.')) {
      try {
        setDeletingMonitor(monitorId);
        await deleteMonitor(monitorId);
        console.log('✅ Monitor deleted successfully');
      } catch (error) {
        console.error('❌ Failed to delete monitor:', error);
      } finally {
        setDeletingMonitor(null);
      }
    }
  };

  const handleTriggerCheck = async (monitorId: string) => {
    try {
      await triggerCheck(monitorId);
      console.log('✅ Manual check triggered successfully');
    } catch (error) {
      console.error('❌ Failed to trigger check:', error);
    }
  };

  const closeMonitorForm = () => {
    setShowAddMonitor(false);
    setEditingMonitor(null);
  };

  const handleMonitorSaved = () => {
    closeMonitorForm();
    // The useUptime hook will automatically refresh the monitors
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'up':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'down':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'bg-green-500';
    if (uptime >= 95) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Uptime Monitoring
              </h1>
              {lastRefresh && (
                <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshIcon />
                <span className="ml-2">Refresh</span>
              </button>
              
              <button
                onClick={() => setShowAddMonitor(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon />
                <span className="ml-2">Add Monitor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertIcon />
              <span className="ml-2 text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <RefreshIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Monitors</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary?.totalMonitors || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Online</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{summary?.upMonitors || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Offline</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{summary?.downMonitors || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                    <ShieldIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">SSL Issues</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{summary?.activeIncidents || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.name}</span>
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Monitoring Status */}
            <MonitoringStatus />
            
            {monitors.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                    <RefreshIcon />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Welcome to Uptime Monitoring
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Start monitoring your websites in real-time. Add your first monitor to see uptime statistics, response times, and get alerts when your sites go down.
                </p>
                <button
                  onClick={() => setShowAddMonitor(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon />
                  <span className="ml-2">Add Your First Monitor</span>
                </button>
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Average Uptime</h3>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {(0).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Last 24 hours</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Average Response Time</h3>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {monitors.length > 0 
                        ? (monitors.reduce((sum, m) => sum + (m.lastResponseTime || 0), 0) / monitors.length).toFixed(0)
                        : 0}ms
                    </div>
                    {monitors.length > 0 && monitors[0].lastResponseTime && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {monitors[0].lastResponseTime}ms last response
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Critical Monitors */}
            {monitors.length > 0 && criticalMonitors.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertIcon />
                  <span className="ml-2">Critical Issues</span>
                </h3>
                <div className="space-y-3">
                  {criticalMonitors.slice(0, 5).map((monitor) => (
                    <div key={monitor.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <div className="flex items-center">
                        {getStatusIcon(monitor.status === true ? 'up' : monitor.status === false ? 'down' : 'unknown')}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {monitor.name || monitor.url}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {typeof monitor.status === 'boolean' ? (monitor.status ? 'UP' : 'DOWN') : 'UNKNOWN'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTriggerCheck(monitor.id)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Check Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'monitors' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search monitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Monitors</option>
                  <option value="up">Online Only</option>
                  <option value="down">Offline Only</option>
                  <option value="ssl-issues">SSL Issues</option>
                </select>
              </div>
            </div>

            {/* Monitors List */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              {loading && monitors.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading monitors...</p>
                </div>
              ) : filteredMonitors.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                      <RefreshIcon />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {monitors.length === 0 ? 'Start Monitoring Your Websites' : 'No monitors match your search'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {monitors.length === 0 
                      ? 'Add your first website to begin real-time uptime monitoring. Get instant alerts when your sites go down.'
                      : 'Try adjusting your search terms or filters.'
                    }
                  </p>
                  {monitors.length === 0 && (
                    <button
                      onClick={() => setShowAddMonitor(true)}
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon />
                      <span className="ml-2">Add Your First Monitor</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMonitors.map((monitor) => (
                    <div key={monitor.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          {getStatusIcon(monitor.status === true ? 'up' : monitor.status === false ? 'down' : 'unknown')}
                          <div className="ml-4 flex-1 min-w-0">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {monitor.name || monitor.url}
                              </h3>
                              {monitor.ssl_monitoring_enabled && (
                                <ShieldIcon />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {monitor.url}
                            </p>
                            <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className={getStatusColor(monitor.status === true ? 'up' : monitor.status === false ? 'down' : 'unknown')}>
                                {typeof monitor.status === 'boolean' ? (monitor.status ? 'UP' : 'DOWN') : 'UNKNOWN'}
                              </span>
                              {monitor.lastResponseTime && (
                                <span>{monitor.lastResponseTime}ms</span>
                              )}
                              <span>24h: {monitor.uptime_stats?.['24h']?.toFixed(1) || 0}%</span>
                              {monitor.lastCheck && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  Last checked: {new Date(monitor.lastCheck).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleTriggerCheck(monitor.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Check now"
                          >
                            <RefreshIcon />
                          </button>
                          <button
                            onClick={() => handleEditMonitor(monitor)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Edit monitor"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteMonitor(monitor.id)}
                            disabled={deletingMonitor === monitor.id}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                            title="Delete monitor"
                          >
                            {deletingMonitor === monitor.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <DeleteIcon />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <IncidentList monitors={monitors} />
        )}

        {activeTab === 'ssl' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">SSL Certificate Status</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {monitors
                  .filter(monitor => monitor.ssl_monitoring_enabled)
                  .map((monitor) => {
                    const isExpiring = monitor.ssl_cert_days_until_expiry !== undefined && monitor.ssl_cert_days_until_expiry < 30;
                    const isValid = monitor.ssl_status === 'valid';
                    
                    return (
                      <div key={monitor.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {monitor.name || monitor.url}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {monitor.url}
                            </p>
                            <div className="flex items-center mt-2 space-x-4 text-xs">
                              <span className={`px-2 py-1 rounded-full ${
                                isValid && !isExpiring 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {isValid ? (isExpiring ? 'Expiring Soon' : 'Valid') : 'Invalid'}
                              </span>
                              {monitor.ssl_cert_days_until_expiry !== undefined && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  Expires in {monitor.ssl_cert_days_until_expiry} days
                                </span>
                              )}
                              {monitor.ssl_cert_issuer && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  Issued by {monitor.ssl_cert_issuer}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {monitors.filter(monitor => monitor.ssl_monitoring_enabled).length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No SSL monitoring enabled on any monitors.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

              {/* Monitor Form Modal */}
        {(showAddMonitor || editingMonitor) && (
          <MonitorForm
            isOpen={showAddMonitor || !!editingMonitor}
            onClose={closeMonitorForm}
            monitorTypes={monitorTypes || []}
            notificationTypes={notificationTypes || []}
            editMonitor={editingMonitor}
          />
        )}

      {/* Monitor History Modal */}
      {selectedMonitor && (
        <UptimeHistory
          monitor={selectedMonitor}
          onClose={() => selectMonitor(null)}
          isOpen={true}
        />
      )}
    </div>
  );
};

export default UptimeDashboard;
