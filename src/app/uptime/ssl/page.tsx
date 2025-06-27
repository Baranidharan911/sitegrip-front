'use client';

import React, { useState, useEffect } from 'react';
import { useUptime } from '../../../hooks/useUptime';
import { Monitor, SSLInfoResponse } from '../../../types/uptime';

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

export default function SSLPage() {
  const {
    monitors,
    expiringSSLMonitors,
    loading,
    error,
    lastRefresh,
    refreshMonitors,
    getSSLInfo,
    clearError,
  } = useUptime(true, 30000); // Auto-refresh every 30 seconds

  const [sslDetails, setSSLDetails] = useState<Record<string, SSLInfoResponse>>({});
  const [loadingSSL, setLoadingSSL] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'status'>('expiry');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'expiring' | 'expired' | 'invalid'>('all');

  // Filter only HTTPS monitors
  const httpsMonitors = monitors.filter(monitor => monitor.url.startsWith('https://'));

  // Filter monitors based on SSL status
  const filteredMonitors = httpsMonitors.filter(monitor => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'valid') return monitor.ssl_status === 'valid';
    if (filterStatus === 'expiring') return monitor.ssl_status === 'expiring_soon';
    if (filterStatus === 'expired') return monitor.ssl_status === 'expired';
    if (filterStatus === 'invalid') return monitor.ssl_status === 'invalid';
    return true;
  });

  // Sort monitors
  const sortedMonitors = [...filteredMonitors].sort((a, b) => {
    switch (sortBy) {
      case 'expiry':
        const daysA = a.ssl_cert_days_until_expiry || 0;
        const daysB = b.ssl_cert_days_until_expiry || 0;
        return daysA - daysB;
      case 'name':
        return (a.name || a.url).localeCompare(b.name || b.url);
      case 'status':
        const statusOrder = { 'expired': 0, 'invalid': 1, 'expiring_soon': 2, 'valid': 3 };
        const statusA = statusOrder[a.ssl_status as keyof typeof statusOrder] || 4;
        const statusB = statusOrder[b.ssl_status as keyof typeof statusOrder] || 4;
        return statusA - statusB;
      default:
        return 0;
    }
  });

  const handleRefresh = async () => {
    try {
      await refreshMonitors();
    } catch (error) {
      console.error('Failed to refresh monitors:', error);
    }
  };

  const loadSSLDetails = async (monitor: Monitor) => {
    if (loadingSSL[monitor.id]) return;
    
    setLoadingSSL(prev => ({ ...prev, [monitor.id]: true }));
    try {
      const sslInfo = await getSSLInfo(monitor.id);
      setSSLDetails(prev => ({ ...prev, [monitor.id]: sslInfo }));
    } catch (error) {
      console.error('Failed to load SSL details:', error);
    } finally {
      setLoadingSSL(prev => ({ ...prev, [monitor.id]: false }));
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired':
      case 'invalid':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'valid':
        return '✅';
      case 'expiring_soon':
        return '⚠️';
      case 'expired':
      case 'invalid':
        return '❌';
      default:
        return '❓';
    }
  };

  const getDaysColor = (days?: number) => {
    if (!days) return 'text-gray-500';
    if (days < 0) return 'text-red-600 dark:text-red-400';
    if (days <= 7) return 'text-red-600 dark:text-red-400';
    if (days <= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <ShieldIcon />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      SSL Certificate Management
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Monitor SSL certificate status and expiration dates
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

        {/* Expiring SSL Alert */}
        {expiringSSLMonitors.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertIcon />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ SSL Certificates Expiring Soon
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {expiringSSLMonitors.length} SSL certificate{expiringSSLMonitors.length !== 1 ? 's' : ''} expiring within 30 days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SSL Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <ShieldIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">HTTPS Monitors</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{httpsMonitors.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <div className="text-green-600">✅</div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valid SSL</p>
                  <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                    {httpsMonitors.filter(m => m.ssl_status === 'valid').length}
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
                    <div className="text-yellow-600">⚠️</div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiring Soon</p>
                  <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                    {httpsMonitors.filter(m => m.ssl_status === 'expiring_soon').length}
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
                    <div className="text-red-600">❌</div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issues</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                    {httpsMonitors.filter(m => 
                      m.ssl_status === 'expired' || 
                      m.ssl_status === 'invalid'
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Certificates</option>
                <option value="valid">Valid</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="invalid">Invalid</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="expiry">Days Until Expiry</option>
                <option value="name">Monitor Name</option>
                <option value="status">SSL Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* SSL Certificates List */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              SSL Certificate Status
            </h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500 dark:text-gray-400">Loading SSL certificates...</span>
            </div>
          ) : httpsMonitors.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldIcon />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No HTTPS Monitors
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No HTTPS monitors configured yet. SSL monitoring is only available for HTTPS URLs.
              </p>
            </div>
          ) : sortedMonitors.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No certificates match the selected filter.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {sortedMonitors.map((monitor) => (
                  <div
                    key={monitor.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-2xl">
                            {getStatusIcon(monitor.ssl_status)}
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {monitor.name || 'Unnamed Monitor'}
                            </h4>
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

                        {/* SSL Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(monitor.ssl_status)}`}>
                                {monitor.ssl_status || 'Unknown'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Days Until Expiry</span>
                            <p className={`text-lg font-semibold mt-1 ${getDaysColor(monitor.ssl_cert_days_until_expiry)}`}>
                              {monitor.ssl_cert_days_until_expiry !== undefined 
                                ? `${monitor.ssl_cert_days_until_expiry} days`
                                : 'Unknown'
                              }
                            </p>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                              {monitor.ssl_cert_expires_at 
                                ? new Date(monitor.ssl_cert_expires_at).toLocaleDateString()
                                : 'Unknown'
                              }
                            </p>
                          </div>

                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Issuer</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                              {monitor.ssl_cert_issuer || 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {/* Additional Details */}
                        {sslDetails[monitor.id] && (
                          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                              Certificate Details
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {sslDetails[monitor.id].ssl_info?.subject || 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Serial Number:</span>
                                <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                                  {sslDetails[monitor.id].ssl_info?.serial_number || 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Algorithm:</span>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {sslDetails[monitor.id].ssl_info?.signature_algorithm || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            
                            {sslDetails[monitor.id].ssl_info?.san_domains && 
                             sslDetails[monitor.id].ssl_info!.san_domains!.length > 0 && (
                              <div className="mt-4">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Subject Alternative Names:
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {sslDetails[monitor.id].ssl_info!.san_domains!.map((domain, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                    >
                                      {domain}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-4">
                        <button
                          onClick={() => loadSSLDetails(monitor)}
                          disabled={loadingSSL[monitor.id]}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          {loadingSSL[monitor.id] 
                            ? 'Loading...' 
                            : sslDetails[monitor.id] 
                            ? 'Refresh Details' 
                            : 'Load Details'
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 