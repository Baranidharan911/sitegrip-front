'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingUp, Globe, Zap, RefreshCw } from 'lucide-react';
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
      
      // Check if this might be a new user (no statistics and minimal quota usage)
      const totalSubmitted = statistics?.total_submitted ?? statistics?.totalUrlsSubmitted ?? 0;
      const quotaUsed = quotaInfo?.total_used ?? quotaInfo?.totalUsed ?? 0;
      
      if (totalSubmitted === 0 && quotaUsed === 0) {
        setIsNewUser(true);
        console.log('New user detected - showing welcome message');
      } else {
        setIsNewUser(false);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Check for new user when data changes
  useEffect(() => {
    const totalSubmitted = statistics?.total_submitted ?? statistics?.totalUrlsSubmitted ?? 0;
    const quotaUsed = quotaInfo?.total_used ?? quotaInfo?.totalUsed ?? 0;
    
    if (totalSubmitted === 0 && quotaUsed === 0) {
      setIsNewUser(true);
    } else {
      setIsNewUser(false);
    }
  }, [statistics, quotaInfo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  // Helper function to safely get numeric values
  const safeNumber = (value: number | undefined | null, fallback: number = 0): number => {
    return typeof value === 'number' && !isNaN(value) ? value : fallback;
  };

  // Helper function to safely format percentages
  const safePercentage = (value: number | undefined | null, decimals: number = 1): string => {
    const num = safeNumber(value, 0);
    return num.toFixed(decimals);
  };

  // Calculate statistics with proper fallbacks
  const totalSubmitted = safeNumber(statistics?.total_submitted ?? statistics?.totalUrlsSubmitted);
  const totalSuccess = safeNumber(statistics?.success ?? statistics?.totalUrlsIndexed);
  const totalPending = safeNumber(statistics?.pending ?? statistics?.totalUrlsPending);
  const totalFailed = safeNumber(statistics?.failed ?? statistics?.totalUrlsError);
  const quotaUsed = safeNumber(statistics?.quota_used ?? statistics?.quotaUsed);
  const quotaRemaining = safeNumber(statistics?.quota_remaining ?? quotaInfo?.remaining_quota ?? quotaInfo?.remainingQuota);
  const successRate = safeNumber(statistics?.success_rate ?? statistics?.indexingSuccessRate);

  // Calculate quota information with proper fallbacks
  const dailyLimit = safeNumber(quotaInfo?.daily_limit ?? quotaInfo?.dailyLimit, 200);
  const totalUsed = safeNumber(quotaInfo?.total_used ?? quotaInfo?.totalUsed ?? quotaInfo?.dailyUsed);
  const remaining = safeNumber(quotaInfo?.remaining_quota ?? quotaInfo?.remainingQuota ?? (dailyLimit - totalUsed));
  const priorityUsed = safeNumber(quotaInfo?.high_priority_used ?? quotaInfo?.highPriorityUsed) + 
                      safeNumber(quotaInfo?.critical_priority_used ?? quotaInfo?.criticalPriorityUsed);
  const priorityReserve = safeNumber(quotaInfo?.priority_reserve ?? quotaInfo?.priorityReserve, 50);
  const priorityRemaining = safeNumber(quotaInfo?.priority_remaining ?? quotaInfo?.priorityRemaining ?? (priorityReserve - priorityUsed));

  const getBadgeClasses = (variant: 'default' | 'secondary' | 'destructive') => {
    switch (variant) {
      case 'default':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'secondary':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'destructive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* New User Welcome Message */}
      {isNewUser && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Welcome to URL Indexing! 🎉
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-3">
                Your account has been successfully set up with all necessary collections and default quota settings. 
                You're ready to start submitting URLs for Google indexing!
              </p>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Your daily quota:</strong> {dailyLimit.toLocaleString()} URLs</p>
                <p><strong>Priority reserve:</strong> {priorityReserve.toLocaleString()} URLs for high/critical priority</p>
                <p><strong>Available today:</strong> {remaining.toLocaleString()} URLs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Submitted</p>
              <p className="text-3xl font-bold">{totalSubmitted.toLocaleString()}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Successfully Indexed</p>
              <p className="text-3xl font-bold">{totalSuccess.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold">{totalPending.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Failed</p>
              <p className="text-3xl font-bold">{totalFailed.toLocaleString()}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-200" />
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Success Rate</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {safePercentage(successRate)}%
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                getBadgeClasses(successRate > 80 ? "default" : successRate > 60 ? "secondary" : "destructive")
              }`}>
                {successRate > 80 ? 'Excellent' : successRate > 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(successRate, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Success</p>
                <p className="font-semibold text-green-600">{totalSuccess.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Failed</p>
                <p className="font-semibold text-red-600">{totalFailed.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quota Usage Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Quota Usage</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalUsed.toLocaleString()} / {dailyLimit.toLocaleString()}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                getBadgeClasses(remaining > dailyLimit * 0.3 ? "default" : remaining > dailyLimit * 0.1 ? "secondary" : "destructive")
              }`}>
                {remaining.toLocaleString()} remaining
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalUsed / dailyLimit) * 100, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Used Today</p>
                <p className="font-semibold text-orange-600">{totalUsed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Remaining</p>
                <p className="font-semibold text-blue-600">{remaining.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Quota Section */}
      {quotaInfo && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Quota Reserve</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Priority</p>
              <p className="text-xl font-bold text-blue-600">
                {safeNumber(quotaInfo.low_priority_used ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Medium Priority</p>
              <p className="text-xl font-bold text-green-600">
                {safeNumber(quotaInfo.medium_priority_used ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
              <p className="text-xl font-bold text-orange-600">
                {safeNumber(quotaInfo.high_priority_used ?? quotaInfo.highPriorityUsed ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical Priority</p>
              <p className="text-xl font-bold text-red-600">
                {safeNumber(quotaInfo.critical_priority_used ?? quotaInfo.criticalPriorityUsed ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Priority Reserve: {priorityUsed.toLocaleString()} / {priorityReserve.toLocaleString()}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                getBadgeClasses(priorityRemaining > 10 ? "default" : "destructive")
              }`}>
                {priorityRemaining.toLocaleString()} remaining
              </span>
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((priorityUsed / priorityReserve) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexingDashboard; 