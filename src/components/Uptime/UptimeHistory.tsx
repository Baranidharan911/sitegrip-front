'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, UptimeLog, SSLInfoResponse } from '../../types/uptime';
import { useUptime } from '../../hooks/useUptime';

interface UptimeHistoryProps {
  monitor: Monitor;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UptimeHistory: React.FC<UptimeHistoryProps> = ({ monitor, onClose }) => {
  const { 
    getMonitorHistory, 
    getSSLInfo, 
    exportMonitorData, 
    refreshMonitor,
    deleteMonitor,
    updateMonitor 
  } = useUptime(false);

  const [logs, setLogs] = useState<UptimeLog[]>([]);
  const [sslInfo, setSSLInfo] = useState<SSLInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(24);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [monitor.id, timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, sslData] = await Promise.all([
        getMonitorHistory(monitor.id, timeRange),
        monitor.url.startsWith('https://') ? getSSLInfo(monitor.id) : Promise.resolve(null)
      ]);
      
      setLogs(historyData.reverse()); // Most recent first
      setSSLInfo(sslData);
    } catch (error) {
      console.error('Failed to load monitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMonitor(monitor.id);
      await loadData();
    } catch (error) {
      console.error('Failed to refresh monitor:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportMonitorData(monitor.id, format, timeRange);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMonitor(monitor.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete monitor:', error);
    }
  };

  const calculateUptime = (logs: UptimeLog[]) => {
    if (logs.length === 0) return 100;
    const upLogs = logs.filter(log => log.status === 'up').length;
    return (upLogs / logs.length) * 100;
  };

  const calculateAverageResponseTime = (logs: UptimeLog[]) => {
    const responseTimes = logs.filter(log => log.response_time).map(log => log.response_time!);
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'bg-green-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatDuration = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const uptime = calculateUptime(logs);
  const averageResponseTime = calculateAverageResponseTime(logs);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {monitor.name || 'Monitor Details'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {monitor.url}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
              title="Refresh Monitor"
            >
              <RefreshIcon />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Edit Monitor"
              >
                <EditIcon />
              </button>
            </div>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Delete Monitor"
            >
              <TrashIcon />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500 dark:text-gray-400">Loading data...</span>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(monitor.last_status || 'unknown')} mr-2`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Current Status</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {monitor.last_status?.toUpperCase() || 'UNKNOWN'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Uptime ({timeRange}h)
                  </span>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {uptime.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Avg Response Time
                  </span>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {averageResponseTime.toFixed(0)}ms
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Checks
                  </span>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {logs.length}
                  </p>
                </div>
              </div>

              {/* SSL Certificate Info */}
              {sslInfo && sslInfo.ssl_info && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    SSL Certificate Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                      <p className={`font-semibold ${
                        sslInfo.ssl_info.is_valid 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {sslInfo.ssl_info.is_valid ? 'Valid' : 'Invalid'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {sslInfo.ssl_info.expires_at 
                          ? new Date(sslInfo.ssl_info.expires_at).toLocaleDateString()
                          : 'Unknown'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Days Until Expiry</span>
                      <p className={`font-semibold ${
                        (sslInfo.ssl_info.days_until_expiry || 0) < 30 
                          ? 'text-yellow-600 dark:text-yellow-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {sslInfo.ssl_info.days_until_expiry || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Issuer</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {sslInfo.ssl_info.issuer || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {sslInfo.ssl_info.subject || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Self-Signed</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {sslInfo.ssl_info.is_self_signed ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  
                  {sslInfo.ssl_info.san_domains && sslInfo.ssl_info.san_domains.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Subject Alternative Names
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sslInfo.ssl_info.san_domains.map((domain, index) => (
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

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time Range:
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(parseInt(e.target.value))}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Last Hour</option>
                    <option value={6}>Last 6 Hours</option>
                    <option value={24}>Last 24 Hours</option>
                    <option value={168}>Last 7 Days</option>
                    <option value={720}>Last 30 Days</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleExport('csv')}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <DownloadIcon />
                    <span className="ml-1">CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <DownloadIcon />
                    <span className="ml-1">JSON</span>
                  </button>
                </div>
              </div>

              {/* Uptime Visualization */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Uptime History
                </h3>
                <div className="flex flex-wrap gap-1">
                  {logs.slice(-90).map((log, index) => (
                    <div
                      key={index}
                      className={`w-3 h-8 rounded-sm ${getStatusColor(log.status)} tooltip`}
                      title={`${log.status.toUpperCase()} - ${new Date(log.timestamp).toLocaleString()}${
                        log.response_time ? ` - ${log.response_time}ms` : ''
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>90 days ago</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Recent Logs */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Recent Checks
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Response Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          HTTP Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          SSL Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {logs.slice(0, 50).map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDuration(log.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.status === 'up'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {log.response_time ? `${log.response_time}ms` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {log.http_status || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {log.ssl_info ? (log.ssl_info.is_valid ? '✅' : '❌') : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {log.error || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Monitor
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete this monitor? This action cannot be undone and will remove all historical data.
              </p>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UptimeHistory;
