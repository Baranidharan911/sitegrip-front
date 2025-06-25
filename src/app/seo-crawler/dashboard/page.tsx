'use client';

import { useState } from 'react';
import RunCrawlForm from '@/components/seo-crawler/RunCrawlForm';
import CrawlSummary from '@/components/seo-crawler/CrawlSummary';
import ResultsTable from '@/components/seo-crawler/ResultsTable';
import DiscoveredTable from '@/components/seo-crawler/DiscoveredTable';
import KeywordSummary from '@/components/seo-crawler/KeywordSummary';
import KeywordTable from '@/components/seo-crawler/KeywordTable';

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
  seoScore: number; // ✅ Add this line
  lcp: number;    // ✅ Add this
  cls: number;    // ✅ Add this
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
}

interface DiscoveredPage {
  url: string;
  statusCode: number;
  title?: string;
  depth: number;
  fromSitemap: boolean;
}

export default function SeoCrawlerDashboardPage() {
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
      const res = await fetch('https://webwatch-api-pu22v4ao5a-uc.a.run.app/api/discover', {
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
    setLoading(true);
    setError(null);
    setCrawlResult(null);

    try {
      const res = await fetch('https://webwatch-api-pu22v4ao5a-uc.a.run.app/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, depth, selectedUrls }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Analysis failed.');
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
    if (!crawlResult) return;

    try {
      const res = await fetch('https://webwatch-api-pu22v4ao5a-uc.a.run.app/api/export/csv', {
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
                  pages={crawlResult.pages}
                  aiSummaryText={(crawlResult as any).aiSummaryText}
                />
                <KeywordSummary domain={new URL(url).hostname} />
              </>
            )}

            {activeTab === 'results' && (
              <>
                <ResultsTable pages={crawlResult.pages} />
                <KeywordTable url={url} pages={crawlResult.pages} />
              </>
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
