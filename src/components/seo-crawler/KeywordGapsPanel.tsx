'use client';

import { useEffect, useState } from 'react';

interface KeywordGap {
  keyword: string;
  missing_frequency: number;
  opportunity_score: number;
  competitor_usage: string[];
  suggested_placement: string;
}

interface KeywordGapsResponse {
  success: boolean;
  url: string;
  keyword_gaps: KeywordGap[];
  total_gaps: number;
  period_days: number;
}

export default function KeywordGapsPanel({ url }: { url: string }) {
  const [gapsData, setGapsData] = useState<KeywordGapsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeywordGaps = async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';
      const encodedUrl = encodeURIComponent(url);
      const response = await fetch(`${apiUrl}/api/keywords/gaps/${encodedUrl}?days=30`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch keyword gaps');
      }

      const result = await response.json();
      setGapsData(result);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywordGaps();
  }, [url]);

  const getOpportunityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
  };

  const getOpportunityLabel = (score: number) => {
    if (score >= 80) return 'High Opportunity';
    if (score >= 60) return 'Medium Opportunity';
    return 'Low Opportunity';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🕳️ Keyword Gaps Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Identify missing keyword opportunities for your content
          </p>
        </div>
        
        <button
          onClick={fetchKeywordGaps}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '🔄 Analyzing...' : '🔍 Refresh'}
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
          <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing keyword gaps...</span>
        </div>
      )}

      {/* Gaps Data */}
      {gapsData && !loading && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📊 Keyword Gaps Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Gaps Found</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {gapsData.total_gaps}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Analysis Period</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {gapsData.period_days} days
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">URL Analyzed</div>
                <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {gapsData.url}
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Gaps List */}
          {gapsData.keyword_gaps && gapsData.keyword_gaps.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  🎯 Identified Keyword Gaps
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {gapsData.keyword_gaps.map((gap, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                          {gap.keyword}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Missing Frequency: {gap.missing_frequency}</span>
                          <span>Suggested: {gap.suggested_placement}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getOpportunityColor(gap.opportunity_score)}`}>
                        {getOpportunityLabel(gap.opportunity_score)}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Opportunity Score</span>
                        <span className="text-sm font-medium">{gap.opportunity_score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${gap.opportunity_score}%` }}
                        />
                      </div>
                    </div>

                    {gap.competitor_usage && gap.competitor_usage.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          🏆 Competitor Usage
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {gap.competitor_usage.map((competitor, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                            >
                              {competitor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No keyword gaps found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Great! Your content appears to be well-optimized for relevant keywords,
                  or there isn't enough data to identify gaps yet.
                </p>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {gapsData.keyword_gaps && gapsData.keyword_gaps.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">💡 Optimization Recommendations</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500">🎯</span>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Priority Focus:</strong> Start with high-opportunity keywords (80+ score) 
                      as they offer the best potential for ranking improvements
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-green-500">📝</span>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Content Strategy:</strong> Incorporate missing keywords naturally into your content, 
                      focusing on the suggested placement areas (titles, headings, body text)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-purple-500">🏆</span>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Competitive Analysis:</strong> Study how competitors use these keywords 
                      to understand best practices and identify content opportunities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !gapsData && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🕳️</div>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to analyze keyword gaps for your content
          </p>
        </div>
      )}
    </div>
  );
} 