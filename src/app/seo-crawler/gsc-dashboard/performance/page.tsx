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

// Interactive line chart component with hover effects
const InteractiveLineChart = ({ data, color = "#1a73e8", height = 200, title = "" }: { 
  data: Array<{ date: string; value: number }>, 
  color?: string, 
  height?: number,
  title?: string 
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: any } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return { x, y, data: point };
  });

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    
    // Find the closest point
    const closestPoint = points.reduce((closest, point) => {
      const distance = Math.abs(point.x - x);
      return distance < Math.abs(closest.x - x) ? point : closest;
    }, points[0]);

    setHoveredPoint(closestPoint);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="relative" style={{ height }}>
      <svg 
        width="100%" 
        height="100%" 
        className="absolute inset-0 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          </pattern>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Gradient fill */}
        <polyline
          fill={`url(#gradient-${color})`}
          stroke="none"
          points={`${pointsString} 100,100 0,100`}
        />
        
        {/* Main line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={pointsString}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="3"
            fill={color}
            className="transition-all duration-200 hover:r-5"
            style={{ opacity: hoveredPoint?.data === point.data ? 1 : 0.6 }}
          />
        ))}
        
        {/* Hover indicator line */}
        {hoveredPoint && (
          <line
            x1={`${hoveredPoint.x}%`}
            y1="0"
            x2={`${hoveredPoint.x}%`}
            y2="100%"
            stroke="#e0e0e0"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}
      </svg>
      
      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-10 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-gray-600">
            {new Date(hoveredPoint.data.date).toLocaleDateString()}
          </div>
          <div className="font-semibold text-blue-600">
            {hoveredPoint.data.value.toLocaleString()}
          </div>
        </div>
      )}
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
                  <InteractiveLineChart 
                    data={historicalData.map(d => ({ date: d.date, value: d.clicks || 0 }))}
                    color="#1a73e8"
                    height={240}
                    title="Clicks"
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
                  <InteractiveLineChart 
                    data={historicalData.map(d => ({ date: d.date, value: d.impressions || 0 }))}
                    color="#34a853"
                    height={240}
                    title="Impressions"
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
                  <InteractiveLineChart 
                    data={historicalData.map(d => ({ date: d.date, value: (d.ctr || 0) * 100 }))}
                    color="#9c27b0"
                    height={240}
                    title="CTR (%)"
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
                  <InteractiveLineChart 
                    data={historicalData.map(d => ({ date: d.date, value: d.position || 0 }))}
                    color="#ff9800"
                    height={240}
                    title="Position"
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