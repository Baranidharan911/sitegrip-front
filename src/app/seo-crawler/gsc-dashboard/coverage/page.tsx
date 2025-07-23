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
  BarChart3,
  TrendingUp
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

export default function GSCCoveragePage() {
  const [coverageData, setCoverageData] = useState<any>(null);
  const [coverageHistory, setCoverageHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availableProperties, setAvailableProperties] = useState<string[]>([]);

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadCoverageData();
    }
  }, [selectedProperty, dateRange]);

  const loadGSCProperties = async () => {
    try {
      const properties = await indexingApi.getGSCProperties();
      
      if (properties && properties.length > 0) {
        const propertyUrls = properties.map((prop: any) => prop.site_url || prop.property);
        setAvailableProperties(propertyUrls);
        setSelectedProperty(propertyUrls[0]); // Use first property by default
      } else {
        setAvailableProperties([]);
        setSelectedProperty('');
      }
    } catch (error: any) {
      console.error('Failed to load GSC properties:', error);
      setAvailableProperties([]);
      setSelectedProperty('');
    }
  };

  const loadCoverageData = async () => {
    if (!selectedProperty) {
      setCoverageData(null);
      setCoverageHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to load real coverage data
      const response = await indexingApi.getIndexedPages(selectedProperty, {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      if (response.data && response.data.pages) {
        const pages = response.data.pages;
        
        // Calculate coverage data from real pages
        const totalSubmitted = pages.length;
        const totalIndexed = pages.filter((page: any) => page.indexed).length;
        const totalExcluded = pages.filter((page: any) => 
          page.coverageState === 'Excluded' || page.coverageState === 'Blocked by robots.txt'
        ).length;
        const totalError = pages.filter((page: any) => 
          page.coverageState === 'Error' || page.coverageState === 'Server error (5xx)'
        ).length;
        
        const coverageByType = [
          { type: 'Submitted and indexed', count: totalIndexed, color: '#34a853' },
          { type: 'Discovered – currently not indexed', count: pages.filter((p: any) => p.coverageState === 'Discovered – currently not indexed').length, color: '#fbbc04' },
          { type: 'Crawled – currently not indexed', count: pages.filter((p: any) => p.coverageState === 'Crawled – currently not indexed').length, color: '#fa903e' },
          { type: 'Error', count: totalError, color: '#ea4335' },
          { type: 'Excluded', count: totalExcluded, color: '#9aa0a6' }
        ];
        
        setCoverageData({
          totalSubmitted,
          totalIndexed,
          totalExcluded,
          totalError,
          coverageByType
        });
        
        // Generate coverage history from available data
        const history = [];
        const days = parseInt(dateRange);
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          history.push({
            date: date.toISOString().split('T')[0],
            indexed: totalIndexed,
            notIndexed: totalSubmitted - totalIndexed,
            errors: totalError
          });
        }
        setCoverageHistory(history);
      } else {
        setCoverageData(null);
        setCoverageHistory([]);
      }
    } catch (error: any) {
      console.error('Failed to load coverage data:', error);
      setCoverageData(null);
      setCoverageHistory([]);
      toast.error('Failed to load coverage data: ' + error.message);
    } finally {
      setLoading(false);
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

  const hasData = coverageData && coverageHistory.length > 0;

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
              <h1 className="text-2xl font-normal text-gray-900">Coverage</h1>
              <p className="text-sm text-gray-600">Monitor your site's indexing coverage</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadCoverageData} 
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

        {/* Property and Date Range Selectors */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {/* Property Selector */}
            {availableProperties.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableProperties.map((property) => (
                    <option key={property} value={property}>
                      {property}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Date Range Selector */}
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
            <h2 className="text-xl font-medium text-gray-900 mb-2">No coverage data available</h2>
            <p className="text-gray-500 mb-4">Coverage data is not currently available for the selected period.</p>
            <button 
              onClick={loadCoverageData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Coverage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total submitted</h3>
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(coverageData?.totalSubmitted)}
                </div>
                <div className="text-sm text-gray-600">
                  All pages submitted
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total indexed</h3>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(coverageData?.totalIndexed)}
                </div>
                <div className="text-sm text-gray-600">
                  Successfully indexed
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total excluded</h3>
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(coverageData?.totalExcluded)}
                </div>
                <div className="text-sm text-gray-600">
                  Pages excluded
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total errors</h3>
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(coverageData?.totalError)}
                </div>
                <div className="text-sm text-gray-600">
                  Pages with errors
                </div>
              </div>
            </div>

            {/* Coverage Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Coverage Trend Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Coverage trend</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Indexed pages</span>
                  </div>
                </div>
                <div className="h-64">
                  <SimpleLineChart 
                    data={coverageHistory.map(d => ({ date: d.date, value: d.indexed }))}
                    color="#34a853"
                    height={240}
                  />
                </div>
              </div>

              {/* Coverage Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Coverage distribution</h3>
                <div className="space-y-4">
                  {coverageData?.coverageByType.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-700">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.count}</span>
                        <span className="text-sm text-gray-500">
                          ({((item.count / coverageData.totalSubmitted) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coverage Status Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Coverage status breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Submitted and indexed</span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {coverageData?.totalIndexed}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Discovered – currently not indexed</span>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {coverageData?.coverageByType.find((item: any) => item.type === 'Discovered – currently not indexed')?.count || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Crawled – currently not indexed</span>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      {coverageData?.coverageByType.find((item: any) => item.type === 'Crawled – currently not indexed')?.count || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-900">Error</span>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {coverageData?.totalError}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Excluded</span>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      {coverageData?.totalExcluded}
                    </span>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Coverage rate</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {coverageData ? ((coverageData.totalIndexed / coverageData.totalSubmitted) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="text-sm text-blue-700">
                      Successfully indexed pages
                    </p>
                  </div>
                </div>
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