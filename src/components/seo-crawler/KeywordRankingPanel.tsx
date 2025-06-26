'use client';

import { useState, useEffect } from 'react';

interface SearchEngineRanking {
  keyword: string;
  google_rank: number;
  bing_rank: number;
  mobile_rank: number;
  search_volume: number;
  competition_level: string;
  cpc_estimate: number;
  ranking_date: string;
  ranking_change: number | null;
}

interface RankingHistory {
  keyword: string;
  url: string;
  rankings: SearchEngineRanking[];
  best_ranking: number;
  worst_ranking: number;
  average_ranking: number;
  ranking_trend: string;
  tracking_start_date: string;
}

export default function KeywordRankingPanel({ url, domain }: { url: string; domain: string }) {
  const [keyword, setKeyword] = useState('');
  const [rankingData, setRankingData] = useState<SearchEngineRanking | null>(null);
  const [historyData, setHistoryData] = useState<RankingHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'track' | 'history'>('track');

  const trackKeyword = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword to track');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/ranking/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(),
          url,
          domain
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to track keyword');
      }

      const result = await response.json();
      setRankingData(result);
      
      // Auto-switch to history view to show results
      setActiveView('history');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankingHistory = async (searchKeyword: string) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${apiUrl}/api/ranking/history?keyword=${encodeURIComponent(searchKeyword)}&url=${encodeURIComponent(url)}&days=30`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch ranking history');
      }

      const result = await response.json();
      setHistoryData(result);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rankingData && activeView === 'history') {
      fetchRankingHistory(rankingData.keyword);
    }
  }, [rankingData, activeView]);

  const getRankColor = (rank: number) => {
    if (rank <= 10) return 'text-green-600 dark:text-green-400';
    if (rank <= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '🔄';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📊 Keyword Ranking</h2>
          <p className="text-gray-600 dark:text-gray-400">Track keyword rankings across search engines</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveView('track')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeView === 'track'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🎯 Track New
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeView === 'history'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📈 History
          </button>
        </div>
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

      {/* Track New Keyword */}
      {activeView === 'track' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">🎯 Track New Keyword</h3>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword to track (e.g., web development)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && trackKeyword()}
              />
            </div>
            <button
              onClick={trackKeyword}
              disabled={loading || !keyword.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {loading ? '🔄 Tracking...' : '🚀 Track'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Domain:</strong> {domain}</p>
            <p><strong>URL:</strong> {url}</p>
          </div>
        </div>
      )}

      {/* Latest Ranking Data */}
      {activeView === 'track' && rankingData && !loading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-6 border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            📊 Latest Ranking for "{rankingData.keyword}"
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Google Rank</div>
              <div className={`text-2xl font-bold ${getRankColor(rankingData.google_rank)}`}>
                #{rankingData.google_rank}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Bing Rank</div>
              <div className={`text-2xl font-bold ${getRankColor(rankingData.bing_rank)}`}>
                #{rankingData.bing_rank}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Mobile Rank</div>
              <div className={`text-2xl font-bold ${getRankColor(rankingData.mobile_rank)}`}>
                #{rankingData.mobile_rank}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Search Volume:</span>
              <span className="ml-2 font-semibold">{rankingData.search_volume.toLocaleString()}/month</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Competition:</span>
              <span className="ml-2 font-semibold capitalize">{rankingData.competition_level}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">CPC Estimate:</span>
              <span className="ml-2 font-semibold">${rankingData.cpc_estimate}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ranking History */}
      {activeView === 'history' && historyData && !loading && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📈 Ranking History for "{historyData.keyword}"
            </h3>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                <div className="text-sm text-green-600 dark:text-green-400">Best Ranking</div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  #{historyData.best_ranking}
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                <div className="text-sm text-red-600 dark:text-red-400">Worst Ranking</div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  #{historyData.worst_ranking}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <div className="text-sm text-blue-600 dark:text-blue-400">Average Ranking</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  #{historyData.average_ranking.toFixed(1)}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                <div className="text-sm text-purple-600 dark:text-purple-400">Trend</div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {getTrendIcon(historyData.ranking_trend)} {historyData.ranking_trend}
                </div>
              </div>
            </div>

            {/* Rankings List */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Recent Rankings</h4>
              {historyData.rankings.slice(0, 5).map((ranking, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(ranking.ranking_date).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-3">
                      <span className={`text-sm font-medium ${getRankColor(ranking.google_rank)}`}>
                        Google #{ranking.google_rank}
                      </span>
                      <span className={`text-sm font-medium ${getRankColor(ranking.bing_rank)}`}>
                        Bing #{ranking.bing_rank}
                      </span>
                      <span className={`text-sm font-medium ${getRankColor(ranking.mobile_rank)}`}>
                        Mobile #{ranking.mobile_rank}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {ranking.search_volume.toLocaleString()} searches
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            {activeView === 'track' ? 'Tracking keyword...' : 'Loading ranking history...'}
          </span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !rankingData && !historyData && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400">
            {activeView === 'track' 
              ? 'Enter a keyword to start tracking its rankings'
              : 'No ranking history available. Track some keywords first!'
            }
          </p>
        </div>
      )}
    </div>
  );
} 