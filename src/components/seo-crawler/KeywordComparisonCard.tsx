'use client';

import { useEffect, useState } from 'react';

interface ComparisonResult {
  current_keyword: string;
  proposed_keyword: string;
  overall_score: number;
  recommendation: string;
  volume_score: number;
  difficulty_score: number;
  content_relevance: number;
  estimated_traffic_change: number;
}

export default function KeywordComparisonCard({ current, proposed }: { current: string; proposed: string }) {
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const compare = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';
        const res = await fetch(`${apiUrl}/api/keywords/compare-keywords`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_keyword: current, proposed_keyword: proposed })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Comparison failed');
        }
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (current && proposed) compare();
  }, [current, proposed]);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 mt-6 rounded shadow border dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">⚖️ Keyword Comparison</h2>
      {loading && <p className="text-sm text-gray-500">Loading comparison...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {result && (
        <>
          <p className="text-sm text-gray-500 mb-2">Comparing <b>{result.current_keyword}</b> vs <b>{result.proposed_keyword}</b></p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>📈 Volume Score: <b>{result.volume_score}/100</b></div>
            <div>💪 Difficulty Score: <b>{result.difficulty_score}/100</b></div>
            <div>🔗 Relevance: <b>{result.content_relevance}/100</b></div>
            <div>🚀 Traffic Boost: +<b>{result.estimated_traffic_change}%</b></div>
          </div>
          <div className="mt-4 font-semibold">
            Final Verdict: <span className="text-green-600">{result.recommendation.toUpperCase()}</span> (Score {result.overall_score}/100)
          </div>
        </>
      )}
    </div>
  );
}
