'use client';

import { useEffect, useState } from 'react';

interface KeywordRecommendations {
  primary_keywords: string[];
  suggested_keywords: string[];
  keyword_density: Record<string, number>;
  missing_keywords: string[];
  competitor_keywords: string[];
  long_tail_suggestions: string[];
}

interface RecommendationResponse {
  success: boolean;
  recommendations: KeywordRecommendations;
}

export default function KeywordRecommendationPanel({ url, bodyText }: { url: string; bodyText: string }) {
  const [recommendations, setRecommendations] = useState<KeywordRecommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!url) return;
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
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
        if (result.success && result.recommendations) {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
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
      if (result.success && result.recommendations) {
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
      
      {!loading && !error && !recommendations && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">💡</div>
          <p className="text-gray-500 text-sm">Recommendations will be generated automatically when URL data is available.</p>
        </div>
      )}
      
      {recommendations && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderKeywords(
              recommendations.primary_keywords,
              "🎯 Primary Keywords",
              "bg-blue-50 dark:bg-blue-900/30",
              "text-blue-700 dark:text-blue-300"
            )}
            
            {renderKeywords(
              recommendations.suggested_keywords,
              "💡 Suggested Keywords",
              "bg-green-50 dark:bg-green-900/30",
              "text-green-700 dark:text-green-300"
            )}
            
            {renderKeywords(
              recommendations.missing_keywords,
              "🚫 Missing Keywords",
              "bg-red-50 dark:bg-red-900/30",
              "text-red-700 dark:text-red-300"
            )}
            
            {renderKeywords(
              recommendations.long_tail_suggestions,
              "📝 Long-tail Suggestions",
              "bg-purple-50 dark:bg-purple-900/30",
              "text-purple-700 dark:text-purple-300"
            )}
          </div>

          {renderKeywordDensity(recommendations.keyword_density)}
        </div>
      )}
    </div>
  );
}
