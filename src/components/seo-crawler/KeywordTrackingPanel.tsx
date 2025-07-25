'use client';

import { useState, useEffect } from 'react';
import { getAuthInstance } from '@/lib/firebase.js';
import { Calendar, BarChart3, TrendingUp, Clock, CheckCircle, XCircle, Play, Pause, Trash2, RefreshCw } from 'lucide-react';

interface TrackingSession {
  id: string;
  domain: string;
  keywords: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: string;
  lastCheck: string | null;
  nextCheck: string | null;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
}

interface KeywordHistory {
  keyword: string;
  history: Array<{
    date: string;
    position: number | null;
    change: number;
  }>;
  averagePosition: number;
  bestPosition: number;
  worstPosition: number;
}

interface TrackingAnalytics {
  totalKeywords: number;
  totalChecks: number;
  averagePosition: number;
  bestPosition: number;
  worstPosition: number;
  top10Keywords: number;
  top20Keywords: number;
  positionDistribution: {
    top3: number;
    top10: number;
    top20: number;
    top50: number;
    beyond50: number;
  };
  keywordStats: Array<{
    keyword: string;
    averagePosition: number;
    bestPosition: number;
    worstPosition: number;
  }>;
}

export default function KeywordTrackingPanel({ url }: { url: string }) {
  const [keywords, setKeywords] = useState<string[]>(['']);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [trackingSessions, setTrackingSessions] = useState<TrackingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrackingSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<KeywordHistory[]>([]);
  const [sessionAnalytics, setSessionAnalytics] = useState<TrackingAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'history' | 'analytics'>('sessions');

  const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;

  useEffect(() => {
    loadTrackingSessions();
  }, []);

  const loadTrackingSessions = async () => {
    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) return;

      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/ranking/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTrackingSessions(result.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load tracking sessions:', err);
    }
  };

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
      const auth = getAuthInstance();
      if (!auth?.currentUser) {
        throw new Error('Authentication required. Please log in to track keywords.');
      }

      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/ranking/track-keywords`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          keywords: validKeywords, 
          domain,
          frequency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start tracking');
      }

      const result = await response.json();
      
      // Reset form
      setKeywords(['']);
      setFrequency('daily');
      
      // Reload sessions
      await loadTrackingSessions();
      
      // Show success message
      setError(null);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (session: TrackingSession) => {
    setSelectedSession(session);
    setActiveTab('history');
    
    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) return;

      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Load history
      const historyResponse = await fetch(`${apiUrl}/api/ranking/tracking/${session.id}?days=30`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (historyResponse.ok) {
        const historyResult = await historyResponse.json();
        setSessionHistory(historyResult.data?.rankingHistory || []);
      }

      // Load analytics
      const analyticsResponse = await fetch(`${apiUrl}/api/ranking/tracking/${session.id}/analytics?days=30`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        setSessionAnalytics(analyticsResult.data);
      }
    } catch (err: any) {
      console.error('Failed to load session details:', err);
    }
  };

  const toggleSessionStatus = async (session: TrackingSession) => {
    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) return;

      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/ranking/tracking/${session.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          isActive: !session.isActive 
        })
      });

      if (response.ok) {
        await loadTrackingSessions();
      }
    } catch (err: any) {
      console.error('Failed to toggle session status:', err);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this tracking session? This action cannot be undone.')) {
      return;
    }

    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) return;

      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/ranking/tracking/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadTrackingSessions();
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
          setSessionHistory([]);
          setSessionAnalytics(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to delete session:', err);
    }
  };

  const triggerManualCheck = async (sessionId: string) => {
    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) return;

      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${apiUrl}/api/ranking/tracking/${sessionId}/check-now`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadTrackingSessions();
        if (selectedSession?.id === sessionId) {
          await loadSessionDetails(selectedSession);
        }
      }
    } catch (err: any) {
      console.error('Failed to trigger manual check:', err);
    }
  };

  const getFrequencyIcon = (freq: string) => {
    switch (freq) {
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <BarChart3 className="w-4 h-4" />;
      case 'monthly': return <TrendingUp className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📍 Keyword Rank Tracking</h2>
        <p className="text-gray-600 dark:text-gray-400">Monitor keyword rankings daily with automated tracking</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">❌</span>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Create New Tracking Session */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">🎯 Create New Tracking Session</h3>
        
        <div className="space-y-4">
          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keywords to Track
            </label>
            <div className="space-y-3">
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
            <button
              onClick={addKeywordField}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              + Add another keyword
            </button>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Check Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Domain Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Domain:</strong> {domain}</p>
            <p><strong>Keywords:</strong> {keywords.filter(k => k.trim()).length} selected</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={startTracking}
            disabled={loading || keywords.filter(k => k.trim()).length === 0}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '🔄 Creating Tracking Session...' : '🚀 Start Tracking Keywords'}
          </button>
        </div>
      </div>

      {/* Tracking Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">📊 Active Tracking Sessions</h3>
        </div>

        {trackingSessions.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-6xl mb-4">📍</div>
            <p className="text-gray-600 dark:text-gray-400">No tracking sessions yet. Create one above to get started.</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {trackingSessions.map((session) => (
              <div key={session.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(session.isActive)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{session.domain}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.keywords.length} keywords • {session.frequency} checks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => triggerManualCheck(session.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Check now"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleSessionStatus(session)}
                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={session.isActive ? 'Pause tracking' : 'Resume tracking'}
                    >
                      {session.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{session.totalChecks}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Checks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{session.successfulChecks}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{session.failedChecks}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {session.lastCheck ? new Date(session.lastCheck).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Check</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {session.keywords.slice(0, 5).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                  {session.keywords.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                      +{session.keywords.length - 5} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => loadSessionDetails(session)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  View Details & History
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Details */}
      {selectedSession && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Tracking Details: {selectedSession.domain}
              </h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'history'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Analytics
              </button>
            </div>

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Keyword Ranking History</h4>
                {sessionHistory.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No ranking history available yet.</p>
                ) : (
                  <div className="space-y-4">
                    {sessionHistory.map((keywordHistory, index) => (
                      <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">{keywordHistory.keyword}</h5>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Average:</span>
                            <span className="ml-2 font-medium">{keywordHistory.averagePosition.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Best:</span>
                            <span className="ml-2 font-medium text-green-600">{keywordHistory.bestPosition}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Worst:</span>
                            <span className="ml-2 font-medium text-red-600">{keywordHistory.worstPosition}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && sessionAnalytics && (
              <div className="space-y-6">
                <h4 className="font-medium text-gray-900 dark:text-white">Tracking Analytics</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{sessionAnalytics.totalKeywords}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Keywords</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{sessionAnalytics.averagePosition.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Position</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{sessionAnalytics.top10Keywords}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Top 10</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sessionAnalytics.top20Keywords}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Top 20</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Position Distribution</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Top 3</span>
                      <span className="font-medium">{sessionAnalytics.positionDistribution.top3}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Top 10</span>
                      <span className="font-medium">{sessionAnalytics.positionDistribution.top10}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Top 20</span>
                      <span className="font-medium">{sessionAnalytics.positionDistribution.top20}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Top 50</span>
                      <span className="font-medium">{sessionAnalytics.positionDistribution.top50}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Beyond 50</span>
                      <span className="font-medium">{sessionAnalytics.positionDistribution.beyond50}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
