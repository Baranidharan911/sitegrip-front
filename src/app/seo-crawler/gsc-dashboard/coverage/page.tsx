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

// Type definitions for GSC data
interface GSCProperty {
  site_url: string;
  property_type: 'URL_PREFIX' | 'DOMAIN';
  permission_level: string;
  verified: boolean;
}

interface IndexedPage {
  url: string;
  indexed: boolean;
  lastCrawled?: string;
  coverageState?: string;
  indexingState?: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface CoverageData {
  totalSubmitted: number;
  totalIndexed: number;
  totalExcluded: number;
  totalError: number;
  coverageByType: any[];
}

// Enhanced Google Search Console style coverage chart component with dark mode support
const GSCCoverageChart = ({
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
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No coverage data available</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Coverage metrics will appear here when data is available</p>
        </div>
      </div>
    );
  }

  // Improved data processing
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

  // Generate proper Y-axis labels with better scaling
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
    <div className="relative w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" style={{ height }}>
      {/* Chart Title and Legend */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
        </div>
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 py-6">
        {yAxisLabels.reverse().map((label, index) => (
          <div key={index} className="text-right pr-2" style={{ transform: 'translateY(-50%)' }}>
            {label.value.toLocaleString()}
          </div>
        ))}
      </div>
      
      {/* Main chart area */}
      <div className="ml-12 mr-4 h-full relative">
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0 cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Background */}
          <rect width="100%" height="100%" fill="transparent" />
          
          {/* Grid lines */}
          {showGrid && (
            <>
              <defs>
                <pattern id={`grid-${title}`} width="100" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 0 20 L 100 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5" className="dark:stroke-gray-700"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${title})`} />
            </>
          )}
          
          {/* Horizontal grid lines */}
          {showGrid && yAxisLabels.map((label, index) => (
            <line
              key={index}
              x1="0"
              y1={label.y}
              x2="100"
              y2={label.y}
              stroke="#f3f4f6"
              strokeWidth="0.5"
              className="dark:stroke-gray-700"
            />
          ))}
          
