'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, ArrowLeft, Globe, Calendar, BarChart3, Share2 } from 'lucide-react';
import CrawlSummary from '@/components/seo-crawler/CrawlSummary';
import ResultsTable from '@/components/seo-crawler/ResultsTable';

export default function CrawlDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [crawl, setCrawl] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrawlFromFirestore = async () => {
      const crawlId = params.crawlId as string;
      if (!crawlId) return;

      try {
        const docRef = doc(db, 'crawls', crawlId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Crawl not found.');
          return;
        }

        const data = docSnap.data();
        const domain = data.url ? new URL(data.url).hostname : '';

        setCrawl({
          crawlId,
          url: data.url || '',
          domain,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          depth: data.depth || 1,
          pages: data.pages || [],
          summary: data.summary || {
            totalPages: data.pages?.length || 0,
            missingTitles: 0,
            brokenLinks: 0,
            orphanPages: 0,
            duplicateTitles: 0,
            duplicateDescriptions: 0,
            averageSeoScore: 0,
            redirectChains: 0,
            pagesWithSlowLoad: 0,
            lowWordCountPages: 0,
            mobileFriendlyPages: 0,
            nonMobilePages: 0,
          },
        });
      } catch (err: any) {
        console.error(err);
        setError('Error fetching crawl data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCrawlFromFirestore();
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
        <p className="text-red-500 font-semibold">{error || 'Failed to load crawl.'}</p>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Crawl Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5" /><span>{crawl.domain}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" /><span>{new Date(crawl.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" /><span>{crawl.summary.totalPages} Pages</span>
          </div>
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" /><span>Depth: {crawl.depth}</span>
          </div>
        </div>

        <div className="space-y-8">
          <CrawlSummary summary={crawl.summary} pages={crawl.pages} />
          <ResultsTable pages={crawl.pages} />
        </div>
      </div>
    </div>
  );
}
