'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import KeywordToolsTabs from '@/components/seo-crawler/KeywordToolsTabs';
import { Search, Database, Globe, History } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFirestoreInstance } from '@/lib/firebase.js';

interface PageData {
  url: string;
  body_text: string;
  title?: string;
  meta_description?: string;
}

interface CrawlResult {
  crawlId: string;
  pages: PageData[];
  domain: string;
  createdAt: string;
  totalPages: number;
}

function KeywordToolsContent() {
  const searchParams = useSearchParams();
  const crawlId = searchParams.get('crawlId') || '';
  
  const [mode, setMode] = useState<'manual' | 'crawl'>('manual');
  const [manualUrl, setManualUrl] = useState('');
  const [allPagesData, setAllPagesData] = useState<PageData[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userCrawls, setUserCrawls] = useState<CrawlResult[]>([]);
  const [selectedCrawlId, setSelectedCrawlId] = useState('');

  // Load user's crawl history on component mount
  useEffect(() => {
    loadUserCrawls();
    if (crawlId) {
      setMode('crawl');
      setSelectedCrawlId(crawlId);
      loadCrawlData(crawlId);
    }
  }, [crawlId]);

  useEffect(() => {
    if (!selectedCrawlId) return;

    const db = getFirestoreInstance();
    if (!db) return;
    const q = collection(db, `crawls/${selectedCrawlId}/keywordAnalysis`);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const analysisResults = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          url: data.url || '',
          body_text: data.body_text || '',
          title: data.title || '',
          meta_description: data.meta_description || '',
        } as PageData;
      });
      setAllPagesData(analysisResults);
    });

    return () => unsubscribe();
  }, [selectedCrawlId]);

  const loadUserCrawls = async () => {
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
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app';
      const response = await fetch(`${apiUrl}/api/history/user/${userId}`);
      
      if (response.ok) {
        const crawls = await response.json();
        setUserCrawls(crawls);
      } else if (response.status === 404) {
        // No crawls found for this user
        setUserCrawls([]);
      } else {
        console.warn('Failed to load user crawls:', response.status);
        setUserCrawls([]);
      }
    } catch (err) {
      console.warn('Failed to load user crawls:', err);
      setUserCrawls([]);
    }
  };

  const loadCrawlData = async (crawlId: string) => {
    if (!crawlId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app';
      const response = await fetch(`${apiUrl}/api/history/crawl/${crawlId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Crawl data not found. It may have been deleted or expired.');
        } else {
          throw new Error(`Failed to load crawl data (${response.status})`);
        }
      }
      
      const crawlData = await response.json();
      const pages = crawlData.pages || [];
      
      // Enhance pages with empty body_text if needed
      const enhancedPages = pages.map((page: PageData) => ({
        ...page,
        body_text: page.body_text || '', // Ensure body_text is never undefined
        title: page.title || '',
        meta_description: page.meta_description || ''
      }));
      
      setAllPagesData(enhancedPages);
      
      // Auto-select first page if available
      if (enhancedPages.length > 0) {
        setSelectedPageIndex(0);
      }
      
    } catch (err: any) {
      console.error('Failed to load crawl data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualUrlSubmit = async () => {
    if (!manualUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate URL format
      const url = new URL(manualUrl.trim());
      
      // Create a page data object for manual URL
      const pageData: PageData = {
        url: url.toString(),
        body_text: '', // Will be fetched by keyword analysis endpoints or by content fetcher
        title: '',
        meta_description: ''
      };
      
      setAllPagesData([pageData]);
      setSelectedPageIndex(0);
      setMode('manual'); // Ensure we stay in manual mode
      
    } catch (err: any) {
      setError('Please enter a valid URL (e.g., https://example.com)');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch page content when missing
  const fetchPageContent = async (url: string): Promise<Partial<PageData>> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app';
      const response = await fetch(`${apiUrl}/api/crawl/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          body_text: data.body_text || '',
          title: data.title || '',
          meta_description: data.meta_description || ''
        };
      }
    } catch (err) {
      console.warn('Failed to fetch page content:', err);
    }
    
    return {
      body_text: '',
      title: '',
      meta_description: ''
    };
  };

  const currentPage = allPagesData[selectedPageIndex];
  let domain = '';
  try {
    domain = currentPage ? new URL(currentPage.url).hostname : '';
  } catch (e) {
    console.warn('Invalid URL:', currentPage?.url);
  }

  // Auto-trigger analysis when crawl data is loaded
  useEffect(() => {
    if (currentPage && !loading && !error) {
      // Auto-trigger analysis for the current page
      console.log('Auto-triggering keyword analysis for:', currentPage.url);
    }
  }, [currentPage, loading, error]);

  // Load initial crawl data if crawlId is provided in URL
  useEffect(() => {
    if (crawlId && !selectedCrawlId) {
      setSelectedCrawlId(crawlId);
      loadCrawlData(crawlId);
    }
  }, [crawlId, selectedCrawlId]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading keyword tools...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-6 border dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">🚀 Keyword Tools Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Comprehensive keyword analysis and optimization tools for your website
          </p>

          {/* Mode Selection */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Mode Selection */}
            <div className="lg:w-1/3">
              <div className="space-y-4">
                {/* Mode Tabs */}
                <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all ${
                      mode === 'manual'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Manual URL
                  </button>
                  <button
                    onClick={() => setMode('crawl')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all ${
                      mode === 'crawl'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    From Crawl
                  </button>
                </div>

                {/* Manual URL Input */}
                {mode === 'manual' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enter URL to Analyze:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://example.com/page"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleManualUrlSubmit()}
                      />
                      <button
                        onClick={handleManualUrlSubmit}
                        disabled={!manualUrl.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enter any URL you want to analyze for keyword opportunities
                    </p>
                  </div>
                )}

                {/* Crawl Selection */}
                {mode === 'crawl' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select from Your Crawls:
                    </label>
                    {userCrawls.length > 0 ? (
                      <select
                        value={selectedCrawlId}
                        onChange={(e) => {
                          setSelectedCrawlId(e.target.value);
                          loadCrawlData(e.target.value);
                        }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      >
                        <option value="">Select a crawl...</option>
                        {userCrawls.map((crawl) => (
                          <option key={crawl.crawlId} value={crawl.crawlId}>
                            {crawl.domain} - {new Date(crawl.createdAt).toLocaleDateString()} ({crawl.totalPages} pages)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No crawls found. Run a crawl first!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Current Selection Info */}
            {currentPage && (
              <div className="lg:w-2/3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3">Current Analysis Target:</h3>
                  
                  {/* Page Selector for Multiple URLs */}
                  {allPagesData.length > 1 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Page ({allPagesData.length} pages available):
                      </label>
                      <select
                        value={selectedPageIndex}
                        onChange={(e) => setSelectedPageIndex(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      >
                        {allPagesData.map((page, index) => (
                          <option key={index} value={index}>
                            {page.url} {page.title ? `- ${page.title}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">URL:</span>
                      <span className="ml-2 font-medium text-gray-800 dark:text-white break-all">{currentPage.url}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Domain:</span>
                      <span className="ml-2 font-medium text-gray-800 dark:text-white">{domain}</span>
                    </div>
                    {currentPage.title && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Title:</span>
                        <span className="ml-2 font-medium text-gray-800 dark:text-white">{currentPage.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Keyword Tools Tabs */}
        {currentPage && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">🔍 Keyword Analysis Results</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analyzing: <span className="font-medium">{currentPage.url}</span>
                </p>
              </div>
              {allPagesData.length > 1 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Page {selectedPageIndex + 1} of {allPagesData.length}
                </div>
              )}
            </div>
            
            <KeywordToolsTabs
              url={currentPage.url}
            />
          </div>
        )}

        {/* Getting Started Section */}
        {!currentPage && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border dark:border-gray-700 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Ready to Analyze Keywords?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose to analyze a specific URL manually or select from your previous crawl results to get started with comprehensive keyword analysis.
              </p>
              <div className="flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>✓ AI-powered analysis</span>
                <span>✓ Search volume data</span>
                <span>✓ Ranking insights</span>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">💡 How to Use Keyword Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">🔍 Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Analyze your current content for keyword opportunities and optimization potential.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">📊 Ranking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track keyword rankings across Google, Bing, and mobile search results.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">📈 Volume</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Research search volume, competition, and seasonal trends for keywords.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">🔥 Trending</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Discover trending keywords in your industry to stay ahead of the curve.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">🕳️ Gaps</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Identify missing keyword opportunities compared to your competitors.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">📍 Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor keyword performance over time with detailed tracking metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function KeywordToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Loading Keyword Tools...
            </h1>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </main>
      </div>
    }>
      <KeywordToolsContent />
    </Suspense>
  );
} 
