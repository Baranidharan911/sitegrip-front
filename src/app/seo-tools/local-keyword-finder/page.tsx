'use client';
import { useState } from 'react';
import {
  KeySquare, Search, TrendingUp, BarChart3, ArrowUpRight, Filter, Download, Info, Star, Zap, Eye, Share2, Settings, ChevronDown, ChevronUp
} from 'lucide-react';

const mockKeywords = [
  { keyword: 'plumber near me', volume: 1900, difficulty: 32, trend: 8, cpc: 3.2, competition: 'Medium' },
  { keyword: 'emergency plumber', volume: 880, difficulty: 28, trend: 12, cpc: 4.1, competition: 'Low' },
  { keyword: 'best plumber NYC', volume: 590, difficulty: 35, trend: -3, cpc: 5.0, competition: 'High' },
  { keyword: 'licensed plumber', volume: 320, difficulty: 22, trend: 5, cpc: 2.8, competition: 'Low' },
  { keyword: 'affordable plumber', volume: 210, difficulty: 18, trend: 15, cpc: 2.1, competition: 'Low' },
  { keyword: '24 hour plumber', volume: 170, difficulty: 27, trend: 7, cpc: 3.7, competition: 'Medium' },
];

const stats = [
  {
    label: 'Total Keywords',
    value: mockKeywords.length,
    icon: KeySquare,
    color: 'from-blue-500 to-cyan-500',
    tooltip: 'Number of keyword suggestions found.'
  },
  {
    label: 'Avg. Difficulty',
    value: Math.round(mockKeywords.reduce((a, b) => a + b.difficulty, 0) / mockKeywords.length),
    icon: BarChart3,
    color: 'from-yellow-500 to-orange-500',
    tooltip: 'Average keyword difficulty (lower is easier).'
  },
  {
    label: 'Total Volume',
    value: mockKeywords.reduce((a, b) => a + b.volume, 0).toLocaleString(),
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    tooltip: 'Sum of monthly search volume for all keywords.'
  },
  {
    label: 'Top Opportunity',
    value: mockKeywords.reduce((a, b) => (a.trend > b.trend ? a : b)).keyword,
    icon: Star,
    color: 'from-purple-500 to-pink-500',
    tooltip: 'Keyword with the highest positive trend.'
  }
];

const chartData = [
  { name: 'plumber near me', volume: 1900, difficulty: 32 },
  { name: 'emergency plumber', volume: 880, difficulty: 28 },
  { name: 'best plumber NYC', volume: 590, difficulty: 35 },
  { name: 'licensed plumber', volume: 320, difficulty: 22 },
  { name: 'affordable plumber', volume: 210, difficulty: 18 },
  { name: '24 hour plumber', volume: 170, difficulty: 27 },
];

