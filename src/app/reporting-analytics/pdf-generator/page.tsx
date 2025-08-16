'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Download, Eye, Settings, BarChart3, TrendingUp, Users, Globe, 
  Search, Activity, Smartphone, Globe2, FileText as FileTextIcon, Calendar,
  Building2, Target, PieChart, Zap
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { getAuthInstance } from '@/lib/firebase.js';

// Types for real analytics data
interface AnalyticsProperty {
  id: string;
  name: string;
  websiteUrl?: string;
}

interface GoogleAnalyticsData {
  basicMetrics: Array<{
    date: string;
    totalUsers: number;
    sessions: number;
    screenPageViews: number;
    bounceRate: number;
    averageSessionDuration: number;
  }>;
  newUsersData: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
    returningUsers: number;
  }>;
  trafficSourcesData: Array<{
    source: string;
    value: number;
    users: number;
  }>;
  geoData: Array<{
    country: string;
    users: number;
    sessions: number;
  }>;
  topPagesData: Array<{
    page: string;
    users: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
  }>;
  deviceData: Array<{
    name: string;
    value: number;
    sessions: number;
  }>;
  derivedMetrics: {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    avgBounceRate: number;
    totalNewUsers: number;
    totalReturningUsers: number;
    avgSessionDuration: number;
    conversionRate: number;
  };
}

interface SearchConsoleData {
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  searchTrends: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

interface Widget {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: (props: { 
    data: GoogleAnalyticsData | SearchConsoleData | null, 
    refreshKey: number,
    dateRange: { from: string, to: string }
  }) => JSX.Element;
  dataType: 'analytics' | 'search-console' | 'both';
}

// Real-time Widgets using actual Google Analytics and Search Console data
const UsersWidget = ({ data, refreshKey, dateRange }: { 
  data: GoogleAnalyticsData | SearchConsoleData | null, 
  refreshKey: number,
  dateRange: { from: string, to: string }
}) => {
  if (!data || !('derivedMetrics' in data)) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Users size={16} className="text-blue-500" />
          Total Users
        </h3>
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No analytics data available</p>
          <p className="text-xs">Select a property and date range</p>
        </div>
      </div>
    );
  }

  const { totalUsers, totalNewUsers, totalReturningUsers } = data.derivedMetrics;
  const growth = data.basicMetrics.length > 1 
    ? ((data.basicMetrics[data.basicMetrics.length - 1].totalUsers - data.basicMetrics[0].totalUsers) / data.basicMetrics[0].totalUsers * 100)
    : 0;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Users size={16} className="text-blue-500" />
        Total Users
      </h3>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-blue-600">{totalUsers.toLocaleString()}</div>
        <div className="text-sm text-green-600">
          {growth > 0 ? '+' : ''}{growth.toFixed(1)}% from period start
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-600">{totalNewUsers.toLocaleString()}</div>
            <div className="text-gray-500">New Users</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-600">{totalReturningUsers.toLocaleString()}</div>
            <div className="text-gray-500">Returning</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SessionsWidget = ({ data, refreshKey, dateRange }: { 
  data: GoogleAnalyticsData | SearchConsoleData | null, 
  refreshKey: number,
  dateRange: { from: string, to: string }
}) => {
  if (!data || !('derivedMetrics' in data)) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Activity size={16} className="text-purple-500" />
          Sessions
        </h3>
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No analytics data available</p>
          <p className="text-xs">Select a property and date range</p>
        </div>
      </div>
    );
  }

  const { totalSessions, avgSessionDuration, avgBounceRate } = data.derivedMetrics;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Activity size={16} className="text-purple-500" />
        Sessions
      </h3>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-purple-600">{totalSessions.toLocaleString()}</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-semibold text-purple-600">{Math.round(avgSessionDuration / 60)}m {Math.round(avgSessionDuration % 60)}s</div>
            <div className="text-gray-500">Avg Duration</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-600">{avgBounceRate.toFixed(1)}%</div>
            <div className="text-gray-500">Bounce Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PageViewsWidget = ({ data, refreshKey, dateRange }: { 
  data: GoogleAnalyticsData | SearchConsoleData | null, 
  refreshKey: number,
  dateRange: { from: string, to: string }
}) => {
  if (!data || !('derivedMetrics' in data)) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FileTextIcon size={16} className="text-green-500" />
          Page Views
        </h3>
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No analytics data available</p>
          <p className="text-xs">Select a property and date range</p>
        </div>
      </div>
    );
  }

  const { totalPageViews } = data.derivedMetrics;
  const avgPageViewsPerSession = totalPageViews / data.derivedMetrics.totalSessions;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <FileTextIcon size={16} className="text-green-500" />
        Page Views
      </h3>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-green-600">{totalPageViews.toLocaleString()}</div>
        <div className="text-sm text-gray-600">
          {avgPageViewsPerSession.toFixed(1)} per session
        </div>
      </div>
    </div>
  );
};

