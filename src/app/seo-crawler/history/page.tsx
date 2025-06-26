'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Globe, Calendar, BarChart3, Eye, Trash2, Download, RefreshCw,
  Filter, SortDesc, SortAsc, ChevronDown, ChevronUp, ExternalLink,
  Clock, AlertTriangle, CheckCircle, TrendingUp, FileText, Share2,
  MoreVertical, Copy, Archive, Star, StarOff
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

interface CrawlResult {
  crawlId: string;
  url: string;
  domain: string;
  createdAt: string;
  totalPages: number;
  userId?: string;
  depth: number;
  summary: {
    totalPages: number;
    missingTitles: number;
    brokenLinks: number;
    orphanPages: number;
    duplicateTitles?: number;
    duplicateDescriptions?: number;
    averageSeoScore?: number;
    redirectChains?: number;
    pagesWithSlowLoad?: number;
  };
  starred?: boolean;
  archived?: boolean;
  tags?: string[];
  aiSummaryText?: string;
  performance?: {
    crawlTime: number;
    avgLoadTime: number;
    totalSize: number;
  };
}

interface FilterOptions {
  search: string;
  domain: string;
  dateRange: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showArchived: boolean;
  showStarred: boolean;
}

export default function CrawlHistoryPage() {
  const router = useRouter();
  const [crawls, setCrawls] = useState<CrawlResult[]>([]);
  const [filteredCrawls, setFilteredCrawls] = useState<CrawlResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCrawls, setSelectedCrawls] = useState<string[]>([]);
  const [expandedCrawl, setExpandedCrawl] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    domain: '',
    dateRange: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    showArchived: false,
    showStarred: false
  });

  useEffect(() => {
    loadCrawlHistory();
  }, []);

  useEffect(() => {
    filterAndSortCrawls();
  }, [crawls, filters]);

  const loadCrawlHistory = async () => {
    setLoading(true);
    setError('');

    try {
      // Get user ID from localStorage
      let userId = 'anonymous';
      try {
        const userData = localStorage.getItem('Sitegrip-user');
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.uid || user.id || user.user_id || 'anonymous';
        }
      } catch (err) {
        console.warn('Failed to parse user data from localStorage');
      }

      console.log('Loading crawls for user:', userId);

      // Query Firebase directly for user's crawls
      const crawlsRef = collection(db, 'crawls');
      const q = query(
        crawlsRef,
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const crawlsData: CrawlResult[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Found crawl:', doc.id, data);
        
        try {
          // Extract domain from URL
          let domain = '';
          try {
            domain = data.url ? new URL(data.url).hostname : '';
          } catch {
            domain = data.url || '';
          }

          // Transform the data to match our interface
          const crawl: CrawlResult = {
            crawlId: doc.id,
            url: data.url || '',
            domain: domain,
            createdAt: data.crawledAt || data.createdAt || new Date().toISOString(),
            totalPages: data.summary?.totalPages || data.pages?.length || 0,
            userId: data.userId,
            depth: data.depth || 1,
            starred: data.starred || false,
            archived: data.archived || false,
            tags: data.tags || [],
            aiSummaryText: data.aiSummaryText,
            summary: {
              totalPages: data.summary?.totalPages || data.pages?.length || 0,
              missingTitles: data.summary?.missingTitles || 0,
              brokenLinks: data.summary?.brokenLinks || 0,
              orphanPages: data.summary?.orphanPages || 0,
              duplicateTitles: data.summary?.duplicateTitles || 0,
              duplicateDescriptions: data.summary?.duplicateDescriptions || 0,
              averageSeoScore: data.summary?.averageSeoScore || 0,
              redirectChains: data.summary?.redirectChains || 0,
              pagesWithSlowLoad: data.summary?.pagesWithSlowLoad || 0
            },
            performance: {
              crawlTime: Math.random() * 300 + 30, // Mock data
              avgLoadTime: Math.random() * 2000 + 500,
              totalSize: Math.random() * 10 + 1
            }
          };
          
          crawlsData.push(crawl);
        } catch (err) {
          console.warn('Skipping malformed crawl document:', doc.id, err);
        }
      });

      console.log('Loaded crawls:', crawlsData);
      setCrawls(crawlsData);
    } catch (err: any) {
      console.error('Failed to load crawl history:', err);
      setError(err.message || 'Failed to load crawl history');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCrawls = () => {
    let filtered = [...crawls];

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter(crawl => 
        crawl.url.toLowerCase().includes(filters.search.toLowerCase()) ||
        crawl.domain.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.domain) {
      filtered = filtered.filter(crawl => crawl.domain === filters.domain);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(crawl => new Date(crawl.createdAt) >= filterDate);
    }

    if (filters.showStarred) {
      filtered = filtered.filter(crawl => crawl.starred);
    }

    if (!filters.showArchived) {
      filtered = filtered.filter(crawl => !crawl.archived);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'url':
          aValue = a.url;
          bValue = b.url;
          break;
        case 'domain':
          aValue = a.domain;
          bValue = b.domain;
          break;
        case 'totalPages':
          aValue = a.totalPages;
          bValue = b.totalPages;
          break;
        case 'issues':
          aValue = a.summary.missingTitles + a.summary.brokenLinks + a.summary.orphanPages;
          bValue = b.summary.missingTitles + b.summary.brokenLinks + b.summary.orphanPages;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      if (typeof aValue === 'string') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }
      
      return filters.sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setFilteredCrawls(filtered);
  };

  const toggleCrawlSelection = (crawlId: string) => {
    setSelectedCrawls(prev => 
      prev.includes(crawlId) 
        ? prev.filter(id => id !== crawlId)
        : [...prev, crawlId]
    );
  };

  const toggleStarred = async (crawlId: string, starred: boolean) => {
    try {
      await updateDoc(doc(db, 'crawls', crawlId), { starred: !starred });
      setCrawls(prev => prev.map(crawl => 
        crawl.crawlId === crawlId ? { ...crawl, starred: !starred } : crawl
      ));
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const archiveCrawl = async (crawlId: string, currentState: boolean) => {
    try {
      await updateDoc(doc(db, 'crawls', crawlId), { archived: !currentState });
      setCrawls(prev => prev.map(crawl => 
        crawl.crawlId === crawlId ? { ...crawl, archived: !currentState } : crawl
      ));
    } catch (err) {
      console.error('Failed to update archive status:', err);
    }
  };

  const deleteCrawl = async (crawlId: string) => {
    if (!confirm('Are you sure you want to permanently delete this crawl? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'crawls', crawlId));
      setCrawls(prev => prev.filter(crawl => crawl.crawlId !== crawlId));
    } catch (err) {
      console.error('Failed to delete crawl:', err);
      setError('Failed to delete crawl');
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCrawls.length} crawls? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(selectedCrawls.map(crawlId => deleteDoc(doc(db, 'crawls', crawlId))));
      setCrawls(prev => prev.filter(crawl => !selectedCrawls.includes(crawl.crawlId)));
      setSelectedCrawls([]);
    } catch (err) {
      console.error('Failed to delete crawls:', err);
      setError('Failed to delete selected crawls');
    }
  };

  const viewDetails = (crawlId: string) => {
    router.push(`/seo-crawler/history/${crawlId}`);
  };

  const getStatusIcon = (crawl: CrawlResult) => {
    const issues = crawl.summary.missingTitles + crawl.summary.brokenLinks + crawl.summary.orphanPages;
    if (issues === 0) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (issues < 5) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getPerformanceScore = (crawl: CrawlResult) => {
    const seoScore = crawl.summary.averageSeoScore || 0;
    if (seoScore >= 80) return { score: seoScore, color: 'text-green-600', bg: 'bg-green-100' };
    if (seoScore >= 60) return { score: seoScore, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { score: seoScore, color: 'text-red-600', bg: 'bg-red-100' };
  };

  const uniqueDomains = Array.from(new Set(crawls.map(crawl => crawl.domain))).filter(Boolean);

  if (loading) {
    return (
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading crawl history...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">📚 Crawl History</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and analyze your SEO crawl history with advanced filtering and insights
              </p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span>{crawls.length} total crawls</span>
                <span>•</span>
                <span>{filteredCrawls.length} filtered results</span>
                <span>•</span>
                <span>{selectedCrawls.length} selected</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/seo-crawler/dashboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>New Crawl</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by URL or domain..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedCrawls.length > 0 && (
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={bulkDelete}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete ({selectedCrawls.length})</span>
                </button>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t dark:border-gray-700 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain</label>
                <select
                  value={filters.domain}
                  onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All domains</option>
                  {uniqueDomains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="week">Last week</option>
                  <option value="month">Last month</option>
                  <option value="quarter">Last 3 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by</label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="createdAt">Date</option>
                    <option value="url">URL</option>
                    <option value="domain">Domain</option>
                    <option value="totalPages">Pages</option>
                    <option value="issues">Issues</option>
                  </select>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showStarred}
                    onChange={(e) => setFilters(prev => ({ ...prev, showStarred: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Starred only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showArchived}
                    onChange={(e) => setFilters(prev => ({ ...prev, showArchived: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show archived</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              <button
                onClick={loadCrawlHistory}
                className="ml-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Crawl Cards */}
        {filteredCrawls.length > 0 ? (
          <div className="space-y-4">
            {filteredCrawls.map((crawl) => {
              const isExpanded = expandedCrawl === crawl.crawlId;
              const performance = getPerformanceScore(crawl);
              const issues = crawl.summary.missingTitles + crawl.summary.brokenLinks + crawl.summary.orphanPages;
              
              return (
                <div key={crawl.crawlId} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg">
                  {/* Main Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedCrawls.includes(crawl.crawlId)}
                          onChange={() => toggleCrawlSelection(crawl.crawlId)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(crawl)}
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {crawl.url}
                              </h3>
                              {crawl.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                              {crawl.archived && <Archive className="w-4 h-4 text-gray-400" />}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Globe className="w-4 h-4" />
                              <span>{crawl.domain}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(crawl.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{crawl.performance?.crawlTime.toFixed(0)}s</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{crawl.totalPages}</div>
                          <div className="text-xs text-gray-500">Pages</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{issues}</div>
                          <div className="text-xs text-gray-500">Issues</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${performance.color}`}>{performance.score}</div>
                          <div className="text-xs text-gray-500">SEO Score</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => viewDetails(crawl.crawlId)}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarred(crawl.crawlId, !crawl.starred);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                          {crawl.starred ? <Star className="w-4 h-4 text-yellow-400" /> : <StarOff className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveCrawl(crawl.crawlId, crawl.archived || false);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                          title={crawl.archived ? "Unarchive" : "Archive"}
                        >
                          <Archive className={`w-4 h-4 ${crawl.archived ? "text-blue-400" : "text-gray-400"}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCrawl(crawl.crawlId);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Detailed Metrics */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Detailed Metrics</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-gray-500 mb-1">Missing Titles</div>
                              <div className="text-lg font-semibold text-red-600">{crawl.summary.missingTitles}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-gray-500 mb-1">Broken Links</div>
                              <div className="text-lg font-semibold text-red-600">{crawl.summary.brokenLinks}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-gray-500 mb-1">Duplicate Titles</div>
                              <div className="text-lg font-semibold text-yellow-600">{crawl.summary.duplicateTitles}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-gray-500 mb-1">Orphan Pages</div>
                              <div className="text-lg font-semibold text-orange-600">{crawl.summary.orphanPages}</div>
                            </div>
                          </div>
                        </div>

                        {/* AI Summary */}
                        {crawl.aiSummaryText && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">AI Summary</h4>
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {crawl.aiSummaryText}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between mt-6 pt-4 border-t dark:border-gray-600">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => router.push(`/seo-crawler/keyword-tools?crawlId=${crawl.crawlId}`)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center space-x-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span>Keywords</span>
                          </button>
                          
                          <button
                            onClick={() => router.push(`/seo-crawler/dashboard?crawlId=${crawl.crawlId}`)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                          
                          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg text-sm flex items-center space-x-2">
                            <RefreshCw className="w-4 h-4" />
                            <span>Re-crawl</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Enhanced Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border dark:border-gray-700 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {filters.search || filters.domain || filters.showStarred ? 'No matches found' : 'No Crawls Yet'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {filters.search || filters.domain || filters.showStarred
                  ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                  : 'You haven\'t run any SEO crawls yet. Start by analyzing your first website to see keyword opportunities and technical SEO insights.'
                }
              </p>
              <div className="flex justify-center space-x-3">
                {filters.search || filters.domain || filters.showStarred ? (
                  <button
                    onClick={() => setFilters({
                      search: '',
                      domain: '',
                      dateRange: 'all',
                      status: 'all',
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                      showArchived: false,
                      showStarred: false
                    })}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : null}
                <button
                  onClick={() => router.push('/seo-crawler/dashboard')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Run Your First Crawl</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Quick Stats */}
        {filteredCrawls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Crawls</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredCrawls.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pages Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredCrawls.reduce((total, crawl) => total + crawl.totalPages, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredCrawls.reduce((total, crawl) => 
                      total + crawl.summary.missingTitles + crawl.summary.brokenLinks + crawl.summary.orphanPages, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg SEO Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredCrawls.length > 0 
                      ? Math.round(filteredCrawls.reduce((total, crawl) => total + (crawl.summary.averageSeoScore || 0), 0) / filteredCrawls.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
