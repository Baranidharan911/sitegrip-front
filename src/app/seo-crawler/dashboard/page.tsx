'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Search, Download, Share2, Printer, Globe, BarChart3 } from 'lucide-react';

// Import Firebase and export utilities
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { exportComponentToPDF } from '@/utils/exportPDF';
import { Firestore } from 'firebase/firestore';

function isFirestore(db: any): db is Firestore {
  return db !== null && typeof db === 'object';
}

import RunCrawlForm from '@/components/seo-crawler/RunCrawlForm';
import CrawlSummary from '@/components/seo-crawler/CrawlSummary';
import ResultsTable from '@/components/seo-crawler/ResultsTable';
import DiscoveredTable from '@/components/seo-crawler/DiscoveredTable';

interface AISuggestions {
  title: string;
  metaDescription: string;
  content: string;
  keyword_analysis?: {
    keyword_density: Record<string, number>;
    missing_keywords?: string[];
  };
}

interface PageData {
  url: string;
  title?: string;
  statusCode: number;
  wordCount: number;
  issues: string[];
  redirectChain: string[];
  loadTime: number;
  pageSizeBytes: number;
  hasViewport: boolean;
  suggestions?: AISuggestions;
  seoScore: number;
  lcp: number;
  cls: number;
  ttfb: number;
  linkedFrom?: string[];
  depth: number;
}

interface CrawlSummaryData {
  totalPages: number;
  missingTitles: number;
  lowWordCountPages: number;
  brokenLinks: number;
  duplicateTitles: number;
  duplicateDescriptions: number;
  redirectChains: number;
  mobileFriendlyPages: number;
  nonMobilePages: number;
  pagesWithSlowLoad: number;
  orphanPages: number;
}

interface CrawlResult {
  crawlId: string;
  summary: CrawlSummaryData;
  pages: PageData[];
  sitemapUrls: string[];
  aiSummaryText?: string;
}

interface DiscoveredPage {
  url: string;
  statusCode: number;
  title?: string;
  depth: number;
  fromSitemap: boolean;
}

