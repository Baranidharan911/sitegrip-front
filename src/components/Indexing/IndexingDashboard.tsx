'use client';

import React from 'react';
import { IndexingStats, QuotaInfo } from '@/lib/indexingApi';

interface IndexingDashboardProps {
  statistics: IndexingStats | null;
  quotaInfo: QuotaInfo | null;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function IndexingDashboard({
  statistics,
  quotaInfo,
  onRefresh,
  isLoading = false,
}: IndexingDashboardProps) {
  const getQuotaPercentage = () => {
    if (!quotaInfo) return 0;
    return (quotaInfo.total_used / quotaInfo.total_daily_limit) * 100;
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 75) return 'text-orange-600 bg-orange-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Indexing Dashboard
        </h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Submitted</p>
              <p className="text-2xl font-bold">
                {statistics?.total_urls_submitted || 0}
              </p>
            </div>
            <div className="text-3xl opacity-75">
              📤
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Successfully Indexed</p>
              <p className="text-2xl font-bold">
                {statistics?.total_urls_indexed || 0}
              </p>
            </div>
            <div className="text-3xl opacity-75">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending</p>
              <p className="text-2xl font-bold">
                {statistics?.total_urls_pending || 0}
              </p>
            </div>
            <div className="text-3xl opacity-75">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Errors</p>
              <p className="text-2xl font-bold">
                {statistics?.total_urls_error || 0}
              </p>
            </div>
            <div className="text-3xl opacity-75">
              ❌
            </div>
          </div>
        </div>
      </div>

      {/* Success Rate and Quota */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Indexing Success Rate
          </h4>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${statistics?.indexing_success_rate || 0}%` }}
                ></div>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {statistics?.indexing_success_rate.toFixed(1) || 0}%
            </span>
          </div>
        </div>

        {/* Quota Usage */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Daily Quota Usage
          </h4>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    getQuotaPercentage() >= 90 ? 'bg-red-500' :
                    getQuotaPercentage() >= 75 ? 'bg-orange-500' :
                    getQuotaPercentage() >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${getQuotaPercentage()}%` }}
                ></div>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {quotaInfo?.total_used || 0}/{quotaInfo?.total_daily_limit || 200}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {quotaInfo?.remaining || 200} remaining today
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      {statistics && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {statistics.total_urls_submitted}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total URLs</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statistics.indexing_success_rate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {quotaInfo?.remaining || 200}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quota Left</p>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {quotaInfo && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date(quotaInfo.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  );
} 