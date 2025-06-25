'use client';

import { useEffect, useState } from 'react';

interface KeywordRow {
  keyword: string;
  frequency: number;
  density: number;
  inTitle: boolean;
  inDescription: boolean;
  isMissing: boolean;
}

export default function KeywordTable({ url }: { url: string }) {
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await fetch(`https://webwatch-api-pu22v4ao5a-uc.a.run.app/api/keywords/performance/${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error('Failed to fetch keyword data');
        const result = await res.json();
        setKeywords(result.keywords || []);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchKeywords();
  }, [url]);

  if (error) return <p className="text-red-500 text-sm mt-2">{error}</p>;
  if (!keywords.length) return <p className="text-sm text-gray-500 mt-2">No keyword data found.</p>;

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md mt-6 overflow-x-auto">
      <h2 className="text-2xl font-bold p-6 text-gray-800 dark:text-white">🔑 Keyword Performance</h2>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Keyword</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Frequency</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Density</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Meta</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Missing</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {keywords.map((kw) => (
            <tr key={kw.keyword} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{kw.keyword}</td>
              <td className="px-6 py-4 text-sm">{kw.frequency}</td>
              <td className="px-6 py-4 text-sm">{kw.density.toFixed(2)}%</td>
              <td className="px-6 py-4 text-center">{kw.inTitle ? '✅' : '❌'}</td>
              <td className="px-6 py-4 text-center">{kw.inDescription ? '✅' : '❌'}</td>
              <td className="px-6 py-4 text-center">{kw.isMissing ? '❌' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
