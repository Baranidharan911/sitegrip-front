"use client";

import React, { useState } from 'react';
import { Search, Download, Share2, Printer, CheckCircle, AlertCircle, XCircle, Info, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { saveToFirebase } from '@/lib/firebase.js';

export const dynamic = 'force-dynamic';

interface MetaTagAnalysis {
  title: { content: string; length: number; optimal: boolean; score: number; issues: string[]; recommendations: string[]; };
  description: { content: string; length: number; optimal: boolean; score: number; issues: string[]; recommendations: string[]; };
  keywords: { content: string; count: number; score: number; issues: string[]; recommendations: string[]; };
  robots: { content: string; directives: string[]; score: number; issues: string[]; recommendations: string[]; };
  viewport: { present: boolean; content: string; score: number; issues: string[]; recommendations: string[]; };
  charset: { present: boolean; content: string; score: number; issues: string[]; recommendations: string[]; };
  overallScore: number;
  recommendations: string[];
}

export default function MetaTagAnalyzerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MetaTagAnalysis | null>(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const analyzeMetaTags = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/meta-tag-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze meta tags');
      }

      setResults(data);

      if (user) {
        try {
          await saveToFirebase('metaTagAnalysis', {
            userId: user.uid,
            url: data.url,
            analysis: data,
            timestamp: new Date().toISOString()
          });
        } catch (firebaseError) {
          console.error('Failed to save to Firebase:', firebaseError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing meta tags');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const exportResults = (format: 'pdf' | 'csv' | 'json') => {
    if (!results) return;

    const data = {
      url: (results as any).url || url,
      timestamp: new Date().toISOString(),
      analysis: results
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meta-tag-analysis-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvData = [
        ['URL', data.url],
        ['Overall Score', results.overallScore],
        ['Title', results.title.content],
        ['Title Score', results.title.score],
        ['Description', results.description.content],
        ['Description Score', results.description.score],
        ['Keywords', results.keywords.content],
        ['Keywords Score', results.keywords.score],
        ['Robots', results.robots.content],
        ['Robots Score', results.robots.score],
        ['Viewport', results.viewport.content],
        ['Viewport Score', results.viewport.score],
        ['Charset', results.charset.content],
        ['Charset Score', results.charset.score]
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meta-tag-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const shareResults = () => {
    if (!results) return;
    const shareData = {
      title: 'Meta Tag Analysis Results',
      text: `Meta Tag Analysis for ${(results as any).url || url} - Overall Score: ${results.overallScore}/100`,
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
              <Search className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meta Tag Analyzer
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Analyze and optimize your page's meta tags for better SEO performance.
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && analyzeMetaTags()}
                />
              </div>
              <button
                onClick={analyzeMetaTags}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="mr-2" />
                    Analyze
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                <XCircle className="mr-2" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Overall Score</h2>
                <div className="flex gap-2">
                  <button onClick={() => exportResults('json')} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Download className="mr-1" /> JSON
                  </button>
                  <button onClick={() => exportResults('csv')} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Download className="mr-1" /> CSV
                  </button>
                  <button onClick={shareResults} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Share2 className="mr-1" /> Share
                  </button>
                  <button onClick={() => window.print()} className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center">
                    <Printer className="mr-1" /> Print
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(results.overallScore)} mb-4`}>
                  <span className={`text-3xl font-bold ${getScoreColor(results.overallScore)}`}>
                    {results.overallScore}
                  </span>
                </div>
                <p className="text-gray-600">out of 100</p>
                <div className="mt-4">
                  <a href={(results as any).url || url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center justify-center">
                    <ExternalLink className="mr-1" />
                    View Analyzed Page
                  </a>
                </div>
              </div>
            </div>

            {/* Individual Analysis Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Title Tag</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(results.title.score)} ${getScoreColor(results.title.score)}`}>
                    {results.title.score}/100
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Content:</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg break-words">
                      {results.title.content || 'Not found'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Length:</span>
                    <span className={`font-medium ${results.title.optimal ? 'text-green-600' : 'text-yellow-600'}`}>
                      {results.title.length} characters
                    </span>
                  </div>

                  {results.title.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Issues:</p>
                      <ul className="space-y-1">
                        {results.title.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start">
                            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.title.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {results.title.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start">
                            <Info className="mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Meta Description</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(results.description.score)} ${getScoreColor(results.description.score)}`}>
                    {results.description.score}/100
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Content:</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg break-words">
                      {results.description.content || 'Not found'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Length:</span>
                    <span className={`font-medium ${results.description.optimal ? 'text-green-600' : 'text-yellow-600'}`}>
                      {results.description.length} characters
                    </span>
                  </div>

                  {results.description.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Issues:</p>
                      <ul className="space-y-1">
                        {results.description.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start">
                            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.description.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {results.description.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start">
                            <Info className="mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Keywords Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Meta Keywords</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(results.keywords.score)} ${getScoreColor(results.keywords.score)}`}>
                    {results.keywords.score}/100
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Content:</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg break-words">
                      {results.keywords.content || 'Not found'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Count:</span>
                    <span className="font-medium text-gray-800">
                      {results.keywords.count} keywords
                    </span>
                  </div>

                  {results.keywords.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Issues:</p>
                      <ul className="space-y-1">
                        {results.keywords.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start">
                            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.keywords.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {results.keywords.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start">
                            <Info className="mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Robots Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Robots Meta</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(results.robots.score)} ${getScoreColor(results.robots.score)}`}>
                    {results.robots.score}/100
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Content:</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg break-words">
                      {results.robots.content || 'Not found'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Directives:</p>
                    <div className="flex flex-wrap gap-2">
                      {results.robots.directives.length > 0 ? (
                        results.robots.directives.map((directive, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {directive}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">None specified</span>
                      )}
                    </div>
                  </div>

                  {results.robots.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Issues:</p>
                      <ul className="space-y-1">
                        {results.robots.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start">
                            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.robots.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {results.robots.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start">
                            <Info className="mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Viewport Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Viewport Meta</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(results.viewport.score)} ${getScoreColor(results.viewport.score)}`}>
                    {results.viewport.score}/100
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Content:</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg break-words">
                      {results.viewport.content || 'Not found'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${results.viewport.present ? 'text-green-600' : 'text-red-600'}`}>
                      {results.viewport.present ? 'Present' : 'Missing'}
                    </span>
                  </div>

                  {results.viewport.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Issues:</p>
                      <ul className="space-y-1">
                        {results.viewport.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start">
                            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.viewport.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {results.viewport.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start">
                            <Info className="mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Charset Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Charset Meta</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(results.charset.score)} ${getScoreColor(results.charset.score)}`}>
                    {results.charset.score}/100
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Content:</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg break-words">
                      {results.charset.content || 'Not found'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${results.charset.present ? 'text-green-600' : 'text-red-600'}`}>
                      {results.charset.present ? 'Present' : 'Missing'}
                    </span>
                  </div>

                  {results.charset.issues.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Issues:</p>
                      <ul className="space-y-1">
                        {results.charset.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-red-600 flex items-start">
                            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.charset.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {results.charset.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start">
                            <Info className="mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Recommendations */}
            {results.recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Overall Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-800">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 