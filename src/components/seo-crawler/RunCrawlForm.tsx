'use client';

import { Loader2, SearchCheck } from 'lucide-react';

interface RunCrawlFormProps {
  url: string;
  depth: number;
  loading: boolean;
  error?: string | null;
  onUrlChange: (value: string) => void;
  onDepthChange: (value: number) => void;
  onSubmit: () => void;
}

export default function RunCrawlForm({
  url,
  depth,
  loading,
  error,
  onUrlChange,
  onDepthChange,
  onSubmit,
}: RunCrawlFormProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-xl border border-white/10 bg-white/5 dark:bg-gray-900/50 backdrop-blur-lg shadow-xl p-6 sm:p-8 transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          SEO Web Crawler <span className="text-sm block text-gray-500 dark:text-gray-400 font-normal">Phase 1: Discover URLs</span>
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter a website URL (e.g. https://example.com)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white/80 dark:bg-gray-800/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
          />
          <input
            type="number"
            placeholder="Depth (e.g. 1)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white/80 dark:bg-gray-800/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={depth}
            onChange={(e) => onDepthChange(Number(e.target.value))}
            min="0"
          />
          <button
            onClick={onSubmit}
            disabled={loading || !url}
            className={`w-full px-6 py-3 rounded text-white flex items-center justify-center font-semibold transition-all text-lg
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
          <div className="mt-4 text-red-600 dark:text-red-400 font-medium bg-red-500/10 p-3 rounded-lg text-center">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
      </div>
    </div>
  );
}
