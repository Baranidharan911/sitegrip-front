'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Globe, Search, BarChart3, Eye, Trash2 } from 'lucide-react';

interface CrawlResult {
  crawlId: string;
  url: string;
  domain: string;
  createdAt: string;
  totalPages: number;
  summary: {
    totalPages: number;
    missingTitles: number;
    brokenLinks: number;
    orphanPages: number;
  };
}

export default function CrawlHistoryPage() {
  const router = useRouter();
  const [crawls, setCrawls] = useState<CrawlResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCrawlHistory();
  }, []);

  const loadCrawlHistory = async () => {
    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual user ID from auth context
      const userId = 'current-user-id';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/history/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load crawl history');
      }
      
      const data = await response.json();
      setCrawls(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCrawl = async (crawlId: string) => {
    if (!confirm('Are you sure you want to delete this crawl? This action cannot be undone.')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/history/crawl/${crawlId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCrawls(crawls.filter(crawl => crawl.crawlId !== crawlId));
      }
    } catch (err) {
      console.error('Failed to delete crawl:', err);
    }
  };

  if (loading) {
    return (
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading crawl history...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">📚 Crawl History</h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage your previous SEO crawls and keyword analyses
              </p>
            </div>
            <button
              onClick={() => router.push('/seo-crawler/dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>New Crawl</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Crawl History Table */}
        {crawls.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Your Crawls ({crawls.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Issues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {crawls.map((crawl) => (
                    <tr key={crawl.crawlId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {crawl.domain}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {crawl.url}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {new Date(crawl.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {crawl.totalPages} pages
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {crawl.summary.missingTitles + crawl.summary.brokenLinks + crawl.summary.orphanPages} issues
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => router.push(`/seo-crawler/keyword-tools?crawlId=${crawl.crawlId}`)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Keywords
                        </button>
                        <button
                          onClick={() => router.push(`/seo-crawler/dashboard?crawlId=${crawl.crawlId}`)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => deleteCrawl(crawl.crawlId)}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border dark:border-gray-700 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No Crawls Yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't run any SEO crawls yet. Start by analyzing your first website to see keyword opportunities and technical SEO insights.
              </p>
              <button
                onClick={() => router.push('/seo-crawler/dashboard')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 mx-auto"
              >
                <Search className="w-4 h-4" />
                <span>Run Your First Crawl</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {crawls.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Crawls</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{crawls.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pages Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crawls.reduce((total, crawl) => total + crawl.totalPages, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Latest Crawl</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crawls.length > 0 ? new Date(Math.max(...crawls.map(c => new Date(c.createdAt).getTime()))).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
