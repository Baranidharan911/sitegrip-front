'use client';

import React, { useState } from 'react';
import VisualSitemap from '@/components/seo-crawler/VisualSitemap';
import { Loader2, Search } from 'lucide-react';

interface SitemapNode {
  url: string;
  children: SitemapNode[];
}

export default function SitemapPage() {
  const [sitemapTree, setSitemapTree] = useState<SitemapNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const handleFetch = async () => {
    if (!inputUrl.trim()) return;
    setLoading(true);
    setError(null);
    setSitemapTree(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app';
      const res = await fetch(`${apiUrl}/api/sitemap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to fetch sitemap');
      }

      const tree = await res.json();
      setSitemapTree(tree);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Header Section */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto space-y-3 text-center">
          <h1 className="text-3xl font-bold">Visual Sitemap Viewer</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Enter a website URL to generate and explore its visual sitemap.
          </p>
        </div>

        <div className="mt-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {error && (
          <div className="mt-4 max-w-2xl mx-auto bg-red-100 text-red-700 px-4 py-3 rounded-md border border-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Visual Sitemap Full-Screen Container */}
      <div className="flex-1 overflow-auto">
        {sitemapTree && !loading && (
          <div className="w-full h-full p-4">
            <VisualSitemap tree={sitemapTree} />
          </div>
        )}
      </div>
    </div>
  );
}
