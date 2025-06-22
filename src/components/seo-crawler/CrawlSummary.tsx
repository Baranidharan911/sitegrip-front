'use client';

import { useState } from 'react';
import { ChevronDown, Gauge, AlertCircle } from 'lucide-react';

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
  seoScore: number;
}

interface SummaryProps {
  summary: {
    totalPages: number;
    missingTitles: number;
    lowWordCountPages: number;
    brokenLinks: number;
    duplicateTitles: number;
    duplicateDescriptions: number;
    redirectChains: number;
    mobileFriendlyPages: number;
    nonMobilePages: number;
    pagesWithSlowLoad: number;
    orphanPages: number;
    averageSeoScore?: number;
  };
  pages: PageData[];
  aiSummaryText?: string;
}

export default function CrawlSummary({ summary, pages, aiSummaryText }: SummaryProps) {
  const [showAI, setShowAI] = useState(true);

  const mobileFriendlyRatio =
    summary.totalPages > 0
      ? `${summary.mobileFriendlyPages}/${summary.totalPages}`
      : 'N/A';

  const getScoreColor = (score: number) => {
    if (score < 50) return 'text-red-600';
    if (score < 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const topPages = [...pages]
    .sort((a, b) => a.seoScore - b.seoScore)
    .slice(0, 5);

  const summaryItems = [
    { label: 'Total Pages Crawled', value: summary.totalPages, isBad: false },
    { label: 'Pages w/ Slow Load (>2.5s)', value: summary.pagesWithSlowLoad, isBad: summary.pagesWithSlowLoad > 0 },
    { label: 'Mobile Friendly Pages', value: mobileFriendlyRatio, isBad: summary.nonMobilePages > 0 },
    { label: 'Pages with Redirects', value: summary.redirectChains, isBad: summary.redirectChains > 0 },
    { label: 'Orphan Pages', value: summary.orphanPages, isBad: summary.orphanPages > 0 },
    { label: 'Broken Links (4xx/5xx)', value: summary.brokenLinks, isBad: summary.brokenLinks > 0 },
    { label: 'Missing Titles', value: summary.missingTitles, isBad: summary.missingTitles > 0 },
    { label: 'Duplicate Titles', value: summary.duplicateTitles, isBad: summary.duplicateTitles > 0 },
    { label: 'Duplicate Descriptions', value: summary.duplicateDescriptions, isBad: summary.duplicateDescriptions > 0 },
  ];

  return (
    <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">📊 Crawl Summary</h2>

      {/* Average Score Card */}
      {'averageSeoScore' in summary && typeof summary.averageSeoScore === 'number' && (
        <div className="p-4 rounded-lg mb-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <Gauge className="h-6 w-6 text-indigo-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average SEO Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(summary.averageSeoScore)}`}>
              {summary.averageSeoScore} / 100
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className={`p-4 rounded-lg transition-all ${
              item.isBad
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-green-100 dark:bg-green-900/30'
            }`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 🛠️ Top Pages to Fix */}
      {topPages.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Top 5 Pages to Fix First
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">URL</th>
                  <th className="px-4 py-2 text-center">SEO Score</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center"># of Issues</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {topPages.map((page) => (
                  <tr key={page.url} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-2 max-w-xs truncate text-blue-600 dark:text-blue-400">
                      <a href={page.url} target="_blank" rel="noopener noreferrer" title={page.url}>
                        {page.url}
                      </a>
                    </td>
                    <td className={`px-4 py-2 text-center font-bold ${getScoreColor(page.seoScore)}`}>
                      {page.seoScore}
                    </td>
                    <td className="px-4 py-2 text-center">{page.statusCode}</td>
                    <td className="px-4 py-2 text-center">{page.issues.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Summary (optional) */}
      {aiSummaryText && (
        <div className="mt-10">
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center text-blue-600 dark:text-blue-400 mb-2 focus:outline-none"
          >
            <ChevronDown
              className={`h-5 w-5 mr-2 transition-transform ${showAI ? 'rotate-180' : ''}`}
            />
            <span className="font-semibold">AI-Powered Crawl Summary</span>
          </button>

          {showAI && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-gray-800 dark:text-blue-100 border border-blue-200 dark:border-blue-700 rounded-lg shadow-inner text-sm whitespace-pre-line leading-relaxed">
              {aiSummaryText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
