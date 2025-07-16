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
            <div key={crawl.crawlId} className="border rounded-lg bg-white dark:bg-gray-900/50 p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-blue-700 dark:text-blue-300 font-medium text-lg">{crawl.url}</h3>
                  <p className="text-sm text-gray-500">
                    {crawl.createdAt ? new Date(crawl.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <CrawlSummary summary={crawl.summary} pages={crawl.pages} />
              <ResultsTable pages={crawl.pages} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
