'use client';
import { useState } from 'react';
import { Search, BarChart3, Star, Image, MapPin, CheckCircle, AlertCircle, TrendingUp, Download, Share2, Settings, Eye, Clock, Users, Zap, Target, ArrowUpRight, Info, Filter, MoreVertical, ExternalLink, RefreshCw, Map, Globe, Smartphone, Monitor } from 'lucide-react';

const mockMapListings = [
  { platform: 'Google Maps', status: 'Active', napConsistency: 95, reviews: 127, photos: 23, lastUpdated: '2 hours ago', priority: 'Critical' },
  { platform: 'Apple Maps', status: 'Error', napConsistency: 0, reviews: 0, photos: 0, lastUpdated: '5 hours ago', priority: 'High' },
  { platform: 'Bing Maps', status: 'Active', napConsistency: 90, reviews: 45, photos: 12, lastUpdated: '1 day ago', priority: 'Medium' },
  { platform: 'Waze', status: 'Active', napConsistency: 85, reviews: 23, photos: 8, lastUpdated: '3 days ago', priority: 'Medium' },
  { platform: 'Here Maps', status: 'Missing', napConsistency: 0, reviews: 0, photos: 0, lastUpdated: 'Never', priority: 'Low' },
  { platform: 'OpenStreetMap', status: 'Active', napConsistency: 80, reviews: 0, photos: 0, lastUpdated: '1 week ago', priority: 'Low' },
];

const mockStats = [
  { title: 'Map Presence', value: '4/6', change: '+1', icon: Map, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { title: 'NAP Consistency', value: '87%', change: '+5%', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { title: 'Total Reviews', value: '195', change: '+12', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { title: 'Total Photos', value: '43', change: '+8', icon: Image, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
];

const mockOpportunities = [
  { title: 'Apple Maps Error Needs Fixing', impact: 'Critical', description: 'Your listing on Apple Maps has an error that\'s preventing customers from finding you' },
  { title: 'Missing on Here Maps', impact: 'Medium', description: 'Adding your business to Here Maps could increase visibility in certain regions' },
  { title: 'Low Photo Count on Bing Maps', impact: 'Low', description: 'Adding more photos to Bing Maps could improve engagement' },
];

const mockInsights = [
  { title: 'Strong Google Maps Presence', impact: 'Positive', description: 'Your Google Maps listing is performing well with high engagement and consistent NAP information' },
  { title: 'Good Review Distribution', impact: 'Positive', description: 'Reviews are well distributed across multiple platforms, building trust with potential customers' },
];

export default function MapsAuditPage() {
  const [input, setInput] = useState('');
  const [showAudit, setShowAudit] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredListings = mockMapListings.filter(listing => {
    const matchesSearch = listing.platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <Map className="w-8 h-8 text-purple-500" />
            Google Maps Audit
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Comprehensive audit of your business presence across all major mapping platforms
          </p>
        </div>

        {/* Search Input */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Information</h2>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
                placeholder="Enter business name or address"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
            </div>
            <button
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
              onClick={() => setShowAudit(true)}
            >
              <Zap className="w-5 h-5" />
              Run Audit
            </button>
          </div>
        </div>

        {showAudit && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {mockStats.map((stat, index) => (
                <div key={index} className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                      {stat.change}
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex gap-6 mb-6">
                {['overview', 'listings', 'insights', 'opportunities'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedTab === tab
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Map Presence Summary */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-500" />
                        Map Platform Presence
                      </h3>
                      <div className="space-y-4">
                        {['Active', 'Error', 'Missing'].map((status) => {
                          const count = mockMapListings.filter(listing => listing.status === status).length;
                          const listings = mockMapListings.filter(listing => listing.status === status);
                          const statusColor = status === 'Active' ? 'green' : status === 'Error' ? 'red' : 'gray';
                          return (
                            <div key={status} className="bg-gradient-to-r from-purple-50/60 to-blue-50/40 dark:from-purple-900/20 dark:to-blue-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  {status === 'Active' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : status === 'Error' ? (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                  )}
                                  <span className="font-semibold text-gray-900 dark:text-white">{status}</span>
                                </div>
                                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{count}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {listings.slice(0, 3).map((listing, i) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200">
                                    {listing.platform}
                                  </span>
                                ))}
                                {listings.length > 3 && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    +{listings.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        NAP Consistency Score
                      </h3>
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 p-6 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl font-bold">87%</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">Average NAP Consistency</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Name • Address • Phone</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'listings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Map Platform Listings</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search platforms..."
                          className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Error">Error</option>
                        <option value="Missing">Missing</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Platform</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NAP Consistency</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reviews</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Photos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredListings.map((listing, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {listing.status === 'Active' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : listing.status === 'Error' ? (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                  ) : (
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                  )}
                                  <span className="ml-3 font-medium text-gray-900 dark:text-white">{listing.platform}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  listing.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' :
                                  listing.status === 'Error' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {listing.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white mr-2">{listing.napConsistency}%</span>
                                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        listing.napConsistency >= 90 ? 'bg-green-500' :
                                        listing.napConsistency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${listing.napConsistency}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {listing.reviews}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {listing.photos}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {listing.lastUpdated}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {listing.status === 'Error' && (
                                    <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium">
                                      Fix Error
                                    </button>
                                  )}
                                  {listing.status === 'Missing' && (
                                    <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
                                      Add Listing
                                    </button>
                                  )}
                                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'insights' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockInsights.map((insight, index) => (
                      <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-xl border border-green-200 dark:border-green-900/30 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'opportunities' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Improvement Opportunities</h3>
                  <div className="space-y-4">
                    {mockOpportunities.map((opp, index) => (
                      <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/10 rounded-xl border border-orange-200 dark:border-orange-900/30 p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{opp.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            opp.impact === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' :
                            opp.impact === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200'
                          }`}>
                            {opp.impact} Priority
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{opp.description}</p>
                        <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300">
                          Take Action →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 transition-all">
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    <RefreshCw className="w-4 h-4" />
                    Refresh All
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  Last updated: 3 hours ago
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 