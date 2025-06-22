'use client';

import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscoveredPage {
  url: string;
  statusCode: number;
  title?: string;
  depth: number;
  fromSitemap: boolean;
}

interface DiscoveredTableProps {
  discovered: DiscoveredPage[];
  selected: string[];
  onToggle: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function DiscoveredTable({
  discovered,
  selected,
  onToggle,
  onAnalyze,
  loading,
}: DiscoveredTableProps) {
  const allSelected = useMemo(
    () => discovered.length > 0 && selected.length === discovered.length,
    [discovered, selected]
  );

  const handleSelectAll = () => {
    if (allSelected) {
      discovered.forEach((page) => onToggle(page.url));
    } else {
      discovered
        .filter((page) => !selected.includes(page.url))
        .forEach((page) => onToggle(page.url));
    }
  };

  return (
    <div className="mt-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900/50 shadow-xl overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">🔍 Discovered Pages</h2>
        <button
          onClick={onAnalyze}
          disabled={selected.length === 0 || loading}
          className={`px-5 py-2 rounded-md text-white font-medium transition-all duration-200 ${
            loading || selected.length === 0
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Analyze Selected (${selected.length})`}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-left">
              <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              </th>
              <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">URL</th>
              <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">Status</th>
              <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">Title</th>
              <th className="px-4 py-3">Sitemap</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {discovered.map((page) => (
                <motion.tr
                  key={page.url}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      checked={selected.includes(page.url)}
                      onChange={() => onToggle(page.url)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-700 max-w-xs truncate">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      title={page.url}
                    >
                      {page.url}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    {page.statusCode}
                  </td>
                  <td
                    className="px-4 py-2 border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 max-w-sm truncate"
                    title={page.title || 'No Title'}
                  >
                    {page.title || <span className="italic text-gray-400">No Title</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {page.fromSitemap ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
