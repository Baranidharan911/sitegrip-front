'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Target,
  RefreshCw,
  Download,
  Filter,
  ArrowLeft,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';
import Link from 'next/link';

// Enhanced Google Search Console style chart component with dark mode support
const GSCPerformanceChart = ({
  data,
  color = "#1a73e8",
  height = 240,
  title = "",
  showDataLabels = true,
  showGrid = true,
  metric = "value"
}: {
  data: Array<{ date: string; value: number }>,
  color?: string,
  height?: number,
  title?: string,
  showDataLabels?: boolean,
  showGrid?: boolean,
  metric?: string
}) => {
  const [hoveredBar, setHoveredBar] = useState<{ x: number; y: number; data: any; index: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No data available</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Data will appear here when available</p>
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

  // Format value based on metric type
  const formatValue = (value: number) => {
    if (metric === "ctr") return `${(value * 100).toFixed(1)}%`;
    if (metric === "position") return value.toFixed(1);
    return value.toLocaleString();
  };

  return (
    <div className="relative w-full bg-transparent rounded-lg p-4" style={{ height }}>
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
            {formatValue(label.value)}
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
          {/* Grid lines */}
          {showGrid && yAxisLabels.map((label, index) => (
            <line
              key={index}
              x1="0"
              y1={label.y}
              x2="100"
              y2={label.y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-200 dark:text-gray-700"
            />
          ))}
          
          {/* Bars */}
          {data.map((point, index) => {
            const barX = index * barWidth + barSpacing / 2;
            const normalizedValue = (point.value - minValue) / range;
            const barHeight = normalizedValue * 80;
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
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="animate-pulse text-gray-400 dark:text-gray-500"
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
                {formatValue(hoveredBar.data.value)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GSCPerformancePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [selectedMetric, setSelectedMetric] = useState('clicks');

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadPerformanceData();
    }
  }, [selectedProperty, dateRange]);

  const loadGSCProperties = async () => {
    try {
      setLoading(true);
      const response = await indexingApi.getGSCProperties();
      setProperties(response);
      if (response.length > 0) {
        setSelectedProperty(response[0].site_url);
      }
    } catch (error: any) {
      toast.error('Failed to load GSC properties: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceData = async () => {
    if (!selectedProperty) return;
    
    try {
      setRefreshing(true);
      
      const pagesResponse = await indexingApi.getIndexedPages(selectedProperty, {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      setPerformanceData(pagesResponse.data.performance || null);
      
      const historyResponse = await indexingApi.getPerformanceHistory(selectedProperty, parseInt(dateRange));
      if (historyResponse.data.history && historyResponse.data.history.length > 0) {
        setHistoricalData(historyResponse.data.history);
      }
      
    } catch (error: any) {
      console.error('Failed to load performance data:', error);
      toast.error('Failed to load performance data: ' + error.message);
    } finally {
      setRefreshing(false);
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

  const formatPosition = (position: number | undefined | null): string => {
    if (!position && position !== 0) return '0';
    return position.toFixed(1);
  };

  const getMetricData = () => {
    if (!historicalData) return [];
    
    return historicalData.map((item: any) => ({
      date: item.date,
      value: item[selectedMetric] || 0
    }));
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'clicks': return '#1a73e8';
      case 'impressions': return '#34a853';
      case 'ctr': return '#fbbc04';
      case 'position': return '#ea4335';
      default: return '#1a73e8';
    }
  };

  const getMetricTitle = () => {
    switch (selectedMetric) {
      case 'clicks': return 'Clicks';
      case 'impressions': return 'Impressions';
      case 'ctr': return 'Click-through rate';
      case 'position': return 'Average position';
      default: return 'Clicks';
    }
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
              <h1 className="text-2xl font-normal text-gray-900 dark:text-white">Performance</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Search performance metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadPerformanceData} 
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
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {properties.map((property) => (
                  <option key={property.site_url} value={property.site_url}>
                    {property.site_url} ({property.property_type})
                  </option>
                ))}
              </select>
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

        {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Clicks</h3>
              <MousePointer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(performanceData?.totalClicks)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Web search clicks
            </p>
              </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Impressions</h3>
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(performanceData?.totalImpressions)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Search result views
            </p>
              </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Average CTR</h3>
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCTR(performanceData?.avgCTR)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Click-through rate
            </p>
              </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Average Position</h3>
              <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatPosition(performanceData?.avgPosition)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Search result position
            </p>
              </div>
            </div>

        {/* Metric Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Metric
          </label>
          <div className="flex gap-2">
            {[
              { key: 'clicks', title: 'Clicks', icon: MousePointer, color: 'text-blue-600 dark:text-blue-400' },
              { key: 'impressions', title: 'Impressions', icon: Eye, color: 'text-green-600 dark:text-green-400' },
              { key: 'ctr', title: 'Click-through rate', icon: TrendingUp, color: 'text-yellow-600 dark:text-yellow-400' },
              { key: 'position', title: 'Average position', icon: Target, color: 'text-red-600 dark:text-red-400' }
            ].map(({ key, title, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedMetric === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Icon className={`w-4 h-4 ${selectedMetric === key ? 'text-white' : color}`} />
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                {getMetricTitle()} Over Time
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getMetricColor() }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{getMetricTitle()}</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          
          <div className="h-80 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <GSCPerformanceChart
              data={getMetricData()}
              color={getMetricColor()}
              height={320}
              title={getMetricTitle()}
              metric={selectedMetric}
            />
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Monitor your performance</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Track how your site performs in search results</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Optimize for better results</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Improve your search visibility and rankings</p>
                </div>
              </div>
                </div>
              </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/seo-crawler/gsc-dashboard/indexing"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Check Indexing Status</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Monitor which pages are indexed</p>
                </div>
              </Link>
              <Link 
                href="/seo-crawler/gsc-dashboard/coverage"
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">View Coverage Report</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">See coverage issues and errors</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 