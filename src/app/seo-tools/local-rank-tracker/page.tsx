'use client';
import { useState } from 'react';
import {
  TrendingUp, Search, MapPin, BarChart3, ArrowUpRight, Filter, Download, Share2, Settings, Info, Star, Eye, ChevronDown, ChevronUp, Plus
} from 'lucide-react';

const mockResults = [
  { keyword: 'plumber near me', location: 'New York', rank: 2, lastChecked: '2024-06-01', trend: 1 },
  { keyword: 'emergency plumber', location: 'New York', rank: 1, lastChecked: '2024-06-01', trend: 0 },
  { keyword: 'best plumber NYC', location: 'New York', rank: 4, lastChecked: '2024-06-01', trend: -1 },
  { keyword: 'licensed plumber', location: 'New York', rank: 3, lastChecked: '2024-06-01', trend: 2 },
];

export default function LocalRankTrackerPage() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRank, setFilterRank] = useState('All');
  const [sortBy, setSortBy] = useState<'rank' | 'trend'>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredResults = [...mockResults]
    .filter(r => filterRank === 'All' || (filterRank === 'Top 3' ? r.rank <= 3 : r.rank > 3))
    .sort((a, b) => {
      if (sortDir === 'asc') return a[sortBy] - b[sortBy];
      return b[sortBy] - a[sortBy];
    });

  // Stats
  const stats = [
    {
      label: 'Tracked Keywords',
      value: mockResults.length,
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      tooltip: 'Number of keywords being tracked.'
    },
    {
      label: 'Top 3 Rankings',
      value: mockResults.filter(r => r.rank <= 3).length,
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      tooltip: 'Keywords ranking in the top 3 positions.'
    },
    {
      label: 'Avg. Rank',
      value: (mockResults.reduce((a, b) => a + b.rank, 0) / mockResults.length).toFixed(1),
      icon: BarChart3,
      color: 'from-green-500 to-emerald-500',
      tooltip: 'Average rank across all tracked keywords.'
    },
    {
      label: 'Best Performer',
      value: mockResults.reduce((a, b) => (a.rank < b.rank ? a : b)).keyword,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      tooltip: 'Keyword with the highest rank.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="w-8 h-8 text-purple-500" /> Local Rank Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Check your business ranking for any keyword and location. See how you stack up in local search results.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-600 transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-600 transition-all">
              <Plus className="w-4 h-4" /> Add Keyword
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/80 dark:bg-gray-900/80 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl flex items-center gap-4 relative group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1">
                  {stat.label}
                  <span title={stat.tooltip}>
                    <Info className="w-4 h-4 text-blue-400 ml-1 cursor-pointer group-hover:opacity-100 opacity-60" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            onClick={() => setShowFilters(f => !f)}
          >
            <Filter className="w-4 h-4" /> Filters {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showFilters && (
            <div className="flex items-center gap-4">
              <label className="text-sm text-slate-700 dark:text-slate-200">Rank:</label>
              <select
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={filterRank}
                onChange={e => setFilterRank(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Top 3">Top 3</option>
                <option value=">3">Below Top 3</option>
              </select>
              <label className="text-sm text-slate-700 dark:text-slate-200">Sort by:</label>
              <select
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                <option value="rank">Rank</option>
                <option value="trend">Trend</option>
              </select>
              <button
                className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
              >
                {sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Keyword Tracker Form */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
              placeholder="Keyword (e.g. plumber near me)"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
              placeholder="Location (e.g. New York)"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <button
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            onClick={() => setShowResults(true)}
            disabled={!keyword || !location}
          >
            Check Rank
          </button>
        </div>

        {/* Table & Insights */}
        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table */}
            <div className="lg:col-span-2 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" /> Ranking Results
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-gray-700 dark:text-gray-200 text-base">
                      <th className="py-2 px-4">Keyword</th>
                      <th className="py-2 px-4">Location</th>
                      <th className="py-2 px-4">Rank</th>
                      <th className="py-2 px-4">Trend</th>
                      <th className="py-2 px-4">Last Checked</th>
                      <th className="py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 px-4 font-medium">{row.keyword}</td>
                        <td className="py-2 px-4">{row.location}</td>
                        <td className="py-2 px-4 text-purple-600 dark:text-purple-400 font-bold">#{row.rank}</td>
                        <td className="py-2 px-4">
                          <span className={`flex items-center gap-1 text-sm font-medium
                            ${row.trend > 0 ? 'text-green-500' : row.trend < 0 ? 'text-red-500' : 'text-slate-500'}
                          `}>
                            {row.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : null}
                            {row.trend}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-gray-500 dark:text-gray-400">{row.lastChecked}</td>
                        <td className="py-2 px-4 flex gap-2">
                          <button className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-all">View</button>
                          <button className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Copy</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Insights */}
            <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-6">
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> Insights & Opportunities
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
                  <TrendingUp className="w-4 h-4" /> Top 3: <span className="font-semibold">{mockResults.filter(r => r.rank <= 3).map(r => r.keyword).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
                  <Eye className="w-4 h-4" /> Best Performer: <span className="font-semibold">{mockResults.reduce((a, b) => (a.rank < b.rank ? a : b)).keyword}</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-300">
                  <BarChart3 className="w-4 h-4" /> Trending Up: <span className="font-semibold">{mockResults.filter(r => r.trend > 0).map(r => r.keyword).join(', ') || 'None'}</span>
                </div>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-300">
                  <Info className="w-4 h-4" /> Dropping: <span className="font-semibold">{mockResults.filter(r => r.trend < 0).map(r => r.keyword).join(', ') || 'None'}</span>
                </div>
              </div>
              <div className="mt-6">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-600 transition-all">
                  <Download className="w-4 h-4" /> Export All as PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 