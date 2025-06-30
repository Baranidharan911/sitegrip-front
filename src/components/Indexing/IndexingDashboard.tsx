'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingUp, Globe, Zap, RefreshCw, Search, Database } from 'lucide-react';
import { useIndexingBackend } from '@/hooks/useIndexingBackend';
import { IndexingStats, QuotaInfo } from '@/types/indexing';

const IndexingDashboard: React.FC = () => {
  const { loading, statistics, quotaInfo, loadDashboardData } = useIndexingBackend();
  const [refreshing, setRefreshing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData('default-project');
      
      const totalSubmitted = statistics?.total_submitted ?? statistics?.totalUrlsSubmitted ?? 0;
      const quotaUsed = quotaInfo?.total_used ?? quotaInfo?.totalUsed ?? 0;
      
      if (totalSubmitted === 0 && quotaUsed === 0) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const totalSubmitted = statistics?.total_submitted ?? statistics?.totalUrlsSubmitted ?? 0;
    const quotaUsed = quotaInfo?.total_used ?? quotaInfo?.totalUsed ?? 0;
    
    if (totalSubmitted === 0 && quotaUsed === 0) {
      setIsNewUser(true);
    } else {
      setIsNewUser(false);
    }
  }, [statistics, quotaInfo]);

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  const safeNumber = (value: number | undefined | null, fallback: number = 0): number => {
    return typeof value === 'number' && !isNaN(value) ? value : fallback;
  };

  const safePercentage = (value: number | undefined | null, decimals: number = 1): string => {
    const num = safeNumber(value, 0);
    return num.toFixed(decimals);
  };

  const totalSubmitted = safeNumber(statistics?.total_submitted);
  const totalIndexed = safeNumber(statistics?.success);
  const totalNotIndexed = safeNumber(statistics?.totalUrlsNotIndexed);
  const totalPending = safeNumber(statistics?.pending);
  const totalFailed = safeNumber(statistics?.failed);
  const quotaUsed = safeNumber(statistics?.quota_used);
  const quotaRemaining = safeNumber(statistics?.quota_remaining);
  const indexingSuccessRate = safeNumber(statistics?.indexingSuccessRate);

  const dailyLimit = safeNumber(quotaInfo?.daily_limit, 200);
  const priorityReserve = safeNumber(quotaInfo?.priority_reserve, 50);
  const priorityUsed = safeNumber(quotaInfo?.high_priority_used) + safeNumber(quotaInfo?.critical_priority_used);
  const priorityRemaining = priorityReserve - priorityUsed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Indexing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your Google indexing progress and quota usage
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isNewUser && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Welcome! 🎉</h3>
          <p className="text-blue-800 dark:text-blue-200">Submit a URL to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-blue-100 text-sm font-medium mb-1">Total Submitted</p>
          <p className="text-3xl font-bold">{totalSubmitted.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-green-100 text-sm font-medium mb-1">Successfully Indexed</p>
          <p className="text-3xl font-bold">{totalIndexed.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-amber-100 text-sm font-medium mb-1">Not Indexed</p>
          <p className="text-3xl font-bold">{totalNotIndexed.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-purple-100 text-sm font-medium mb-1">Pending Check</p>
          <p className="text-3xl font-bold">{totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Indexing Success Rate</h3>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{safePercentage(indexingSuccessRate)}%</span>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span>Indexed: {totalIndexed}</span>
            <span>Not Indexed: {totalNotIndexed}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Quota Usage</h3>
           <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {quotaUsed.toLocaleString()} / {dailyLimit.toLocaleString()}
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {quotaRemaining.toLocaleString()} remaining
              </span>
            </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Quota Reserve</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500">Low</p>
            <p className="font-bold text-blue-600">{safeNumber(quotaInfo?.low_priority_used).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500">Medium</p>
            <p className="font-bold text-green-600">{safeNumber(quotaInfo?.medium_priority_used).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500">High</p>
            <p className="font-bold text-orange-600">{safeNumber(quotaInfo?.high_priority_used).toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500">Critical</p>
            <p className="font-bold text-red-600">{safeNumber(quotaInfo?.critical_priority_used).toLocaleString()}</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Priority Reserve: {priorityUsed.toLocaleString()} / {priorityReserve.toLocaleString()} used
        </div>
      </div>
    </div>
  );
};

export default IndexingDashboard; 
