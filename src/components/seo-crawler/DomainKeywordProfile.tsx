'use client';

import { useEffect, useState } from 'react';

interface DomainSummary {
  domain: string;
  total_pages_analyzed: number;
  total_unique_primary_keywords: number;
  total_unique_suggested_keywords: number;
  total_missing_keywords: number;
  top_primary_keywords: string[];
  top_suggested_keywords: string[];
  critical_missing_keywords: string[];
  average_keyword_density: { [key: string]: number };
  analysis_period: string;
  last_updated: any;
}

export default function DomainKeywordProfile({ domain }: { domain: string }) {
  const [data, setData] = useState<DomainSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!domain) return;
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';
        const response = await fetch(`${apiUrl}/api/keywords/domain-summary/${encodeURIComponent(domain)}`);
        if (!response.ok) throw new Error('Failed to fetch domain summary');
        const result = await response.json();
        
        if (result.success && result.domain_summary) {
          setData(result.domain_summary);
        } else if (result.domain_summary?.message) {
          setError(result.domain_summary.message);
        } else if (result.domain_summary?.error) {
          setError(result.domain_summary.error);
        } else {
          setError('No data available for this domain');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [domain]);

  if (!domain) return <p className="text-sm text-gray-500">No domain provided.</p>;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 mt-6 rounded shadow border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🌐 Domain Keyword Profile</h2>
        <p className="text-sm text-gray-500">Loading domain summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 mt-6 rounded shadow border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🌐 Domain Keyword Profile</h2>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 mt-6 rounded shadow border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🌐 Domain Keyword Profile</h2>
        <p className="text-sm text-gray-500">No keyword data found for this domain.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 mt-6 rounded shadow border dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🌐 Domain Keyword Profile</h2>
      <p className="text-sm text-gray-500 mb-4">
        Domain: <b>{data.domain}</b> | Analysis Period: {data.analysis_period}
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
          <div className="font-semibold text-blue-800 dark:text-blue-200">Pages Analyzed</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{data.total_pages_analyzed}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-3 rounded">
          <div className="font-semibold text-green-800 dark:text-green-200">Primary Keywords</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-300">{data.total_unique_primary_keywords}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded">
          <div className="font-semibold text-purple-800 dark:text-purple-200">Suggested Keywords</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{data.total_unique_suggested_keywords}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900 p-3 rounded">
          <div className="font-semibold text-red-800 dark:text-red-200">Missing Keywords</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-300">{data.total_missing_keywords}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">🔥 Top Primary Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {data.top_primary_keywords.map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 Top Suggested Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {data.top_suggested_keywords.map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">🚫 Critical Missing Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {data.critical_missing_keywords.map((kw, i) => (
              <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm">
                {kw}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Top Keyword Densities</h3>
          <div className="space-y-1">
            {Object.entries(data.average_keyword_density).slice(0, 8).map(([keyword, density]) => (
              <div key={keyword} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                <span className="truncate">{keyword}</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{density}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {new Date(data.last_updated.seconds * 1000).toLocaleString()}
      </div>
    </div>
  );
}
