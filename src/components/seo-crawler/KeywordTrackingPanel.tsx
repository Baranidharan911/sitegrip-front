'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';

interface TrackingResponse {
  success: boolean;
  data: {
    trackingId: string;
    domain: string;
    keywords: string[];
    initialRankings: any[];
    createdAt: string;
    isActive: boolean;
  };
}

export default function KeywordTrackingPanel({ url }: { url: string }) {
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [trackingResult, setTrackingResult] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addKeywordField = () => setKeywords([...keywords, '']);
  const removeKeywordField = (index: number) => {
    if (keywords.length > 1) setKeywords(keywords.filter((_, i) => i !== index));
  };
  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const startTracking = async () => {
    const validKeywords = keywords.filter(k => k.trim() !== '');
    
    if (validKeywords.length === 0) {
      setError('Please enter at least one keyword to track');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get authentication token
      if (!auth) throw new Error('Authentication not available');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required. Please log in to track keywords.');
      }

      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/keywords/track`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          keywords: validKeywords, 
          domain: new URL(url.startsWith('http') ? url : `https://${url}`).hostname 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start tracking');
      }

      const result = await response.json();
      setTrackingResult(result);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📍 Keyword Tracking</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor keyword performance over time</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">❌</span>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">🎯 Add Keywords to Track</h3>
        
        <div className="space-y-3 mb-4">
          {keywords.map((keyword, index) => (
            <div key={index} className="flex space-x-3">
              <input
                type="text"
                value={keyword}
                onChange={(e) => updateKeyword(index, e.target.value)}
                placeholder={`Keyword ${index + 1} (e.g., web development)`}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {keywords.length > 1 && (
                <button
                  onClick={() => removeKeywordField(index)}
                  className="px-3 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  ❌
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-3 mb-6">
          <button
            onClick={addKeywordField}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            ➕ Add Keyword
          </button>
          <button
            onClick={startTracking}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '🔄 Starting...' : '🚀 Start Tracking'}
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>URL to track:</strong> {url}</p>
        </div>
      </div>

      {trackingResult && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-green-500 text-xl">✅</span>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Tracking Started!</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-green-700 dark:text-green-300">
              <strong>Message:</strong> {trackingResult.data.trackingId}
            </p>
            <div className="text-green-700 dark:text-green-300">
              <strong>Keywords being tracked:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {trackingResult.data.keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Starting keyword tracking...</span>
        </div>
      )}

      {!loading && !error && !trackingResult && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📍</div>
          <p className="text-gray-600 dark:text-gray-400">Add keywords to start tracking their performance</p>
        </div>
      )}
    </div>
  );
} 
