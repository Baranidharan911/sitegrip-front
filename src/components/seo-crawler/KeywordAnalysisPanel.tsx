'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

interface KeywordAnalysis {
  primary_keywords: string[];
  suggested_keywords: string[];
  keyword_density: Record<string, number>;
  missing_keywords: string[];
  competitor_keywords: string[];
  long_tail_suggestions: string[];
}

interface AnalysisResponse {
  success: boolean;
  keyword_analysis: KeywordAnalysis;
}

interface KeywordAnalysisPanelProps {
  url: string;
  bodyText?: string;
  title?: string;
  metaDescription?: string;
}

export default function KeywordAnalysisPanel({ url, bodyText, title, metaDescription }: KeywordAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const analyzeKeywords = async () => {
    if (!url) {
      setError('URL is required for analysis');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get authentication token
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required. Please log in to analyze keywords.');
      }

      const token = await user.getIdToken();
      
      const response = await fetch(`${apiUrl}/api/keywords/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          url,
          body_text: bodyText || '', // Allow empty body_text
          title: title || '',
          meta_description: metaDescription || ''
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to analyze keywords';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            // Handle nested error details
            if (typeof errorData.detail === 'string' && errorData.detail.includes('Keyword analysis failed:')) {
              errorMessage = 'Keyword analysis service is currently unavailable. Please try again later.';
            } else {
              errorMessage = errorData.detail;
            }
          }
        } catch (e) {
          errorMessage = `Server error (${response.status}). Please try again later.`;
        }
        throw new Error(errorMessage);
      }

      const result: AnalysisResponse = await response.json();
      
      if (result.success && result.keyword_analysis) {
        setAnalysis(result.keyword_analysis);
      } else {
        throw new Error('Invalid response format from keyword analysis service');
      }
      
    } catch (err: any) {
      console.error('Keyword analysis error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger analysis when URL is available
  useEffect(() => {
    if (url) {
      analyzeKeywords();
    }
  }, [url, bodyText, title, metaDescription]);

  const renderKeywordSection = (keywords: string[] | undefined, title: string, bgColor: string, textColor: string) => {
    if (!keywords || keywords.length === 0) return null;
    
    return (
      <div className={`${bgColor} rounded-lg p-4`}>
        <h3 className={`font-semibold ${textColor} mb-3`}>{title}</h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <span 
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium ${textColor} bg-white/20 border border-current/20`}
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderKeywordDensity = (density: Record<string, number>) => {
    const sortedDensity = Object.entries(density)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

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
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(density, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-mono text-blue-600 dark:text-blue-400 w-12 text-right">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🔍 Keyword Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400">Analyze keyword opportunities for your content</p>
        </div>
        <button
          onClick={analyzeKeywords}
          disabled={loading || !url}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '🔄 Analyzing...' : '🔄 Retry Analysis'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">❌</span>
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">Analysis Failed</p>
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>
              <button
                onClick={analyzeKeywords}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing keywords...</span>
        </div>
      )}

      {analysis && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderKeywordSection(
            analysis.primary_keywords,
            '🎯 Primary Keywords',
            'bg-blue-50 dark:bg-blue-900/30',
            'text-blue-700 dark:text-blue-300'
          )}
          
          {renderKeywordSection(
            analysis.suggested_keywords,
            '💡 Suggested Keywords',
            'bg-green-50 dark:bg-green-900/30',
            'text-green-700 dark:text-green-300'
          )}
          
          {renderKeywordSection(
            analysis.missing_keywords,
            '🚫 Missing Keywords',
            'bg-red-50 dark:bg-red-900/30',
            'text-red-700 dark:text-red-300'
          )}
          
          {renderKeywordSection(
            analysis.long_tail_suggestions,
            '📝 Long-tail Suggestions',
            'bg-purple-50 dark:bg-purple-900/30',
            'text-purple-700 dark:text-purple-300'
          )}
        </div>
      )}

      {analysis?.keyword_density && Object.keys(analysis.keyword_density).length > 0 && (
        <div className="col-span-full">
          {renderKeywordDensity(analysis.keyword_density)}
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-400">
            Analysis will start automatically when URL data is available
          </p>
        </div>
      )}
    </div>
  );
} 
