'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceTrendPoint {
  date: any;
  density: number;
  crawl_id: string;
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/keywords/performance/${encodeURIComponent(url)}?keywords=${encodeURIComponent(keyword)}`);
        if (!res.ok) throw new Error('Failed to fetch keyword performance trends');
        const result = await res.json();
        
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
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">📊 Keyword Density Trends for "{keyword}"</h2>
      {loading && <p className="text-sm text-gray-500">Loading performance data...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="text-sm text-gray-500">No performance trend data available for this keyword.</p>
      )}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value.seconds * 1000).toLocaleDateString()}
            />
            <YAxis 
              label={{ value: 'Density %', angle: -90, position: 'insideLeft' }}
              domain={[0, 'dataMax']}
            />
            <Tooltip 
              labelFormatter={(value) => new Date(value.seconds * 1000).toLocaleDateString()}
              formatter={(value) => [`${value}%`, 'Keyword Density']}
            />
            <Line type="monotone" dataKey="density" stroke="#3182ce" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
