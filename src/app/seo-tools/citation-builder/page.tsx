'use client';
import { useState } from 'react';
import { Link, FileText, CheckCircle, AlertCircle, Loader2, TrendingUp, Download, Share2, Settings, Eye, Clock, Users, Zap, Target, ArrowUpRight, Info, Filter, Search, MoreVertical, ExternalLink, RefreshCw, BarChart3 } from 'lucide-react';

type Status = 'Ready to Submit' | 'Submitted' | 'Error';

const mockSites: { name: string; status: Status; priority: string; category: string; lastChecked: string }[] = [
  { name: 'Yelp', status: 'Ready to Submit', priority: 'High', category: 'Review Sites', lastChecked: '2 hours ago' },
  { name: 'Yellow Pages', status: 'Submitted', priority: 'High', category: 'Directory', lastChecked: '1 day ago' },
  { name: 'Bing Places', status: 'Ready to Submit', priority: 'Medium', category: 'Search Engine', lastChecked: '3 hours ago' },
  { name: 'Apple Maps', status: 'Error', priority: 'High', category: 'Maps', lastChecked: '5 hours ago' },
  { name: 'Foursquare', status: 'Submitted', priority: 'Medium', category: 'Social', lastChecked: '2 days ago' },
  { name: 'Facebook', status: 'Ready to Submit', priority: 'High', category: 'Social', lastChecked: '1 hour ago' },
  { name: 'Google My Business', status: 'Submitted', priority: 'Critical', category: 'Search Engine', lastChecked: '1 week ago' },
  { name: 'TripAdvisor', status: 'Ready to Submit', priority: 'Medium', category: 'Review Sites', lastChecked: '4 hours ago' },
];

const statusIcon: Record<Status, JSX.Element> = {
  'Ready to Submit': <FileText className="w-5 h-5 text-blue-500" />,
  'Submitted': <CheckCircle className="w-5 h-5 text-green-500" />,
  'Error': <AlertCircle className="w-5 h-5 text-red-500" />,
};

const mockStats = [
  { title: 'Total Sites', value: '8', change: '+2', icon: Target, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { title: 'Submitted', value: '3', change: '+1', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { title: 'Ready to Submit', value: '4', change: '+2', icon: FileText, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  { title: 'Errors', value: '1', change: '-1', icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' },
];

const mockOpportunities = [
  { title: '5 Top Sites Missing Your Listing', impact: 'High', description: 'Yelp, Facebook, and 3 other high-traffic sites don\'t have your business listed' },
  { title: 'Apple Maps Error Needs Fixing', impact: 'Critical', description: 'Your listing on Apple Maps has an error that needs immediate attention' },
  { title: '3 Sites Ready for Submission', impact: 'Medium', description: 'Quick wins available - submit to these sites to improve visibility' },
];

export default function CitationBuilderPage() {
  const [business, setBusiness] = useState({ name: '', address: '', phone: '' });
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setShowList(true);
      setLoading(false);
    }, 1000);
  };

  const filteredSites = mockSites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
            <Link className="w-8 h-8 text-purple-500" />
            Citation Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Generate and manage your business citations across top directories for maximum local SEO impact
          </p>
        </div>

        {/* Business Info Form */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
              placeholder="Business Name"
              value={business.name}
              onChange={e => setBusiness({ ...business, name: e.target.value })}
            />
            <input
              type="text"
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
              placeholder="Address"
              value={business.address}
              onChange={e => setBusiness({ ...business, address: e.target.value })}
            />
            <input
              type="text"
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
              placeholder="Phone Number"
              value={business.phone}
              onChange={e => setBusiness({ ...business, phone: e.target.value })}
            />
          </div>
          <button
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Generating Citations...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Citations
              </>
            )}
          </button>
        </div>

        {showList && (
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
                {['overview', 'sites', 'opportunities'].map((tab) => (
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
                    {/* Citation Sites Summary */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        Citation Sites Summary
                      </h3>
                      <div className="space-y-4">
                        {['Submitted', 'Ready to Submit', 'Error'].map((status) => {
                          const count = mockSites.filter(site => site.status === status).length;
                          const sites = mockSites.filter(site => site.status === status);
                          return (
                            <div key={status} className="bg-gradient-to-r from-purple-50/60 to-blue-50/40 dark:from-purple-900/20 dark:to-blue-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  {statusIcon[status as Status]}
                                  <span className="font-semibold text-gray-900 dark:text-white">{status}</span>
                                </div>
                                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{count}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {sites.slice(0, 3).map((site, i) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200">
                                    {site.name}
                                  </span>
                                ))}
                                {sites.length > 3 && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    +{sites.length - 3} more
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
                        Citation Status
                      </h3>
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 p-6 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">3</span>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">4</span>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">1</span>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Submitted • Ready • Errors</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'sites' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Citation Sites</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search sites..."
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
                        <option value="Ready to Submit">Ready to Submit</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Error">Error</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Site</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Checked</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredSites.map((site, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {statusIcon[site.status]}
                                  <span className="ml-3 font-medium text-gray-900 dark:text-white">{site.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  site.status === 'Submitted' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' :
                                  site.status === 'Ready to Submit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                                }`}>
                                  {site.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  site.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' :
                                  site.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                                }`}>
                                  {site.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {site.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {site.lastChecked}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {site.status === 'Ready to Submit' && (
                                    <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
                                      Copy Info
                                    </button>
                                  )}
                                  {site.status === 'Error' && (
                                    <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium">
                                      Retry
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
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200'
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
                  Last updated: 1 hour ago
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 