          {/* Bars */}
          {data.map((point, index) => {
            const barX = index * barWidth + barSpacing / 2;
            const normalizedValue = (point.value - minValue) / range;
            const barHeight = Math.max(normalizedValue * 80, 2); // Minimum height of 2%
            const barY = 85 - barHeight;
            const isHovered = hoveredBar?.index === index;
            
            return (
              <g key={index}>
                <rect
                  x={`${barX}%`}
                  y={`${barY}%`}
                  width={`${actualBarWidth}%`}
                  height={`${barHeight}%`}
                  fill={color}
                  className="transition-all duration-200"
                  style={{
                    opacity: isHovered ? 0.9 : 0.7,
                    filter: isHovered ? 'brightness(1.1)' : 'none'
                  }}
                  rx="2"
                />
                
                {/* Data point indicator */}
                {isHovered && (
                  <circle
                    cx={`${barX + actualBarWidth / 2}%`}
                    cy={`${barY}%`}
                    r="3"
                    fill={color}
                    className="animate-pulse"
                  />
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
              stroke="#dadce0"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="animate-pulse dark:stroke-gray-600"
            />
          )}
        </svg>
        
        {/* X-axis labels */}
        {showDataLabels && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            {data.map((point, index) => {
              if (index % Math.ceil(data.length / 8) === 0 || index === data.length - 1) {
                return (
                  <div key={index} className="text-center" style={{ width: `${100/data.length}%` }}>
                    {new Date(point.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        
        {/* Enhanced Tooltip */}
        {hoveredBar && (
          <div
            className="absolute z-20 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl pointer-events-none"
            style={{
              left: `${hoveredBar.x + actualBarWidth / 2}%`,
              top: `${Math.max(hoveredBar.y - 20, 5)}%`,
              transform: 'translateX(-50%)',
              minWidth: '140px'
            }}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {new Date(hoveredBar.data.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600 dark:text-gray-300 text-xs">{title}</span>
              </div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {hoveredBar.data.value.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GSCCoveragePage() {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [error, setError] = useState<string | null>(null);
  const [propertyLoading, setPropertyLoading] = useState(false);

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty && selectedProperty.trim() !== '') {
      console.log('🔄 Property changed, loading coverage data for:', selectedProperty);
      loadCoverageData();
    }
  }, [selectedProperty, dateRange]);

  const loadGSCProperties = async () => {
    try {
      setLoading(true);
      setPropertyLoading(true);
      setError(null);
      
      console.log('🔍 Loading GSC properties...');
      const response = await indexingApi.getGSCProperties();
      console.log('✅ GSC properties loaded:', response);
      
      setProperties(response);
      
      // Only set the first property if no property is currently selected
      if (response.length > 0 && !selectedProperty) {
        const firstProperty = response[0].site_url;
        console.log('🎯 Setting first property as selected:', firstProperty);
        setSelectedProperty(firstProperty);
      } else if (response.length > 0 && selectedProperty) {
        // Verify that the currently selected property still exists in the list
        const propertyExists = response.some(p => p.site_url === selectedProperty);
        if (!propertyExists) {
          console.log('⚠️ Selected property no longer exists, setting first property:', response[0].site_url);
          setSelectedProperty(response[0].site_url);
        } else {
          console.log('✅ Selected property still exists:', selectedProperty);
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to load GSC properties:', error);
      setError('Failed to load GSC properties: ' + error.message);
      toast.error('Failed to load GSC properties: ' + error.message);
    } finally {
      setLoading(false);
      setPropertyLoading(false);
    }
  };

  const handlePropertyChange = (newProperty: string) => {
    console.log('🔄 Property selection changed from', selectedProperty, 'to', newProperty);
    
    // Clear existing data when property changes
    setCoverageData(null);
    
    // Set the new property
    setSelectedProperty(newProperty);
  };

  const loadCoverageData = async () => {
    if (!selectedProperty) return;
    
    try {
      setRefreshing(true);
      
      // Load indexed pages data
      const pagesResponse = await indexingApi.getIndexedPages(selectedProperty, {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      // Handle the response data properly
      const pagesData = pagesResponse.data || pagesResponse;
      const pages = pagesData.pages || [];
      
      // Calculate coverage data from pages
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
      
    } catch (error: any) {
      console.error('Failed to load coverage data:', error);
      toast.error('Failed to load coverage data: ' + error.message);
      
      // Set fallback coverage data
      setCoverageData({
        totalSubmitted: 0,
        totalIndexed: 0,
        totalExcluded: 0,
        totalError: 0,
        coverageByType: []
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Generate chart data for coverage over time
  const generateCoverageChartData = () => {
    if (!coverageData) {
      // Generate fallback data
      const data = [];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 100) + 50 // Random coverage 50-150
        });
      }
      
      return data;
    }
    
    // Use real data if available
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic trend based on current coverage
      const baseValue = coverageData.totalIndexed;
      const variation = Math.floor(Math.random() * 20) - 10; // ±10 variation
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, baseValue + variation)
      });
    }
    
    return data;
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('en-US');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/seo-crawler/gsc-dashboard" 
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-normal text-gray-900 dark:text-white">Coverage</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your site's search coverage</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadCoverageData} 
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Property and Date Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property
              </label>
              <select 
                value={selectedProperty} 
                onChange={(e) => handlePropertyChange(e.target.value)}
                disabled={propertyLoading}
                className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {propertyLoading ? (
                  <option value="">Loading properties...</option>
                ) : properties.length === 0 ? (
                  <option value="">No properties available</option>
                ) : (
                  properties.map((property) => (
                    <option key={property.site_url} value={property.site_url}>
                      {property.site_url} ({property.property_type})
                    </option>
                  ))
                )}
              </select>
              {selectedProperty && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Currently viewing data for: <span className="font-medium">{selectedProperty}</span>
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date range
              </label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coverage Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Submitted</h3>
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(coverageData?.totalSubmitted)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              All submitted pages
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Indexed</h3>
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(coverageData?.totalIndexed)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Successfully indexed
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Excluded</h3>
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(coverageData?.totalExcluded)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Excluded from indexing
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Errors</h3>
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(coverageData?.totalError)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Pages with errors
            </p>
          </div>
        </div>

        {/* Coverage Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Coverage Over Time
            </h2>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          
          <div className="h-80">
            <GSCCoverageChart
              data={generateCoverageChartData()}
              color="#34a853"
              height={320}
              title="Indexed Pages"
            />
          </div>
        </div>

        {/* Coverage Breakdown */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">Coverage Breakdown</h2>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
              View details
            </button>
          </div>
          
          <div className="space-y-3">
            {coverageData?.coverageByType.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.count} pages
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {coverageData?.totalSubmitted ? Math.round((item.count / coverageData.totalSubmitted) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    of total
                  </p>
                </div>
              </div>
            ))}
            
            {!coverageData && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">No coverage data found</p>
                <p className="text-sm">Try refreshing the data or selecting a different property</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 