'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Globe, 
  Zap, 
  RefreshCw, 
  Search, 
  Database,
  BarChart3,
  Target,
  Activity,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useIndexingBackend } from '@/hooks/useIndexingBackend';
import { IndexingStats, QuotaInfo } from '@/types/indexing';
import { getTierInfo, formatQuotaDisplay, getQuotaUsagePercentage, getQuotaStatusColor } from '@/lib/dataUtils';
import { useAuth } from '@/hooks/useAuth';

const IndexingDashboard: React.FC = () => {
  const { loading, statistics, quotaInfo, loadDashboardData, loadQuotaInfo } = useIndexingBackend();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [tierName, setTierName] = useState('Basic');

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Update tier info from user data
      // const userTier = user?.tier || 'free';
      // setTierName(userTier.charAt(0).toUpperCase() + userTier.slice(1));
      
      // Load quota info first to get real-time quota data
      try {
        await loadQuotaInfo();
        console.log('✅ Quota info refreshed successfully');
      } catch (quotaError) {
        console.warn('⚠️ Failed to refresh quota info:', quotaError);
      }
      
      // Then load dashboard data
      await loadDashboardData('sitegrip-basic-1'); // user?.projectId || 'sitegrip-basic-1'
      
      const totalSubmitted = statistics?.total_submitted ?? statistics?.totalUrlsSubmitted ?? 0;
      const quotaUsed = quotaInfo?.total_used ?? quotaInfo?.totalUsed ?? 0;
      
      if (totalSubmitted === 0 && quotaUsed === 0) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    } catch (err) {
      console.error('❌ Failed to load dashboard data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Update tier info when user data changes
    // if (user) {
    //   setTierName(user.tierName || 'Basic');
    // }
    
    const totalSubmitted = statistics?.total_submitted ?? statistics?.totalUrlsSubmitted ?? 0;
    const quotaUsed = quotaInfo?.total_used ?? quotaInfo?.totalUsed ?? 0;
    
    if (totalSubmitted === 0 && quotaUsed === 0) {
      setIsNewUser(true);
    } else {
      setIsNewUser(false);
    }
  }, [statistics, quotaInfo]); // , user

  if (loading && !statistics) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <span className="ml-4 text-gray-600 dark:text-gray-400 font-medium">Loading dashboard...</span>
        </div>
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

  // Get tier information based on actual quota limits (no fallbacks)
  const dailyLimit = quotaInfo?.daily_limit || 0;
  const priorityReserve = quotaInfo?.priority_reserve || 0;
  const priorityUsed = safeNumber(quotaInfo?.high_priority_used) + safeNumber(quotaInfo?.critical_priority_used);
  
  // Get tier information for display
  const tierInfo = quotaInfo ? getTierInfo(dailyLimit) : { tierName: 'Unknown', tierLevel: 'unknown', features: [] };
  const quotaUsagePercentage = quotaInfo ? getQuotaUsagePercentage(quotaInfo) : 0;
  const quotaStatusColor = quotaInfo ? getQuotaStatusColor(quotaInfo) : 'text-gray-500';
  const priorityRemaining = priorityReserve - priorityUsed;

  const quotaPercentage = (quotaUsed / dailyLimit) * 100;
  const successRatePercentage = indexingSuccessRate;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Indexing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitor your Google indexing progress and quota usage in real-time
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2.5 test-black-300 bg-gray-300 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Welcome Message for New Users */}
      {isNewUser && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Welcome to Site Grip! 🎉</h3>
              <p className="text-blue-800 dark:text-blue-200 mb-3">
                You're all set up! Start by submitting your first URL for Google indexing. 
                We'll help you track its progress and optimize your website's search visibility.
              </p>
              <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Real-time tracking
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Instant submissions
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Priority control
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quota Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Quota Usage</h3>
          <div className="flex items-center gap-2">
            {loading || !quotaInfo ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
                  Loading quota info...
                </span>
              </div>
            ) : (
              <>
                <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {tierInfo.tierName} Plan - {quotaInfo.daily_limit} URLs/day
                </span>
              </>
            )}
          </div>
        </div>
        
        {loading || !quotaInfo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Used Today</span>
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-gray-300 dark:bg-gray-600 h-3 rounded-full animate-pulse w-1/4"></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <span className="text-gray-500 dark:text-gray-400">
                Resets daily at midnight
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Used Today</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {quotaInfo.total_used} / {quotaInfo.daily_limit}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  quotaUsagePercentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  quotaUsagePercentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(quotaUsagePercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className={quotaStatusColor}>
                {quotaInfo.daily_limit - quotaInfo.total_used} URLs remaining today
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Resets daily at midnight
              </span>
            </div>
            
            {/* Tier Features */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  tierInfo.tierLevel === 'free' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                  tierInfo.tierLevel === 'basic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  tierInfo.tierLevel === 'professional' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  tierInfo.tierLevel === 'advanced' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  tierInfo.tierLevel === 'premium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-200'
                }`}>
                  {tierInfo.tierName} Tier
                </span>
                {quotaUsagePercentage >= 90 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Quota Low
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Plan includes: {tierInfo.features.slice(0, 2).join(', ')}
                {tierInfo.features.length > 2 && ` +${tierInfo.features.length - 2} more`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quota Alert */}
      {quotaInfo && (quotaInfo.daily_limit - quotaInfo.total_used) < Math.max(5, Math.floor(quotaInfo.daily_limit * 0.1)) && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Quota Limit Approaching</p>
            <p className="text-sm">
              You have only {quotaInfo.daily_limit - quotaInfo.total_used} URLs remaining on your {tierInfo.tierName} plan ({quotaInfo.daily_limit}/day). 
              {tierInfo.tierLevel === 'free' ? (
                <a href="/pricing" className="ml-1 underline text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100">
                  Upgrade to Basic (50/day)
                </a>
              ) : (
                <a href="/pricing" className="ml-1 underline text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100">
                  Upgrade your plan
                </a>
              )} for more capacity.
            </p>
          </div>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-blue-100" />
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Submitted</p>
            <p className="text-3xl font-bold">{totalSubmitted.toLocaleString()}</p>
            <p className="text-blue-100 text-xs mt-2">URLs sent to Google</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-100" />
            </div>
            <p className="text-emerald-100 text-sm font-medium mb-1">Successfully Indexed</p>
            <p className="text-3xl font-bold">{totalIndexed.toLocaleString()}</p>
            <p className="text-emerald-100 text-xs mt-2">Pages in Google index</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <ArrowDownRight className="w-5 h-5 text-amber-100" />
            </div>
            <p className="text-amber-100 text-sm font-medium mb-1">Not Indexed</p>
            <p className="text-3xl font-bold">{totalNotIndexed.toLocaleString()}</p>
            <p className="text-amber-100 text-xs mt-2">Need attention</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-purple-100" />
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">Pending Check</p>
            <p className="text-3xl font-bold">{totalPending.toLocaleString()}</p>
            <p className="text-purple-100 text-xs mt-2">Awaiting status</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Indexing Success Rate
            </h3>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{safePercentage(indexingSuccessRate)}%</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Successfully Indexed</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalIndexed.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Not Indexed</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{totalNotIndexed.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{totalFailed.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Daily Quota Usage
            </h3>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{Math.round(quotaPercentage)}%</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Used Today</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {quotaUsed.toLocaleString()} / {dailyLimit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Remaining</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {quotaRemaining.toLocaleString()} submissions
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Priority Quota Breakdown */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Priority Quota Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">L</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Low Priority</p>
            <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
              {safeNumber(quotaInfo?.low_priority_used).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 dark:text-green-400 font-bold text-sm">M</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Medium Priority</p>
            <p className="font-bold text-green-600 dark:text-green-400 text-lg">
              {safeNumber(quotaInfo?.medium_priority_used).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">H</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">High Priority</p>
            <p className="font-bold text-orange-600 dark:text-orange-400 text-lg">
              {safeNumber(quotaInfo?.high_priority_used).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 rounded-xl border border-red-200 dark:border-red-800">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 dark:text-red-400 font-bold text-sm">C</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Critical Priority</p>
            <p className="font-bold text-red-600 dark:text-red-400 text-lg">
              {safeNumber(quotaInfo?.critical_priority_used).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Priority Reserve Usage</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {priorityUsed.toLocaleString()} / {priorityReserve.toLocaleString()} used
          </span>
        </div>
      </div>
    </div>
  );
};

export default IndexingDashboard; 
