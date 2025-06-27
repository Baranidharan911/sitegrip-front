'use client';

import { useEffect, useState } from 'react';

interface CurrentKeywords {
  primary_keywords: string[];
  suggested_keywords: string[];
  keyword_density: Record<string, number>;
  missing_keywords: string[];
  competitor_keywords: string[];
  long_tail_suggestions: string[];
}

interface RecommendationData {
  optimization_suggestions: string[];
  recommended_additions: string[];
  content_improvements: string[];
  priority_actions: string[];
  analysis_summary: {
    current_primary_count: number;
    current_density_range: string;
    content_word_count: number;
    missing_opportunities: number;
  };
}

interface RecommendationResponse {
  success: boolean;
  current_keywords: CurrentKeywords;
  recommendations: RecommendationData;
}

export default function KeywordRecommendationPanel({ url, bodyText }: { url: string; bodyText: string }) {
  const [currentKeywords, setCurrentKeywords] = useState<CurrentKeywords | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!url) return;
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';
        const res = await fetch(`${apiUrl}/api/keywords/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, body_text: bodyText || '' }),
        });
        if (!res.ok) {
          let errorMessage = 'Failed to get recommendations';
          try {
            const err = await res.json();
            if (err.detail) {
              if (typeof err.detail === 'string' && err.detail.includes('Keyword analysis failed:')) {
                errorMessage = 'Keyword recommendation service is currently unavailable. Please try again later.';
              } else {
                errorMessage = err.detail;
              }
            }
          } catch (e) {
            errorMessage = `Server error (${res.status}). Please try again later.`;
          }
          throw new Error(errorMessage);
        }
        const result: RecommendationResponse = await res.json();
        if (result.success && result.current_keywords && result.recommendations) {
          setCurrentKeywords(result.current_keywords);
          setRecommendations(result.recommendations);
        } else {
          throw new Error('Invalid response format from recommendation service');
        }
      } catch (err: any) {
        console.error('Keyword recommendation error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [url, bodyText]);

  const retryRecommendations = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';
      const res = await fetch(`${apiUrl}/api/keywords/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, body_text: bodyText || '' }),
      });
      if (!res.ok) {
        let errorMessage = 'Failed to get recommendations';
        try {
          const err = await res.json();
          if (err.detail) {
            if (typeof err.detail === 'string' && err.detail.includes('Keyword analysis failed:')) {
              errorMessage = 'Keyword recommendation service is currently unavailable. Please try again later.';
            } else {
              errorMessage = err.detail;
            }
          }
        } catch (e) {
          errorMessage = `Server error (${res.status}). Please try again later.`;
        }
        throw new Error(errorMessage);
      }
      const result: RecommendationResponse = await res.json();
      if (result.success && result.current_keywords && result.recommendations) {
        setCurrentKeywords(result.current_keywords);
        setRecommendations(result.recommendations);
      } else {
        throw new Error('Invalid response format from recommendation service');
      }
    } catch (err: any) {
      console.error('Keyword recommendation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderKeywords = (keywords: string[] | undefined, title: string, bgColor: string, textColor: string) => {
    if (!keywords || keywords.length === 0) return null;
    return (
      <div className={`${bgColor} rounded-lg p-4`}>
        <h3 className={`font-semibold ${textColor} mb-3`}>{title}</h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, i) => (
            <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${textColor} bg-white/20 border border-current/20`}>
              {kw}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderKeywordDensity = (density: Record<string, number>) => {
    if (!density || Object.keys(density).length === 0) return null;
    
    const sortedDensity = Object.entries(density)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 Keyword Density</h3>
        <div className="space-y-2">
          {sortedDensity.map(([keyword, density]) => (
            <div key={keyword} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1 mr-3">
                {keyword}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(density, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-blue-600 dark:text-blue-400 w-10 text-right">
                  {density.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow border dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">💡 AI Keyword Recommendations</h2>
        {error && (
          <button
            onClick={retryRecommendations}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔄 Retrying...' : '🔄 Retry'}
          </button>
        )}
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Fetching recommendations...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">❌</span>
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">Recommendations Failed</p>
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !error && !currentKeywords && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">💡</div>
          <p className="text-gray-500 text-sm">Recommendations will be generated automatically when URL data is available.</p>
        </div>
      )}
      
      {currentKeywords && recommendations && !loading && (
        <div className="space-y-6">
          {/* Current Keywords Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              📊 Current Keywords Analysis
              <span className="ml-3 text-sm bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                {recommendations.analysis_summary.current_primary_count} primary
              </span>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {renderKeywords(
                currentKeywords.primary_keywords,
                "🎯 Current Primary Keywords",
                "bg-blue-50 dark:bg-blue-900/30",
                "text-blue-700 dark:text-blue-300"
              )}
              
              {renderKeywords(
                currentKeywords.suggested_keywords,
                "💡 Currently Suggested",
                "bg-green-50 dark:bg-green-900/30", 
                "text-green-700 dark:text-green-300"
              )}
            </div>
            
            {renderKeywordDensity(currentKeywords.keyword_density)}
          </div>

          {/* Recommendations Section */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              ⚡ AI Recommendations
              <span className="ml-3 text-sm bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                {recommendations.optimization_suggestions.length} suggestions
              </span>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                  🚨 Priority Actions
                </h4>
                <ul className="space-y-2">
                  {recommendations.priority_actions.map((action, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-red-500 mr-2 mt-0.5">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Optimization Suggestions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                  🔧 Optimization Tips
                </h4>
                <ul className="space-y-2">
                  {recommendations.optimization_suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Additions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                  ➕ Recommended Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.recommended_additions.map((keyword, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm border border-green-200 dark:border-green-700">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Improvements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                  📝 Content Improvements
                </h4>
                <ul className="space-y-2">
                  {recommendations.content_improvements.map((improvement, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-purple-500 mr-2 mt-0.5">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">📈 Analysis Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Primary Keywords</div>
                  <div className="font-semibold text-gray-800 dark:text-white">{recommendations.analysis_summary.current_primary_count}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Density Range</div>
                  <div className="font-semibold text-gray-800 dark:text-white">{recommendations.analysis_summary.current_density_range}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Word Count</div>
                  <div className="font-semibold text-gray-800 dark:text-white">{recommendations.analysis_summary.content_word_count}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Missing Opportunities</div>
                  <div className="font-semibold text-gray-800 dark:text-white">{recommendations.analysis_summary.missing_opportunities}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
