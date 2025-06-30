'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PerformanceTrendPoint {
  date: string;
  position: number;
  search_volume: number;
  ctr: number;
  impressions: number;
  clicks: number;
  keyword_density: number;
}

export default function KeywordPerformanceChart({ keyword, url }: { keyword: string; url?: string }) {
  const [data, setData] = useState<PerformanceTrendPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!keyword || !url) {
        setError('Both keyword and URL are required for performance tracking.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app';
        const encodedUrl = encodeURIComponent(url);
        const keywords = encodeURIComponent(keyword);
        const response = await fetch(`${apiUrl}/api/keywords/performance/${encodedUrl}?keywords=${keywords}&days=90`);
        if (!response.ok) throw new Error('Failed to fetch keyword performance trends');
        const result = await response.json();
        
        if (result.success && result.performance_trends && result.performance_trends[keyword]) {
          setData(result.performance_trends[keyword]);
        } else {
          setData([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [keyword, url]);

  if (!keyword) return <p className="text-sm text-gray-500">No keyword selected.</p>;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 mt-6 rounded shadow border dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📊 Keyword Performance Trends for "{keyword}"</h2>
      {loading && <p className="text-sm text-gray-500">Loading performance data...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="text-sm text-gray-500">No performance trend data available for this keyword.</p>
      )}
      {data.length > 0 && (
        <div className="space-y-6">
          {/* Position Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Search Position</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  label={{ value: 'Position', angle: -90, position: 'insideLeft' }}
                  domain={[0, 'dataMax']}
                  reversed={true}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`Position ${value}`, 'Search Position']}
                />
                <Line type="monotone" dataKey="position" stroke="#3182ce" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Search Volume Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Search Volume</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  label={{ value: 'Volume', angle: -90, position: 'insideLeft' }}
                  domain={[0, 'dataMax']}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`${value} searches`, 'Search Volume']}
                />
                <Line type="monotone" dataKey="search_volume" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Keyword Density Chart */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Keyword Density</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis 
                  label={{ value: 'Density %', angle: -90, position: 'insideLeft' }}
                  domain={[0, 'dataMax']}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value) => [`${value}%`, 'Keyword Density']}
                />
                <Line type="monotone" dataKey="keyword_density" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.length > 0 ? Math.min(...data.map(d => d.position)) : '-'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Best Position</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.search_volume, 0) / data.length) : '-'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Search Volume</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.keyword_density, 0) / data.length * 100) / 100 : '-'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Density</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.ctr, 0) / data.length * 100) / 100 : '-'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg CTR</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
