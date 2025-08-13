'use client';

import { useState, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Cpu,
  ExternalLink,
  Lightbulb,
  Sparkles,
  X,
  AlertCircle,
  Copy
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import WebVitalsChart from './WebVitalsChart';

interface AISuggestions {
  titleSuggestions?: string[];
  metaDescriptionSuggestions?: string[];
  contentStructure?: string[];
  technicalImprovements?: string[];
  priorityScore?: number;
  impact?: 'low' | 'medium' | 'high';
  specificIssues?: string[];
  recommendations?: string[];
  outline?: { h1?: string; h2?: string[] };
  diffs?: {
    title?: { current?: string; proposed?: string };
    metaDescription?: { current?: string; proposed?: string };
  };
  // Legacy support
  title?: string;
  metaDescription?: string;
  content?: string;
}

interface WebVitalsHistoryEntry {
  date: string;
  lcp: number;
  cls: number;
  ttfb: number;
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
  suggestions?: AISuggestions; // Legacy support
  aiSuggestions?: AISuggestions; // New field from backend
  seoScore: number;
  lcp: number;
  cls: number;
  ttfb: number;
  linkedFrom?: string[];
  depth: number;
  mobileScreenshot?: string;
  desktopScreenshot?: string;
  webVitalsHistory?: WebVitalsHistoryEntry[];
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

const AISuggestionsCard = ({ suggestions }: { suggestions: AISuggestions }) => {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedMeta, setCopiedMeta] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'text-red-600 dark:text-red-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const copyWithFlash = async (text: string, set: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      set(true);
      setTimeout(() => set(false), 1200);
    } catch {}
  };

  const proposedTitle = suggestions.diffs?.title?.proposed || suggestions.titleSuggestions?.[0] || '';
  const proposedMeta = suggestions.diffs?.metaDescription?.proposed || suggestions.metaDescriptionSuggestions?.[0] || '';
  const h2List: string[] = Array.isArray(suggestions.outline?.h2) ? (suggestions.outline!.h2 as string[]) : [];

  const copyAll = () => {
    const outline = suggestions.outline;
    const lines: string[] = [];
    if (proposedTitle) lines.push(`Title: ${proposedTitle}`);
    if (proposedMeta) lines.push(`Meta: ${proposedMeta}`);
    if (outline?.h1) lines.push(`H1: ${outline.h1}`);
    if (h2List.length) {
      lines.push('H2:');
      h2List.slice(0, 10).forEach(h2 => lines.push(`- ${h2}`));
    }
    if (suggestions.recommendations && suggestions.recommendations.length) {
      lines.push('Recommendations:');
      suggestions.recommendations.slice(0, 5).forEach(r => lines.push(`- ${r}`));
    }
    copyWithFlash(lines.join('\n'), setCopiedAll);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <Sparkles className="h-6 w-6 mr-2 text-purple-500" /> AI-Powered Suggestions
        </h3>
        <button
          onClick={copyAll}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700"
          title="Copy title, meta, outline and top recommendations"
        >
          <Copy className="h-4 w-4" /> {copiedAll ? 'Copied' : 'Copy All'}
        </button>
      </div>
      
      {/* Priority and Impact */}
      {(suggestions.priorityScore !== undefined || suggestions.impact) && (
        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-4 text-sm">
            {suggestions.priorityScore !== undefined && (
              <div>
                <span className="font-semibold">Priority: </span>
                <span className={getPriorityColor(suggestions.priorityScore)}>
                  {suggestions.priorityScore}/10
                </span>
              </div>
            )}
            {suggestions.impact && (
              <div>
                <span className="font-semibold">Impact: </span>
                <span className={getImpactColor(suggestions.impact)}>
                  {suggestions.impact.charAt(0).toUpperCase() + suggestions.impact.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Title Suggestions */}
        {suggestions.titleSuggestions && suggestions.titleSuggestions.length > 0 && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Title Suggestions
            </h4>
            <ul className="space-y-2">
              {suggestions.titleSuggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-800/50 p-2 rounded border">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta Description Suggestions */}
        {suggestions.metaDescriptionSuggestions && suggestions.metaDescriptionSuggestions.length > 0 && (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Meta Description Suggestions
            </h4>
            <ul className="space-y-2">
              {suggestions.metaDescriptionSuggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-green-700 dark:text-green-300 bg-white dark:bg-green-800/50 p-2 rounded border">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Structure */}
        {suggestions.contentStructure && suggestions.contentStructure.length > 0 && (
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Content Structure Improvements
            </h4>
            <ul className="space-y-1">
              {suggestions.contentStructure.map((item, index) => (
                <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start">
                  <span className="mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Improvements */}
        {suggestions.technicalImprovements && suggestions.technicalImprovements.length > 0 && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center">
              <Cpu className="h-4 w-4 mr-2" />
              Technical SEO Improvements
            </h4>
            <ul className="space-y-1">
              {suggestions.technicalImprovements.map((item, index) => (
                <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                  <span className="mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Specific Issues */}
        {suggestions.specificIssues && suggestions.specificIssues.length > 0 && (
          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Specific Issues Detected
            </h4>
            <ul className="space-y-1">
              {suggestions.specificIssues.map((issue, index) => (
                <li key={index} className="text-sm text-orange-700 dark:text-orange-300 flex items-start">
                  <span className="mr-2">⚠</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {suggestions.recommendations && suggestions.recommendations.length > 0 && (
          <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Actionable Recommendations
            </h4>
            <ul className="space-y-1">
              {suggestions.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-indigo-700 dark:text-indigo-300 flex items-start">
                  <span className="mr-2">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Draft H1/H2 Outline */}
        {suggestions.outline && (suggestions.outline.h1 || h2List.length > 0) && (
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" /> Draft Outline (H1/H2)
            </h4>
            {suggestions.outline.h1 && (
              <div className="mb-2 text-sm"><span className="font-semibold">H1: </span>{suggestions.outline.h1}</div>
            )}
            {h2List.length > 0 && (
              <ul className="space-y-1 ml-1">
                {h2List.map((h2, idx) => (
                  <li key={idx} className="text-sm text-purple-700 dark:text-purple-300 flex items-start">
                    <span className="mr-2">–</span>
                    {h2}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Diff-like changes for Title/Meta */}
        {suggestions.diffs && (suggestions.diffs.title || suggestions.diffs.metaDescription) && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" /> Proposed Changes
            </h4>
            {suggestions.diffs.title && (suggestions.diffs.title.current || suggestions.diffs.title.proposed) && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Title</div>
                {suggestions.diffs.title.current && (
                  <div className="text-xs text-gray-700 dark:text-gray-300 line-through">
                    - {suggestions.diffs.title.current}
                  </div>
                )}
                {suggestions.diffs.title.proposed && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-900 dark:text-white">+ {suggestions.diffs.title.proposed}</div>
                    <button
                      onClick={() => copyWithFlash(proposedTitle, setCopiedTitle)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <Copy className="h-3 w-3" /> {copiedTitle ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            )}
            {suggestions.diffs.metaDescription && (suggestions.diffs.metaDescription.current || suggestions.diffs.metaDescription.proposed) && (
              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Meta Description</div>
                {suggestions.diffs.metaDescription.current && (
                  <div className="text-xs text-gray-700 dark:text-gray-300 line-through">
                    - {suggestions.diffs.metaDescription.current}
                  </div>
                )}
                {suggestions.diffs.metaDescription.proposed && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-900 dark:text-white">+ {suggestions.diffs.metaDescription.proposed}</div>
                    <button
                      onClick={() => copyWithFlash(proposedMeta, setCopiedMeta)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <Copy className="h-3 w-3" /> {copiedMeta ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Legacy Support */}
        {!suggestions.titleSuggestions && suggestions.title && (
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Title Suggestion</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {suggestions.title}
            </p>
          </div>
        )}

        {!suggestions.metaDescriptionSuggestions && suggestions.metaDescription && (
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Meta Description Suggestion</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {suggestions.metaDescription}
            </p>
          </div>
        )}

        {!suggestions.contentStructure && suggestions.content && (
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Content Suggestion</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {suggestions.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

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

        {page.aiSuggestions && <AISuggestionsCard suggestions={page.aiSuggestions} />}
        
        {/* Web Vitals Trend Chart */}
        {page.webVitalsHistory && page.webVitalsHistory.length > 1 && (
          <div className="mt-8">
            <h4 className="text-md font-semibold mb-2 text-blue-700 dark:text-blue-300">Web Vitals Trend</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={page.webVitalsHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="lcp" stroke="#3b82f6" name="LCP (s)" dot={false} />
                <Line type="monotone" dataKey="cls" stroke="#f59e42" name="CLS" dot={false} />
                <Line type="monotone" dataKey="ttfb" stroke="#10b981" name="TTFB (s)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

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
        {/* Web Vitals Chart Overview */}
        <WebVitalsChart pages={pages} />
        {/* Mobile Card View */}
        <div className="sm:hidden space-y-4 p-4">
          {paginatedPages.map((page) => (
            <div key={page.url} className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow">
              <div className="text-blue-600 dark:text-blue-400 font-medium truncate mb-1">
                <a href={page.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{page.title || page.url}</a>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <div><strong>Status:</strong> <span className={page.statusCode >= 400 ? 'text-red-500' : 'text-green-600'}>{page.statusCode}</span></div>
                <div><strong>Depth:</strong> {page.depth}</div>
                <div><strong>LCP:</strong> <span className={getColorForLCP(page.lcp)}>{page.lcp.toFixed(2)}s</span></div>
                <div><strong>CLS:</strong> <span className={getColorForCLS(page.cls)}>{page.cls.toFixed(2)}</span></div>
                <div><strong>TTFB:</strong> <span className={getColorForTTFB(page.ttfb)}>{page.ttfb.toFixed(2)}s</span></div>
                <div><strong>SEO Score:</strong> <span className={getScoreClass(page.seoScore)}>{page.seoScore}</span></div>
                <div className="mt-2 flex justify-between items-center">
                  <span><strong>JS:</strong> {page.consoleErrors?.length ? <XCircle className="inline h-5 w-5 text-red-500" /> : <CheckCircle className="inline h-5 w-5 text-green-500" />}</span>
                  <button onClick={() => setSelectedPage(page)} className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1 text-sm">
                    <Lightbulb className="h-4 w-4" /> Insights
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block overflow-x-auto">
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