export default function SeoCrawlerDashboardPage() {
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [discovered, setDiscovered] = useState<DiscoveredPage[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'results'>('summary');

  // Add state for user and saved reports
  const [user, setUser] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  // On mount, listen for auth state and load saved reports
  useEffect(() => {
    if (!auth) return;
    
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadReports(u.uid);
      else setSavedReports([]);
    });
    return () => unsub();
  }, []);

  const loadReports = async (uid: string) => {
    if (!db) return;
    const q = query(
      collection(db!, 'seoCrawlReports'),
      where('uid', '==', uid),
      orderBy('created', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    setSavedReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const saveReport = async (data: any) => {
    if (!db) return;
    try {
      const result = await addDoc(collection(db!, 'seoCrawlReports'), data);
      console.log('✅ Report saved to Firebase');
      return result;
    } catch (error) {
      console.error('❌ Failed to save report to Firebase:', error);
      // Don't show error to user - Firebase is optional
      return null;
    }
  };

  // On successful result, save to Firestore
  useEffect(() => {
    if (crawlResult && url) {
      const save = async () => {
        try {
          const firebaseResult = await addDoc(collection(db!, 'seoCrawlReports'), {
            uid: user?.uid || null,
            url,
            crawlResult,
            created: serverTimestamp(),
          });
          if (firebaseResult) {
            console.log('✅ Report saved to Firebase');
            if (user) loadReports(user.uid);
          } else {
            console.warn('⚠️ Report not saved (Firebase unavailable)');
          }
        } catch (error) {
          console.error('❌ Failed to save report to Firebase:', error);
          // Don't show error to user - Firebase is optional
        }
      };
      save();
    }
    // eslint-disable-next-line
  }, [crawlResult]);

  const handleDiscover = async () => {
    setLoading(true);
    setError(null);
    setDiscovered([]);
    setCrawlResult(null);

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, depth }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to discover URLs.');
      }

      const data: DiscoveredPage[] = await res.json();
      setDiscovered(data);
    } catch (err: any) {
      setError(err.message || 'Discovery failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (selectedUrls.length === 0) {
      setError('Please select at least one URL to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setCrawlResult(null);

    try {
      const { auth } = await import('@/lib/firebase');
      if (!auth) {
        throw new Error('Authentication not available. Please refresh the page.');
      }
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('Authentication required. Please log in to run crawls.');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log('🚀 Starting crawl request:', {
        apiUrl,
        selectedUrls,
        baseUrl: url,
        userAuthenticated: !!token
      });

      // Use new selective crawl endpoint
      const res = await fetch(`${apiUrl}/api/crawl/selected`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ urls: selectedUrls, baseUrl: url }),
      });

      console.log('📡 Crawl response status:', res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: `HTTP ${res.status} error` }));
        console.error('❌ Crawl request failed:', {
          status: res.status,
          statusText: res.statusText,
          data,
          url: res.url
        });
        
        // Provide specific error messages for different status codes
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log out and log back in.');
        } else if (res.status === 403) {
          throw new Error('Access denied. Please check your account permissions.');
        } else if (res.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again in a few minutes.');
        } else if (res.status === 408) {
          throw new Error('Request timed out. Please try with fewer pages or try again later.');
        } else {
          throw new Error(data.detail || data.message || data.error || `Analysis failed with status ${res.status}`);
        }
      }

      const result: CrawlResult = await res.json();
      console.log('✅ Crawl completed successfully:', {
        crawlId: result.crawlId,
        pageCount: result.pages?.length || 0,
        summaryTotalPages: result.summary?.totalPages || 0
      });

      setCrawlResult(result);
      setActiveTab('summary');
    } catch (err: any) {
      console.error('❌ Crawl error:', err);
      setError(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  // Export/share/report functions
  const handleExportPDF = () => exportComponentToPDF('seo-crawler-dashboard', 'seo-crawl-report.pdf');
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(crawlResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-crawl-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handlePrint = () => window.print();
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?url=' + encodeURIComponent(url));
    alert('Shareable link copied!');
  };

  const handleCSVExport = async () => {
    if (!crawlResult) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/api/export/csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crawlResult.pages),
      });

      if (!res.ok) throw new Error('Failed to generate CSV');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'crawl_results.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  return (
    <div className="min-h-screen px-2 sm:px-4 py-4 sm:py-8 bg-gray-50 dark:bg-[#0a0b1e]">
      <div className="max-w-7xl mx-auto">
        <RunCrawlForm
          url={url}
          depth={depth}
          loading={loading}
          error={error}
          onUrlChange={setUrl}
          onDepthChange={setDepth}
          onSubmit={handleDiscover}
        />

        {discovered.length > 0 && (
          <DiscoveredTable
            discovered={discovered}
            selected={selectedUrls}
            onToggle={(url) =>
              setSelectedUrls((prev) =>
                prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
              )
            }
            onAnalyze={handleAnalyze}
            loading={loading}
          />
        )}

        {crawlResult && (
          <div id="seo-crawler-dashboard" className="mt-6 sm:mt-10 px-2 sm:px-0">
            {/* Export/share/report buttons */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
              <button
                onClick={handleExportPDF}
                className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="hidden sm:inline">Export JSON</span>
                <span className="sm:hidden">JSON</span>
              </button>
              <button
                onClick={handleCSVExport}
                className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
              >
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="hidden sm:inline">Print Report</span>
                <span className="sm:hidden">Print</span>
              </button>
              <button
                onClick={handleShare}
                className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="hidden sm:inline">Share Link</span>
                <span className="sm:hidden">Share</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 max-w-4xl mx-auto">
              <TabCard
                label="Summary"
                icon={FileText}
                tab="summary"
                activeTab={activeTab}
                onClick={() => setActiveTab('summary')}
                bgColor="bg-purple-100 dark:bg-purple-900/40"
                activeColor="bg-purple-600"
              />
              <TabCard
                label="Detailed Results"
                icon={Search}
                tab="results"
                activeTab={activeTab}
                onClick={() => setActiveTab('results')}
                bgColor="bg-purple-100 dark:bg-purple-900/40"
                activeColor="bg-purple-600"
              />
            </div>

            {activeTab === 'summary' && (
              <>
                <CrawlSummary
                  summary={crawlResult.summary}
                  pages={crawlResult.pages}
                  aiSummaryText={crawlResult.aiSummaryText}
                />
              </>
            )}

            {activeTab === 'results' && (
              <>
                <ResultsTable pages={crawlResult.pages} />
              </>
            )}

            {/* Keyword Analysis Section */}
            <div className="mt-6 sm:mt-8 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/20 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-700">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Keyword Analysis Available
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                    Your crawl has been completed! You can now analyze keywords for all {crawlResult.pages.length} crawled pages. 
                    Get insights on keyword opportunities, ranking potential, and SEO optimization recommendations for each page.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500">✓</span>
                      <span>Keyword density analysis</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500">✓</span>
                      <span>Missing keyword opportunities</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500">✓</span>
                      <span>Competitor keyword gaps</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500">✓</span>
                      <span>Search volume insights</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500">✓</span>
                      <span>Ranking tracking</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500">✓</span>
                      <span>Trending keywords</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push(`/seo-crawler/keyword-tools?crawlId=${crawlResult.crawlId}`)}
                      className="px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Analyze Keywords for All Pages</span>
                    </button>
                    <button
                      onClick={() => router.push(`/seo-crawler/history`)}
                      className="px-4 sm:px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>View Crawl History</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reports (if user is logged in) */}
            {user && savedReports.length > 0 && (
              <div className="mt-6 sm:mt-8 bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Crawl Reports</h3>
                <div className="space-y-2">
                  {savedReports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{report.url}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Pages: {report.crawlResult?.pages?.length || 0} • {report.created?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setUrl(report.url);
                          setCrawlResult(report.crawlResult);
                        }}
                        className="self-end sm:self-auto px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabCard({ label, icon: Icon, tab, activeTab, onClick, bgColor, activeColor }: any) {
  const isActive = activeTab === tab;
  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-center justify-center px-4 sm:px-6 py-4 sm:py-6 rounded-lg border transition-all duration-300 ${
        isActive
          ? `${activeColor} text-white border-transparent shadow-md scale-105`
          : `${bgColor} text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:opacity-100 hover:scale-[1.02]`
      }`}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
      <span className="text-sm sm:text-lg font-semibold text-center">{label}</span>
    </button>
  );
}
