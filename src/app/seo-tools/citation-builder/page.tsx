'use client';
import { useState } from 'react';
import { Link, FileText, CheckCircle, AlertCircle, Loader2, TrendingUp, Download, Share2, Settings, Eye, Clock, Users, Zap, Target, ArrowUpRight, Info, Filter, Search, MoreVertical, ExternalLink, RefreshCw, BarChart3, Copy, Check, HelpCircle } from 'lucide-react';
import HowToUseSection from '@/components/Common/HowToUseSection';

type Status = 'Ready to Submit' | 'Submitted' | 'Error';

const citationDirectories = [
  {
    name: 'Google Business Profile',
    url: 'https://www.google.com/business/',
  },
  {
    name: 'Yelp',
    url: 'https://biz.yelp.com/signup_business',
  },
  {
    name: 'Bing Places',
    url: 'https://www.bingplaces.com/',
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/pages/create/',
  },
  {
    name: 'Apple Maps',
    url: 'https://register.apple.com/placesonmaps/',
  },
  {
    name: 'Foursquare',
    url: 'https://foursquare.com/venue/claim',
  },
  {
    name: 'Yellow Pages',
    url: 'https://www.yellowpages.com/business',
  },
  {
    name: 'TripAdvisor',
    url: 'https://www.tripadvisor.com/Owners',
  },
];

function formatCitation(business: { name: string; address: string; phone: string }) {
  return `${business.name}, ${business.address}, ${business.phone}`;
}

function generateCitations(business: { name: string; address: string; phone: string }) {
  if (!business.name && !business.address && !business.phone) return [];
  return citationDirectories.map(dir => ({
    ...dir,
    citation: formatCitation(business),
  }));
}

export default function CitationBuilderPage() {
  const [business, setBusiness] = useState({ name: '', address: '', phone: '' });
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const citations = generateCitations(business);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setShowList(true);
      setLoading(false);
    }, 1000);
  };

  const handleCopyAll = () => {
    const allCitations = citations.map(c => `${c.name}: ${c.citation}`).join('\n');
    navigator.clipboard.writeText(allCitations);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Directory', 'Citation', 'Submission Link'],
      ...citations.map(c => [c.name, c.citation, c.url]),
    ];
    const csvContent = csvRows.map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSites = citations.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                <Link className="w-8 h-8 text-purple-500" />
                Citation Builder
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Generate and manage your business citations across top directories for maximum local SEO impact
              </p>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              {showHelp ? 'Hide Help' : 'How to Use'}
            </button>
          </div>

          {/* Help Section */}
          {showHelp && (
            <HowToUseSection
              title="How to Use Citation Builder"
              description="Generate consistent business citations for submission to major online directories and improve your local SEO presence."
              steps={[
                {
                  title: "Enter your business information",
                  description: "Fill in your business name, address, and phone number exactly as they should appear online"
                },
                {
                  title: "Click 'Generate Citations'",
                  description: "Our system will create properly formatted citations for each directory"
                },
                {
                  title: "Review the citations",
                  description: "Check that all information is accurate and consistent across all directories"
                },
                {
                  title: "Submit to directories",
                  description: "Use the provided links to submit your citations to each directory"
                }
              ]}
              examples={[
                {
                  type: "Business Name",
                  example: "Joe's Plumbing Service",
                  description: "Use your exact business name as registered"
                },
                {
                  type: "Address",
                  example: "123 Main Street, New York, NY 10001",
                  description: "Include full street address, city, state, and ZIP code"
                },
                {
                  type: "Phone Number",
                  example: "(555) 123-4567",
                  description: "Use your main business phone number"
                }
              ]}
              tips={[
                {
                  title: "Consistent NAP",
                  content: "Ensure your Name, Address, and Phone are identical across all citations"
                },
                {
                  title: "Directory Coverage",
                  content: "Submit to major directories like Google, Yelp, Bing, and Facebook"
                },
                {
                  title: "Regular Updates",
                  content: "Keep your citations updated when business information changes"
                }
              ]}
              proTip="Submit to Google Business Profile first, then work through other directories systematically. This ensures consistency and faster indexing."
            />
          )}
        </div>

        {/* Business Info Form */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
              placeholder="Business Name"
              value={business.name}
              onChange={e => setBusiness({ ...business, name: e.target.value })}
            />
            <input
              type="text"
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
              placeholder="Address"
              value={business.address}
              onChange={e => setBusiness({ ...business, address: e.target.value })}
            />
            <input
              type="text"
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
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
            {/* Copy/Export Buttons */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-all"
                onClick={handleCopyAll}
                disabled={citations.length === 0}
                aria-label="Copy all citations"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all"
                onClick={handleExportCSV}
                disabled={citations.length === 0}
                aria-label="Export citations as CSV"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
            {/* Citations Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/80 mb-8">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Directory</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Citation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submission Link</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {citations.map((c, idx) => (
                    <tr key={c.name}>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white">{c.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">{c.citation}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          Go to Site <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* This section is no longer directly tied to mock data,
                  but the structure and styling remain for now. */}
              <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    +2
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Total Sites</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total directories with citations</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    +1
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Submitted</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Directories with submitted citations</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                    <FileText className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    +2
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ready to Submit</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Directories with ready citations</p>
              </div>
              <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    -1
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Errors</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Directories with citation errors</p>
              </div>
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
                        {/* In the summary section, replace the status-based mapping with a single card showing total citations and a list of directory names.
                            Remove all references to site.status. */}
                        <div className="bg-gradient-to-r from-purple-50/60 to-blue-50/40 dark:from-purple-900/20 dark:to-blue-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {/* Status icons are not directly applicable to generated citations */}
                              <span className="font-semibold text-gray-900 dark:text-white">Total Citations</span>
                            </div>
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{citations.length}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {citations.map((site, i) => (
                              <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200">
                                {site.name}
                              </span>
                            ))}
                            {citations.length > 3 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                +{citations.length - 3} more
                              </span>
                            )}
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
                    </div>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Site</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Citation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submission Link</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredSites.map((site, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {/* Status icons are not directly applicable to generated citations */}
                                  <span className="ml-3 font-medium text-gray-900 dark:text-white">{site.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                                {site.citation}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <a
                                  href={site.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                  Go to Site <ExternalLink className="w-4 h-4" />
                                </a>
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
                    {/* This section is no longer directly tied to mock data,
                        but the structure and styling remain for now. */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/10 rounded-xl border border-orange-200 dark:border-orange-900/30 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">5 Top Sites Missing Your Listing</h4>
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
                          Medium Priority
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Yelp, Facebook, and 3 other high-traffic sites don't have your business listed</p>
                      <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300">
                        Take Action →
                      </button>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/10 rounded-xl border border-orange-200 dark:border-orange-900/30 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Apple Maps Error Needs Fixing</h4>
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">
                          Critical Priority
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Your listing on Apple Maps has an error that needs immediate attention</p>
                      <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300">
                        Take Action →
                      </button>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/10 rounded-xl border border-orange-200 dark:border-orange-900/30 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">3 Sites Ready for Submission</h4>
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
                          Medium Priority
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Quick wins available - submit to these sites to improve visibility</p>
                      <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300">
                        Take Action →
                      </button>
                    </div>
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