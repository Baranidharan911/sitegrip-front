'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, Plus, Save, RotateCcw, TrendingUp, Users, Globe, BarChart3, 
  Eye, Clock, Settings, PieChart, StickyNote, TrendingDown, FileText,
  ChevronDown, Calendar, Building2, Search, Target, Zap, Activity,
  Smartphone, Monitor, Globe2, MousePointer, EyeOff
} from 'lucide-react';
import { Responsive, WidthProvider, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ThemeToggle from '@/components/Home/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { getAuthInstance } from '@/lib/firebase.js';

const ResponsiveGridLayout = WidthProvider(Responsive);

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

// Real-time Widgets using actual Google Analytics and Search Console data
const UsersWidget = ({ data, refreshKey }: { data: GoogleAnalyticsData | null, refreshKey: number }) => {
  if (!data) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <Users size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const { totalUsers, totalNewUsers, totalReturningUsers } = data.derivedMetrics;
  const growth = data.basicMetrics.length > 1 
    ? ((data.basicMetrics[data.basicMetrics.length - 1].totalUsers - data.basicMetrics[0].totalUsers) / data.basicMetrics[0].totalUsers * 100)
    : 0;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-blue-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Total Users</h3>
      </div>
      <div className="text-3xl font-bold text-blue-600 mb-2">
        <motion.span animate={{ scale: [1, 1.2, 1] }}>{totalUsers.toLocaleString()}</motion.span>
      </div>
      <div className="text-sm text-green-600 mb-4">
        <motion.span animate={{ scale: [1, 1.2, 1] }}>
          {growth > 0 ? '+' : ''}{growth.toFixed(1)}% from period start
        </motion.span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">New Users</span>
          <span className="font-medium text-green-600">{totalNewUsers.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Returning Users</span>
          <span className="font-medium text-blue-600">{totalReturningUsers.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

const SessionsWidget = ({ data, refreshKey }: { data: GoogleAnalyticsData | null, refreshKey: number }) => {
  if (!data) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <Activity size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const { totalSessions, avgSessionDuration, avgBounceRate } = data.derivedMetrics;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} className="text-purple-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Sessions</h3>
      </div>
      <div className="text-3xl font-bold text-purple-600 mb-2">
        <motion.span animate={{ scale: [1, 1.2, 1] }}>{totalSessions.toLocaleString()}</motion.span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Avg Duration</span>
          <span className="font-medium">{Math.round(avgSessionDuration / 60)}m {Math.round(avgSessionDuration % 60)}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Bounce Rate</span>
          <span className="font-medium text-red-600">{avgBounceRate.toFixed(1)}%</span>
        </div>
      </div>
    </motion.div>
  );
};

const PageViewsWidget = ({ data, refreshKey }: { data: GoogleAnalyticsData | null, refreshKey: number }) => {
  if (!data) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <FileText size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const { totalPageViews } = data.derivedMetrics;
  const avgPageViewsPerSession = totalPageViews / data.derivedMetrics.totalSessions;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText size={16} className="text-green-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Page Views</h3>
      </div>
      <div className="text-3xl font-bold text-green-600 mb-2">
        <motion.span animate={{ scale: [1, 1.2, 1] }}>{totalPageViews.toLocaleString()}</motion.span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {avgPageViewsPerSession.toFixed(1)} per session
      </div>
    </motion.div>
  );
};

const TrafficSourcesWidget = ({ data, refreshKey }: { data: GoogleAnalyticsData | null, refreshKey: number }) => {
  if (!data || !data.trafficSourcesData.length) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <Globe2 size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const topSources = data.trafficSourcesData.slice(0, 5);

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Globe2 size={16} className="text-indigo-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Traffic Sources</h3>
      </div>
      <div className="space-y-2">
        {topSources.map((source, index) => (
          <div key={source.source} className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
              {source.source}
            </span>
            <span className="text-sm font-medium ml-2">{source.users.toLocaleString()}</span>
            <span className="text-xs text-gray-500 ml-2">({source.value.toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const DeviceBreakdownWidget = ({ data, refreshKey }: { data: GoogleAnalyticsData | null, refreshKey: number }) => {
  if (!data || !data.deviceData.length) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <Smartphone size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const totalSessions = data.deviceData.reduce((sum, device) => sum + device.sessions, 0);

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Smartphone size={16} className="text-orange-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Device Breakdown</h3>
      </div>
      <div className="space-y-2">
        {data.deviceData.map((device) => {
          const percentage = (device.sessions / totalSessions * 100).toFixed(1);
          return (
            <div key={device.name} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{device.name}</span>
              <span className="text-sm font-medium">{device.sessions.toLocaleString()}</span>
              <span className="text-xs text-gray-500">({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const TopPagesWidget = ({ data, refreshKey }: { data: GoogleAnalyticsData | null, refreshKey: number }) => {
  if (!data || !data.topPagesData.length) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <FileText size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  const topPages = data.topPagesData.slice(0, 5);

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText size={16} className="text-blue-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Top Pages</h3>
      </div>
      <div className="space-y-2">
        {topPages.map((page, index) => (
          <div key={page.page} className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1">
              {page.page}
            </span>
            <span className="text-sm font-medium ml-2">{page.pageviews.toLocaleString()}</span>
            <span className="text-xs text-gray-500 ml-2">({page.bounceRate.toFixed(1)}% bounce)</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const SearchConsoleWidget = ({ data, refreshKey }: { data: SearchConsoleData | null, refreshKey: number }) => {
  if (!data || !data.topQueries.length) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex items-center justify-center">
        <div className="text-center">
          <Search size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No Search Console data</p>
        </div>
      </div>
    );
  }

  const topQueries = data.topQueries.slice(0, 5);
  const totalClicks = data.topQueries.reduce((sum, query) => sum + query.clicks, 0);
  const totalImpressions = data.topQueries.reduce((sum, query) => sum + query.impressions, 0);
  const avgPosition = data.topQueries.reduce((sum, query) => sum + query.position, 0) / data.topQueries.length;

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Search size={16} className="text-yellow-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Search Performance</h3>
      </div>
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</span>
          <span className="font-medium text-yellow-600">{totalClicks.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Impressions</span>
          <span className="font-medium">{totalImpressions.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Avg Position</span>
          <span className="font-medium">{avgPosition.toFixed(1)}</span>
        </div>
      </div>
      <div className="text-xs text-gray-500">Top queries available</div>
    </motion.div>
  );
};

const CustomNoteWidget = ({ id, note, setNote }: { id: string, note: string, setNote: (v: string) => void }) => (
  <div className="h-full bg-yellow-50 dark:bg-yellow-900/40 rounded-3xl border border-yellow-200 dark:border-yellow-700 p-6 shadow-xl backdrop-blur-xl flex flex-col">
    <div className="flex items-center gap-2 mb-3">
      <StickyNote size={16} className="text-yellow-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Custom Note</h3>
    </div>
    <textarea
      className="flex-1 bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 text-base rounded-xl p-2 mt-2"
      value={note}
      onChange={e => setNote(e.target.value)}
      placeholder="Write your note here..."
      rows={4}
    />
  </div>
);

const availableWidgets = [
  { id: 'users', title: 'Total Users', icon: Users, component: (props: any) => <UsersWidget {...props} /> },
  { id: 'sessions', title: 'Sessions', icon: Activity, component: (props: any) => <SessionsWidget {...props} /> },
  { id: 'pageviews', title: 'Page Views', icon: FileText, component: (props: any) => <PageViewsWidget {...props} /> },
  { id: 'traffic-sources', title: 'Traffic Sources', icon: Globe2, component: (props: any) => <TrafficSourcesWidget {...props} /> },
  { id: 'device-breakdown', title: 'Device Breakdown', icon: Smartphone, component: (props: any) => <DeviceBreakdownWidget {...props} /> },
  { id: 'top-pages', title: 'Top Pages', icon: FileText, component: (props: any) => <TopPagesWidget {...props} /> },
  { id: 'search-console', title: 'Search Console', icon: Search, component: (props: any) => <SearchConsoleWidget {...props} /> },
  { id: 'custom-note', title: 'Custom Note', icon: StickyNote, component: (props: any) => <CustomNoteWidget {...props} /> },
];

export default function CustomDashboardPage() {
  const { user } = useAuth();
  const [dashboardWidgets, setDashboardWidgets] = useState<string[]>(['users', 'sessions']);
  const [layouts, setLayouts] = useState<Layouts>({});
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [note, setNote] = useState('');
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [undoWidget, setUndoWidget] = useState<string | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
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

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (saved) setDashboardWidgets(JSON.parse(saved));
    if (savedLayouts) setLayouts(JSON.parse(savedLayouts));
  }, []);

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
      setAnalyticsProperties(data.properties || []);
      
      // Auto-select first property
      if (data.properties && data.properties.length > 0 && !selectedProperty) {
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
    if (user) {
      fetchAnalyticsProperties();
    }
  }, [user]);

  // Fetch data when property or date range changes
  useEffect(() => {
    if (selectedProperty && user) {
      fetchAnalyticsData();
    }
  }, [selectedProperty, dateRange, user]);

  const saveDashboard = () => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(dashboardWidgets));
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
  };

  const resetDashboard = () => {
    setDashboardWidgets(['users', 'sessions']);
    setLayouts({});
    localStorage.removeItem('dashboard-widgets');
    localStorage.removeItem('dashboard-layouts');
  };

  const generateLayout = () =>
    dashboardWidgets.map((id, index) => ({
      i: id,
      x: (index % 4) * 3,
      y: Math.floor(index / 4) * 2,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2
    }));

  const handleRemoveWidget = (widgetId: string) => {
    setDashboardWidgets(prev => prev.filter(id => id !== widgetId));
    setUndoWidget(widgetId);
    if (undoTimer) clearTimeout(undoTimer);
    setUndoTimer(setTimeout(() => setUndoWidget(null), 5000));
  };

  const handleUndo = () => {
    if (undoWidget) {
      setDashboardWidgets(prev => [...prev, undoWidget]);
      setUndoWidget(null);
    }
  };

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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 px-8 py-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Grid3X3 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg mb-1">Custom Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Build your personalized analytics dashboard with real Google Analytics & Search Console data</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-2xl text-base focus:ring-2 focus:ring-blue-300 active:scale-95 disabled:opacity-50">
              <RotateCcw size={20} className={loading ? 'animate-spin' : ''} /> 
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
            <button onClick={() => setShowWidgetSelector(!showWidgetSelector)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-2xl text-base focus:ring-2 focus:ring-purple-300 active:scale-95">
              <Plus size={20} /> Add Widget
            </button>
            <button onClick={saveDashboard} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-2xl text-base focus:ring-2 focus:ring-green-300 active:scale-95">
              <Save size={20} /> Save
            </button>
            <button onClick={resetDashboard} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-2xl text-base focus:ring-2 focus:ring-red-300 active:scale-95">
              <RotateCcw size={20} /> Reset
            </button>
          </div>
        </motion.div>

        {/* Property Selection and Date Range */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Property Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website Property
              </label>
              <div className="relative">
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  disabled={loadingProperties}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="flex-1">
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
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Connection Status */}
          {!selectedProperty && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                Please select a website property to view analytics data. Make sure you have connected your Google Analytics account.
              </p>
            </div>
          )}
        </motion.div>

        {/* Widget Selector */}
        {showWidgetSelector && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Available Widgets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableWidgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => setDashboardWidgets(prev => [...prev, widget.id])}
                  disabled={dashboardWidgets.includes(widget.id)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border shadow text-base font-semibold transition-all ${
                    dashboardWidgets.includes(widget.id)
                      ? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900'
                  }`}
                >
                  <widget.icon size={28} className="text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300 text-center">{widget.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dashboard Widgets */}
        {dashboardWidgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="text-6xl mb-4">🧩</span>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No widgets yet!</p>
            <button onClick={() => setShowWidgetSelector(true)} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl text-base mt-4">Add Widget</button>
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: generateLayout() }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 8, xs: 4, xxs: 2 }}
          rowHeight={140}
          isDraggable
          isResizable
          margin={[24, 24]}
          onLayoutChange={(layout, layouts) => setLayouts(layouts)}
        >
          {dashboardWidgets.map(widgetId => {
            const widget = availableWidgets.find(w => w.id === widgetId);
            if (!widget) return null;
            const Component = widget.component;
            
            // Pass appropriate data to each widget
            let widgetData = null;
            if (widgetId === 'search-console') {
              widgetData = searchConsoleData;
            } else if (['users', 'sessions', 'pageviews', 'traffic-sources', 'device-breakdown', 'top-pages'].includes(widgetId)) {
              widgetData = analyticsData;
            }

            return (
              <div key={widgetId} className="relative group z-10" style={{ marginTop: '-40px', paddingTop: '40px' }}>
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(widgetId)}
                  className="absolute -top-4 left-1 z-20 w-8 h-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-purple-600 hover:border-purple-400 shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                  title="Widget Settings"
                >
                  <Settings size={18} />
                </button>
                {/* Close Button */}
                <button
                  onClick={() => handleRemoveWidget(widgetId)}
                  className="absolute -top-4 -right-4 z-20 w-8 h-8 bg-red-500 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-2xl duration-200"
                  title="Remove Widget"
                >
                  ✕
                </button>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full w-full">
                  {widgetId === 'custom-note' ? (
                    <Component id={widgetId} note={note} setNote={setNote} />
                  ) : (
                    <Component data={widgetData} refreshKey={refreshKey} />
                  )}
                </motion.div>
              </div>
            );
          })}
        </ResponsiveGridLayout>

        {/* Undo Snackbar */}
        {undoWidget && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-fade-in">
            <span className="text-gray-700 dark:text-gray-200">Widget removed.</span>
            <button onClick={handleUndo} className="text-purple-600 font-bold hover:underline">Undo</button>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-xs border border-gray-200 dark:border-gray-700 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Widget Settings</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Settings for <span className="font-semibold">{availableWidgets.find(w => w.id === showSettings)?.title}</span> coming soon!</p>
              <button onClick={() => setShowSettings(null)} className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl text-base">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
