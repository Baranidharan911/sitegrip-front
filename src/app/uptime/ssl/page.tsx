'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFrontendUptime } from '../../../hooks/useFrontendUptime';
import { Monitor, SSLInfoResponse } from '../../../types/uptime';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

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

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

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
  } = useFrontendUptime(true, 30000); // Auto-refresh every 30 seconds

  const [sslDetails, setSSLDetails] = useState<Record<string, SSLInfoResponse>>({});
  const [loadingSSL, setLoadingSSL] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'status'>('expiry');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'expiring' | 'expired' | 'invalid'>('all');
  const [sslAlerts, setSSLAlerts] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time Firestore listener for SSL alerts
  useEffect(() => {
    const sslAlertsQuery = query(
      collection(db, 'ssl_alerts'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(sslAlertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSSLAlerts(alertsData);
    }, (error) => {
      console.error('Error fetching SSL alerts:', error);
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh logic for SSL certificate checks
  useEffect(() => {
    function checkSSLCertificates() {
      httpsMonitors.forEach(async (monitor) => {
        try {
          // Check SSL certificate status
          const sslInfo = await getSSLInfo(monitor.id);
          
          // Update monitor with SSL info
          await updateDoc(doc(db, 'monitors', monitor.id), {
            ssl_status: (sslInfo as any).status,
            ssl_cert_days_until_expiry: (sslInfo as any).daysUntilExpiry,
            ssl_cert_expiry_date: (sslInfo as any).expiryDate,
            last_ssl_check: new Date()
          });

          // Create alert for expiring/expired certificates
          if ((sslInfo as any).status === 'expired' || (sslInfo as any).status === 'expiring_soon') {
            const existingAlert = sslAlerts.find(alert => alert.monitor_id === monitor.id);
            if (!existingAlert) {
              await addDoc(collection(db, 'ssl_alerts'), {
                monitor_id: monitor.id,
                monitor_name: monitor.name,
                monitor_url: monitor.url,
                ssl_status: (sslInfo as any).status,
                days_until_expiry: (sslInfo as any).daysUntilExpiry,
                expiry_date: (sslInfo as any).expiryDate,
                severity: (sslInfo as any).status === 'expired' ? 'critical' : 'warning',
                description: `SSL certificate for ${monitor.name} ${(sslInfo as any).status === 'expired' ? 'has expired' : 'is expiring soon'}`,
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
        } catch (error) {
          console.error('Error checking SSL certificate:', error);
        }
      });
    }

    // Run immediately on mount
    checkSSLCertificates();
    // Set interval
    intervalRef.current = setInterval(checkSSLCertificates, AUTO_REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [monitors, sslAlerts]);

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

  const getDaysColor = (days?: number | null) => {
    if (days === null || days === undefined) return 'text-gray-500';
    if (days < 0) return 'text-red-600 dark:text-red-400';
    if (days <= 7) return 'text-red-600 dark:text-red-400';
    if (days <= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Frontend-only monitoring warning */}
      <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
        <strong>Note:</strong> SSL certificate monitoring runs only while this dashboard is open. For 24/7 monitoring, set up a backend worker.
      </div>

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

        {/* SSL Alerts */}
        {sslAlerts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertIcon />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  🔒 SSL Certificate Alerts
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {sslAlerts.length} SSL certificate{sslAlerts.length !== 1 ? 's' : ''} requiring attention.
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
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <ShieldIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valid</p>
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
                    <AlertIcon />
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
                    <AlertIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expired</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                    {httpsMonitors.filter(m => m.ssl_status === 'expired').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <ShieldIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total HTTPS</p>
                  <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                    {httpsMonitors.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort by
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'expiry' | 'name' | 'status')}
                  className="block w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="expiry">Expiry Date</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Status
                </label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'valid' | 'expiring' | 'expired' | 'invalid')}
                  className="block w-full sm:w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="valid">Valid</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredMonitors.length} of {httpsMonitors.length} HTTPS monitors
            </div>
          </div>
        </div>

        {/* SSL Certificates List */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500 dark:text-gray-400">Loading SSL certificates...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Monitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Days Left
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedMonitors.map((monitor) => (
                    <tr key={monitor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {(monitor.name || monitor.url).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {monitor.name || monitor.url}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {monitor.url}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(monitor.ssl_status)}`}>
                          {getStatusIcon(monitor.ssl_status)} {monitor.ssl_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {(monitor as any).ssl_cert_expiry_date ? (
                          <div className="flex items-center">
                            <CalendarIcon />
                            <span className="ml-1">
                              {new Date((monitor as any).ssl_cert_expiry_date).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getDaysColor(monitor.ssl_cert_days_until_expiry)}`}>
                          {monitor.ssl_cert_days_until_expiry !== undefined && monitor.ssl_cert_days_until_expiry !== null ? (
                            monitor.ssl_cert_days_until_expiry < 0 ? (
                              `Expired ${Math.abs(monitor.ssl_cert_days_until_expiry)} days ago`
                            ) : (
                              `${monitor.ssl_cert_days_until_expiry} days`
                            )
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Unknown</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => loadSSLDetails(monitor)}
                            disabled={loadingSSL[monitor.id]}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                          >
                            {loadingSSL[monitor.id] ? 'Loading...' : 'Details'}
                          </button>
                          <a
                            href={monitor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <ExternalLinkIcon />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SSL Details Modal */}
        {Object.keys(sslDetails).length > 0 && (
          <div className="mt-8 space-y-6">
            {Object.entries(sslDetails).map(([monitorId, sslInfo]) => {
              const monitor = monitors.find(m => m.id === monitorId);
              if (!monitor) return null;
              
              return (
                <div key={monitorId} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    SSL Details for {monitor.name || monitor.url}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Certificate Information</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Issuer</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{(sslInfo as any).issuer || 'Unknown'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Subject</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{(sslInfo as any).subject || 'Unknown'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Valid From</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {(sslInfo as any).validFrom ? new Date((sslInfo as any).validFrom).toLocaleDateString() : 'Unknown'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Valid Until</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {(sslInfo as any).validUntil ? new Date((sslInfo as any).validUntil).toLocaleDateString() : 'Unknown'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Security Information</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Protocol</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{(sslInfo as any).protocol || 'Unknown'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Cipher Suite</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{(sslInfo as any).cipherSuite || 'Unknown'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Key Size</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">{(sslInfo as any).keySize || 'Unknown'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-gray-500 dark:text-gray-400">Days Until Expiry</dt>
                          <dd className={`text-sm font-medium ${getDaysColor((sslInfo as any).daysUntilExpiry)}`}>
                            {(sslInfo as any).daysUntilExpiry !== undefined ? (sslInfo as any).daysUntilExpiry : 'Unknown'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 
