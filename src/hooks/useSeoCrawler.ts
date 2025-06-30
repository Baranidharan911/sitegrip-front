'use client';

import { useState } from 'react';
import { indexingApi } from '../lib/indexingApi';

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

    try {
      // Use the authenticated backend API
      const crawlResult = await indexingApi.crawlUrl(url, {
        depth: 2,
        waitForJs: true
      });

      const duration = Math.round((performance.now() - start) / 1000);

      // Process the crawl results into issues format
      const issues: Issue[] = [];
      if (crawlResult.pages) {
        crawlResult.pages.forEach((page: any) => {
          // Add SEO issues based on page analysis
          if (!page.title || page.title.length < 30) {
            issues.push({ page: page.url, issue: 'Title tag too short', source: 'live' });
          }
          if (!page.meta_description || page.meta_description.length < 120) {
            issues.push({ page: page.url, issue: 'Missing or short meta description', source: 'live' });
          }
          if (page.status_code >= 400) {
            issues.push({ page: page.url, issue: `HTTP ${page.status_code} error`, source: 'live' });
          }
          // Add more SEO checks as needed
        });
      }

      setResults(issues);
      setSummary({ 
        issues: issues.length, 
        pagesCrawled: crawlResult.pages?.length || 0, 
        duration 
      });
      setStatus('Completed');

    } catch (error) {
      console.error('Crawl failed:', error);
      setStatus('Failed');
      setResults([{ page: url, issue: 'Crawl failed - please try again', source: 'live' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistoryUrls = async () => {
    try {
      // Get crawl history from the backend
      const history = await indexingApi.getIndexingHistory(1, 50);
      const urls = history.entries
        .filter((entry: any) => entry.url)
        .map((entry: any) => entry.url);
      setHistoryUrls(Array.from(new Set(urls)));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadCrawlByUrl = async (url: string) => {
    setIsLoading(true);
    try {
      // Get crawl history for the specific URL
      const history = await indexingApi.getIndexingHistory(1, 100);
      const urlEntries = history.entries.filter((entry: any) => entry.url === url);
      
      if (urlEntries.length > 0) {
        const latest = urlEntries[0];
        
        // Since indexing history doesn't have crawl-specific data, 
        // we'll show basic information
        const loadedResults = [{
          page: url,
          issue: `Last indexed: ${new Date(latest.created_at).toLocaleDateString()}`,
          source: 'history' as const
        }];

        setResults(loadedResults);
        setSummary({
          issues: 1,
          pagesCrawled: 1,
          duration: 0,
        });
        setStatus('Loaded from History');
      } else {
        setResults([{ page: url, issue: 'No crawl history found for this URL', source: 'history' }]);
        setStatus('No History');
      }
    } catch (error) {
      console.error('Failed to load crawl history:', error);
      setResults([{ page: url, issue: 'Failed to load history', source: 'history' }]);
    } finally {
      setIsLoading(false);
    }
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
