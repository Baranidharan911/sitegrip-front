'use client';

import { Loader2, SearchCheck } from 'lucide-react';

interface RunCrawlFormProps {
  url: string;
  depth: number;
  loading: boolean;
  error?: string | null;
  onUrlChange: (value: string) => void;
  onDepthChange: (value: number) => void;
  onOptionsChange: (options: Partial<CrawlOptionsUI>) => void;
  options: CrawlOptionsUI;
  onSubmit: () => void;
}

export interface CrawlOptionsUI {
  userAgent: string;
  respectRobots: boolean;
  includeExternalLinks: boolean;
  maxPages: number;
}

export default function RunCrawlForm({
  url,
  depth,
  loading,
  error,
  onUrlChange,
  onDepthChange,
  onOptionsChange,
  options,
  onSubmit,
}: RunCrawlFormProps) {
  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-6 lg:px-8 py-8">
      <div className="rounded-2xl border border-white/10 bg-white/30 dark:bg-gray-900/50 backdrop-blur-xl shadow-2xl p-6 sm:p-8 transition-all duration-300">
        <h1 className="text-sm sm:text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">
          SEO Web Crawler
        </h1>


        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Website URL</label>
            <input
              type="text"
              placeholder="e.g. https://example.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Crawl Depth</label>
            <input
              type="number"
              placeholder="e.g. 1"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={depth}
              onChange={(e) => onDepthChange(Number(e.target.value))}
              min="0"
            />
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">User Agent</label>
              <input
                type="text"
                placeholder="Mozilla/5.0..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={options.userAgent}
                onChange={(e) => onOptionsChange({ userAgent: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">Max Pages</label>
              <input
                type="number"
                min={1}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={options.maxPages}
                onChange={(e) => onOptionsChange({ maxPages: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="respectRobots"
                type="checkbox"
                checked={options.respectRobots}
                onChange={(e) => onOptionsChange({ respectRobots: e.target.checked })}
              />
              <label htmlFor="respectRobots" className="text-sm text-gray-700 dark:text-gray-300">Respect robots.txt</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="includeExternalLinks"
                type="checkbox"
                checked={options.includeExternalLinks}
                onChange={(e) => onOptionsChange({ includeExternalLinks: e.target.checked })}
              />
              <label htmlFor="includeExternalLinks" className="text-sm text-gray-700 dark:text-gray-300">Include external links</label>
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={loading || !url}
            className={`w-full px-2 py-3 rounded-xl text-white flex items-center justify-center font-semibold transition-all text-base sm:text-lg
              ${loading || !url
                ? 'bg-blue-400 dark:bg-blue-800 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transform hover:scale-[1.02]'}`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                Discovering...
              </>
            ) : (
              <>
                <SearchCheck className="h-5 w-5 mr-2" />
                Discover Pages
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-5 text-red-600 dark:text-red-400 font-medium bg-red-500/10 p-3 rounded-lg text-center">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
      </div>
    </div>
  );
}
