'use client';

import React, { useState, useEffect } from 'react';
import { useFrontendUptime } from '../../../hooks/useFrontendUptime';

const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

export default function StatusPage() {
  const {
    monitors,
    summary,
    lastRefresh,
    loading,
    refreshMonitors,
  } = useFrontendUptime(true, 60000); // Auto-refresh every minute for status page

  const [showAllMonitors, setShowAllMonitors] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter public monitors (you might want to add a public field to monitors)
  const publicMonitors = monitors.filter(monitor => monitor.is_public !== false);

  // Get overall system status
  const getOverallStatus = () => {
    const downMonitors = publicMonitors.filter(m => m.last_status === 'down').length;
    const degradedMonitors = publicMonitors.filter(m => 
      (m.failures_in_a_row ?? 0) > 0 && m.last_status === 'up'
    ).length;
    
    if (downMonitors > 0) return 'down';
    if (degradedMonitors > 0) return 'degraded';
    return 'operational';
  };

  const overallStatus = getOverallStatus();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'operational':
        return {
          text: 'All Systems Operational',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          icon: <CheckIcon />,
        };
      case 'degraded':
        return {
          text: 'Degraded Performance',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          icon: <AlertIcon />,
        };
      case 'down':
        return {
          text: 'Service Disruption',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          icon: <XIcon />,
        };
      default:
        return {
          text: 'Status Unknown',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          icon: <AlertIcon />,
        };
    }
  };

  const statusInfo = getStatusInfo(overallStatus);

  const getMonitorStatusBadge = (monitor: any) => {
    if (monitor.last_status === 'down') {
      return {
        text: 'Down',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        icon: <XIcon />,
      };
    }
    
    if (monitor.failures_in_a_row > 0) {
      return {
        text: 'Degraded',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: <AlertIcon />,
      };
    }
    
    return {
      text: 'Operational',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      icon: <CheckIcon />,
    };
  };

  const handleRefresh = async () => {
    if (loading) return;
    try {
      await refreshMonitors();
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        handleRefresh();
      }, 60000); // Refresh every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <GlobeIcon />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            System Status
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Real-time status of all monitored services
          </p>
          
          {/* Overall Status */}
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${statusInfo.color} ${statusInfo.bgColor}`}>
            <span className="mr-2">{statusInfo.icon}</span>
            {statusInfo.text}
          </div>
          
          {/* Last Updated */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {lastRefresh ? (
                <>
                  Last updated: {lastRefresh.toLocaleString()}
                </>
              ) : (
                'Loading...'
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
            >
              <RefreshIcon />
              <span className="ml-1">Refresh</span>
            </button>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Auto-refresh</span>
            </label>
          </div>
        </div>

        {/* Current Incidents */}
        {publicMonitors.some(m => m.last_status === 'down' || (m.failures_in_a_row ?? 0) > 0) && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🚨 Current Incidents
            </h2>
            <div className="space-y-3">
              {publicMonitors
                .filter(m => m.last_status === 'down' || (m.failures_in_a_row ?? 0) > 0)
                .map((monitor) => {
                  const badge = getMonitorStatusBadge(monitor);
                  return (
                    <div
                      key={monitor.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                          <span className="mr-1 opacity-75">{badge.icon}</span>
                          {badge.text}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {monitor.name || 'Unnamed Service'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {monitor.last_status === 'down' ? (
                          `Down since ${monitor.lastCheck ? new Date(monitor.lastCheck).toLocaleString() : 'Unknown'}`
                        ) : (
                          `${monitor.failures_in_a_row ?? 0} failed attempts`
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <GlobeIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Services</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{publicMonitors.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Operational</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                    {publicMonitors.filter(m => m.last_status === 'up' && m.failures_in_a_row === 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                    <AlertIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Degraded</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                    {publicMonitors.filter(m => (m.failures_in_a_row ?? 0) > 0 && m.last_status === 'up').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <XIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Down</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                    {publicMonitors.filter(m => m.last_status === 'down').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Monitored Services
              </h2>
              <button
                onClick={() => setShowAllMonitors(!showAllMonitors)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {showAllMonitors ? 'Show Less' : 'Show All'}
              </button>
            </div>
          </div>
          
          {loading && publicMonitors.length === 0 ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading services...</p>
            </div>
          ) : publicMonitors.length === 0 ? (
            <div className="p-12 text-center">
              <GlobeIcon />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No Services Monitored
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No public services are currently being monitored.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {(showAllMonitors ? publicMonitors : publicMonitors.slice(0, 5))
                  .map((monitor) => {
                    const badge = getMonitorStatusBadge(monitor);
                    const uptime = monitor.uptime_stats?.['24h'] 
                      ? `${(monitor.uptime_stats['24h'] * 100).toFixed(2)}%`
                      : 'N/A';
                    
                    return (
                      <div
                        key={monitor.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                            <span className="mr-1 opacity-75">{badge.icon}</span>
                            {badge.text}
                          </span>
                          
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {monitor.name || 'Unnamed Service'}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {monitor.url}
                              </span>
                              <a
                                href={monitor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                              >
                                <ExternalLinkIcon />
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {uptime} uptime
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            24h average
                          </div>
                          {monitor.lastResponseTime && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {monitor.lastResponseTime}ms last response
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {!showAllMonitors && publicMonitors.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllMonitors(true)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Show {publicMonitors.length - 5} more services
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Powered by WebWatch Uptime Monitoring • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
} 
