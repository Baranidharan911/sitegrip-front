"use client";

import React, { useState } from 'react';
import { useFrontendUptime } from '../../../hooks/useFrontendUptime';
import UptimeStatsCard from '../../../components/Uptime/UptimeStatsCard';
import MonitorForm from '../../../components/Uptime/MonitorForm';
import UptimeHistory from '../../../components/Uptime/UptimeHistory';
import { Monitor, CreateMonitorRequest } from '../../../types/uptime';

export const dynamic = 'force-dynamic';

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function MonitorsPage() {
  const {
    monitors,
    loading,
    error,
    refreshMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    clearError,
    monitorTypes,
    notificationTypes,
  } = useFrontendUptime(true, 30000); // Auto-refresh every 30 seconds

  const [showAddMonitor, setShowAddMonitor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'up' | 'down' | 'paused'>('all');
  const [filterType, setFilterType] = useState<'all' | 'http' | 'ping' | 'port' | 'ssl' | 'pagespeed' | 'hardware' | 'docker'>('all');

  // Filter monitors based on search, status, and type filters
  const filteredMonitors = monitors.filter(monitor => {
    const matchesSearch = monitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         monitor.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter = filterStatus === 'all' ||
                               (filterStatus === 'up' && monitor.status === true) ||
                               (filterStatus === 'down' && monitor.status === false) ||
                               (filterStatus === 'paused' && monitor.status === false && monitor.name?.toLowerCase().includes('paused'));
    const matchesTypeFilter = filterType === 'all' || monitor.type === filterType;
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  const handleRefresh = async () => {
    try {
      await refreshMonitors();
    } catch (error) {
      console.error('Failed to refresh monitors:', error);
    }
  };

  const handleSaveMonitor = async (data: CreateMonitorRequest, id?: string) => {
    if (id) {
      await updateMonitor(id, data);
    } else {
      await createMonitor(data);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Monitor Management
                </h1>
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
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-400 text-red-800 rounded">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
            </div>
          </div>
        )}
        {/* Add Monitor Modal */}
        {showAddMonitor && (
          <MonitorForm
            isOpen={showAddMonitor}
            onClose={() => setShowAddMonitor(false)}
            monitorTypes={monitorTypes}
            notificationTypes={notificationTypes}
            onSave={handleSaveMonitor}
          />
        )}
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <input
            type="text"
            placeholder="Search monitors..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="paused">Paused</option>
            </select>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="http">HTTP</option>
              <option value="ping">Ping</option>
              <option value="port">Port</option>
              <option value="ssl">SSL</option>
              <option value="pagespeed">PageSpeed</option>
              <option value="hardware">Hardware</option>
              <option value="docker">Docker</option>
            </select>
          </div>
        </div>
        {/* Monitors List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <span className="text-gray-600 dark:text-gray-400">Loading monitors...</span>
          ) : filteredMonitors.length === 0 ? (
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No monitors found</h3>
          ) : (
            filteredMonitors.map((monitor) => (
              <UptimeStatsCard
                key={monitor.id}
                monitor={monitor}
                onClick={() => {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 
