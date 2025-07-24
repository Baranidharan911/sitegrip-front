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
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No sitemaps data available</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sitemap metrics will appear here when data is available</p>
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
    <div className="relative w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" style={{ height }}>
      {/* Chart Title and Legend */}
      <div className="flex items-center justify-between mb-4">
        {title && (
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">{title}</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-full">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
        >
          {/* Grid Lines */}
          {showGrid && yAxisLabels.map((label, index) => (
            <g key={index}>
              <line
                x1="0"
                y1={label.y}
                x2="100"
                y2={label.y}
                stroke="#f3f4f6"
                strokeWidth="0.5"
                className="dark:stroke-gray-700"
              />
              <text
                x="-2"
                y={label.y + 1}
                textAnchor="end"
                fontSize="8"
                fill="#6b7280"
                className="dark:fill-gray-400"
              >
                {label.value}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((item, index) => {
            const normalizedValue = (item.value - minValue) / range;
            const barHeight = normalizedValue * 80;
            const barY = 85 - barHeight;
            const barX = index * barWidth + barSpacing / 2;
            const isHovered = hoveredBar?.index === index;

            return (
              <g key={index}>
                <rect
                  x={barX}
                  y={barY}
                  width={actualBarWidth}
                  height={barHeight}
                  fill={color}
                  opacity={isHovered ? 0.8 : 0.6}
                  className="transition-all duration-200"
                />
                {showDataLabels && (
                  <text
                    x={barX + actualBarWidth / 2}
                    y={barY - 2}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#374151"
                    className="dark:fill-gray-300"
                  >
                    {item.value}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hover Indicator */}
          {hoveredBar && (
            <line
              x1={hoveredBar.x + actualBarWidth / 2}
              y1="5"
              x2={hoveredBar.x + actualBarWidth / 2}
              y2="95"
              stroke="#1f2937"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="animate-pulse dark:stroke-gray-600"
            />
          )}
        </svg>

        {/* Tooltip */}
        {hoveredBar && (
          <div
            className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none z-10"
            style={{
              left: `${hoveredBar.x + actualBarWidth / 2}%`,
              top: `${hoveredBar.y - 30}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {hoveredBar.data.date}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Value: {hoveredBar.data.value}
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
    if (sitemap.isPending) return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />;
    if (sitemap.errors > 0) return <XCircle className="w-4 h-4 text-red-600 dark:text-red-500" />;
    if (sitemap.warnings > 0) return <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />;
  };

  const getStatusText = (sitemap: any) => {
    if (sitemap.isPending) return 'Pending';
    if (sitemap.errors > 0) return 'Errors';
    if (sitemap.warnings > 0) return 'Warnings';
    return 'Success';
  };

  const getStatusColor = (sitemap: any) => {
    if (sitemap.isPending) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    if (sitemap.errors > 0) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    if (sitemap.warnings > 0) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('en-US');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
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
            <Link href="/seo-crawler/gsc-dashboard" className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-normal text-gray-900 dark:text-gray-100">Sitemaps</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your XML sitemaps</p>
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
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              Add sitemap
            </button>
          </div>
        </div>

        {/* Property Selector */}
        {availableProperties.length > 0 && (
          <div className="mb-6">
            <label htmlFor="property-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Property
            </label>
            <select
              id="property-select"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="block w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No sitemaps data available</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Sitemaps data is not currently available.</p>
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
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total sitemaps</h3>
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {sitemaps.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Submitted sitemaps
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total URLs</h3>
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {formatNumber(sitemaps.reduce((sum, sitemap) => sum + (sitemap.contents || 0), 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  URLs in sitemaps
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Errors</h3>
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {formatNumber(sitemaps.reduce((sum, sitemap) => sum + (sitemap.errors || 0), 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total errors
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Warnings</h3>
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {formatNumber(sitemaps.reduce((sum, sitemap) => sum + (sitemap.warnings || 0), 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total warnings
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Sitemaps Performance Chart */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sitemaps Performance</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Sitemaps</span>
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
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sitemaps Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Successful Sitemaps</span>
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
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Sitemaps ({sitemaps.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Submit sitemap
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {sitemaps.map((sitemap, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getStatusIcon(sitemap)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{sitemap.path}</p>
                            <a 
                              href={sitemap.path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {sitemap.isSitemapsIndex && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                                Index
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {sitemap.lastSubmitted ? `Last submitted: ${new Date(sitemap.lastSubmitted).toLocaleDateString()}` : 'Not submitted yet'}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatNumber(sitemap.contents)} URLs
                            </span>
                            {sitemap.errors > 0 && (
                              <span className="text-sm text-red-600 dark:text-red-400">
                                {sitemap.errors} errors
                              </span>
                            )}
                            {sitemap.warnings > 0 && (
                              <span className="text-sm text-orange-600 dark:text-orange-400">
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
                        
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Add a new sitemap</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="https://www.example.com/sitemap.xml"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Submit
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter the URL of your XML sitemap to submit it to Google Search Console
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/help" className="hover:text-gray-700 dark:hover:text-gray-300">Help</a>
              <a href="/feedback" className="hover:text-gray-700 dark:hover:text-gray-300">Send feedback</a>
              <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 