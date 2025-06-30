'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import RunCrawlForm from '@/components/seo-crawler/RunCrawlForm';
import CrawlSummary from '@/components/seo-crawler/CrawlSummary';
import ResultsTable from '@/components/seo-crawler/ResultsTable';
import DiscoveredTable from '@/components/seo-crawler/DiscoveredTable';

import { FileText, Search, Download } from 'lucide-react';

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
  pages?: PageData[];
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

  const handleDiscover = async () => {
    setLoading(true);
    setError(null);
    setDiscovered([]);
    setCrawlResult(null);

    try {
      // Validate URL before sending request
      if (!url.trim()) {
        throw new Error('Please enter a valid URL');
      }

      // Get Firebase auth token for authentication
      const { auth } = await import('@/lib/firebase');
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add authentication token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const requestBody = { url: url.trim(), depth };
      console.log('🔍 [Frontend] Sending discovery request:', {
        url: `${apiUrl}/api/discover`,
        method: 'POST',
        headers,
        body: requestBody
      });
      
      const res = await fetch(`${apiUrl}/api/discover`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('🔍 [Frontend] Discovery response status:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('🔍 [Frontend] Discovery error response:', errorData);
        const errorMessage = errorData.detail || errorData.message || `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(errorMessage);
      }

      const data: DiscoveredPage[] = await res.json();
      console.log('🔍 [Frontend] Discovery success:', data.length, 'pages found');
      setDiscovered(data);
    } catch (err: any) {
      console.error('❌ [Frontend] Discovery error:', err);
      setError(err.message || 'Discovery failed. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setCrawlResult(null);

    try {
      // Get Firebase auth token for authentication
      const { auth } = await import('@/lib/firebase');
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      
      if (!token) {
        throw new Error('Authentication required. Please log in to run crawls.');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      // Use new selective crawl endpoint
      const res = await fetch(`${apiUrl}/api/crawl/selected`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ urls: selectedUrls, baseUrl: url }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || data.message || 'Analysis failed.');
      }

      const result: CrawlResult = await res.json();
      setCrawlResult(result);
      setActiveTab('summary');
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVExport = async () => {
    if (!crawlResult || !crawlResult.pages) return;

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
    <div className="min-h-screen px-4 py-8 bg-gray-50 dark:bg-gray-950">
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

        {discovered && discovered.length > 0 && (
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
          <div className="mt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-4xl mx-auto">
              <TabCard
                label="Summary"
                icon={FileText}
                tab="summary"
                activeTab={activeTab}
                onClick={() => setActiveTab('summary')}
                bgColor="bg-blue-100 dark:bg-blue-900/40"
                activeColor="bg-blue-600"
              />
              <TabCard
                label="Detailed Results"
                icon={Search}
                tab="results"
                activeTab={activeTab}
                onClick={() => setActiveTab('results')}
                bgColor="bg-green-100 dark:bg-green-900/40"
                activeColor="bg-green-600"
              />
            </div>

            <div className="flex justify-end mb-6">
              <button
                onClick={handleCSVExport}
                className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </button>
            </div>

            {activeTab === 'summary' && (
              <>
                <CrawlSummary
                  summary={crawlResult.summary}
                  pages={crawlResult.pages || []}
                  aiSummaryText={crawlResult.aiSummaryText}
                />
              </>
            )}

            {activeTab === 'results' && (
              <>
                <ResultsTable pages={crawlResult.pages || []} />
              </>
            )}

            {/* Keyword Analysis Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🔍</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Keyword Analysis Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your crawl has been completed! You can now analyze keywords for all {crawlResult.pages?.length || 0} crawled pages. 
                    Get insights on keyword opportunities, ranking potential, and SEO optimization recommendations for each page.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500">✓</span>
                      <span>Keyword density analysis</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500">✓</span>
                      <span>Missing keyword opportunities</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500">✓</span>
                      <span>Competitor keyword gaps</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500">✓</span>
                      <span>Search volume insights</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500">✓</span>
                      <span>Ranking tracking</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500">✓</span>
                      <span>Trending keywords</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push(`/seo-crawler/keyword-tools?crawlId=${crawlResult.crawlId}`)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>🚀</span>
                      <span>Analyze Keywords for All Pages</span>
                    </button>
                    <button
                      onClick={() => router.push(`/seo-crawler/history`)}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>📚</span>
                      <span>View Crawl History</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
      className={`w-full flex flex-col items-center justify-center px-6 py-6 rounded-lg border transition-all duration-300 ${
        isActive
          ? `${activeColor} text-white border-transparent shadow-md scale-105`
          : `${bgColor} text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:opacity-100 hover:scale-[1.02]`
      }`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-lg font-semibold">{label}</span>
    </button>
  );
}
