'use client';

import { useEffect, useState } from 'react';
import ResultsTable from './ResultsTable';
import CrawlSummary from './CrawlSummary';
import { ChevronDown, Loader2, Smartphone } from 'lucide-react';
import { format } from 'date-fns';

interface AISuggestions {
  title: string;
  metaDescription: string;
  content: string;
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

interface CrawlHistoryEntry {
  crawlId: string;
  url: string;
  crawledAt: string;
  summary: CrawlSummaryData;
  pages: PageData[];
}

export default function CrawlHistory() {
  const [crawls, setCrawls] = useState<CrawlHistoryEntry[]>([]);
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/history');
        if (!response.ok) throw new Error('Failed to fetch crawl history from the server.');
        const data: CrawlHistoryEntry[] = await response.json();
        setCrawls(data);

        const dateMap: Record<string, string> = {};
        data.forEach((entry) => {
          dateMap[entry.crawlId] = format(new Date(entry.crawledAt), 'PPpp');
        });
        setFormattedDates(dateMap);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-4 text-gray-500">Loading crawl history...</p>
      </div>
    );
  }

  if (error) {
    return <p className="p-6 text-center text-red-500 font-semibold">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {crawls.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 p-8 bg-white dark:bg-gray-900/50 rounded-lg">
          No crawl history found. Run a crawl on the dashboard to see results here.
        </p>
      ) : (
        crawls.map((crawl) => {
          const isOpen = crawl.crawlId === expandedId;
          return (
            <div key={crawl.crawlId} className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-900/50 transition-all duration-300">
              <button onClick={() => toggleExpand(crawl.crawlId)} className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 focus:outline-none">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">{crawl.url}</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                      {formattedDates[crawl.crawlId] || '...'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1">
                  <span>📄 Pages: {crawl.summary.totalPages}</span>
                  <span className={crawl.summary.brokenLinks > 0 ? 'text-red-500 font-semibold' : ''}>🔗 Broken: {crawl.summary.brokenLinks}</span>
                  <span className={crawl.summary.pagesWithSlowLoad > 0 ? 'text-yellow-600 font-semibold' : ''}>🐢 Slow: {crawl.summary.pagesWithSlowLoad}</span>
                  <span className={crawl.summary.nonMobilePages > 0 ? 'text-red-500 font-semibold' : ''}>
                    <Smartphone size={14} className="inline-block mr-1" /> Unfriendly: {crawl.summary.nonMobilePages}
                  </span>
                </div>
              </button>
              {isOpen && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-6 bg-gray-50/50 dark:bg-black/20">
                  <CrawlSummary summary={crawl.summary} pages={crawl.pages} />
                  <ResultsTable pages={crawl.pages} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
