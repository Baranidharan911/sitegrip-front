'use client';
import { useState } from 'react';
import { Radar, BarChart3, Star, TrendingUp, Link } from 'lucide-react';

const mockCompetitors = [
  { name: 'yourbusiness.com', domainAuthority: 72, reviews: 120, avgRating: 4.7, ranking: 1 },
  { name: 'competitor1.com', domainAuthority: 68, reviews: 98, avgRating: 4.5, ranking: 2 },
  { name: 'competitor2.com', domainAuthority: 60, reviews: 80, avgRating: 4.2, ranking: 3 },
  { name: 'competitor3.com', domainAuthority: 55, reviews: 60, avgRating: 4.0, ranking: 4 },
];

export default function CompetitorAnalysisPage() {
  const [urls, setUrls] = useState('');
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-3xl mx-auto mt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Radar className="w-8 h-8 text-purple-500" /> Competitor Analysis
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">Compare your business with top competitors. Analyze domain authority, reviews, and rankings.</p>
        <div className="flex gap-4 mb-8 justify-center">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
            placeholder="Enter competitor URLs (comma separated)"
            value={urls}
            onChange={e => setUrls(e.target.value)}
          />
          <button
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            onClick={() => setShowTable(true)}
          >
            Analyze
          </button>
        </div>
        {showTable && (
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Comparison Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-gray-700 dark:text-gray-200 text-base">
                    <th className="py-2 px-4"><Link className="inline w-4 h-4 mr-1" />Domain</th>
                    <th className="py-2 px-4"><BarChart3 className="inline w-4 h-4 mr-1" />Domain Authority</th>
                    <th className="py-2 px-4"><Star className="inline w-4 h-4 mr-1" />Reviews</th>
                    <th className="py-2 px-4"><Star className="inline w-4 h-4 mr-1" />Avg. Rating</th>
                    <th className="py-2 px-4"><TrendingUp className="inline w-4 h-4 mr-1" />Ranking</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCompetitors.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-100 dark:border-gray-800 ${i === 0 ? 'bg-purple-50/40 dark:bg-purple-900/10' : ''}`}>
                      <td className="py-2 px-4 font-medium">{row.name}</td>
                      <td className="py-2 px-4">{row.domainAuthority}</td>
                      <td className="py-2 px-4">{row.reviews}</td>
                      <td className="py-2 px-4">{row.avgRating.toFixed(1)}</td>
                      <td className="py-2 px-4 text-purple-600 dark:text-purple-400 font-bold">#{row.ranking}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 