'use client';

import dynamic from 'next/dynamic';

// ⛑ Disable SSR for CrawlHistory to fix hydration mismatch
const CrawlHistory = dynamic(() => import('@/components/seo-crawler/CrawlHistory'), { ssr: false });

export default function CrawlHistoryPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 py-10 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">📜 Crawl History</h1>
        <CrawlHistory />
      </div>
    </div>
  );
}
