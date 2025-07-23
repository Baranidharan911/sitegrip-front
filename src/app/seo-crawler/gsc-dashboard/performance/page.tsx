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

// Enhanced Google Search Console style chart component
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
      <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500">No data available</p>
          <p className="text-xs text-gray-400 mt-1">Data will appear here when available</p>
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
            {formatValue(label.value)}
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
                <pattern id={`perf-grid-${title}`} width="100" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 0 16 L 100 16" fill="none" stroke="#f8fafc" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#perf-grid-${title})`} />
              
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
                  rx="1"
                />
                
                {/* Main bar */}
                <rect
                  x={`${barX}%`}
                  y={`${barY}%`}
                  width={`${actualBarWidth}%`}
                  height={`${barHeight}%`}
                  fill={color}
                  className="transition-all duration-200"
                  style={{
                    opacity: isHovered ? 0.95 : 0.8,
                    filter: isHovered ? 'brightness(1.05) saturate(1.1)' : 'none'
                  }}
                  rx="1.5"
                />
                
                {/* Hover highlight */}
                {isHovered && (
                  <>
                    <rect
                      x={`${barX}%`}
                      y={`${barY}%`}
                      width={`${actualBarWidth}%`}
                      height={`${barHeight}%`}
                      fill="url(#barGradient)"
                      rx="1.5"
                      opacity="0.3"
                    />
                    <circle
                      cx={`${barX + actualBarWidth / 2}%`}
                      cy={`${barY}%`}
                      r="2"
                      fill={color}
                      className="animate-pulse"
                    />
                  </>
                )}
              </g>
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="white" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          
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
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availableProperties, setAvailableProperties] = useState<string[]>([]);
  const [propertyLoading, setPropertyLoading] = useState(true);

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
      setPropertyLoading(true);
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
      toast.error('Failed to load Google Search Console properties. Please ensure you have connected your GSC account.');
    } finally {
      setPropertyLoading(false);
    }
  };

  const loadPerformanceData = async () => {
    if (!selectedProperty) {
      setPerformanceData(null);
      setHistoricalData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to load real performance data
      const response = await indexingApi.getPerformanceHistory(selectedProperty, parseInt(dateRange));
      
      if (response.data && response.data.history && response.data.history.length > 0) {
        setHistoricalData(response.data.history);
        
        // Calculate performance metrics from historical data
        const totalClicks = response.data.history.reduce((sum: number, day: any) => sum + (day.clicks || 0), 0);
        const totalImpressions = response.data.history.reduce((sum: number, day: any) => sum + (day.impressions || 0), 0);
        const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
        const avgPosition = response.data.history.reduce((sum: number, day: any) => sum + (day.position || 0), 0) / response.data.history.length;
        
        setPerformanceData({
          totalClicks,
          totalImpressions,
          avgCTR,
          avgPosition
        });
      } else {
        setPerformanceData(null);
        setHistoricalData([]);
      }
    } catch (error: any) {
      console.error('Failed to load performance data:', error);
      setPerformanceData(null);
      setHistoricalData([]);
      toast.error('Failed to load performance data: ' + error.message);
    } finally {
      setLoading(false);
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

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 w-48 mx-auto bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-32 mx-auto bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (availableProperties.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/seo-crawler/gsc-dashboard" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-normal text-gray-900">Performance</h1>
              <p className="text-sm text-gray-600">Search performance over time</p>
            </div>
          </div>
          
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No Google Search Console properties found</h2>
            <p className="text-gray-500 mb-4">You need to connect your Google Search Console account to view performance data.</p>
            <button 
              onClick={loadGSCProperties}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const hasData = performanceData && historicalData.length > 0;

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
              <h1 className="text-2xl font-normal text-gray-900">Performance</h1>
              <p className="text-sm text-gray-600">Search performance over time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadPerformanceData} 
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

        {/* Property Selector */}
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
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No performance data available</h2>
            <p className="text-gray-500 mb-4">Performance data is not currently available for the selected property and period.</p>
            <button 
              onClick={loadPerformanceData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total clicks</h3>
                  <MousePointer className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(performanceData?.totalClicks)}
                </div>
                <div className="text-sm text-gray-600">
                  Clicks from search results
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total impressions</h3>
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(performanceData?.totalImpressions)}
                </div>
                <div className="text-sm text-gray-600">
                  Times shown in search
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Average CTR</h3>
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCTR(performanceData?.avgCTR)}
                </div>
                <div className="text-sm text-gray-600">
                  Click-through rate
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Average position</h3>
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {performanceData?.avgPosition?.toFixed(1) || '0'}
                </div>
                <div className="text-sm text-gray-600">
                  Average search position
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Clicks Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Clicks over time</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Clicks</span>
                  </div>
                </div>
                <div className="h-64">
                  <GSCPerformanceChart
                    data={historicalData.map(d => ({ date: d.date, value: d.clicks || 0 }))}
                    color="#1a73e8"
                    height={240}
                    title="Clicks"
                    metric="clicks"
                  />
                </div>
              </div>

              {/* Impressions Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Impressions over time</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Impressions</span>
                  </div>
                </div>
                <div className="h-64">
                  <GSCPerformanceChart
                    data={historicalData.map(d => ({ date: d.date, value: d.impressions || 0 }))}
                    color="#34a853"
                    height={240}
                    title="Impressions"
                    metric="impressions"
                  />
                </div>
              </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* CTR Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">CTR over time</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">CTR (%)</span>
                  </div>
                </div>
                <div className="h-64">
                  <GSCPerformanceChart
                    data={historicalData.map(d => ({ date: d.date, value: d.ctr || 0 }))}
                    color="#9c27b0"
                    height={240}
                    title="CTR"
                    metric="ctr"
                  />
                </div>
              </div>

              {/* Position Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Position over time</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Position</span>
                  </div>
                </div>
                <div className="h-64">
                  <GSCPerformanceChart
                    data={historicalData.map(d => ({ date: d.date, value: d.position || 0 }))}
                    color="#ff9800"
                    height={240}
                    title="Position"
                    metric="position"
                  />
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