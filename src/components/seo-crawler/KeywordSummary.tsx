'use client';

import { useEffect, useState } from 'react';

interface DomainSummary {
  domain?: string;
  total_pages_analyzed?: number;
  total_unique_primary_keywords?: number;
  total_unique_suggested_keywords?: number;
  total_missing_keywords?: number;
  top_primary_keywords?: string[];
  top_suggested_keywords?: string[];
  critical_missing_keywords?: string[];
  average_keyword_density?: Record<string, number>;
  analysis_period?: string;
  last_updated?: string;
}

export default function KeywordSummary({ domain }: { domain: string }) {
  const [data, setData] = useState<DomainSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/keywords/domain-summary/${domain}`);
        if (!res.ok) throw new Error('Failed to load keyword summary');
        const result = await res.json();
        setData(result.domain_summary || {});
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
          <p className="text-sm text-gray-700 dark:text-gray-300">Total Pages Analyzed</p>
          <p className="text-3xl font-bold">{data.total_pages_analyzed ?? 0}</p>
        </div>
        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <p className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">Top Primary Keywords</p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
            {(data.top_primary_keywords || []).map((kw, idx) => <li key={idx}>{kw}</li>)}
          </ul>
        </div>
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <p className="text-sm font-semibold mb-1 text-gray-800 dark:text-white">Critical Missing Keywords</p>
          <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
            {(data.critical_missing_keywords || []).map((kw, idx) => <li key={idx}>{kw}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
