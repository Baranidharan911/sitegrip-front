'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Search, 
  Globe, 
  Eye, 
  MousePointer, 
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
  Calendar,
  BarChart,
  PieChart,
  Activity,
  Database,
  FileText,
  Sparkles,
  ExternalLink,
  Settings,
  MoreHorizontal,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';

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
  crawlAllowed?: boolean;
  robotsTxtState?: string;
  mobileUsabilityResult?: any;
  richResultsItems?: any[];
  lastCrawlTime?: string;
  pageFetchState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  sitemap?: string[];
  referringUrls?: string[];
  richResults?: any;
  mobileUsability?: any;
  structuredData?: any;
  links?: any;
  screenshot?: any;
}

interface IndexingSummary {
  totalPages: number;
  indexedPages: number;
  notIndexedPages: number;
  pendingPages: number;
  errorPages: number;
  indexingRate: number;
  lastUpdated: string;
}

interface PerformanceData {
  totalClicks: number;
  totalImpressions: number;
  avgCTR: number;
  avgPosition: number;
}

interface CoverageData {
  totalSubmitted: number;
  totalIndexed: number;
  totalExcluded: number;
  totalError: number;
  coverageByType: any[];
}

interface SitemapData {
  path: string;
  lastSubmitted: string;
  contents: number;
  errors: number;
  warnings: number;
  isPending: boolean;
  isSitemapsIndex: boolean;
}

interface EnhancementsData {
  structuredData: any[];
  mobileUsability: any[];
  coreWebVitals: any[];
  richResults: any[];
}

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
            left: `${hoveredBar.x + actualBarWidth / 2}%`,
            top: `${hoveredBar.y - 10}%`,
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

