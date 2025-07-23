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

// Enhanced Google Search Console style indexing chart component
const GSCIndexingChart = ({
  data,
  color = "#34a853",
  height = 240,
  title = "",
  showDataLabels = true,
  showGrid = true
}: {
  data: Array<{ date: string; value: number }>,
  color?: string,
  height?: number,
  title?: string,
  showDataLabels?: boolean,
  showGrid?: boolean
}) => {
  const [hoveredBar, setHoveredBar] = useState<{ x: number; y: number; data: any; index: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500">No indexing data available</p>
          <p className="text-xs text-gray-400 mt-1">Indexing metrics will appear here when data is available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const barWidth = 100 / data.length;
  const barSpacing = Math.min(barWidth * 0.15, 1.5);
  const actualBarWidth = barWidth - barSpacing;

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    
    const barIndex = Math.floor(x / barWidth);
    if (barIndex >= 0 && barIndex < data.length) {
      const barData = data[barIndex];
      const barX = barIndex * barWidth + barSpacing / 2;
      const normalizedValue = (barData.value - minValue) / range;
      const barHeight = normalizedValue * 80;
      const barY = 85 - barHeight;
      
      setHoveredBar({ x: barX, y: barY, data: barData, index: barIndex });
    }
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  // Generate Y-axis labels
  const yAxisLabels = [];
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const value = minValue + (range * i / steps);
    yAxisLabels.push({
      value: Math.round(value),
      y: 85 - (i / steps * 80)
    });
  }

  return (
    <div className="relative w-full bg-white border border-gray-200 rounded-lg p-4" style={{ height }}>
      {/* Chart Title and Legend */}
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
          <span className="text-xs text-gray-600">{title}</span>
        </div>
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-2 top-12 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500">
        {yAxisLabels.reverse().map((label, index) => (
          <div key={index} className="text-right pr-2 leading-none">
            {label.value.toLocaleString()}
          </div>
        ))}
      </div>
      
      {/* Main chart area */}
      <div className="ml-14 mr-2 h-full relative" style={{ height: height - 80 }}>
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0 cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {showGrid && (
            <>
              <defs>
                <pattern id={`indexing-grid-${title}`} width="100" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 0 16 L 100 16" fill="none" stroke="#f8fafc" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="indexingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
                  <stop offset="100%" stopColor={color} stopOpacity="0.6"/>
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill={`url(#indexing-grid-${title})`} />
              
              {/* Horizontal grid lines */}
              {yAxisLabels.map((label, index) => (
                <line
                  key={index}
                  x1="0"
                  y1={label.y}
                  x2="100"
                  y2={label.y}
                  stroke="#f1f5f9"
                  strokeWidth="0.5"
                />
              ))}
            </>
          )}
          
          {/* Bars with enhanced styling */}
          {data.map((point, index) => {
            const barX = index * barWidth + barSpacing / 2;
            const normalizedValue = (point.value - minValue) / range;
            const barHeight = normalizedValue * 80;
            const barY = 85 - barHeight;
            const isHovered = hoveredBar?.index === index;
            
            return (
              <g key={index}>
                {/* Bar shadow */}
                <rect
                  x={`${barX + 0.2}%`}
                  y={`${barY + 0.5}%`}
                  width={`${actualBarWidth}%`}
                  height={`${barHeight}%`}
                  fill="rgba(0,0,0,0.05)"
                  rx="1.5"
                />
                
                {/* Main bar with gradient */}
                <rect
                  x={`${barX}%`}
                  y={`${barY}%`}
                  width={`${actualBarWidth}%`}
                  height={`${barHeight}%`}
                  fill="url(#indexingGradient)"
                  className="transition-all duration-200"
                  style={{
                    opacity: isHovered ? 0.95 : 0.85,
                    filter: isHovered ? 'brightness(1.05) saturate(1.1)' : 'none'
                  }}
                  rx="1.5"
                />
                
                {/* Top accent */}
                <rect
                  x={`${barX}%`}
                  y={`${barY}%`}
                  width={`${actualBarWidth}%`}
                  height="1.5%"
                  fill={color}
                  rx="1.5"
                  opacity="1"
                />
                
                {/* Hover effects */}
                {isHovered && (
                  <>
                    <circle
                      cx={`${barX + actualBarWidth / 2}%`}
                      cy={`${barY}%`}
                      r="2.5"
                      fill={color}
                      className="animate-pulse"
                      opacity="0.9"
                    />
                    <circle
                      cx={`${barX + actualBarWidth / 2}%`}
                      cy={`${barY}%`}
                      r="1.5"
                      fill="white"
                    />
                  </>
                )}
              </g>
            );
          })}
          
          {/* Hover indicator line */}
          {hoveredBar && (
            <line
              x1={`${hoveredBar.x + actualBarWidth / 2}%`}
              y1="5%"
              x2={`${hoveredBar.x + actualBarWidth / 2}%`}
              y2="85%"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="3,3"
              className="animate-pulse"
            />
          )}
        </svg>
        
        {/* X-axis labels */}
        {showDataLabels && (
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
            {data.map((point, index) => {
              const showLabel = data.length <= 7 || index % Math.ceil(data.length / 6) === 0 || index === data.length - 1;
              if (!showLabel) return <div key={index} style={{ width: `${100/data.length}%` }}></div>;
              
              return (
                <div key={index} className="text-center" style={{ width: `${100/data.length}%` }}>
                  {new Date(point.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Enhanced Tooltip */}
        {hoveredBar && (
          <div
            className="absolute z-30 px-4 py-3 text-sm bg-white border border-gray-300 rounded-lg shadow-2xl pointer-events-none"
            style={{
              left: `${hoveredBar.x + actualBarWidth / 2}%`,
              top: `${Math.max(hoveredBar.y - 20, -10)}%`,
              transform: 'translateX(-50%)',
              minWidth: '140px'
            }}
          >
            <div className="font-medium text-gray-900 mb-2">
              {new Date(hoveredBar.data.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600 text-xs font-medium">{title}</span>
              </div>
              <div className="font-bold text-gray-900 text-base">
                {hoveredBar.data.value.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GSCIndexingPage() {
  const [indexingData, setIndexingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availableProperties, setAvailableProperties] = useState<string[]>([]);

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadIndexingData();
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

  const loadIndexingData = async () => {
    if (!selectedProperty) {
      setIndexingData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to load real indexing data
      const response = await indexingApi.getIndexedPages(selectedProperty, {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      if (response.data && response.data.pages) {
        const pages = response.data.pages;
        
        // Calculate indexing data from real pages
        const totalSubmitted = pages.length;
        const totalIndexed = pages.filter((page: any) => page.indexed).length;
        const totalNotIndexed = pages.filter((page: any) => !page.indexed).length;
        const totalExcluded = pages.filter((page: any) => 
          page.coverageState === 'Excluded' || page.coverageState === 'Blocked by robots.txt'
        ).length;
        const totalError = pages.filter((page: any) => 
          page.coverageState === 'Error' || page.coverageState === 'Server error (5xx)'
        ).length;
        
        const indexingByType = [
          { type: 'Submitted and indexed', count: totalIndexed, color: '#34a853' },
          { type: 'Discovered – currently not indexed', count: pages.filter((p: any) => p.coverageState === 'Discovered – currently not indexed').length, color: '#fbbc04' },
          { type: 'Crawled – currently not indexed', count: pages.filter((p: any) => p.coverageState === 'Crawled – currently not indexed').length, color: '#fa903e' },
          { type: 'Error', count: totalError, color: '#ea4335' },
          { type: 'Excluded', count: totalExcluded, color: '#9aa0a6' }
        ];
        
        setIndexingData({
          totalSubmitted,
          totalIndexed,
          totalNotIndexed,
          totalExcluded,
          totalError,
          indexingByType,
          pages: pages.slice(0, 10) // Show first 10 pages
        });
      } else {
        setIndexingData(null);
      }
    } catch (error: any) {
      console.error('Failed to load indexing data:', error);
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

  const hasData = indexingData && indexingData.pages && indexingData.pages.length > 0;

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

        {/* Property and Date Range Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <select 
                value={selectedProperty} 
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableProperties.map((property) => (
                  <option key={property} value={property}>
                    {property}
                  </option>
                ))}
              </select>
            </div>
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
                  {formatNumber(indexingData?.totalSubmitted)}
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
                  {formatNumber(indexingData?.totalIndexed)}
                </div>
                <div className="text-sm text-gray-600">
                  {indexingData?.totalIndexed ? `${indexingData.totalIndexed / indexingData.totalSubmitted * 100}%` : '0%'} indexing rate
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Not indexed</h3>
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(indexingData?.totalNotIndexed)}
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
                  {formatNumber(indexingData?.totalError)}
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
                      {indexingData?.totalIndexed}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Not Indexed</span>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {indexingData?.totalNotIndexed}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Pending</span>
                    </div>
                                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {indexingData?.indexingByType.find((item: any) => item.type === 'Discovered – currently not indexed')?.count || 0}
                      </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-900">Errors</span>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {indexingData?.totalError}
                    </span>
                  </div>
                </div>

                {/* Indexing Chart */}
                <div className="h-64">
                  <GSCIndexingChart
                    data={[
                      { date: '2025-01-20', value: indexingData?.totalIndexed || 0 },
                      { date: '2025-01-21', value: indexingData?.totalIndexed || 0 },
                      { date: '2025-01-22', value: indexingData?.totalIndexed || 0 },
                      { date: '2025-01-23', value: indexingData?.totalIndexed || 0 },
                      { date: '2025-01-24', value: indexingData?.totalIndexed || 0 },
                      { date: '2025-01-25', value: indexingData?.totalIndexed || 0 },
                      { date: '2025-01-26', value: indexingData?.totalIndexed || 0 }
                    ]}
                    color="#34a853"
                    height={240}
                    title="Indexed Pages"
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
                {indexingData?.pages.map((page: any, index: number) => (
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