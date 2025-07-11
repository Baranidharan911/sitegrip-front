'use client';
import { useState } from 'react';
import { Search, MapPin, TrendingUp } from 'lucide-react';

const mockResults = [
  { keyword: 'plumber near me', location: 'New York', rank: 2, lastChecked: '2024-06-01' },
  { keyword: 'emergency plumber', location: 'New York', rank: 1, lastChecked: '2024-06-01' },
  { keyword: 'best plumber NYC', location: 'New York', rank: 4, lastChecked: '2024-06-01' },
  { keyword: 'licensed plumber', location: 'New York', rank: 3, lastChecked: '2024-06-01' },
];

export default function LocalRankTrackerPage() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-3xl mx-auto mt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <TrendingUp className="w-8 h-8 text-purple-500" /> Local Rank Tracker
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">Check your business ranking for any keyword and location. See how you stack up in local search results.</p>
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
              placeholder="Keyword (e.g. plumber near me)"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
              placeholder="Location (e.g. New York)"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <button
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            onClick={() => setShowResults(true)}
          >
            Check Rank
          </button>
        </div>
        {showResults && (
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Ranking Results</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-gray-700 dark:text-gray-200 text-base">
                    <th className="py-2 px-4">Keyword</th>
                    <th className="py-2 px-4">Location</th>
                    <th className="py-2 px-4">Rank</th>
                    <th className="py-2 px-4">Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {mockResults.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-4 font-medium">{row.keyword}</td>
                      <td className="py-2 px-4">{row.location}</td>
                      <td className="py-2 px-4 text-purple-600 dark:text-purple-400 font-bold">#{row.rank}</td>
                      <td className="py-2 px-4 text-gray-500 dark:text-gray-400">{row.lastChecked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Simple chart mockup */}
            <div className="mt-8">
              <div className="h-32 w-full bg-gradient-to-r from-purple-200/60 to-blue-200/40 dark:from-purple-900/30 dark:to-blue-900/20 rounded-xl flex items-end gap-2 p-4">
                {/* Mock bars */}
                {mockResults.map((row, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-6 rounded-t-lg bg-purple-500/80 dark:bg-purple-400/80"
                      style={{ height: `${(5 - row.rank) * 20 + 20}px` }}
                    ></div>
                    <span className="text-xs mt-2 text-gray-700 dark:text-gray-200 text-center truncate w-12">{row.keyword.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400 text-center mt-2">(Mock chart: Lower rank is better)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 