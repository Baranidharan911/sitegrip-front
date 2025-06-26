'use client';

import { useState } from 'react';

interface KeywordVolume {
  keyword: string;
  monthly_volume: number;
  volume_trend: string;
  competition_score: number;
  difficulty_score: number;
  related_keywords: string[];
  seasonal_data: Record<string, number>;
}

export default function KeywordVolumePanel() {
  const [keyword, setKeyword] = useState('');
  const [volumeData, setVolumeData] = useState<KeywordVolume | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeVolume = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/keywords/volume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword: keyword.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get volume data');
      }

      const result = await response.json();
      setVolumeData(result);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '🔄';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'growing': return 'text-green-600 dark:text-green-400';
      case 'declining': return 'text-red-600 dark:text-red-400';
      case 'stable': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getCompetitionLevel = (score: number) => {
    if (score <= 0.3) return { level: 'Low', color: 'text-green-600 dark:text-green-400' };
    if (score <= 0.7) return { level: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'High', color: 'text-red-600 dark:text-red-400' };
  };

  const getDifficultyLevel = (score: number) => {
    if (score <= 30) return { level: 'Easy', color: 'text-green-600 dark:text-green-400' };
    if (score <= 70) return { level: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
    return { level: 'Hard', color: 'text-red-600 dark:text-red-400' };
  };

  const renderSeasonalChart = (seasonalData: Record<string, number>) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxVolume = Math.max(...Object.values(seasonalData));

    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">📅 Seasonal Trends</h4>
        <div className="grid grid-cols-12 gap-2">
          {months.map((month, index) => {
            const monthKey = `month_${index + 1}`;
            const volume = seasonalData[monthKey] || 0;
            const heightPercentage = (volume / maxVolume) * 100;
            
            return (
              <div key={month} className="flex flex-col items-center space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-sm h-20 flex items-end">
                  <div 
                    className="w-full bg-blue-500 rounded-sm transition-all duration-300"
                    style={{ height: `${heightPercentage}%` }}
                    title={`${month}: ${volume.toLocaleString()}`}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{month}</span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-500">
                  {(volume / 1000).toFixed(1)}k
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📈 Keyword Volume Analysis</h2>
        <p className="text-gray-600 dark:text-gray-400">Analyze search volume and competition for keywords</p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword to analyze (e.g., web development)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && analyzeVolume()}
            />
          </div>
          <button
            onClick={analyzeVolume}
            disabled={loading || !keyword.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? '🔄 Analyzing...' : '📊 Analyze'}
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing keyword volume...</span>
        </div>
      )}

      {/* Volume Data */}
      {volumeData && !loading && (
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📈 Volume Analysis for "{volumeData.keyword}"
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Volume</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {volumeData.monthly_volume.toLocaleString()}
                </div>
                <div className={`text-sm flex items-center mt-1 ${getTrendColor(volumeData.volume_trend)}`}>
                  {getTrendIcon(volumeData.volume_trend)}
                  <span className="ml-1 capitalize">{volumeData.volume_trend}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Competition</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {(volumeData.competition_score * 100).toFixed(0)}%
                </div>
                <div className={`text-sm mt-1 ${getCompetitionLevel(volumeData.competition_score).color}`}>
                  {getCompetitionLevel(volumeData.competition_score).level}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">SEO Difficulty</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {volumeData.difficulty_score}/100
                </div>
                <div className={`text-sm mt-1 ${getDifficultyLevel(volumeData.difficulty_score).color}`}>
                  {getDifficultyLevel(volumeData.difficulty_score).level}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Related Keywords</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {volumeData.related_keywords.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Suggestions
                </div>
              </div>
            </div>
          </div>

          {/* Seasonal Data */}
          {volumeData.seasonal_data && Object.keys(volumeData.seasonal_data).length > 0 && (
            <div>
              {renderSeasonalChart(volumeData.seasonal_data)}
            </div>
          )}

          {/* Related Keywords */}
          {volumeData.related_keywords && volumeData.related_keywords.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">🔍 Related Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {volumeData.related_keywords.map((relatedKeyword, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setKeyword(relatedKeyword);
                      analyzeVolume();
                    }}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm"
                  >
                    {relatedKeyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">💡 Key Insights</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="text-blue-500">📊</span>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Search Volume:</strong> {volumeData.monthly_volume.toLocaleString()} monthly searches 
                    indicates {volumeData.monthly_volume > 10000 ? 'high' : volumeData.monthly_volume > 1000 ? 'medium' : 'low'} demand
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-green-500">🎯</span>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Competition Level:</strong> {getCompetitionLevel(volumeData.competition_score).level.toLowerCase()} competition 
                    makes this keyword {volumeData.competition_score <= 0.5 ? 'easier to rank for' : 'more challenging to rank for'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-purple-500">🚀</span>
                <div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>SEO Difficulty:</strong> {getDifficultyLevel(volumeData.difficulty_score).level} difficulty suggests 
                    {volumeData.difficulty_score <= 50 ? ' this keyword has good ranking potential' : ' significant effort will be needed to rank'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !volumeData && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📈</div>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a keyword to analyze its search volume and competition
          </p>
        </div>
      )}
    </div>
  );
} 