export default function LocalKeywordFinderPage() {
  const [seed, setSeed] = useState('');
  const [location, setLocation] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'volume' | 'difficulty' | 'trend'>('volume');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterComp, setFilterComp] = useState('All');

  const sortedKeywords = [...mockKeywords]
    .filter(k => filterComp === 'All' || k.competition === filterComp)
    .sort((a, b) => {
      if (sortDir === 'asc') return a[sortBy] - b[sortBy];
      return b[sortBy] - a[sortBy];
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <KeySquare className="w-8 h-8 text-purple-500" /> Local Keyword Finder
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Discover high-potential local keywords for your business. Enter a seed keyword and location to get started.</p>
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

        {/* Chart (mocked) */}
        <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Keyword Volume & Difficulty Trend
          </h2>
          <div className="w-full h-48 flex items-center justify-center">
            {/* Mocked chart: Replace with real chart library for production */}
            <svg width="100%" height="100%" viewBox="0 0 400 120">
              {/* Volume bars */}
              {chartData.map((d, i) => (
                <rect
                  key={d.name}
                  x={30 + i * 55}
                  y={120 - d.volume / 25}
                  width={20}
                  height={d.volume / 25}
                  fill="#3B82F6"
                  opacity="0.7"
                />
              ))}
              {/* Difficulty line */}
              <polyline
                fill="none"
                stroke="#F59E42"
                strokeWidth="3"
                points={chartData.map((d, i) => `${40 + i * 55},${120 - d.difficulty * 3}`).join(' ')}
              />
              {/* X labels */}
              {chartData.map((d, i) => (
                <text
                  key={d.name + '-label'}
                  x={40 + i * 55}
                  y={115}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#64748B"
                >
                  {d.name.split(' ')[0]}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Keyword Finder Form */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
              placeholder="Seed keyword (e.g. plumber)"
              value={seed}
              onChange={e => setSeed(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            disabled={!seed || !location}
          >
            Find Keywords
          </button>
        </div>

        {/* Filters */}
        {showResults && (
          <div className="mb-4 flex items-center gap-4">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              onClick={() => setShowFilters(f => !f)}
            >
              <Filter className="w-4 h-4" /> Filters {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showFilters && (
              <div className="flex items-center gap-4">
                <label className="text-sm text-slate-700 dark:text-slate-200">Competition:</label>
                <select
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={filterComp}
                  onChange={e => setFilterComp(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <label className="text-sm text-slate-700 dark:text-slate-200">Sort by:</label>
                <select
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                >
                  <option value="volume">Volume</option>
                  <option value="difficulty">Difficulty</option>
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
        )}

        {/* Keyword Table & Insights */}
        {showResults && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Table */}
            <div className="lg:col-span-2 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" /> Keyword Suggestions
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-gray-700 dark:text-gray-200 text-base">
                      <th className="py-2 px-4 cursor-pointer" onClick={() => { setSortBy('volume'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>Volume</th>
                      <th className="py-2 px-4 cursor-pointer" onClick={() => { setSortBy('difficulty'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>Difficulty</th>
                      <th className="py-2 px-4">Trend</th>
                      <th className="py-2 px-4">CPC ($)</th>
                      <th className="py-2 px-4">Competition</th>
                      <th className="py-2 px-4">Keyword</th>
                      <th className="py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedKeywords.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 px-4 font-medium">{row.volume.toLocaleString()}</td>
                        <td className="py-2 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold
                            ${row.difficulty < 25 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' : ''}
                            ${row.difficulty >= 25 && row.difficulty < 35 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200' : ''}
                            ${row.difficulty >= 35 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' : ''}
                          `}>{row.difficulty}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`flex items-center gap-1 text-sm font-medium
                            ${row.trend > 0 ? 'text-green-500' : row.trend < 0 ? 'text-red-500' : 'text-slate-500'}
                          `}>
                            {row.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : null}
                            {row.trend}
                          </span>
                        </td>
                        <td className="py-2 px-4">${row.cpc.toFixed(2)}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${row.competition === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' : ''}
                            ${row.competition === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200' : ''}
                            ${row.competition === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' : ''}
                          `}>{row.competition}</span>
                        </td>
                        <td className="py-2 px-4">{row.keyword}</td>
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
                <Zap className="w-5 h-5 text-yellow-500" /> Insights & Opportunities
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
                  <Star className="w-4 h-4" /> Top Opportunity: <span className="font-semibold">{mockKeywords.reduce((a, b) => (a.trend > b.trend ? a : b)).keyword}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
                  <Eye className="w-4 h-4" /> Low Competition: <span className="font-semibold">{mockKeywords.filter(k => k.competition === 'Low').map(k => k.keyword).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-300">
                  <TrendingUp className="w-4 h-4" /> Trending Up: <span className="font-semibold">{mockKeywords.filter(k => k.trend > 5).map(k => k.keyword).join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-300">
                  <Info className="w-4 h-4" /> Warnings: <span className="font-semibold">{mockKeywords.filter(k => k.difficulty > 30).map(k => k.keyword).join(', ') || 'None'}</span>
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