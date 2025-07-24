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

// Enhanced Google Search Console style pages chart component
const GSCPagesChart = ({
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
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No pages data available</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Page metrics will appear here when data is available</p>
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

export default function GSCPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availableProperties, setAvailableProperties] = useState<string[]>([]);

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadPages();
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

  const loadPages = async () => {
    if (!selectedProperty) {
      setPages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to load real pages data
      const response = await indexingApi.getIndexedPages(selectedProperty, {
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
      case 'Submitted and indexed': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />;
      case 'Discovered – currently not indexed': return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />;
      case 'Crawled – currently not indexed': return <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-500" />;
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
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
              <h1 className="text-2xl font-normal text-gray-900 dark:text-gray-100">Pages</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and manage indexed pages</p>
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
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Property, Search and Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Property
              </label>
              <select 
                value={selectedProperty} 
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {availableProperties.map((property) => (
                  <option key={property} value={property}>
                    {property}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No pages data available</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Pages data is not currently available.</p>
            <button 
              onClick={loadPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pages Performance Chart */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pages Performance</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Pages</span>
                  </div>
                </div>
                <div className="h-64">
                  <GSCPagesChart
                    data={[
                      { date: '2025-01-20', value: pages.length },
                      { date: '2025-01-21', value: pages.length },
                      { date: '2025-01-22', value: pages.length },
                      { date: '2025-01-23', value: pages.length },
                      { date: '2025-01-24', value: pages.length },
                      { date: '2025-01-25', value: pages.length },
                      { date: '2025-01-26', value: pages.length }
                    ]}
                    color="#1a73e8"
                    height={240}
                    title="Total Pages"
                  />
                </div>
              </div>

              {/* Indexing Status Chart */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Indexing Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Indexed Pages</span>
                  </div>
                </div>
                <div className="h-64">
                  <GSCPagesChart
                    data={[
                      { date: '2025-01-20', value: pages.filter(p => p.indexed).length },
                      { date: '2025-01-21', value: pages.filter(p => p.indexed).length },
                      { date: '2025-01-22', value: pages.filter(p => p.indexed).length },
                      { date: '2025-01-23', value: pages.filter(p => p.indexed).length },
                      { date: '2025-01-24', value: pages.filter(p => p.indexed).length },
                      { date: '2025-01-25', value: pages.filter(p => p.indexed).length },
                      { date: '2025-01-26', value: pages.filter(p => p.indexed).length }
                    ]}
                    color="#34a853"
                    height={240}
                    title="Indexed Pages"
                  />
                </div>
              </div>
            </div>

            {/* Pages List */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Pages ({filteredPages.length})
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredPages.length} of {pages.length} pages
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPages.map((page, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getStatusIcon(page.coverageState || '')}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{page.url}</p>
                          <a 
                            href={page.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {page.lastCrawled ? `Last crawled: ${new Date(page.lastCrawled).toLocaleDateString()}` : 'Not crawled yet'}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          page.indexed 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {page.coverageState || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 ml-4">
                      {page.clicks !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatNumber(page.clicks)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
                        </div>
                      )}
                      
                      {page.impressions !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatNumber(page.impressions)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Impressions</p>
                        </div>
                      )}
                      
                      {page.ctr !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCTR(page.ctr)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
                        </div>
                      )}
                      
                      {page.position !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{page.position?.toFixed(1) || '0'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPages.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No pages found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
          </>
        )}

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