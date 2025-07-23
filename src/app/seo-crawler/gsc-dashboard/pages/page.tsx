'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';
import Link from 'next/link';

export default function GSCPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      
      // Try to load real pages data
      const response = await indexingApi.getIndexedPages('', {
        days: 30,
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      if (response.data && response.data.pages) {
        setPages(response.data.pages);
      } else {
        setPages([]);
      }
    } catch (error: any) {
      console.error('Failed to load pages:', error);
      setPages([]);
      toast.error('Failed to load pages: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted and indexed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Discovered – currently not indexed': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Crawled – currently not indexed': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('en-US');
  };

  const formatCTR = (ctr: number | undefined | null): string => {
    if (!ctr && ctr !== 0) return '0%';
    return `${(ctr * 100).toFixed(1)}%`;
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'indexed' && page.indexed) ||
      (filterStatus === 'not-indexed' && !page.indexed);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/seo-crawler/gsc-dashboard" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-normal text-gray-900">Pages</h1>
              <p className="text-sm text-gray-600">View and manage indexed pages</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadPages} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All pages</option>
                <option value="indexed">Indexed</option>
                <option value="not-indexed">Not indexed</option>
              </select>
            </div>
          </div>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No pages data available</h2>
            <p className="text-gray-500 mb-4">Pages data is not currently available.</p>
            <button 
              onClick={loadPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          /* Pages List */
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Pages ({filteredPages.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {filteredPages.length} of {pages.length} pages
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredPages.map((page, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getStatusIcon(page.coverageState || '')}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-gray-900 truncate">{page.url}</p>
                          <a 
                            href={page.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {page.lastCrawled ? `Last crawled: ${new Date(page.lastCrawled).toLocaleDateString()}` : 'Not crawled yet'}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          page.indexed 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {page.coverageState || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 ml-4">
                      {page.clicks !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatNumber(page.clicks)}</p>
                          <p className="text-xs text-gray-500">Clicks</p>
                        </div>
                      )}
                      
                      {page.impressions !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatNumber(page.impressions)}</p>
                          <p className="text-xs text-gray-500">Impressions</p>
                        </div>
                      )}
                      
                      {page.ctr !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCTR(page.ctr)}</p>
                          <p className="text-xs text-gray-500">CTR</p>
                        </div>
                      )}
                      
                      {page.position !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{page.position?.toFixed(1) || '0'}</p>
                          <p className="text-xs text-gray-500">Position</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPages.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900 mb-2">No pages found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/help" className="hover:text-gray-700">Help</a>
              <a href="/feedback" className="hover:text-gray-700">Send feedback</a>
              <a href="/privacy" className="hover:text-gray-700">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 