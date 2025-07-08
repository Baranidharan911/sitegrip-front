"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useFrontendUptime } from '../../../hooks/useFrontendUptime';
import UptimeStatsCard from '../../../components/Uptime/UptimeStatsCard';
import MonitorForm from '../../../components/Uptime/MonitorForm';
import UptimeHistory from '../../../components/Uptime/UptimeHistory';
import { db } from '../../../lib/firebase.js';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
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

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export default function MonitorsPage() {
  const {
    selectedMonitor,
    refreshMonitors,
    selectMonitor,
    clearError,
    monitorTypes,
    notificationTypes,
  } = useFrontendUptime(true, 30000); // Auto-refresh every 30 seconds

  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, 'monitors'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMonitors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Monitor)));
      setLoading(false);
    }, (err: any) => {
      setError('Failed to load monitors: ' + (err?.message || ''));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-refresh logic
  useEffect(() => {
    function runChecksAndSave() {
      monitors.forEach(async (monitor) => {
        // Example: HTTP check (replace with your real check logic)
        try {
          const res = await fetch(monitor.url, { method: 'HEAD' });
          const status = res.ok;
          await updateMonitor(monitor.id, { status });
          await logMonitorHistory(monitor.id, status ? 'up' : 'down');
        } catch {
          await updateMonitor(monitor.id, { status: false });
          await logMonitorHistory(monitor.id, 'down');
        }
      });
    }
    // Run immediately on mount
    runChecksAndSave();
    // Set interval
    intervalRef.current = setInterval(runChecksAndSave, AUTO_REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [monitors]);

  // CRUD actions
  const addMonitor = async (monitor: CreateMonitorRequest) => {
    try {
      await addDoc(collection(db, 'monitors'), {
        ...monitor,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError('Failed to add monitor: ' + (err?.message || ''));
    }
  };
  const updateMonitor = async (id: string, updates: Partial<Monitor>) => {
    try {
      await updateDoc(doc(db, 'monitors', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError('Failed to update monitor: ' + (err?.message || ''));
    }
  };
  const deleteMonitor = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'monitors', id));
    } catch (err: any) {
      setError('Failed to delete monitor: ' + (err?.message || ''));
    }
  };

  // Historical tracking (example: add to subcollection on status change)
  const logMonitorHistory = async (monitorId: string, status: string) => {
    try {
      await addDoc(collection(db, 'monitors', monitorId, 'history'), {
        status,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      // Optionally handle error
    }
  };

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
      await addMonitor(data);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Frontend-only monitoring warning */}
      <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
        <strong>Note:</strong> Monitoring runs only while this dashboard is open. For 24/7 monitoring, set up a backend worker.
      </div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Monitor Management
                </h1>
                {/* lastRefresh removed as per new_code */}
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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{monitors.length || 0}</p>
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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{monitors.filter(m => m.status).length || 0}</p>
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
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{monitors.filter(m => !m.status).length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Incidents</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{monitors.filter(m => m.status === false).length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
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
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="up">Online</option>
                <option value="down">Offline</option>
                <option value="paused">Paused</option>
              </select>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="http">HTTP/HTTPS</option>
                <option value="ping">Ping</option>
                <option value="port">Port</option>
                <option value="ssl">SSL Certificate</option>
                <option value="pagespeed">Page Speed</option>
                <option value="hardware">Hardware</option>
                <option value="docker">Docker</option>
              </select>
            </div>
          </div>
        </div>

        {/* Monitors List */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Monitors ({filteredMonitors.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">Loading monitors...</span>
              </div>
            </div>
          ) : filteredMonitors.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No monitors found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by creating your first monitor.'}
              </p>
              {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddMonitor(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon />
                    <span className="ml-2">Add Monitor</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMonitors.map((monitor) => (
                <div
                  key={monitor.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => selectMonitor(monitor)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${monitor.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{monitor.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{monitor.url}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            monitor.type === 'http' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            monitor.type === 'ping' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            monitor.type === 'port' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            monitor.type === 'ssl' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            monitor.type === 'pagespeed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                            monitor.type === 'hardware' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {monitor.type.toUpperCase()}
                          </span>
                          {monitor.lastResponseTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {monitor.lastResponseTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {monitor.lastCheck ? new Date(monitor.lastCheck).toLocaleTimeString() : 'Never'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Every {monitor.interval}s
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual refresh button */}
        <div className="mb-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Manual Refresh
          </button>
        </div>

        {/* Monitor Form Modal */}
        {showAddMonitor && (
          <MonitorForm
            isOpen={showAddMonitor}
            onClose={() => setShowAddMonitor(false)}
            monitorTypes={monitorTypes || []}
            notificationTypes={notificationTypes || []}
            onSave={handleSaveMonitor}
          />
        )}

        {/* Monitor Details Modal */}
        {selectedMonitor && (
          <UptimeHistory
            monitor={selectedMonitor}
            isOpen={!!selectedMonitor}
            onClose={() => selectMonitor(null)}
          />
        )}
      </div>
    </div>
  );
} 
