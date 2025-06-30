'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

interface DiscoveredPage {
  url: string;
  statusCode: number;
  title?: string;
  depth: number;
  fromSitemap: boolean;
}

interface DiscoveredTableProps {
  discovered?: DiscoveredPage[];
  selected: string[];
  onToggle: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function DiscoveredTable({
  discovered = [],
  selected,
  onToggle,
  onAnalyze,
  loading,
}: DiscoveredTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((discovered.length || 0) / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return discovered.slice(start, start + ITEMS_PER_PAGE);
  }, [discovered, page]);

  const allSelected = useMemo(
    () => discovered.length > 0 && discovered.every((page) => selected.includes(page.url)),
    [discovered, selected]
  );

  const toggleAll = () => {
    if (allSelected) {
      discovered.forEach((page) => onToggle(page.url));
    } else {
      discovered
        .filter((page) => !selected.includes(page.url))
        .forEach((page) => onToggle(page.url));
    }
  };


  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className="bg-white dark:bg-gray-900/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🔍 Discovered Pages</h2>

      {loading && (
        <div className="flex justify-center items-center p-6 text-blue-600 dark:text-blue-400">
          <Loader2 className="animate-spin mr-2" /> Analyzing...
        </div>
      )}

      {/* Mobile Card View with Select All */}
      <div className="sm:hidden space-y-4">
        {/* Select All for Mobile */}
        <div className="flex items-center mb-3 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="mr-2"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">Select All on This Page</label>
        </div>

        {paginated.map((page) => (
          <div key={page.url} className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selected.includes(page.url)}
                onChange={() => onToggle(page.url)}
                className="mr-2"
              />
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-300 font-medium truncate"
              >
                {page.url}
              </a>
              <ExternalLink className="h-4 w-4 ml-1" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Title: {page.title || <em>No Title</em>}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Status: <span className={page.statusCode >= 400 ? 'text-red-500' : 'text-green-600'}>{page.statusCode}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Depth: {page.depth}
            </p>
            <p className="text-sm">
              From Sitemap:{' '}
              {page.fromSitemap ? (
                <CheckCircle className="h-4 w-4 text-green-500 inline-block" />
              ) : (
                <span className="text-red-500">✖</span>
              )}
            </p>
          </div>
        ))}
      </div>


      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
            <tr>
              <th className="px-4 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="px-4 py-2 text-left">URL</th>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Depth</th>
              <th className="px-4 py-2">From Sitemap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginated.map((page) => (
              <tr key={page.url} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(page.url)}
                    onChange={() => onToggle(page.url)}
                  />
                </td>
                <td className="px-4 py-2 max-w-xs truncate">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-300 hover:underline"
                  >
                    {page.url}
                  </a>
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                  {page.title || <em className="text-gray-400">No Title</em>}
                </td>
                <td className="px-4 py-2 text-center text-sm font-semibold">
                  <span className={page.statusCode >= 400 ? 'text-red-600' : 'text-green-600'}>
                    {page.statusCode}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">{page.depth}</td>
                <td className="px-4 py-2 text-center">
                  {page.fromSitemap ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                  ) : (
                    <span className="text-red-500">✖</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* Analyze Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onAnalyze}
          disabled={selected.length === 0 || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze Selected'}
        </button>
      </div>
    </div>
  );
}
