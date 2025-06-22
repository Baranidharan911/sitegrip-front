'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Cpu,
  ExternalLink,
  Lightbulb,
  Sparkles,
  X
} from 'lucide-react';

interface AISuggestions {
  title: string;
  metaDescription: string;
  content: string;
}

interface PageData {
  url: string;
  title?: string;
  statusCode: number;
  wordCount: number;
  issues: string[];
  redirectChain: string[];
  consoleErrors?: string[];
  loadTime: number;
  hasSchema?: boolean;
  pageSizeBytes: number;
  hasViewport: boolean;
  suggestions?: AISuggestions;
  seoScore: number;
  lcp: number;
  cls: number;
  ttfb: number;
  linkedFrom?: string[];
  depth: number;
  mobileScreenshot?: string;
  desktopScreenshot?: string;

}

interface ResultsTableProps {
  pages: PageData[];
}

const getColorForLCP = (lcp: number) =>
  lcp > 4 ? 'text-red-600' : lcp > 2.5 ? 'text-yellow-600' : 'text-green-600';
const getColorForCLS = (cls: number) =>
  cls > 0.25 ? 'text-red-600' : cls > 0.1 ? 'text-yellow-600' : 'text-green-600';
const getColorForTTFB = (ttfb: number) =>
  ttfb > 0.6 ? 'text-red-600' : ttfb > 0.2 ? 'text-yellow-600' : 'text-green-600';

const AISuggestionsCard = ({ suggestions }: { suggestions: AISuggestions }) => (
  <div className="mt-6">
    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center mb-4">
      <Sparkles className="h-6 w-6 mr-2 text-purple-500" /> AI-Powered Suggestions
    </h3>
    <div className="space-y-4">
      {['title', 'metaDescription', 'content'].map((key) => {
        const suggestionText = suggestions[key as keyof AISuggestions];
        if (!suggestionText) return null;
        return (
          <div
            key={key}
            className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 capitalize mb-1">
              {key === 'metaDescription'
                ? 'Meta Description'
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {suggestionText}
            </p>
          </div>
        );
      })}
    </div>
  </div>
);

const PageDetailsModal = ({ page, onClose }: { page: PageData; onClose: () => void }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div
        className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 break-all">
          {page.title || <span className="italic text-gray-500">No Title</span>}
        </h2>
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm flex items-center gap-1 mb-6"
        >
          {page.url} <ExternalLink className="h-4 w-4" />
        </a>

        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center mb-4">
          <Cpu className="h-6 w-6 mr-2 text-blue-500" /> Technical SEO
        </h3>
        {page.consoleErrors && page.consoleErrors.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg mb-4">
            <strong className="block mb-2 text-sm font-semibold text-red-700 dark:text-red-300">
              ⚠ JavaScript Console Errors
            </strong>
            <ul className="list-disc pl-5 space-y-1 text-sm text-red-800 dark:text-red-200">
              {page.consoleErrors.map((err, idx) => (
                <li key={idx} className="break-words">{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong>Status:</strong>{' '}
            <span className={`font-semibold ${page.statusCode >= 400 ? 'text-red-500' : 'text-green-500'}`}>
              {page.statusCode}
            </span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center">
            <strong>Mobile Friendly:</strong>{' '}
            {page.hasViewport ? (
              <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 ml-2 text-red-500" />
            )}
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong>Page Size:</strong> {formatBytes(page.pageSizeBytes)}
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong>Load Time:</strong> {page.loadTime.toFixed(2)}s
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong>LCP:</strong> <span className={getColorForLCP(page.lcp)}>{page.lcp.toFixed(2)}s</span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong>CLS:</strong> <span className={getColorForCLS(page.cls)}>{page.cls.toFixed(2)}</span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <strong>TTFB:</strong> <span className={getColorForTTFB(page.ttfb)}>{page.ttfb.toFixed(2)}s</span>
          </div>
          {page.redirectChain && page.redirectChain.length > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg col-span-2">
              <strong className="block mb-2 text-yellow-800 dark:text-yellow-200">
                🔁 Redirect Chain:
              </strong>
              <p className="text-sm text-gray-800 dark:text-gray-300">
                {page.redirectChain.join(' → ')}
              </p>
              {page.redirectChain.length > 2 && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  ⚠️ This redirect chain has {page.redirectChain.length} hops. Consider simplifying it to improve SEO and load time.
                </p>
              )}
            </div>
          )}

          {page.statusCode >= 400 && page.linkedFrom && page.linkedFrom.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
              <strong className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">🔗 Linked From:</strong>
              <ul className="list-disc pl-5 text-sm text-blue-600 dark:text-blue-400 space-y-1">
                {page.linkedFrom.map((src, idx) => (
                  <li key={idx}>
                    <a href={src} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {src}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {page.suggestions && <AISuggestionsCard suggestions={page.suggestions} />}
        {/* {(page.mobileScreenshot || page.desktopScreenshot) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">📸 Screenshots</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {page.mobileScreenshot && (
                <div>
                  <p className="text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">Mobile View</p>
                  <img
                    src={`data:image/png;base64,${page.mobileScreenshot}`}
                    alt="Mobile Screenshot"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow"
                  />
                </div>
              )}
              {page.desktopScreenshot && (
                <div>
                  <p className="text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">Desktop View</p>
                  <img
                    src={`data:image/png;base64,${page.desktopScreenshot}`}
                    alt="Desktop Screenshot"
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          </div>
        )} */}

      </div>
    </div>
  );
};

export default function ResultsTable({ pages }: ResultsTableProps) {
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);

  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(pages.length / ITEMS_PER_PAGE);

  const paginatedPages = useMemo(
    () => pages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [pages, currentPage]
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const getScoreClass = (score: number) => {
    if (score < 50) return 'text-red-600 font-bold';
    if (score < 80) return 'text-yellow-600 font-bold';
    return 'text-green-600 font-bold';
  };

  return (
    <>
      {selectedPage && <PageDetailsModal page={selectedPage} onClose={() => setSelectedPage(null)} />}
      <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
        <h2 className="text-2xl font-bold p-6 text-gray-800 dark:text-white">📄 Detailed Page Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">URL</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Depth</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">LCP</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">CLS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">TTFB</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">SEO Score</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">JS</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">AI</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedPages.map((page) => (
                <tr key={page.url} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm max-w-[300px] truncate text-blue-600 dark:text-blue-400">
                    <a href={page.url} target="_blank" rel="noopener noreferrer" title={page.url}>
                      {page.title || page.url}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-200">
                    {page.depth}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${page.statusCode >= 400 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {page.statusCode}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm text-center font-semibold ${getColorForLCP(page.lcp ?? 0)}`}>
                    {(page.lcp ?? 0).toFixed(2)}s
                  </td>
                  <td className={`px-4 py-3 text-sm text-center font-semibold ${getColorForCLS(page.cls ?? 0)}`}>
                    {(page.cls ?? 0).toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-center font-semibold ${getColorForTTFB(page.ttfb ?? 0)}`}>
                    {(page.ttfb ?? 0).toFixed(2)}s
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={getScoreClass(page.seoScore)}>{page.seoScore}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {page.consoleErrors && page.consoleErrors.length > 0 ? (
                      <span title="Console Errors Found">
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      </span>
                    ) : (
                      <span title="No Console Errors">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedPage(page)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      title="View Details"
                    >
                      <Lightbulb className="h-5 w-5 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, pages.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, pages.length)} of {pages.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Prev
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-200 px-2 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
