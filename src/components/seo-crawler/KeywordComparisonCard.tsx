'use client';

import { useEffect, useState } from 'react';
import { getAuthInstance } from '@/lib/firebase.js';

interface ComparisonResult {
  success: boolean;
  comparison: {
    current_keyword: {
      keyword: string;
      search_volume: number;
      difficulty: number;
      cpc: number;
      competition: string;
    };
    proposed_keyword: {
      keyword: string;
      search_volume: number;
      difficulty: number;
      cpc: number;
      competition: string;
    };
    analysis: {
      volume_difference: number;
      difficulty_difference: number;
      cpc_difference: number;
      recommendation: string;
    };
  };
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
        // Get authentication token
        const auth = getAuthInstance();
        if (!auth) throw new Error('Authentication not available');
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Authentication required. Please log in to compare keywords.');
        }

        const token = await user.getIdToken();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        const res = await fetch(`${apiUrl}/api/keywords/compare-keywords`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ current_keyword: current, proposed_keyword: proposed })
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Comparison failed');
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
          <p className="text-sm text-gray-500 mb-2">Comparing <b>{result.comparison.current_keyword.keyword}</b> vs <b>{result.comparison.proposed_keyword.keyword}</b></p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>📈 Volume Score: <b>{result.comparison.current_keyword.search_volume}/100</b></div>
            <div>💪 Difficulty Score: <b>{result.comparison.current_keyword.difficulty}/100</b></div>
            <div>🔗 Relevance: <b>{result.comparison.current_keyword.cpc}/100</b></div>
            <div>🚀 Traffic Boost: +<b>{result.comparison.analysis.volume_difference}%</b></div>
          </div>
          <div className="mt-4 font-semibold">
            Final Verdict: <span className="text-green-600">{result.comparison.analysis.recommendation.toUpperCase()}</span>
          </div>
        </>
      )}
    </div>
  );
}
