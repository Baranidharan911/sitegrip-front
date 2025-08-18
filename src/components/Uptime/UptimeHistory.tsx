'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useFrontendUptime } from '../../hooks/useFrontendUptime';
import { Monitor, CheckResult, Incident } from '../../types/uptime';

interface UptimeHistoryProps {
  monitor: Monitor;
  isOpen: boolean;
  onClose: () => void;
}

export default function UptimeHistory({ monitor, isOpen, onClose }: UptimeHistoryProps) {
  const { 
    getMonitorChecks, 
    getMonitorIncidents, 
    getMonitorStats, 
    performMonitorCheck,
    exportMonitorData,
    loading,
    checkSSLStatus,
    getMonitorDiagnostics
  } = useFrontendUptime();

  const [activeTab, setActiveTab] = useState<'overview' | 'checks' | 'incidents' | 'ssl' | 'diagnostics' | 'settings'>('overview');
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [sslInfo, setSslInfo] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loadingChecks, setLoadingChecks] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingSSL, setLoadingSSL] = useState(false);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);

  useEffect(() => {
    if (isOpen && monitor) {
      loadMonitorData();
    }
  }, [isOpen, monitor]);

  const loadMonitorData = async () => {
    try {
      setLoadingChecks(true);
      setLoadingIncidents(true);
      setLoadingStats(true);

      const [checksData, incidentsData, statsData] = await Promise.all([
        getMonitorChecks(monitor.id, 50),
        getMonitorIncidents(monitor.id, 20),
        getMonitorStats(monitor.id)
      ]);

      setChecks(checksData);
      setIncidents(incidentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load monitor data:', error);
    } finally {
      setLoadingChecks(false);
      setLoadingIncidents(false);
      setLoadingStats(false);
    }
  };

  const loadSSLData = async () => {
    if (!monitor.url.startsWith('https://')) return;
    
    try {
      setLoadingSSL(true);
      const sslData = await checkSSLStatus(monitor.id);
      setSslInfo(sslData);
    } catch (error) {
      console.error('Failed to load SSL data:', error);
    } finally {
      setLoadingSSL(false);
    }
  };

  const loadDiagnosticsData = async () => {
    try {
      setLoadingDiagnostics(true);
      const diagnosticsData = await getMonitorDiagnostics(monitor.id);
      setDiagnostics(diagnosticsData);
    } catch (error) {
      console.error('Failed to load diagnostics data:', error);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  const handleManualCheck = async () => {
    try {
      await performMonitorCheck(monitor.id);
      // Reload checks after manual check
      const newChecks = await getMonitorChecks(monitor.id, 50);
      setChecks(newChecks);
    } catch (error) {
      console.error('Failed to perform manual check:', error);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const blob = await exportMonitorData(monitor.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${monitor.name}-data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getStatusIcon(monitor.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{monitor.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{monitor.url}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'checks', label: 'Check History' },
              { id: 'incidents', label: 'Incidents' },
              ...(monitor.url.startsWith('https://') ? [{ id: 'ssl', label: 'SSL Certificate' }] : []),
              { id: 'diagnostics', label: 'Diagnostics' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Monitor Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Response Time</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {monitor.lastResponseTime ? `${monitor.lastResponseTime}ms` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uptime (24h)</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stats?.stats?.uptime?.['24h'] ? `${stats.stats.uptime['24h'].toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Incidents</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {incidents.filter(i => i.status === 'open').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Checks</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stats?.stats?.total_checks || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-700 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                </div>
                <div className="p-6">
                  {loadingChecks ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">Loading recent checks...</p>
                    </div>
                  ) : checks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent checks found</p>
                  ) : (
                    <div className="space-y-3">
                      {checks.slice(0, 5).map((check) => (
                        <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(check.status)}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {check.status ? 'Check Passed' : 'Check Failed'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(check.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900 dark:text-white">{check.responseTime}ms</p>
                            {check.statusCode && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">HTTP {check.statusCode}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Checks Tab */}
          {activeTab === 'checks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Check History</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleManualCheck}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Manual Check
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {loadingChecks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Loading check history...</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-700 shadow rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Response Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Message
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                        {checks.map((check) => (
                          <tr key={check.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(check.status)}
                                <span className={`ml-2 text-sm font-medium ${getStatusColor(check.status)}`}>
                                  {check.status ? 'UP' : 'DOWN'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {check.responseTime}ms
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {check.statusCode || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {check.message}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(check.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Incidents</h3>
              
              {loadingIncidents ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Loading incidents...</p>
                </div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No incidents found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              incident.status === 'open' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              incident.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {incident.status.toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              incident.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              incident.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {incident.severity.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {incident.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            {incident.description}
                          </p>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p>Started: {new Date(incident.startTime).toLocaleString()}</p>
                            {incident.endTime && (
                              <p>Resolved: {new Date(incident.endTime).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SSL Tab */}
          {activeTab === 'ssl' && monitor.url.startsWith('https://') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">SSL Certificate</h3>
                <button
                  onClick={loadSSLData}
                  disabled={loadingSSL}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
                >
                  {loadingSSL ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh SSL
                    </>
                  )}
                </button>
              </div>
              
              {loadingSSL ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Checking SSL certificate...</p>
                </div>
              ) : sslInfo ? (
                <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Certificate Status</h4>
                      <dl className="space-y-3">
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                          <dd className="text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              sslInfo.ssl_status === 'valid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              sslInfo.ssl_status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {sslInfo.ssl_status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {sslInfo.ssl_cert_expires_at ? new Date(sslInfo.ssl_cert_expires_at).toLocaleString() : 'Unknown'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Days Until Expiry</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {sslInfo.ssl_cert_days_until_expiry !== null ? sslInfo.ssl_cert_days_until_expiry : 'Unknown'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Issuer</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {sslInfo.ssl_cert_issuer || 'Unknown'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Checked</dt>
                          <dd className="text-sm text-gray-900 dark:text-white">
                            {sslInfo.ssl_last_checked ? new Date(sslInfo.ssl_last_checked).toLocaleString() : 'Never'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Click "Refresh SSL" to check certificate status</p>
                </div>
              )}
            </div>
          )}

          {/* Diagnostics Tab */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Network Diagnostics</h3>
                <button
                  onClick={loadDiagnosticsData}
                  disabled={loadingDiagnostics}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
                >
                  {loadingDiagnostics ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Diagnostics
                    </>
                  )}
                </button>
              </div>
              
              {loadingDiagnostics ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Running network diagnostics...</p>
                </div>
              ) : diagnostics ? (
                <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Diagnostic Results</h4>
                      <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm overflow-auto max-h-96">
                        {JSON.stringify(diagnostics, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Click "Run Diagnostics" to analyze network connectivity</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monitor Settings</h3>
              
              <div className="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Monitor Type</dt>
                        <dd className="text-sm text-gray-900 dark:text-white capitalize">{monitor.type}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Check Interval</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{monitor.interval} seconds</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeout</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{monitor.timeout} seconds</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Retries</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">{monitor.retries}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Thresholds</h4>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Response Time Threshold</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {monitor.threshold?.responseTime || 'Not set'}ms
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Status Code</dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                          {monitor.threshold?.statusCode || 'Not set'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {monitor.tags && monitor.tags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {monitor.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