const TrafficSourcesWidget = ({ data, refreshKey, dateRange }: { 
  data: GoogleAnalyticsData | SearchConsoleData | null, 
  refreshKey: number,
  dateRange: { from: string, to: string }
}) => {
  if (!data || !('trafficSourcesData' in data) || !data.trafficSourcesData.length) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Globe2 size={16} className="text-indigo-500" />
          Traffic Sources
        </h3>
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No analytics data available</p>
          <p className="text-xs">Select a property and date range</p>
        </div>
      </div>
    );
  }

  const topSources = data.trafficSourcesData.slice(0, 4);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Globe2 size={16} className="text-indigo-500" />
        Traffic Sources
      </h3>
      <div className="space-y-2">
        {topSources.map((source, index) => (
          <div key={source.source} className="flex justify-between items-center text-sm">
            <span className="text-gray-600 truncate flex-1">{source.source}</span>
            <span className="font-medium ml-2">{source.users.toLocaleString()}</span>
            <span className="text-xs text-gray-500 ml-2">({source.value.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeviceBreakdownWidget = ({ data, refreshKey, dateRange }: { 
  data: GoogleAnalyticsData | SearchConsoleData | null, 
  refreshKey: number,
  dateRange: { from: string, to: string }
}) => {
  if (!data || !('deviceData' in data) || !data.deviceData.length) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Smartphone size={16} className="text-orange-500" />
          Device Breakdown
        </h3>
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No analytics data available</p>
          <p className="text-xs">Select a property and date range</p>
        </div>
      </div>
    );
  }

  const totalSessions = data.deviceData.reduce((sum, device) => sum + device.sessions, 0);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Smartphone size={16} className="text-orange-500" />
        Device Breakdown
      </h3>
      <div className="space-y-2">
        {data.deviceData.map((device) => {
          const percentage = (device.sessions / totalSessions * 100).toFixed(1);
          return (
            <div key={device.name} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{device.name}</span>
              <span className="font-medium">{device.sessions.toLocaleString()}</span>
              <span className="text-xs text-gray-500">({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopPagesWidget = ({ data, refreshKey, dateRange }: { 
  data: GoogleAnalyticsData | SearchConsoleData | null, 
  refreshKey: number,
  dateRange: { from: string, to: string }
}) => {
  if (!data || !('topPagesData' in data) || !data.topPagesData.length) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FileTextIcon size={16} className="text-blue-500" />
          Top Pages
        </h3>
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No analytics data available</p>
          <p className="text-xs">Select a property and date range</p>
        </div>
      </div>
    );
  }

  const topPages = data.topPagesData.slice(0, 4);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <FileTextIcon size={16} className="text-blue-500" />
        Top Pages
      </h3>
      <div className="space-y-2">
        {topPages.map((page, index) => (
          <div key={page.page} className="text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 truncate flex-1">{page.page}</span>
              <span className="font-medium ml-2">{page.pageviews.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 text-right">
              {page.bounceRate.toFixed(1)}% bounce
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SearchConsoleWidget = ({ data, refreshKey, dateRange }: { 
  data: GoogleAnalyticsData | SearchConsoleData | null, 
  refreshKey: number,
  dateRange: { from: string, to: string }
}) => {
  if (!data || !('topQueries' in data) || !data.topQueries.length) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Search size={16} className="text-yellow-500" />
          Search Performance
        </h3>
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No Search Console data</p>
          <p className="text-xs">Select a property and date range</p>
        </div>
      </div>
    );
  }

  const topQueries = data.topQueries.slice(0, 4);
  const totalClicks = data.topQueries.reduce((sum, query) => sum + query.clicks, 0);
  const totalImpressions = data.topQueries.reduce((sum, query) => sum + query.impressions, 0);
  const avgPosition = data.topQueries.reduce((sum, query) => sum + query.position, 0) / data.topQueries.length;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Search size={16} className="text-yellow-500" />
        Search Performance
      </h3>
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="font-semibold text-yellow-600">{totalClicks.toLocaleString()}</div>
            <div className="text-gray-500">Clicks</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-600">{totalImpressions.toLocaleString()}</div>
            <div className="text-gray-500">Impressions</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-600">{avgPosition.toFixed(1)}</div>
            <div className="text-gray-500">Avg Position</div>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500">Top queries available</div>
    </div>
  );
};

const availableWidgets: Widget[] = [
  {
    id: 'users',
    title: 'Total Users',
    description: 'Real user counts and growth metrics',
    icon: Users,
    component: UsersWidget,
    dataType: 'analytics'
  },
  {
    id: 'sessions',
    title: 'Sessions',
    description: 'Session data and engagement metrics',
    icon: Activity,
    component: SessionsWidget,
    dataType: 'analytics'
  },
  {
    id: 'pageviews',
    title: 'Page Views',
    description: 'Page view counts and averages',
    icon: FileTextIcon,
    component: PageViewsWidget,
    dataType: 'analytics'
  },
  {
    id: 'traffic-sources',
    title: 'Traffic Sources',
    description: 'Top traffic sources breakdown',
    icon: Globe2,
    component: TrafficSourcesWidget,
    dataType: 'analytics'
  },
  {
    id: 'device-breakdown',
    title: 'Device Breakdown',
    description: 'Device usage statistics',
    icon: Smartphone,
    component: DeviceBreakdownWidget,
    dataType: 'analytics'
  },
  {
    id: 'top-pages',
    title: 'Top Pages',
    description: 'Best performing pages',
    icon: FileTextIcon,
    component: TopPagesWidget,
    dataType: 'analytics'
  },
  {
    id: 'search-console',
    title: 'Search Console',
    description: 'Google Search performance metrics',
    icon: Search,
    component: SearchConsoleWidget,
    dataType: 'search-console'
  }
];

export default function PDFGeneratorPage() {
  const { user } = useAuth();
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['users', 'sessions']);
  const [logo, setLogo] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState('SEO Performance Report');
  const [clientName, setClientName] = useState('Client Name');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Google Analytics and Search Console integration
  const [analyticsProperties, setAnalyticsProperties] = useState<AnalyticsProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [analyticsData, setAnalyticsData] = useState<GoogleAnalyticsData | null>(null);
  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [error, setError] = useState('');

  // Fetch Google Analytics properties
  const fetchAnalyticsProperties = async () => {
    if (!user) return;
    
    setLoadingProperties(true);
    setError('');
    
    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) {
        throw new Error('No authenticated user found');
      }
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/analytics/properties', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch properties');
      }

      const data = await response.json();
      console.log('🔍 [PDF Generator] Properties response:', data);
      setAnalyticsProperties(data.properties || []);
      
      // Auto-select first property
      if (data.properties && data.properties.length > 0 && !selectedProperty) {
        console.log('🎯 [PDF Generator] Auto-selecting first property:', data.properties[0]);
        setSelectedProperty(data.properties[0].id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';
      setError(errorMessage);
      console.error('Error fetching properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!selectedProperty || !user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) {
        throw new Error('No authenticated user found');
      }
      const token = await auth.currentUser.getIdToken();
      
      // Fetch Google Analytics data
      const analyticsResponse = await fetch('/api/analytics/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: selectedProperty,
          startDate: dateRange.from,
          endDate: dateRange.to,
        }),
      });

      if (!analyticsResponse.ok) {
        const errorData = await analyticsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch analytics data');
      }

      const analyticsResult = await analyticsResponse.json();
      setAnalyticsData(analyticsResult.data);

      // Fetch Search Console data
      try {
        const searchConsoleResponse = await fetch('/api/analytics/search-console', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            propertyId: selectedProperty,
            startDate: dateRange.from,
            endDate: dateRange.to,
          }),
        });

        if (searchConsoleResponse.ok) {
          const searchConsoleResult = await searchConsoleResponse.json();
          setSearchConsoleData(searchConsoleResult.data);
        }
      } catch (searchConsoleError) {
        console.warn('Search Console data not available:', searchConsoleError);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load properties and data when user changes
  useEffect(() => {
    console.log('👤 [PDF Generator] User changed:', user?.email);
    if (user) {
      console.log('🚀 [PDF Generator] Fetching properties for user:', user.email);
      fetchAnalyticsProperties();
    }
  }, [user]);

  // Auto-select first property when properties are loaded
  useEffect(() => {
    if (analyticsProperties.length > 0 && !selectedProperty) {
      setSelectedProperty(analyticsProperties[0].id);
    }
  }, [analyticsProperties, selectedProperty]);

  // Fetch data when property or date range changes
  useEffect(() => {
    if (selectedProperty && user) {
      fetchAnalyticsData();
    }
  }, [selectedProperty, dateRange, user]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  const selectedWidgetComponents = availableWidgets.filter(widget => 
    selectedWidgets.includes(widget.id)
  );

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
    if (selectedProperty) {
      fetchAnalyticsData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <FileText className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg">
              PDF Report Generator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Create professional PDF reports with real Google Analytics & Search Console data
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Property Selection and Date Range */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <Building2 size={22} />
                Data Source
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website Property {analyticsProperties.length > 0 && `(${analyticsProperties.length} available)`}
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      disabled={loadingProperties}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">Select a website property</option>
                      {analyticsProperties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name} {property.websiteUrl && `(${property.websiteUrl})`}
                        </option>
                      ))}
                    </select>
                    {loadingProperties && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500">
                      Properties loaded: {analyticsProperties.length} | Selected: {selectedProperty || 'none'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Quick Date Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Presets
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[7, 30, 90, 365].map((days) => (
                      <button
                        key={days}
                        onClick={() => {
                          const to = new Date();
                          const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
                          setDateRange({
                            from: from.toISOString().split('T')[0],
                            to: to.toISOString().split('T')[0]
                          });
                        }}
                        className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {days === 7 ? '7D' : days === 30 ? '30D' : days === 90 ? '90D' : '1Y'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={loading || !selectedProperty}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Zap size={18} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Loading...' : 'Refresh Data'}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Connection Status */}
                {!selectedProperty && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                      Please select a website property to view analytics data.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Report Settings */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <Settings size={22} />
                Report Settings
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-5 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-white/70 dark:bg-gray-800/70 shadow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {logo ? (
                        <Image src={logo} alt="Logo" width={64} height={64} className="max-h-16 mx-auto" />
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-gray-400" size={28} />
                          <p className="text-sm text-gray-500">Click to upload logo</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Widget Selection */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                Select Widgets
              </h3>
              <div className="grid gap-4">
                {availableWidgets.map((widget) => {
                  const active = selectedWidgets.includes(widget.id);
                  return (
                    <button
                      key={widget.id}
                      type="button"
                      onClick={() => toggleWidget(widget.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}
                    >
                      <widget.icon size={22} className="text-blue-500" />
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{widget.title}</div>
                        <div className="text-xs text-gray-500">{widget.description}</div>
                      </div>
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                        {active && <span className="w-3 h-3 bg-white rounded-full" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Generate Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                generatePDF();
                setRefreshKey(prev => prev + 1);
              }}
              disabled={generating || selectedWidgets.length === 0 || !selectedProperty}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl text-lg"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Generate PDF
                </>
              )}
            </motion.button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Eye size={22} className="text-gray-500" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Report Preview
                  </h3>
                </div>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-gray-900 max-h-[600px] overflow-y-auto">
                <div ref={reportRef} className="bg-white p-10 shadow-2xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700" style={{ width: '210mm', minHeight: '297mm' }}>
                  {/* Report Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{reportTitle}</h1>
                      <p className="text-lg text-gray-600">Prepared for: {clientName}</p>
                      <p className="text-sm text-gray-500">Report Date: {reportDate}</p>
                      {selectedProperty && (
                        <p className="text-sm text-gray-500">Property: {analyticsProperties.find(p => p.id === selectedProperty)?.name}</p>
                      )}
                      <p className="text-sm text-gray-500">Period: {dateRange.from} to {dateRange.to}</p>
                    </div>
                    {logo && (
                      <Image src={logo} alt="Company Logo" width={128} height={64} className="max-h-16 max-w-32 object-contain" />
                    )}
                  </div>
                  
                  {/* Report Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedWidgetComponents.map((widget) => {
                      // Pass appropriate data to each widget
                      let widgetData = null;
                      if (widget.dataType === 'search-console') {
                        widgetData = searchConsoleData;
                      } else if (widget.dataType === 'analytics') {
                        widgetData = analyticsData;
                      }

                      return (
                        <widget.component 
                          key={widget.id} 
                          data={widgetData} 
                          refreshKey={refreshKey}
                          dateRange={dateRange}
                        />
                      );
                    })}
                  </div>
                  
                  {selectedWidgets.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Select widgets to preview your report</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 