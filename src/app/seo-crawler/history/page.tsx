'use client';

import CrawlHistory from '@/components/seo-crawler/CrawlHistory';

export default function SeoCrawlerHistoryPage() {
  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <CrawlHistory />
      </div>
    </div>
  );
}
