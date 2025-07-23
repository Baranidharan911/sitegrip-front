'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Download,
  Filter,
  ArrowLeft,
  Search,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';
import Link from 'next/link';

// Interactive bar chart component with hover effects (like Google's design)
const InteractiveBarChart = ({ data, color = "#34a853", height = 200, title = "" }: { 
  data: Array<{ date: string; value: number }>, 
  color?: string, 
  height?: number,
  title?: string 
}) => {
  const [hoveredBar, setHoveredBar] = useState<{ x: number; y: number; data: any } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 100 / data.length;
  const barSpacing = barWidth * 0.1; // 10% spacing between bars
  const actualBarWidth = barWidth - barSpacing;

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    
    // Find which bar we're hovering over
    const barIndex = Math.floor(x / barWidth);
    if (barIndex >= 0 && barIndex < data.length) {
      const barData = data[barIndex];
      const barX = barIndex * barWidth + barSpacing / 2;
      const barHeight = (barData.value / maxValue) * 100;
      const barY = 100 - barHeight;
      
      setHoveredBar({ x: barX, y: barY, data: barData });
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
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
        </defs>
        
        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Bars */}
        {data.map((point, index) => {
          const barX = index * barWidth + barSpacing / 2;
          const barHeight = (point.value / maxValue) * 100;
          const barY = 100 - barHeight;
          const isHovered = hoveredBar?.data === point;
          
          return (
            <rect
              key={index}
              x={`${barX}%`}
              y={`${barY}%`}
              width={`${actualBarWidth}%`}
              height={`${barHeight}%`}
              fill={color}
              className="transition-all duration-200"
              style={{ 
                opacity: isHovered ? 1 : 0.8,
                filter: isHovered ? 'brightness(1.1)' : 'none'
              }}
            />
          );
        })}
        
        {/* Hover indicator line */}
        {hoveredBar && (
          <line
            x1={`${hoveredBar.x + actualBarWidth / 2}%`}
            y1="0"
            x2={`${hoveredBar.x + actualBarWidth / 2}%`}
            y2="100%"
            stroke="#e0e0e0"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}
      </svg>
      
      {/* Tooltip */}
      {hoveredBar && (
        <div
          className="absolute z-10 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 40,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-medium text-gray-900">
            {new Date(hoveredBar.data.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'short' 
            })}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-gray-600">{title}</span>
          </div>
          <div className="font-semibold text-gray-900 mt-1">
            {hoveredBar.data.value.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default function GSCActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [availableProperties, setAvailableProperties] = useState<string[]>([]);

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadActivities();
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

  const loadActivities = async () => {
    if (!selectedProperty) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try to load real activity data
      const response = await indexingApi.getIndexedPages(selectedProperty, {
        days: 30,
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      if (response.data && response.data.pages) {
        // Convert pages data to activity format
        const pages = response.data.pages;
        const activities = pages.map((page: any, index: number) => ({
          id: index + 1,
          type: 'indexing',
          status: page.indexed ? 'success' : 'warning',
          title: page.indexed ? 'Page indexed successfully' : 'Page not indexed',
          description: `${page.url} ${page.indexed ? 'was successfully indexed' : 'is not currently indexed'}`,
          timestamp: page.lastCrawled || new Date().toISOString(),
          url: page.url,
          details: {
            clicks: page.clicks || 0,
            impressions: page.impressions || 0,
            ctr: page.ctr || 0,
            position: page.position || 0
          }
        }));
        
        setActivities(activities);
      } else {
        setActivities([]);
      }
    } catch (error: any) {
      console.error('Failed to load activities:', error);
      setActivities([]);
      toast.error('Failed to load activities: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'info': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'indexing': return <CheckCircle className="w-4 h-4" />;
      case 'crawl': return <Search className="w-4 h-4" />;
      case 'sitemap': return <Calendar className="w-4 h-4" />;
      case 'performance': return <Activity className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'coverage': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Success';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      case 'info': return 'Info';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('en-US');
  };

  const filteredActivities = activities.filter(activity => {
    if (filterType === 'all') return true;
    return activity.type === filterType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
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
              <h1 className="text-2xl font-normal text-gray-900">Recent activity</h1>
              <p className="text-sm text-gray-600">Monitor your site's recent activities</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadActivities} 
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

        {/* Property Selector and Filter */}
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableProperties.map((property) => (
                    <option key={property} value={property}>
                      {property}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by type
              </label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All activities</option>
                <option value="indexing">Indexing</option>
                <option value="crawl">Crawl</option>
                <option value="sitemap">Sitemap</option>
                <option value="performance">Performance</option>
                <option value="error">Errors</option>
                <option value="coverage">Coverage</option>
              </select>
            </div>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No activity data available</h2>
            <p className="text-gray-500 mb-4">Activity data is not currently available.</p>
            <button 
              onClick={loadActivities}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Activity Performance Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Activity Performance</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Total Activities</span>
                  </div>
                </div>
                <div className="h-64">
                  <InteractiveBarChart 
                    data={[
                      { date: '2025-01-20', value: activities.length },
                      { date: '2025-01-21', value: activities.length },
                      { date: '2025-01-22', value: activities.length },
                      { date: '2025-01-23', value: activities.length },
                      { date: '2025-01-24', value: activities.length },
                      { date: '2025-01-25', value: activities.length },
                      { date: '2025-01-26', value: activities.length }
                    ]}
                    color="#1a73e8"
                    height={240}
                    title="Total Activities"
                  />
                </div>
              </div>

              {/* Activity Status Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Activity Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Successful Activities</span>
                  </div>
                </div>
                <div className="h-64">
                  <InteractiveBarChart 
                    data={[
                      { date: '2025-01-20', value: activities.filter(a => a.status === 'success').length },
                      { date: '2025-01-21', value: activities.filter(a => a.status === 'success').length },
                      { date: '2025-01-22', value: activities.filter(a => a.status === 'success').length },
                      { date: '2025-01-23', value: activities.filter(a => a.status === 'success').length },
                      { date: '2025-01-24', value: activities.filter(a => a.status === 'success').length },
                      { date: '2025-01-25', value: activities.filter(a => a.status === 'success').length },
                      { date: '2025-01-26', value: activities.filter(a => a.status === 'success').length }
                    ]}
                    color="#34a853"
                    height={240}
                    title="Successful Activities"
                  />
                </div>
              </div>
            </div>

            {/* Activities List */}
            <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Activities ({filteredActivities.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {filteredActivities.length} of {activities.length} activities
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {getStatusText(activity.status)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                      
                      {activity.url && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-gray-500">URL:</span>
                          <a 
                            href={activity.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm truncate"
                          >
                            {activity.url}
                          </a>
                          <a 
                            href={activity.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                      
                      {/* Activity Details */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(activity.type)}
                          <span className="text-sm font-medium text-gray-700 capitalize">{activity.type}</span>
                        </div>
                        
                        {activity.details && (
                          <div className="text-sm text-gray-600">
                            {activity.type === 'indexing' && activity.details.clicks !== undefined && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <span className="font-medium">Clicks:</span> {formatNumber(activity.details.clicks)}
                                </div>
                                <div>
                                  <span className="font-medium">Impressions:</span> {formatNumber(activity.details.impressions)}
                                </div>
                                <div>
                                  <span className="font-medium">CTR:</span> {((activity.details.ctr || 0) * 100).toFixed(1)}%
                                </div>
                                <div>
                                  <span className="font-medium">Position:</span> {activity.details.position?.toFixed(1) || '0'}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredActivities.length === 0 && (
              <div className="p-12 text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900 mb-2">No activities found</p>
                <p className="text-sm text-gray-500">Try adjusting your filter criteria or refreshing the data</p>
              </div>
            )}
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