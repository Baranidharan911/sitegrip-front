'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, ArrowLeft, Globe, Calendar, BarChart3, Share2 } from 'lucide-react';
import CrawlSummary from '@/components/seo-crawler/CrawlSummary';
import ResultsTable from '@/components/seo-crawler/ResultsTable';

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
    duplicateTitles: number;
    duplicateDescriptions: number;
    averageSeoScore: number;
    redirectChains: number;
    pagesWithSlowLoad: number;
    lowWordCountPages: number;
    mobileFriendlyPages: number;
    nonMobilePages: number;
  };
  pages: Array<{
    url: string;
    title?: string;
    statusCode: number;
    wordCount: number;
    issues: string[];
    redirectChain: string[];
    loadTime: number;
    pageSizeBytes: number;
    hasViewport: boolean;
    seoScore: number;
    lcp: number;
    cls: number;
    ttfb: number;
    linkedFrom?: string[];
    depth: number;
  }>;
  performance?: {
    crawlTime: number;
    avgLoadTime: number;
    totalSize: number;
  };
}

export default function CrawlDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [crawl, setCrawl] = useState<CrawlResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrawlDetails = async () => {
      if (!params.crawlId) return;

      // 1. Try fetching directly from backend REST API first
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/crawl/results/${params.crawlId}`);
        if (res.ok) {
          const data = await res.json();

          let domain = '';
          try {
            domain = data.url ? new URL(data.url).hostname : '';
          } catch {
            domain = data.url || '';
          }

          const crawlResult: CrawlResult = {
            crawlId: data.crawlId || (params.crawlId as string),
            url: data.url || '',
            domain,
            createdAt: data.crawledAt || data.createdAt || new Date().toISOString(),
            totalPages: data.summary?.totalPages || data.pages?.length || 0,
            depth: data.depth || 1,
            pages: data.pages || [],
            summary: {
              totalPages: data.summary?.totalPages || data.pages?.length || 0,
              missingTitles: data.summary?.missingTitles || 0,
              brokenLinks: data.summary?.brokenLinks || 0,
              orphanPages: data.summary?.orphanPages || 0,
              duplicateTitles: data.summary?.duplicateTitles || 0,
              duplicateDescriptions: data.summary?.duplicateDescriptions || 0,
              averageSeoScore: data.summary?.averageSeoScore || 0,
              redirectChains: data.summary?.redirectChains || 0,
              pagesWithSlowLoad: data.summary?.pagesWithSlowLoad || 0,
              lowWordCountPages: data.summary?.lowWordCountPages || 0,
              mobileFriendlyPages: data.summary?.mobileFriendlyPages || 0,
              nonMobilePages: data.summary?.nonMobilePages || 0
            },
            performance: {
              crawlTime: data.performance?.crawlTime || 0,
              avgLoadTime: data.performance?.avgLoadTime || 0,
              totalSize: data.performance?.totalSize || 0
            }
          };

          setCrawl(crawlResult);
          setLoading(false);
          return; // ✅ successfully loaded from backend – no need to hit Firestore
        }
      } catch (err) {
        console.warn('Remote crawl results fetch failed, falling back to Firestore:', err);
        // Intentionally fall through to Firestore logic below
      }

      // 2. Fallback: try loading from Firestore (legacy behaviour)
      try {
        const crawlDoc = await getDoc(doc(db, 'crawls', params.crawlId as string));

        if (!crawlDoc.exists()) {
          setError('Crawl not found');
          return;
        }

        const data = crawlDoc.data();
        let domain = '';
        try {
          domain = data.url ? new URL(data.url).hostname : '';
        } catch {
          domain = data.url || '';
        }

        setCrawl({
          crawlId: crawlDoc.id,
          url: data.url || '',
          domain,
          createdAt: data.crawledAt || data.createdAt || new Date().toISOString(),
          totalPages: data.summary?.totalPages || data.pages?.length || 0,
          userId: data.userId,
          depth: data.depth || 1,
          pages: data.pages || [],
          summary: {
            totalPages: data.summary?.totalPages || data.pages?.length || 0,
            missingTitles: data.summary?.missingTitles || 0,
            brokenLinks: data.summary?.brokenLinks || 0,
            orphanPages: data.summary?.orphanPages || 0,
            duplicateTitles: data.summary?.duplicateTitles || 0,
            duplicateDescriptions: data.summary?.duplicateDescriptions || 0,
            averageSeoScore: data.summary?.averageSeoScore || 0,
            redirectChains: data.summary?.redirectChains || 0,
            pagesWithSlowLoad: data.summary?.pagesWithSlowLoad || 0,
            lowWordCountPages: data.summary?.lowWordCountPages || data.pages?.filter((p: { wordCount: number }) => p.wordCount < 300).length || 0,
            mobileFriendlyPages: data.summary?.mobileFriendlyPages || data.pages?.filter((p: { hasViewport: boolean }) => p.hasViewport).length || 0,
            nonMobilePages: data.summary?.nonMobilePages || data.pages?.filter((p: { hasViewport: boolean }) => !p.hasViewport).length || 0
          },
          performance: {
            crawlTime: data.performance?.crawlTime || 0,
            avgLoadTime: data.performance?.avgLoadTime || 0,
            totalSize: data.performance?.totalSize || 0
          }
        });
      } catch (err: any) {
        console.error('Error fetching crawl details:', err);
        setError(err.message || 'Failed to load crawl details');
      } finally {
        setLoading(false);
      }
    };

    fetchCrawlDetails();
  }, [params.crawlId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-4 text-gray-500">Loading crawl details...</p>
      </div>
    );
  }

  if (error || !crawl) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-semibold">{error || 'Failed to load crawl details'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Crawl Details
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Globe className="w-5 h-5" />
            <span>{crawl.domain}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-5 h-5" />
            <span>{new Date(crawl.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <BarChart3 className="w-5 h-5" />
            <span>{crawl.totalPages} Pages</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <Share2 className="w-5 h-5" />
            <span>Depth: {crawl.depth}</span>
          </div>
        </div>

        <div className="space-y-8">
          <CrawlSummary
            summary={crawl.summary}
            pages={crawl.pages}
          />
          <ResultsTable pages={crawl.pages} />
        </div>
      </div>
    </div>
  );
} 