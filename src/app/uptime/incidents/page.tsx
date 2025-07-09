"use client";

import React from 'react';
import { useFrontendUptime } from '../../../hooks/useFrontendUptime';
import IncidentList from '../../../components/Uptime/IncidentList';

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function IncidentsPage() {
  const {
    monitors,
    monitorIncidents,
    criticalMonitors,
    loading,
    error,
    lastRefresh,
    refreshMonitors,
    clearError,
  } = useFrontendUptime(true, 30000); // Auto-refresh every 30 seconds

  const handleRefresh = async () => {
    try {
      await refreshMonitors();
    } catch (error) {
      console.error('Failed to refresh monitors:', error);
    }
  };

  // Get all monitors with issues for the incident list
  const monitorsWithIssues = monitors.filter(monitor => 
    monitor.last_status === 'down' || 
    (monitor.failures_in_a_row && monitor.failures_in_a_row > 0) || 
    monitor.ssl_status === 'expired' || 
    monitor.ssl_status === 'expiring_soon' ||
    monitor.ssl_status === 'invalid'
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <AlertIcon />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Incident Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Monitor and manage active incidents across all services
                    </p>
                  </div>
                </div>
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
              </div>
            </div>
          </div>
        </div>
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6 rounded-r-md">
            <div className="flex">
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
        {/* Critical Incidents Alert */}
        {criticalMonitors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertIcon />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">
                  {criticalMonitors.length} Critical Incident{criticalMonitors.length > 1 ? 's' : ''} Detected
                </h2>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Immediate attention required for affected monitors.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Incident List */}
        <IncidentList monitors={monitorsWithIssues} />
      </div>
    </div>
  );
} 
