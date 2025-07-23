'use client';

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Download,
  Filter,
  ArrowLeft,
  FileText,
  Database
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';
import Link from 'next/link';

// Simple line chart component to match Google's design
const SimpleLineChart = ({ data, color = "#1a73e8", height = 200 }: { data: Array<{ date: string; value: number }>, color?: string, height?: number }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" className="absolute inset-0">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline
          fill={`url(#gradient-${color})`}
          stroke="none"
          points={`${points} 100,100 0,100`}
        />
      </svg>
    </div>
  );
};

export default function GSCIndexingPage() {
  const [indexingData, setIndexingData] = useState<any>(null);
  const [indexedPages, setIndexedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadIndexingData();
  }, [dateRange]);

  const loadIndexingData = async () => {
    try {
      setLoading(true);
      
      // Try to load real indexing data
      const pagesResponse = await indexingApi.getIndexedPages('', {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      if (pagesResponse.data && pagesResponse.data.pages) {
        setIndexedPages(pagesResponse.data.pages);
        
        // Calculate indexing summary from real data
        const totalPages = pagesResponse.data.pages.length;
        const indexedPages = pagesResponse.data.pages.filter((page: any) => page.indexed).length;
        const notIndexedPages = pagesResponse.data.pages.filter((page: any) => !page.indexed).length;
        const pendingPages = pagesResponse.data.pages.filter((page: any) => 
          page.coverageState === 'Discovered – currently not indexed'
        ).length;
        const errorPages = pagesResponse.data.pages.filter((page: any) => 
          page.coverageState === 'Error'
        ).length;
        
        setIndexingData({
          totalPages,
          indexedPages,
          notIndexedPages,
          pendingPages,
          errorPages,
          indexingRate: totalPages > 0 ? (indexedPages / totalPages) * 100 : 0
        });
      } else {
        setIndexedPages([]);
        setIndexingData(null);
      }
    } catch (error: any) {
      console.error('Failed to load indexing data:', error);
      setIndexedPages([]);
      setIndexingData(null);
      toast.error('Failed to load indexing data: ' + error.message);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasData = indexingData && indexedPages.length > 0;

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
              <h1 className="text-2xl font-normal text-gray-900">Indexing</h1>
              <p className="text-sm text-gray-600">Monitor your site's indexing status</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadIndexingData} 
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

        {/* Date Range Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date range
              </label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {!hasData ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No indexing data available</h2>
            <p className="text-gray-500 mb-4">Indexing data is not currently available for the selected period.</p>
            <button 
              onClick={loadIndexingData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Indexing Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total pages</h3>
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(indexingData?.totalPages)}
                </div>
                <div className="text-sm text-gray-600">
                  All pages submitted
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Indexed pages</h3>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(indexingData?.indexedPages)}
                </div>
                <div className="text-sm text-gray-600">
                  {indexingData?.indexingRate?.toFixed(1)}% indexing rate
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Not indexed</h3>
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(indexingData?.notIndexedPages)}
                </div>
                <div className="text-sm text-gray-600">
                  Pages pending indexing
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Errors</h3>
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(indexingData?.errorPages)}
                </div>
                <div className="text-sm text-gray-600">
                  Pages with errors
                </div>
              </div>
            </div>

            {/* Indexing Status Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Indexing status breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Indexed</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {indexingData?.indexedPages}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Not Indexed</span>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {indexingData?.notIndexedPages}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      {indexingData?.pendingPages}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-900">Errors</span>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {indexingData?.errorPages}
                    </span>
                  </div>
                </div>

                {/* Indexing Chart */}
                <div className="h-64">
                  <SimpleLineChart 
                    data={[
                      { date: '2025-01-20', value: indexingData?.indexedPages || 0 },
                      { date: '2025-01-21', value: indexingData?.indexedPages || 0 },
                      { date: '2025-01-22', value: indexingData?.indexedPages || 0 },
                      { date: '2025-01-23', value: indexingData?.indexedPages || 0 },
                      { date: '2025-01-24', value: indexingData?.indexedPages || 0 },
                      { date: '2025-01-25', value: indexingData?.indexedPages || 0 },
                      { date: '2025-01-26', value: indexingData?.indexedPages || 0 }
                    ]}
                    color="#34a853"
                    height={240}
                  />
                </div>
              </div>
            </div>

            {/* Indexed Pages List */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Indexed pages</h2>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {indexedPages.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(page.coverageState || '')}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-900">{page.url}</p>
                        <p className="text-xs text-gray-500">
                          {page.lastCrawled ? `Last crawled: ${new Date(page.lastCrawled).toLocaleDateString()}` : 'Not crawled yet'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {page.clicks !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{page.clicks}</p>
                          <p className="text-xs text-gray-500">Clicks</p>
                        </div>
                      )}
                      
                      {page.impressions !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{page.impressions}</p>
                          <p className="text-xs text-gray-500">Impressions</p>
                        </div>
                      )}
                      
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        page.indexed 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.coverageState || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
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