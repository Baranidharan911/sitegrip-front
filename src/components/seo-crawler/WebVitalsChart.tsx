import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WebVitalsChartProps {
  pages: Array<{
    url: string;
    lcp: number;
    cls: number;
    ttfb: number;
  }>;
}

function truncateUrl(url: string, maxLength = 30) {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength - 3) + '...';
}

const WebVitalsChart: React.FC<WebVitalsChartProps> = ({ pages }) => {
  const data = pages.map(page => ({
    url: page.url,
    LCP: page.lcp ?? 0,
    CLS: page.cls ?? 0,
    TTFB: page.ttfb ?? 0,
  }));

  const hasRealData = data.some(d => d.LCP > 0 || d.CLS > 0 || d.TTFB > 0);

  if (!hasRealData) {
    return (
      <div className="my-8 text-center text-gray-500 dark:text-gray-400">
        <h3 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-300">Web Vitals Overview</h3>
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 inline-block">
          No web vitals data available yet. Run more crawls or check your backend extraction logic.
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h3 className="text-lg font-bold mb-4 text-blue-700 dark:text-blue-300">Web Vitals Overview</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
          <XAxis dataKey="url" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} height={60} tickFormatter={truncateUrl} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="LCP" fill="#3b82f6" name="LCP (s)" />
          <Bar dataKey="CLS" fill="#f59e42" name="CLS" />
          <Bar dataKey="TTFB" fill="#10b981" name="TTFB (s)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WebVitalsChart; 