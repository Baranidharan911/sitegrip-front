'use client';

import React, { useState, useEffect } from 'react';
import { realtimeMonitoring } from '../../lib/realtimeMonitoring';

const MonitoringStatus: React.FC = () => {
  const [status, setStatus] = useState<{
    isRunning: boolean;
    queueLength: number;
    processingQueue: boolean;
  }>({
    isRunning: false,
    queueLength: 0,
    processingQueue: false,
  });

  const [stats, setStats] = useState<{
    totalMonitors: number;
    activeMonitors: number;
    upMonitors: number;
    downMonitors: number;
    lastCheckTime: Date | null;
  }>({
    totalMonitors: 0,
    activeMonitors: 0,
    upMonitors: 0,
    downMonitors: 0,
    lastCheckTime: null,
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus(realtimeMonitoring.getStatus());
    };

    const updateStats = async () => {
      try {
        const monitoringStats = await realtimeMonitoring.getStats();
        setStats(monitoringStats);
      } catch (error) {
        console.error('Failed to get monitoring stats:', error);
      }
    };

    // Update immediately
    updateStatus();
    updateStats();

    // Update every 5 seconds
    const statusInterval = setInterval(updateStatus, 5000);
    const statsInterval = setInterval(updateStats, 10000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const getStatusColor = () => {
    return status.isRunning ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getStatusIcon = () => {
    return status.isRunning ? (
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    ) : (
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Real-time Monitoring Status
        </h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {status.isRunning ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Total Monitors</p>
          <p className="font-semibold text-gray-900 dark:text-white">{stats.totalMonitors}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Active Monitors</p>
          <p className="font-semibold text-gray-900 dark:text-white">{stats.activeMonitors}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Up</p>
          <p className="font-semibold text-green-600 dark:text-green-400">{stats.upMonitors}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Down</p>
          <p className="font-semibold text-red-600 dark:text-red-400">{stats.downMonitors}</p>
        </div>
      </div>

      {status.processingQueue && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Processing {status.queueLength} checks...
            </span>
          </div>
        </div>
      )}

      {stats.lastCheckTime && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Last check: {stats.lastCheckTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default MonitoringStatus; 