'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthInstance, getFirestoreInstance } from '@/lib/firebase.js';
import { Loader2, RefreshCw } from 'lucide-react';
import CrawlSummary from '@/components/seo-crawler/CrawlSummary';
import ResultsTable from '@/components/seo-crawler/ResultsTable';

function MetricBadge({ label, value, good = false, bad = false }: { label: string; value: string | number; good?: boolean; bad?: boolean }) {
  const color = bad ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : good ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{label}: {value}</div>
  );
}

function CrawlHistoryItem({ crawl }: { crawl: any }) {
  const [tab, setTab] = useState<'overview' | 'insights' | 'pages'>('overview');
  const firstPage = (crawl.pages && crawl.pages[0]) || {};
  const perf = firstPage.advanced?.performance || firstPage.performance || {};
  const social = firstPage.advanced?.socialMedia || firstPage.socialMedia || {};
  const structured = firstPage.advanced?.structuredData || firstPage.structuredData || {};
  const images = firstPage.advanced?.images || firstPage.images || [];
  const linkAnalysis = firstPage.linkAnalysis || {};

  const createdAt = crawl.createdAt ? new Date(crawl.createdAt).toLocaleString() : 'N/A';
  const domain = crawl.url ? (() => { try { return new URL(crawl.url).hostname; } catch { return crawl.url; } })() : '';

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900/50 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-blue-700 dark:text-blue-300 font-medium text-lg break-all">{domain}</h3>
          <p className="text-sm text-gray-500">{createdAt}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricBadge label="Pages" value={crawl.summary?.totalPages ?? crawl.pages?.length ?? 0} />
          {'averageSeoScore' in (crawl.summary || {}) && (
            <MetricBadge label="Avg Score" value={crawl.summary?.averageSeoScore ?? crawl.summary?.avgSeoScore ?? 0} good={(crawl.summary?.averageSeoScore ?? 0) >= 70} bad={(crawl.summary?.averageSeoScore ?? 0) < 40} />
          )}
          <MetricBadge label="Broken" value={crawl.summary?.brokenLinks ?? 0} bad={(crawl.summary?.brokenLinks ?? 0) > 0} />
          <MetricBadge label="Redirects" value={crawl.summary?.redirectChains ?? 0} bad={(crawl.summary?.redirectChains ?? 0) > 0} />
          <MetricBadge label="Slow" value={crawl.summary?.pagesWithSlowLoad ?? 0} bad={(crawl.summary?.pagesWithSlowLoad ?? 0) > 0} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('overview')} className={`px-3 py-1 rounded ${tab==='overview'?'bg-purple-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Overview</button>
        <button onClick={() => setTab('insights')} className={`px-3 py-1 rounded ${tab==='insights'?'bg-purple-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Insights</button>
        <button onClick={() => setTab('pages')} className={`px-3 py-1 rounded ${tab==='pages'?'bg-purple-600 text-white':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>Pages</button>
      </div>

      {tab === 'overview' && (
        <CrawlSummary summary={crawl.summary} pages={crawl.pages} />
      )}

      {tab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Performance</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div>Load Time: <span className="font-semibold">{(perf.loadTime ?? firstPage.loadTime ?? 0).toFixed ? (perf.loadTime ?? firstPage.loadTime).toFixed(2) : (perf.loadTime ?? firstPage.loadTime ?? 0)}</span>s</div>
              <div>TTFB: <span className="font-semibold">{(perf.ttfb ?? firstPage.ttfb ?? 0).toFixed ? (perf.ttfb ?? firstPage.ttfb).toFixed(2) : (perf.ttfb ?? firstPage.ttfb ?? 0)}</span>s</div>
              <div>LCP: <span className="font-semibold">{(perf.lcp ?? firstPage.lcp ?? 0).toFixed ? (perf.lcp ?? firstPage.lcp).toFixed(2) : (perf.lcp ?? firstPage.lcp ?? 0)}</span>s</div>
              <div>CLS: <span className="font-semibold">{(perf.cls ?? firstPage.cls ?? 0).toFixed ? (perf.cls ?? firstPage.cls).toFixed(2) : (perf.cls ?? firstPage.cls ?? 0)}</span></div>
              <div>Size: <span className="font-semibold">{(perf.pageSizeBytes ?? firstPage.pageSizeBytes ?? 0)}</span> bytes</div>
              <div>Resources: <span className="font-semibold">{perf.resourcesCount ?? '-'}</span></div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Technical</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <MetricBadge label="Viewport" value={firstPage.hasViewport ? 'Yes' : 'No'} good={!!firstPage.hasViewport} bad={!firstPage.hasViewport} />
              <MetricBadge label="Canonical" value={firstPage.technical?.canonical ? 'Yes' : 'No'} good={!!firstPage.technical?.canonical} />
              <MetricBadge label="Language" value={firstPage.technical?.language || 'N/A'} />
              <MetricBadge label="Charset" value={firstPage.technical?.charset || 'N/A'} />
              <MetricBadge label="Issues" value={(firstPage.issues?.length ?? 0)} bad={(firstPage.issues?.length ?? 0) > 0} />
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Social & Structured</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <MetricBadge label="OpenGraph" value={social?.openGraph ? 'Yes' : 'No'} good={!!social?.openGraph} />
              <MetricBadge label="Twitter Card" value={social?.twitterCard ? 'Yes' : 'No'} good={!!social?.twitterCard} />
              <MetricBadge label="Structured Data" value={structured?.hasStructuredData ? 'Yes' : 'No'} good={!!structured?.hasStructuredData} />
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Images & Links</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <MetricBadge label="Images" value={images?.length ?? 0} />
              <MetricBadge label="No Alt" value={firstPage.imagesWithoutAltCount ?? 0} bad={(firstPage.imagesWithoutAltCount ?? 0) > 0} />
              <MetricBadge label="Internal Links" value={linkAnalysis?.internalCount ?? firstPage.internalLinks?.length ?? 0} />
              <MetricBadge label="External Links" value={linkAnalysis?.externalCount ?? 0} />
              <MetricBadge label="NoFollow" value={linkAnalysis?.nofollowCount ?? 0} />
            </div>
          </div>
        </div>
      )}

      {tab === 'pages' && (
        <ResultsTable pages={crawl.pages} />
      )}
    </div>
  );
}

export default function CrawlHistory() {
  const [crawls, setCrawls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const db = getFirestoreInstance();
  if (!db) return null;
  const crawlCollection = collection(db, 'crawls');

  const fetchCrawls = async (userId: string) => {
    try {
      const q = query(
        crawlCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          crawlId: doc.id,
          url: data.url,
          userId: data.userId,
          createdAt: data.createdAt?.toDate().toISOString() || null,
          summary: data.summary || {},
          pages: data.pages || [],
        };
      });
      setCrawls(results);
    } catch (err: any) {
      setError('Error loading crawl history');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const auth = getAuthInstance();
    if (!auth) {
      setError('Please log in to see crawl history.');
      setLoading(false);
      return;
    }
    
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError('Please log in to see crawl history.');
        setLoading(false);
        return;
      }
      fetchCrawls(user.uid);
    });
  }, []);

  const handleRefresh = async () => {
    const auth = getAuthInstance();
    if (!auth) return;
    const user = auth?.currentUser;
    if (!user) return;
    setRefreshing(true);
    await fetchCrawls(user.uid);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Crawl History</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="ml-2">Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-500">Loading crawl history...</span>
        </div>
      ) : error ? (
        <p className="text-center text-red-500 font-semibold mt-4">{error}</p>
      ) : crawls.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 py-10">No crawl data found.</p>
      ) : (
        <div className="space-y-6">
          {crawls.map((crawl) => (
            <CrawlHistoryItem key={crawl.crawlId} crawl={crawl} />
          ))}
        </div>
      )}
    </div>
  );
}
