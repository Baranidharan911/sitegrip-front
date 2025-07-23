'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Upload, 
  Download, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  FileText
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';
import Link from 'next/link';

// Enhanced Google Search Console style sitemaps chart component
const GSCSitemapsChart = ({
  data,
  color = "#1a73e8",
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
          <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500">No sitemaps data available</p>
          <p className="text-xs text-gray-400 mt-1">Sitemap metrics will appear here when data is available</p>
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
                <pattern id={`sitemaps-grid-${title}`} width="100" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 0 16 L 100 16" fill="none" stroke="#f8fafc" strokeWidth="0.5"/>
                </pattern>
                <linearGradient id="sitemapsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
                  <stop offset="100%" stopColor={color} stopOpacity="0.5"/>
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill={`url(#sitemaps-grid-${title})`} />
              
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
                  fill="url(#sitemapsGradient)"
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

export default function GSCSitemapsPage() {
  const [sitemaps, setSitemaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availableProperties, setAvailableProperties] = useState<string[]>([]);

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadSitemaps();
    }
  }, [selectedProperty]);

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

  const loadSitemaps = async () => {
    if (!selectedProperty) {
      setSitemaps([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to load real sitemaps data
      const response = await indexingApi.getIndexedPages(selectedProperty, {
        days: 30,
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      if (response.data && response.data.sitemaps) {
        setSitemaps(response.data.sitemaps);
      } else {
        setSitemaps([]);
      }
    } catch (error: any) {
      console.error('Failed to load sitemaps:', error);
      setSitemaps([]);
      toast.error('Failed to load sitemaps: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (sitemap: any) => {
    if (sitemap.isPending) return <Clock className="w-4 h-4 text-yellow-600" />;
    if (sitemap.errors > 0) return <XCircle className="w-4 h-4 text-red-600" />;
    if (sitemap.warnings > 0) return <AlertCircle className="w-4 h-4 text-orange-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  const getStatusText = (sitemap: any) => {
    if (sitemap.isPending) return 'Pending';
    if (sitemap.errors > 0) return 'Errors';
    if (sitemap.warnings > 0) return 'Warnings';
    return 'Success';
  };

  const getStatusColor = (sitemap: any) => {
    if (sitemap.isPending) return 'bg-yellow-100 text-yellow-800';
    if (sitemap.errors > 0) return 'bg-red-100 text-red-800';
    if (sitemap.warnings > 0) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
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
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
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
              <h1 className="text-2xl font-normal text-gray-900">Sitemaps</h1>
              <p className="text-sm text-gray-600">Manage your XML sitemaps</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadSitemaps} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Plus className="w-4 h-4" />
              Add sitemap
            </button>
          </div>
        </div>

        {/* Property Selector */}
        {availableProperties.length > 0 && (
          <div className="mb-6">
            <label htmlFor="property-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Property
            </label>
            <select
              id="property-select"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {availableProperties.map((property) => (
                <option key={property} value={property}>
                  {property}
                </option>
              ))}
            </select>
          </div>
        )}

        {sitemaps.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No sitemaps data available</h2>
            <p className="text-gray-500 mb-4">Sitemaps data is not currently available.</p>
            <button 
              onClick={loadSitemaps}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Sitemaps Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total sitemaps</h3>
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {sitemaps.length}
                </div>
                <div className="text-sm text-gray-600">
                  Submitted sitemaps
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total URLs</h3>
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(sitemaps.reduce((sum, sitemap) => sum + (sitemap.contents || 0), 0))}
                </div>
                <div className="text-sm text-gray-600">
                  URLs in sitemaps
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Errors</h3>
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(sitemaps.reduce((sum, sitemap) => sum + (sitemap.errors || 0), 0))}
                </div>
                <div className="text-sm text-gray-600">
                  Total errors
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Warnings</h3>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(sitemaps.reduce((sum, sitemap) => sum + (sitemap.warnings || 0), 0))}
                </div>
                <div className="text-sm text-gray-600">
                  Total warnings
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Sitemaps Performance Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Sitemaps Performance</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Total Sitemaps</span>
                  </div>
                </div>
                <div className="h-64">
                  <GSCSitemapsChart
                    data={[
                      { date: '2025-01-20', value: sitemaps.length },
                      { date: '2025-01-21', value: sitemaps.length },
                      { date: '2025-01-22', value: sitemaps.length },
                      { date: '2025-01-23', value: sitemaps.length },
                      { date: '2025-01-24', value: sitemaps.length },
                      { date: '2025-01-25', value: sitemaps.length },
                      { date: '2025-01-26', value: sitemaps.length }
                    ]}
                    color="#1a73e8"
                    height={240}
                    title="Total Sitemaps"
                  />
                </div>
              </div>

              {/* Sitemaps Status Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Sitemaps Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Successful Sitemaps</span>
                  </div>
                </div>
                <div className="h-64">
                  <GSCSitemapsChart
                    data={[
                      { date: '2025-01-20', value: sitemaps.filter(s => s.errors === 0 && s.warnings === 0).length },
                      { date: '2025-01-21', value: sitemaps.filter(s => s.errors === 0 && s.warnings === 0).length },
                      { date: '2025-01-22', value: sitemaps.filter(s => s.errors === 0 && s.warnings === 0).length },
                      { date: '2025-01-23', value: sitemaps.filter(s => s.errors === 0 && s.warnings === 0).length },
                      { date: '2025-01-24', value: sitemaps.filter(s => s.errors === 0 && s.warnings === 0).length },
                      { date: '2025-01-25', value: sitemaps.filter(s => s.errors === 0 && s.warnings === 0).length },
                      { date: '2025-01-26', value: sitemaps.filter(s => s.errors === 0 && s.warnings === 0).length }
                    ]}
                    color="#34a853"
                    height={240}
                    title="Successful Sitemaps"
                  />
                </div>
              </div>
            </div>

            {/* Sitemaps List */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Sitemaps ({sitemaps.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4" />
                      Submit sitemap
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {sitemaps.map((sitemap, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getStatusIcon(sitemap)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-gray-900 truncate">{sitemap.path}</p>
                            <a 
                              href={sitemap.path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {sitemap.isSitemapsIndex && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                Index
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            {sitemap.lastSubmitted ? `Last submitted: ${new Date(sitemap.lastSubmitted).toLocaleDateString()}` : 'Not submitted yet'}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              {formatNumber(sitemap.contents)} URLs
                            </span>
                            {sitemap.errors > 0 && (
                              <span className="text-sm text-red-600">
                                {sitemap.errors} errors
                              </span>
                            )}
                            {sitemap.warnings > 0 && (
                              <span className="text-sm text-orange-600">
                                {sitemap.warnings} warnings
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sitemap)}`}>
                          {getStatusText(sitemap)}
                        </span>
                        
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Add Sitemap Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add a new sitemap</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="https://www.example.com/sitemap.xml"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Submit
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Enter the URL of your XML sitemap to submit it to Google Search Console
          </p>
        </div>

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