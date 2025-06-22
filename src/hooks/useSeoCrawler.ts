'use client';

import { useState } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Issue {
  page: string;
  issue: string;
  source?: 'live' | 'history';
}

export function useSeoCrawler() {
  const [status, setStatus] = useState('Idle');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Issue[]>([]);
  const [summary, setSummary] = useState({ issues: 0, pagesCrawled: 0, duration: 0 });

  const [historyUrls, setHistoryUrls] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState('');

  const handleCrawl = async (url: string) => {
    setIsLoading(true);
    setStatus('Crawling...');
    setResults([]);
    setSummary({ issues: 0, pagesCrawled: 0, duration: 0 });

    const start = performance.now();

    const mockResults: Issue[] = [
      { page: `${url}/about`, issue: 'Missing meta description', source: 'live' },
      { page: `${url}/products`, issue: 'Broken image link', source: 'live' },
      { page: `${url}/`, issue: 'Title tag too short', source: 'live' },
    ];

    await new Promise((res) => setTimeout(res, 2500));

    const duration = Math.round((performance.now() - start) / 1000);

    setResults(mockResults);
    setSummary({ issues: mockResults.length, pagesCrawled: 3, duration });
    setStatus('Completed');

    await addDoc(collection(db, 'seoCrawls'), {
      url,
      crawledAt: Timestamp.now(),
      issues: mockResults,
      durationMs: duration * 1000,
    });

    setIsLoading(false);
  };

  const loadHistoryUrls = async () => {
    const q = query(collection(db, 'seoCrawls'), orderBy('crawledAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    const urls = snapshot.docs.map((doc) => doc.data().url);
    setHistoryUrls(Array.from(new Set(urls)));
  };

  const loadCrawlByUrl = async (url: string) => {
    setIsLoading(true);
    const q = query(collection(db, 'seoCrawls'), orderBy('crawledAt', 'desc'));
    const snapshot = await getDocs(q);
    const crawls = snapshot.docs.map((doc) => doc.data());
    const latest = crawls.find((c) => c.url === url);

    if (latest) {
      const loadedResults = latest.issues.map((i: any) => ({
        ...i,
        source: 'history',
      }));

      setResults(loadedResults);
      setSummary({
        issues: loadedResults.length,
        pagesCrawled: 3,
        duration: Math.round((latest.durationMs || 0) / 1000),
      });
      setStatus('Loaded from History');
    }

    setIsLoading(false);
  };

  return {
    status,
    isLoading,
    results,
    summary,
    handleCrawl,
    historyUrls,
    loadHistoryUrls,
    selectedHistory,
    setSelectedHistory,
    loadCrawlByUrl,
  };
}
