'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFrontendUptime } from '../../../hooks/useFrontendUptime';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

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

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

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
  const [statusUpdates, setStatusUpdates] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time Firestore listener for status updates
  useEffect(() => {
    const statusUpdatesQuery = query(
      collection(db, 'status_updates'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(statusUpdatesQuery, (snapshot) => {
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStatusUpdates(updatesData);
    }, (error) => {
      console.error('Error fetching status updates:', error);
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh logic for status checks
  useEffect(() => {
    function checkAndUpdateStatus() {
      monitors.forEach(async (monitor) => {
        try {
          // Check monitor status
          const res = await fetch(monitor.url, { method: 'HEAD' });
          const status = res.ok ? 'up' : 'down';
          
          // Update monitor status in Firebase
          await updateDoc(doc(db, 'monitors', monitor.id), {
            last_status: status,
            last_check: new Date(),
            response_time: Date.now() - performance.now()
          });

          // Create status update if status changed
          if (monitor.last_status !== status) {
            await addDoc(collection(db, 'status_updates'), {
              monitor_id: monitor.id,
              monitor_name: monitor.name,
              monitor_url: monitor.url,
              previous_status: monitor.last_status,
              current_status: status,
              description: `${monitor.name} is now ${status}`,
              created_at: new Date()
            });
          }
        } catch (error) {
          console.error('Error checking monitor status:', error);
          // Update monitor as down if check fails
          await updateDoc(doc(db, 'monitors', monitor.id), {
            last_status: 'down',
            last_check: new Date()
          });
        }
      });
    }

    // Run immediately on mount
    checkAndUpdateStatus();
    // Set interval
    intervalRef.current = setInterval(checkAndUpdateStatus, AUTO_REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [monitors]);

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
      {/* Frontend-only monitoring warning */}
      <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
        <strong>Note:</strong> Status monitoring runs only while this dashboard is open. For 24/7 monitoring, set up a backend worker.
      </div>

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

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    {publicMonitors.filter(m => m.last_status === 'up' && !m.failures_in_a_row).length}
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

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <GlobeIcon />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                    {publicMonitors.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status List */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Service Status
              </h2>
              <button
                onClick={() => setShowAllMonitors(!showAllMonitors)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {showAllMonitors ? 'Show Public Only' : 'Show All Services'}
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(showAllMonitors ? monitors : publicMonitors).map((monitor) => {
              const statusBadge = getMonitorStatusBadge(monitor);
              return (
                <div key={monitor.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
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
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                        <span className="mr-1">{statusBadge.icon}</span>
                        {statusBadge.text}
                      </span>
                      
                      <a
                        href={monitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <ExternalLinkIcon />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Status Updates */}
        {statusUpdates.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Status Updates
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {statusUpdates.slice(0, 10).map((update) => (
                <div key={update.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {update.monitor_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {update.description}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(update.created_at.toDate()).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
