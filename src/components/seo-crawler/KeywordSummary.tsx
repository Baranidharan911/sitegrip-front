'use client';

import { useEffect, useState } from 'react';

interface KeywordSummaryData {
  totalKeywords: number;
  topKeywords: string[];
  trending: string[];
  gaps: string[];
}

export default function KeywordSummary({ domain }: { domain: string }) {
  const [data, setData] = useState<KeywordSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await fetch(`https://webwatch-api-pu22v4ao5a-uc.a.run.app/api/keywords/domain-summary/${domain}`);
        if (!res.ok) throw new Error('Failed to load keyword summary');
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadSummary();
  }, [domain]);

  if (error) return <p className="text-red-500 text-sm mt-2">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500 mt-2">Loading keyword summary...</p>;

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">🧠 Keyword Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">Total Keywords</p>
          <p className="text-3xl font-bold">{data.totalKeywords}</p>
        </div>
        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <p className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">Top Keywords</p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
            {data.topKeywords.map((kw, idx) => <li key={idx}>{kw}</li>)}
          </ul>
        </div>
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <p className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">Trending</p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
            {data.trending.map((kw, idx) => <li key={idx}>{kw}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
