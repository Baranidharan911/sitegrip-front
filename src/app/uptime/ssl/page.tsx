"use client";

import React from 'react';
import { useFrontendUptime } from '../../../hooks/useFrontendUptime';

const SSLPage = () => {
  const {
    monitors,
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

  // Only show HTTPS monitors
  const httpsMonitors = monitors.filter(monitor => monitor.url.startsWith('https://'));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 rounded-lg mb-6">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SSL Certificate Monitoring</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track SSL certificate status and expiry for all HTTPS monitors</p>
              {lastRefresh && (
                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="ml-2">Refresh</span>
            </button>
          </div>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500 dark:text-gray-400">Loading SSL data...</span>
            </div>
          ) : httpsMonitors.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
              No HTTPS monitors found.
            </div>
          ) : (
            httpsMonitors.map((monitor) => (
              <div key={monitor.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{monitor.name || monitor.url}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{monitor.url}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    monitor.ssl_status === 'valid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : monitor.ssl_status === 'expiring_soon'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : monitor.ssl_status === 'expired' || monitor.ssl_status === 'invalid'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {monitor.ssl_status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-gray-500 dark:text-gray-400">Expires</span>
                  <span className={
                    monitor.ssl_cert_days_until_expiry && monitor.ssl_cert_days_until_expiry < 30
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }>
                    {monitor.ssl_cert_days_until_expiry && monitor.ssl_cert_days_until_expiry > 0
                      ? `In ${monitor.ssl_cert_days_until_expiry} days`
                      : monitor.ssl_status === 'expired'
                      ? 'Expired'
                      : 'Valid'}
                  </span>
                </div>
                {monitor.ssl_cert_issuer && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Issuer</span>
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">{monitor.ssl_cert_issuer}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SSLPage; 
