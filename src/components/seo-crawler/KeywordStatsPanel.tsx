'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

interface KeywordStats {
  success: boolean;
  statistics: {
    total_keyword_analyses: number;
    total_keyword_comparisons: number;
    total_tracking_records: number;
    last_updated: string;
  };
}

export default function KeywordStatsPanel() {
  const [stats, setStats] = useState<KeywordStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get authentication token
      if (!auth) throw new Error('Authentication not available');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required. Please log in to view keyword stats.');
      }

      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/keywords/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch statistics');
      }

      const result = await response.json();
      setStats(result);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📊 Keyword Statistics</h2>
          <p className="text-gray-600 dark:text-gray-400">Overview of keyword analysis activity</p>
        </div>
        
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">❌</span>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading statistics...</span>
        </div>
      )}

      {/* Statistics Display */}
      {stats && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🔍</span>
                <div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Analyses</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.statistics.total_keyword_analyses}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">⚖️</span>
                <div>
                  <div className="text-sm text-green-600 dark:text-green-400">Comparisons</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.statistics.total_keyword_comparisons}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📍</span>
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Tracking Records</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.statistics.total_tracking_records}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📊 Activity Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {new Date(stats.statistics.last_updated).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Activities:</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {stats.statistics.total_keyword_analyses + 
                   stats.statistics.total_keyword_comparisons + 
                   stats.statistics.total_tracking_records}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !stats && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading keyword statistics...
          </p>
        </div>
      )}
    </div>
  );
} 
