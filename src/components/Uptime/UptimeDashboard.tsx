'use client';

import React, { useState, useEffect } from 'react';
import { useUptime } from '../../hooks/useUptime';
import { Monitor } from '../../types/uptime';
import UptimeStatsCard from './UptimeStatsCard';
import MonitorForm from './MonitorForm';
import UptimeHistory from './UptimeHistory';
import IncidentList from './IncidentList';

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
    lastRefresh,
    refreshMonitors,
    selectMonitor,
    clearError,
  } = useUptime(true, 30000); // Auto-refresh every 30 seconds

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAddMonitor, setShowAddMonitor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'up' | 'down' | 'ssl-issues'>('all');

  // Filter monitors based on search and status filter
  const filteredMonitors = monitors.filter(monitor => {
    const matchesSearch = monitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         monitor.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'up' && monitor.last_status === 'up') ||
                         (filterStatus === 'down' && monitor.last_status === 'down') ||
                         (filterStatus === 'ssl-issues' && (monitor.ssl_status === 'expired' || monitor.ssl_status === 'expiring_soon'));
    
    return matchesSearch && matchesFilter;
  });

  const tabs: TabType[] = [
    { id: 'overview', name: 'Overview', icon: <ChartIcon /> },
    { id: 'monitors', name: 'Monitors', icon: <RefreshIcon />, count: monitors.length },
    { id: 'incidents', name: 'Incidents', icon: <AlertIcon />, count: criticalMonitors.length },
    { id: 'ssl', name: 'SSL Certificates', icon: <ShieldIcon />, count: expiringSSLMonitors.length },
  ];

  const handleRefresh = async () => {
    try {
      await refreshMonitors();
    } catch (error) {
      console.error('Failed to refresh monitors:', error);
    }
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
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.total}</p>
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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.up}</p>
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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.down}</p>
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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary.sslIssues}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                {tab.icon}
                <span className="ml-2">{tab.name}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Critical Issues Alert */}
            {criticalMonitors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <AlertIcon />
                  <h3 className="ml-2 text-lg font-medium text-red-800 dark:text-red-200">
                    Critical Issues ({criticalMonitors.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {criticalMonitors.slice(0, 6).map((monitor) => (
                    <div
                      key={monitor.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-700 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => selectMonitor(monitor)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {monitor.name || monitor.url}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {monitor.url}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            {monitor.last_status === 'down' ? 'DOWN' : `${monitor.failures_in_a_row} failures`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SSL Expiring Soon Alert */}
            {expiringSSLMonitors.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <ShieldIcon />
                  <h3 className="ml-2 text-lg font-medium text-yellow-800 dark:text-yellow-200">
                    SSL Certificates Expiring Soon ({expiringSSLMonitors.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expiringSSLMonitors.slice(0, 6).map((monitor) => (
                    <div
                      key={monitor.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => selectMonitor(monitor)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {monitor.name || monitor.url}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Expires in {monitor.ssl_cert_days_until_expiry} days
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            SSL
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Statistics */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Overall Statistics (24h)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {summary.averageUptime.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Average Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {summary.averageResponseTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Average Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {((summary.up / summary.total) * 100 || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Services Online</div>
                </div>
              </div>
            </div>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="up">Online</option>
                  <option value="down">Offline</option>
                  <option value="ssl-issues">SSL Issues</option>
                </select>
              </div>
            </div>

            {/* Monitors Grid */}
            {loading && filteredMonitors.length === 0 ? (
              <div className="text-center py-12">
                <RefreshIcon />
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading monitors...</p>
              </div>
            ) : filteredMonitors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {monitors.length === 0 ? 'No monitors configured yet.' : 'No monitors match your search.'}
                </p>
                {monitors.length === 0 && (
                  <button
                    onClick={() => setShowAddMonitor(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon />
                    <span className="ml-2">Add Your First Monitor</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMonitors.map((monitor) => (
                  <UptimeStatsCard
                    key={monitor.id}
                    monitor={monitor}
                    onClick={() => selectMonitor(monitor)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'incidents' && (
          <IncidentList monitors={criticalMonitors} />
        )}

        {activeTab === 'ssl' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  SSL Certificate Status
                </h3>
              </div>
              <div className="p-6">
                {monitors.filter(m => m.url.startsWith('https://')).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No HTTPS monitors configured yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {monitors
                      .filter(m => m.url.startsWith('https://'))
                      .map((monitor) => (
                        <div
                          key={monitor.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => selectMonitor(monitor)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <ShieldIcon />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {monitor.name || monitor.url}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {monitor.url}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {monitor.ssl_cert_days_until_expiry && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Expires in {monitor.ssl_cert_days_until_expiry} days
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              monitor.ssl_status === 'valid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : monitor.ssl_status === 'expiring_soon'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {monitor.ssl_status || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monitor Form Modal */}
      {showAddMonitor && (
        <MonitorForm
          onClose={() => setShowAddMonitor(false)}
          onSuccess={() => {
            setShowAddMonitor(false);
            refreshMonitors();
          }}
        />
      )}

      {/* Monitor Details Modal */}
      {selectedMonitor && (
        <UptimeHistory
          monitor={selectedMonitor}
          onClose={() => selectMonitor(null)}
        />
      )}
    </div>
  );
};

export default UptimeDashboard;
