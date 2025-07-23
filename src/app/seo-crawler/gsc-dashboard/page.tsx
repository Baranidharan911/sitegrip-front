'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Search, 
  Globe, 
  Eye, 
  MousePointer, 
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
  Calendar,
  BarChart,
  PieChart,
  Activity,
  Database,
  FileText,
  Sparkles
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';

interface GSCProperty {
  site_url: string;
  property_type: 'URL_PREFIX' | 'DOMAIN';
  permission_level: string;
  verified: boolean;
}

interface IndexedPage {
  url: string;
  indexed: boolean;
  lastCrawled?: string;
  coverageState?: string;
  indexingState?: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  crawlAllowed?: boolean;
  robotsTxtState?: string;
  mobileUsabilityResult?: any;
  richResultsItems?: any[];
  lastCrawlTime?: string;
  pageFetchState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  sitemap?: string[];
  referringUrls?: string[];
  richResults?: any;
  mobileUsability?: any;
  structuredData?: any;
  links?: any;
  screenshot?: any;
}

interface IndexingSummary {
  totalPages: number;
  indexedPages: number;
  notIndexedPages: number;
  pendingPages: number;
  errorPages: number;
  indexingRate: number;
  lastUpdated: string;
}

interface PerformanceData {
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
}

interface CoverageData {
  totalSubmitted: number;
  totalIndexed: number;
  totalExcluded: number;
  totalError: number;
  coverageByType: any[];
}

interface SitemapData {
  path: string;
  lastSubmitted: string;
  contents: number;
  errors: number;
  warnings: number;
  isPending: boolean;
  isSitemapsIndex: boolean;
}

interface EnhancementsData {
  structuredData: any[];
  mobileUsability: any[];
  coreWebVitals: any[];
  richResults: any[];
}

