'use client';

import { useEffect, useState } from 'react';

interface TrendingKeyword {
  keyword: string;
  search_volume: number;
  growth_rate: number;
  difficulty: number;
  opportunity: 'high' | 'medium' | 'low';
  related_keywords: string[];
  pages_found: number;
  domain_relevance: number;
}

interface TrendingResponse {
  success: boolean;
  trending_keywords: TrendingKeyword[];
  domain: string | null;
  period_days: number;
  total_keywords: number;
  metadata: {
    analyzed_at: string;
    data_source: string;
    update_frequency: string;
  };
}

export default function TrendingKeywordsPanel({ domain }: { domain?: string }) {
  const [trendingData, setTrendingData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  const fetchTrendingKeywords = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app';
      const params = new URLSearchParams({
        days: selectedPeriod.toString(),
        ...(domain && { domain })
      });
      
      const response = await fetch(`${apiUrl}/api/keywords/trending?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch trending keywords');
      }

      const result = await response.json();
      setTrendingData(result);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingKeywords();
  }, [domain, selectedPeriod]);

  const periods = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🔥 Trending Keywords</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {domain ? `Popular keywords for ${domain}` : 'Popular keywords across all domains'}
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {period.label}
            </button>
          ))}
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading trending keywords...</span>
        </div>
      )}

      {/* Trending Keywords */}
      {trendingData && !loading && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              📊 Trending Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Keywords</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {trendingData.total_keywords}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Period</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {trendingData.period_days} days
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Domain Filter</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {trendingData.domain || 'All domains'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Data Source</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  {trendingData.metadata?.data_source === 'crawled_content' ? 'Real Content' : 'Analysis'}
                </div>
              </div>
            </div>
          </div>

          {/* Keywords List */}
          {trendingData.trending_keywords && trendingData.trending_keywords.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  🔥 Top Trending Keywords
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingData.trending_keywords
                    .sort((a, b) => b.search_volume - a.search_volume)
                    .slice(0, 12)
                    .map((keyword, index) => (
                      <div 
                        key={keyword.keyword}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            #{index + 1}
                          </span>
                          <span className="text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔥'}
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                          {keyword.keyword}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Search Volume:</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                              {keyword.search_volume.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Growth:</span>
                            <span className={`font-medium ${keyword.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {keyword.growth_rate > 0 ? '+' : ''}{keyword.growth_rate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                              {keyword.difficulty}/100
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Opportunity:</span>
                            <span className={`font-medium ${
                              keyword.opportunity === 'high' ? 'text-green-600' : 
                              keyword.opportunity === 'medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {keyword.opportunity.charAt(0).toUpperCase() + keyword.opportunity.slice(1)}
                            </span>
                          </div>
                          {keyword.pages_found > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Pages Found:</span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {keyword.pages_found}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(keyword.search_volume / Math.max(...trendingData.trending_keywords.map(k => k.search_volume))) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No trending keywords found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {domain 
                    ? `No keyword data available for ${domain} in the last ${selectedPeriod} days.`
                    : `No keyword data available in the last ${selectedPeriod} days.`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Insights */}
          {trendingData.trending_keywords && trendingData.trending_keywords.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">💡 Trending Insights</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">📈</span>
                  <span>
                    <strong>High Growth:</strong> {trendingData.trending_keywords.filter(k => k.growth_rate > 15).length} keywords showing strong growth
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">🎯</span>
                  <span>
                    <strong>High Opportunity:</strong> {trendingData.trending_keywords.filter(k => k.opportunity === 'high').length} keywords with high ranking potential
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-500">📊</span>
                  <span>
                    <strong>Average Search Volume:</strong> {Math.round(trendingData.trending_keywords.reduce((sum, k) => sum + k.search_volume, 0) / trendingData.trending_keywords.length).toLocaleString()} searches per month
                  </span>
                </div>
                {trendingData.metadata?.data_source === 'crawled_content' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-500">🔍</span>
                    <span>
                      <strong>Real-time Data:</strong> Keywords extracted from actual crawled content
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