// Interactive stacked bar chart component (like the second image)
const InteractiveStackedBarChart = ({ 
  data, 
  height = 200, 
  title = "" 
}: { 
  data: Array<{ 
    date: string; 
    indexed: number; 
    notIndexed: number; 
  }>, 
  height?: number,
  title?: string 
}) => {
  const [hoveredBar, setHoveredBar] = useState<{ x: number; data: any } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.indexed + d.notIndexed));
  const barWidth = 100 / data.length;
  const barSpacing = barWidth * 0.1;
  const actualBarWidth = barWidth - barSpacing;

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    
    const barIndex = Math.floor(x / barWidth);
    if (barIndex >= 0 && barIndex < data.length) {
      const barData = data[barIndex];
      const barX = barIndex * barWidth + barSpacing / 2;
      
      setHoveredBar({ x: barX, data: barData });
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
        
        {/* Stacked bars */}
        {data.map((point, index) => {
          const barX = index * barWidth + barSpacing / 2;
          const totalHeight = ((point.indexed + point.notIndexed) / maxValue) * 100;
          const notIndexedHeight = (point.notIndexed / maxValue) * 100;
          const indexedHeight = (point.indexed / maxValue) * 100;
          const barY = 100 - totalHeight;
          const isHovered = hoveredBar?.data === point;
          
          return (
            <g key={index}>
              {/* Not indexed (bottom) */}
              <rect
                x={`${barX}%`}
                y={`${barY + indexedHeight}%`}
                width={`${actualBarWidth}%`}
                height={`${notIndexedHeight}%`}
                fill="#9aa0a6"
                className="transition-all duration-200"
                style={{ 
                  opacity: isHovered ? 1 : 0.8,
                  filter: isHovered ? 'brightness(1.1)' : 'none'
                }}
              />
              {/* Indexed (top) */}
              <rect
                x={`${barX}%`}
                y={`${barY}%`}
                width={`${actualBarWidth}%`}
                height={`${indexedHeight}%`}
                fill="#34a853"
                className="transition-all duration-200"
                style={{ 
                  opacity: isHovered ? 1 : 0.8,
                  filter: isHovered ? 'brightness(1.1)' : 'none'
                }}
              />
            </g>
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
            left: `${hoveredBar.x + actualBarWidth / 2}%`,
            top: '10%',
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
            <div className="w-3 h-3 rounded-sm bg-gray-400"></div>
            <span className="text-gray-600">Not indexed {hoveredBar.data.notIndexed}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-sm bg-green-500"></div>
            <span className="text-gray-600">Indexed {hoveredBar.data.indexed}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function GSCDashboardPage() {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [indexedPages, setIndexedPages] = useState<IndexedPage[]>([]);
  const [indexingSummary, setIndexingSummary] = useState<IndexingSummary | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [sitemapsData, setSitemapsData] = useState<SitemapData[]>([]);
  const [enhancementsData, setEnhancementsData] = useState<EnhancementsData | null>(null);
  const [historicalData, setHistoricalData] = useState<Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadGSCProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      loadGSCData();
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

  const loadGSCData = async () => {
    if (!selectedProperty) return;
    
    try {
      setRefreshing(true);
      
      console.log('🔍 Loading GSC data for property:', selectedProperty);
      
      const pagesResponse = await indexingApi.getIndexedPages(selectedProperty, {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      console.log('📊 Pages Response:', pagesResponse);
      console.log('📈 Performance Data:', pagesResponse.data.performance);
      console.log('📄 Pages Count:', pagesResponse.data.pages?.length);
      
      setIndexedPages(pagesResponse.data.pages || []);
      setPerformanceData(pagesResponse.data.performance || null);
      setCoverageData(pagesResponse.data.coverage || null);
      setSitemapsData(pagesResponse.data.sitemaps || []);
      setEnhancementsData(pagesResponse.data.enhancements || null);
      
      const summaryResponse = await indexingApi.getIndexingSummary(selectedProperty);
      console.log('📊 Summary Response:', summaryResponse);
      setIndexingSummary(summaryResponse.data.summary || null);
      
      const historyResponse = await indexingApi.getPerformanceHistory(selectedProperty, parseInt(dateRange));
      console.log('📈 History Response:', historyResponse);
      if (historyResponse.data.history && historyResponse.data.history.length > 0) {
        setHistoricalData(historyResponse.data.history);
        console.log('✅ Using real historical data:', historyResponse.data.history.length, 'days');
      } else {
        console.log('⚠️ No historical data available, will use fallback');
      }
      
    } catch (error: any) {
      console.error('❌ Failed to load GSC data:', error);
      toast.error('Failed to load GSC data: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted and indexed': return 'text-green-600';
      case 'Discovered – currently not indexed': return 'text-yellow-600';
      case 'Crawled – currently not indexed': return 'text-orange-600';
      default: return 'text-gray-600';
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

  const formatNumber = (value: number | undefined | null, decimals: number = 0): string => {
    if (!value && value !== 0) return '0';
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatCTR = (ctr: number | undefined | null): string => {
    if (!ctr && ctr !== 0) return '0%';
    return `${(ctr * 100).toFixed(1)}%`;
  };

  const formatPosition = (position: number | undefined | null): string => {
    if (!position && position !== 0) return '0';
    return position.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Google Search Console Style Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-normal text-gray-900">Search Console</h1>
              <p className="text-sm text-gray-600">Monitor your site's search performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadGSCData} 
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Property Selector - Google Style */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <select 
                value={selectedProperty} 
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {properties.map((property) => (
                  <option key={property.site_url} value={property.site_url}>
                    {property.site_url} ({property.property_type})
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

        {/* Main Dashboard - Google Search Console Style */}
        <div className="space-y-8">
          {/* Overview Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-900">Overview</h2>
              <a href="/seo-crawler/gsc-dashboard/performance" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                Explore your insights
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Card */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Performance</h3>
                  <a href="/seo-crawler/gsc-dashboard/performance" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                    Full report
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      {formatNumber(performanceData?.totalClicks)} total web search clicks
                    </span>
                  </div>
                </div>
                {historicalData && (
                  <div className="h-32 mb-4">
                    <InteractiveBarChart 
                      data={historicalData.map(d => ({ date: d.date, value: d.clicks }))}
                      color="#1a73e8"
                      height={120}
                      title="Clicks"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500">Performance data available for the selected period</p>
              </div>

              {/* Indexing Card */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Indexing</h3>
                  <a href="/seo-crawler/gsc-dashboard/indexing" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                    Full report
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {indexedPages.filter(page => !page.indexed).length} not indexed pages
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {indexedPages.filter(page => page.indexed).length} indexed pages
                      </span>
                    </div>
                  </div>
                </div>
                
                {historicalData && (
                  <div className="h-32 mb-4">
                    <InteractiveStackedBarChart 
                      data={historicalData.map(d => ({ 
                        date: d.date, 
                        indexed: indexedPages.filter(page => page.indexed).length,
                        notIndexed: indexedPages.filter(page => !page.indexed).length
                      }))}
                      height={120}
                      title="Pages"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500">Indexing status overview for the selected property</p>
              </div>

              {/* Coverage Card */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Coverage</h3>
                  <a href="/seo-crawler/gsc-dashboard/coverage" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                    Full report
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
                
                {coverageData && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total submitted</span>
                      <span className="font-medium">{coverageData.totalSubmitted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total indexed</span>
                      <span className="font-medium text-green-600">{coverageData.totalIndexed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total excluded</span>
                      <span className="font-medium text-yellow-600">{coverageData.totalExcluded}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total errors</span>
                      <span className="font-medium text-red-600">{coverageData.totalError}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-yellow-600">💡</div>
                    <span className="text-sm text-gray-700">Get insights into your site's Search performance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/seo-crawler/gsc-dashboard/performance" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Performance</h3>
                  <p className="text-sm text-gray-600">View search performance</p>
                </div>
              </a>
              
              <a href="/seo-crawler/gsc-dashboard/indexing" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Target className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Indexing</h3>
                  <p className="text-sm text-gray-600">Check indexing status</p>
                </div>
              </a>
              
              <a href="/seo-crawler/gsc-dashboard/pages" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Pages</h3>
                  <p className="text-sm text-gray-600">View indexed pages</p>
                </div>
              </a>
              
              <a href="/seo-crawler/gsc-dashboard/sitemaps" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Database className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Sitemaps</h3>
                  <p className="text-sm text-gray-600">Manage sitemaps</p>
                </div>
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-gray-900">Recent activity</h2>
              <a href="/seo-crawler/gsc-dashboard/activity" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            
            <div className="space-y-3">
              {indexedPages.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
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
              
              {indexedPages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No activity found</p>
                  <p className="text-sm">Try refreshing the data or selecting a different property</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              {indexingSummary && (
                <span>Last updated: {new Date(indexingSummary.lastUpdated).toLocaleString()}</span>
              )}
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