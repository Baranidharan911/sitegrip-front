'use client';

import { RefreshCw, Globe, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { IndexingStats, QuotaInfo } from '@/types/indexing';

interface IndexingDashboardProps {
  statistics: IndexingStats | null;
  quotaInfo: QuotaInfo | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function IndexingDashboard({
  statistics,
  quotaInfo,
  loading,
  onRefresh,
}: IndexingDashboardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getQuotaColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Indexing Dashboard
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total URLs */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total URLs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics ? formatNumber(statistics.totalUrlsSubmitted) : '-'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Indexed URLs */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Indexed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics ? formatNumber(statistics.totalUrlsIndexed) : '-'}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Pending URLs */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics ? formatNumber(statistics.totalUrlsPending) : '-'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Error URLs */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Errors
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statistics ? formatNumber(statistics.totalUrlsError) : '-'}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Success Rate and Quota */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Indexing Success Rate
            </h3>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200 dark:text-purple-300 dark:bg-purple-900/20">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-purple-600 dark:text-purple-300">
                  {statistics?.indexingSuccessRate.toFixed(1) || 0}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200 dark:bg-purple-900/20">
              <div
                style={{ width: `${statistics?.indexingSuccessRate || 0}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 dark:bg-purple-500 transition-all duration-500"
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Time</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {statistics?.averageIndexingTime || 0}h
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {statistics?.weeklySubmissions || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                {statistics?.indexingSuccessRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Quota Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            API Quota Usage
          </h3>
          
          {quotaInfo && (
            <div className="space-y-4">
              {/* Daily Quota */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Daily Quota
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getQuotaColor(quotaInfo.dailyUsed, quotaInfo.dailyLimit)}`}>
                    {quotaInfo.dailyUsed}/{quotaInfo.dailyLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((quotaInfo.dailyUsed / quotaInfo.dailyLimit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Monthly Quota */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Monthly Quota
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getQuotaColor(quotaInfo.monthlyUsed, quotaInfo.monthlyLimit)}`}>
                    {quotaInfo.monthlyUsed}/{quotaInfo.monthlyLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((quotaInfo.monthlyUsed / quotaInfo.monthlyLimit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                {quotaInfo.isPremium && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 mr-2">
                    Premium
                  </span>
                )}
                Resets in {new Date(quotaInfo.resetTime).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 