export default function GSCDashboardPage() {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [indexedPages, setIndexedPages] = useState<IndexedPage[]>([]);
  const [indexingSummary, setIndexingSummary] = useState<IndexingSummary | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [sitemapsData, setSitemapsData] = useState<SitemapData[]>([]);
  const [enhancementsData, setEnhancementsData] = useState<EnhancementsData | null>(null);
  const [historicalData, setHistoricalData] = useState<Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadGSCData();
    }
  }, [selectedProperty, dateRange]);

  const loadGSCProperties = async () => {
    try {
      setLoading(true);
      const response = await indexingApi.getGSCProperties();
      setProperties(response);
      if (response.length > 0) {
        setSelectedProperty(response[0].site_url);
      }
    } catch (error: any) {
      toast.error('Failed to load GSC properties: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadGSCData = async () => {
    if (!selectedProperty) return;
    
    try {
      setRefreshing(true);
      
      console.log('🔍 Loading GSC data for property:', selectedProperty);
      
      const pagesResponse = await indexingApi.getIndexedPages(selectedProperty, {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      console.log('📊 Pages Response:', pagesResponse);
      console.log('📈 Performance Data:', pagesResponse.data.performance);
      console.log('📄 Pages Count:', pagesResponse.data.pages?.length);
      
      setIndexedPages(pagesResponse.data.pages || []);
      setPerformanceData(pagesResponse.data.performance || null);
      setCoverageData(pagesResponse.data.coverage || null);
      setSitemapsData(pagesResponse.data.sitemaps || []);
      setEnhancementsData(pagesResponse.data.enhancements || null);
      
      const summaryResponse = await indexingApi.getIndexingSummary(selectedProperty);
      console.log('📊 Summary Response:', summaryResponse);
      setIndexingSummary(summaryResponse.data.summary || null);
      
      const historyResponse = await indexingApi.getPerformanceHistory(selectedProperty, parseInt(dateRange));
      console.log('📈 History Response:', historyResponse);
      if (historyResponse.data.history && historyResponse.data.history.length > 0) {
        setHistoricalData(historyResponse.data.history);
        console.log('✅ Using real historical data:', historyResponse.data.history.length, 'days');
      } else {
        console.log('⚠️ No historical data available, will use fallback');
      }
      
    } catch (error: any) {
      console.error('❌ Failed to load GSC data:', error);
      toast.error('Failed to load GSC data: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted and indexed': return 'bg-green-500';
      case 'Discovered – currently not indexed': return 'bg-yellow-500';
      case 'Crawled – currently not indexed': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted and indexed': return <CheckCircle className="w-4 h-4" />;
      case 'Discovered – currently not indexed': return <Clock className="w-4 h-4" />;
      case 'Crawled – currently not indexed': return <AlertCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const formatNumber = (value: number | undefined | null, decimals: number = 0): string => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatCTR = (ctr: number | undefined | null): string => {
    if (!ctr && ctr !== 0) return '0%';
    return `${(ctr * 100).toFixed(1)}%`;
  };

  const formatPosition = (position: number | undefined | null): string => {
    if (!position && position !== 0) return '0';
    return position.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-slate-200/50 dark:border-white/20 rounded-full px-4 py-2 mb-4">
              <BarChart3 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-white/90">GSC Analytics</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              Google Search Console Dashboard
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
              Monitor your website's search performance and indexing status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl px-3 py-2 rounded-lg">
              Last update: {new Date().toLocaleTimeString()}
            </div>
            <button 
              onClick={loadGSCData} 
              disabled={refreshing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </motion.div>

        {/* Property Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Google Search Console Property
              </label>
              <select 
                value={selectedProperty} 
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full lg:w-80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              >
                <option value="">Select GSC Property</option>
                {properties.map((property) => (
                  <option key={property.site_url} value={property.site_url}>
                    {property.site_url} ({property.property_type})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date Range
              </label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="w-32 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl p-1">
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'indexing', label: 'Indexing' },
                { id: 'performance', label: 'Performance' },
                { id: 'pages', label: 'Pages' },
                { id: 'gsc-data', label: 'GSC Data' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Overview Section */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Overview</h2>
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        Explore your insights →
                      </button>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                      <div className="w-5 h-5 text-yellow-600">💡</div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">Get insights into your site's Search performance</span>
                    </div>
                  </div>

                  {/* Performance Section */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Performance</h2>
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        Full report →
                      </button>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {formatNumber(performanceData?.totalClicks)} total web search clicks
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Performance data available for the selected period</p>
                    </div>
                  </div>

                  {/* Indexing Section */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Indexing</h2>
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        Full report →
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {indexedPages.filter(page => !page.indexed).length} not indexed pages
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {indexedPages.filter(page => page.indexed).length} indexed pages
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Indexing status overview for the selected property</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'indexing' && (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Indexing Status Breakdown</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-slate-900 dark:text-white">Indexed</span>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                          {indexedPages.filter(page => page.indexed).length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium">Not Indexed</span>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                          {indexedPages.filter(page => !page.indexed).length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          <span className="font-medium">Pending</span>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                          {indexedPages.filter(page => page.coverageState === 'Discovered – currently not indexed').length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-slate-900 dark:text-white">Errors</span>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                          {indexedPages.filter(page => page.coverageState === 'Error').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Performance</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      <Download className="w-4 h-4" />
                      EXPORT
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">24 hours</button>
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">7 days</button>
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">28 days</button>
                    <button className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-xs shadow-lg">3 months</button>
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">More</button>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total clicks</span>
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {formatNumber(performanceData?.totalClicks)}
                      </div>
                      <div className="text-xs opacity-80 mt-1">?</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total impressions</span>
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {formatNumber(performanceData?.totalImpressions)}
                      </div>
                      <div className="text-xs opacity-80 mt-1">?</div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Average CTR</span>
                        <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                      </div>
                      <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                        {formatCTR(performanceData?.avgCTR)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">?</div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Average position</span>
                        <div className="w-4 h-4 border border-slate-300 dark:border-slate-600 rounded"></div>
                      </div>
                      <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
                        {formatPosition(performanceData?.avgPosition)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">?</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Performance metrics for the selected period</p>
                  </div>
                </div>
              )}

              {activeTab === 'pages' && (
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Indexed Pages ({indexedPages.length})
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {indexedPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(page.coverageState || '')}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate text-slate-900 dark:text-white">{page.url}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {page.lastCrawled ? `Last crawled: ${new Date(page.lastCrawled).toLocaleDateString()}` : 'Not crawled yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {page.clicks !== undefined && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{page.clicks}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Clicks</p>
                            </div>
                          )}
                          
                          {page.impressions !== undefined && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{page.impressions}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Impressions</p>
                            </div>
                          )}
                          
                          {page.ctr !== undefined && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{page.ctr.toFixed(2)}%</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">CTR</p>
                            </div>
                          )}
                          
                          {page.position !== undefined && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{page.position.toFixed(1)}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Position</p>
                            </div>
                          )}
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            page.indexed 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {page.coverageState || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {indexedPages.length === 0 && (
                      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Search className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-lg font-medium">No indexed pages found</p>
                        <p className="text-sm">Try refreshing the data or selecting a different property</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'gsc-data' && (
                <div className="space-y-6">
                  {/* Data Diagnostic Panel */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 mb-6">
                      <Database className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Data Diagnostic</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Performance Data</h4>
                          <pre className="text-xs text-blue-800 dark:text-blue-200 overflow-auto max-h-32">
                            {JSON.stringify(performanceData, null, 2) || 'null'}
                          </pre>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Historical Data Sample</h4>
                          <pre className="text-xs text-green-800 dark:text-green-200 overflow-auto max-h-32">
                            {JSON.stringify(historicalData?.slice(0, 3), null, 2) || 'null'}
                            {historicalData && historicalData.length > 3 && `\n... and ${historicalData.length - 3} more days`}
                          </pre>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">Pages Sample (first 3)</h4>
                        <pre className="text-xs text-slate-800 dark:text-slate-200 overflow-auto max-h-32">
                          {JSON.stringify(indexedPages?.slice(0, 3), null, 2) || 'null'}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Coverage Data */}
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 mb-6">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Coverage Summary</h2>
                      </div>
                      {coverageData ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{coverageData.totalSubmitted}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Total Submitted</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{coverageData.totalIndexed}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Total Indexed</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{coverageData.totalExcluded}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Total Excluded</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{coverageData.totalError}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">Total Errors</div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <p className="text-sm text-slate-600 dark:text-slate-400">Coverage distribution summary</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-slate-500 dark:text-slate-400">No coverage data available</div>
                      )}
                    </div>

                    {/* Sitemaps Data */}
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                      <div className="flex items-center gap-2 mb-6">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                          Sitemaps ({sitemapsData.length})
                        </h2>
                      </div>
                      {sitemapsData.length > 0 ? (
                        <div className="space-y-3">
                          {sitemapsData.slice(0, 5).map((sitemap, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-slate-900 dark:text-white">{sitemap.path}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {sitemap.contents} URLs • {sitemap.errors} errors
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                sitemap.isPending 
                                  ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}>
                                {sitemap.isPending ? "Pending" : "Active"}
                              </span>
                            </div>
                          ))}
                          {sitemapsData.length > 5 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                              +{sitemapsData.length - 5} more sitemaps
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-slate-500 dark:text-slate-400">No sitemaps found</div>
                      )}
                    </div>
                  </div>

                  {/* Enhancements Data */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Enhancements & Rich Results</h2>
                    </div>
                    {enhancementsData ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{enhancementsData.structuredData.length}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Structured Data</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{enhancementsData.mobileUsability.length}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Mobile Usability</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{enhancementsData.coreWebVitals.length}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Core Web Vitals</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{enhancementsData.richResults.length}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Rich Results</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 dark:text-slate-400">No enhancements data available</div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Last Updated */}
        {indexingSummary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl px-4 py-2 rounded-lg"
          >
            Last updated: {new Date(indexingSummary.lastUpdated).toLocaleString()}
          </motion.div>
        )}
      </div>
    </div>
  );
} 