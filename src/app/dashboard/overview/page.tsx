"use client";

import React, { useState, useEffect } from "react";
import { Loader2, BarChart3, Globe, Users, Eye, MousePointer, TrendingUp } from "lucide-react";
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

// Force dynamic rendering to prevent Firebase initialization issues during build
export const dynamic = 'force-dynamic';

interface AnalyticsProperty {
  name: string;
  displayName: string;
  property: string;
}

interface AnalyticsData {
  date: string;
  totalUsers: number;
  sessions: number;
  screenPageViews: number;
  bounceRate: number;
  averageSessionDuration?: number; // <-- add this line
}

interface NewUsersData {
  date: string;
  newUsers: number;
  totalUsers: number;
  returningUsers: number;
}

interface SessionDurationData {
  date: string;
  avgSessionDuration: number;
}

interface TrafficSourceData {
  source: string;
  value: number;
  users: number;
}

interface GeoData {
  country: string;
  users: number;
  sessions: number;
}

interface TopPageData {
  page: string;
  users: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
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

interface DerivedMetrics {
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  avgBounceRate: number;
  totalNewUsers: number;
  totalReturningUsers: number;
  avgSessionDuration: number;
  conversionRate: number;
}

interface CombinedAnalyticsData {
  basicMetrics: AnalyticsData[];
  newUsersData: NewUsersData[];
  sessionDurationData: SessionDurationData[];
  trafficSourcesData: TrafficSourceData[];
  geoData: GeoData[];
  topPagesData: TopPageData[];
  searchConsoleData: SearchConsoleData;
  deviceData: DeviceData[];
  derivedMetrics: DerivedMetrics;
}

interface DeviceData {
  name: string;
  value: number;
  sessions: number;
}

interface TopQueries {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface TopReferrers {
  referrer: string;
  sessions: number;
}

interface ConversionFunnel {
  step: string;
  value: number;
}

interface GoalCompletions {
  goal: string;
  completions: number;
}

const COLORS = ['#6366f1', '#10b981', '#f59e42'];

// Utility function to format session duration from seconds to 'Xm Ys'
function formatSessionDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

const DashboardOverviewPage = React.memo(function DashboardOverviewPage() {
  const { loading: authLoading, error: authError, authState, refreshAuthStatus, debug, retryAuth, authReady, signInWithGoogle } = useGoogleAuth();
  const [analyticsProperties, setAnalyticsProperties] = useState<AnalyticsProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [dateRange, setDateRange] = useState({ from: "2025-01-01", to: "2025-01-31" });
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<CombinedAnalyticsData | null>(null);
  const [error, setError] = useState("");

  // Memoize expensive calculations
  const memoizedAnalyticsData = React.useMemo(() => analyticsData, [analyticsData]);
  const memoizedProperties = React.useMemo(() => analyticsProperties, [analyticsProperties]);
  const memoizedDateRange = React.useMemo(() => dateRange, [dateRange]);

  // Refresh auth state on mount and after login redirect
  useEffect(() => {
    refreshAuthStatus();
  }, []);

  // Auto-select first property if authenticated and properties are loaded
  useEffect(() => {
    if (authState?.isAuthenticated && analyticsProperties.length > 0 && !selectedProperty) {
      setSelectedProperty(analyticsProperties[0].property);
    }
  }, [authState?.isAuthenticated, analyticsProperties]);

  // Get Firebase ID token for authentication
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { getAuthInstance } = await import('@/lib/firebase');
      const auth = getAuthInstance();
      if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to get Firebase token:', error);
      return null;
    }
  };

  // Fetch Google Analytics properties
  useEffect(() => {
    if (authState?.isAuthenticated) {
      fetchAnalyticsProperties();
    } else {
      setAnalyticsProperties([]); // Clear properties if not authenticated
      setSelectedProperty("");
      setAnalyticsData(null);
    }
  }, [authState?.isAuthenticated]);

  const fetchAnalyticsProperties = async () => {
    setLoadingProperties(true);
    setError("");
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      const response = await fetch('/api/analytics/properties', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics properties');
      }

      setAnalyticsProperties(data.properties || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Google Analytics properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Fetch analytics data when property or date range changes
  useEffect(() => {
    if (selectedProperty && dateRange.from && dateRange.to) {
      fetchAnalyticsData();
    }
  }, [selectedProperty, dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      // Fetch all analytics data in parallel
      const [analyticsResponse, deviceResponse] = await Promise.all([
        fetch('/api/analytics/data', {
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
        }),
        fetch('/api/analytics/devices', {
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
        })
      ]);

      if (!analyticsResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      if (!deviceResponse.ok) {
        throw new Error('Failed to fetch device data');
      }

      const analyticsResult = await analyticsResponse.json();
      const deviceResult = await deviceResponse.json();

      // Combine the data
      const combinedData = {
        ...analyticsResult.data,
        deviceData: deviceResult.data
      };

      setAnalyticsData(combinedData);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // UI always shows selectors
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
          {/* Property Selector */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Analytics Property</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100"
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
              disabled={loadingProperties || !analyticsProperties.length}
            >
              <option value="">{loadingProperties ? 'Loading properties...' : 'Select a property'}</option>
              {analyticsProperties.map((prop) => (
                <option key={prop.property} value={prop.property}>{prop.displayName}</option>
              ))}
            </select>
          </div>
          {/* Date Range Picker */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100"
                value={dateRange.from}
                onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              />
              <span className="text-gray-500 dark:text-gray-400 self-center">to</span>
              <input
                type="date"
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100"
                value={dateRange.to}
                onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Auth/Property/Data State Handling */}
        {(!authReady || authLoading) ? (
          <div className="text-center py-16 text-lg text-gray-500 dark:text-gray-300">Checking authentication...</div>
        ) : !authState?.isAuthenticated ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center gap-4">
            <span>Please log in with Google to view your analytics data.</span>
            <button
              onClick={signInWithGoogle}
              disabled={authLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {authLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            {error && <div className="text-red-600 dark:text-red-400 mt-2">{error}</div>}
            {debug && (
              <pre className="mt-4 text-xs text-left bg-gray-100 dark:bg-gray-800 p-2 rounded max-w-xl overflow-x-auto">
                {JSON.stringify(debug, null, 2)}
              </pre>
            )}
          </div>
        ) : loadingProperties ? (
          <div className="text-center py-16 text-lg text-gray-500 dark:text-gray-300">Loading Google Analytics properties...</div>
        ) : !analyticsProperties.length ? (
          <div className="text-center py-16 text-lg text-red-600 dark:text-red-400">{error || 'No Google Analytics properties found for your account.'}</div>
        ) : !selectedProperty ? (
          <div className="text-center py-16 text-lg text-gray-500 dark:text-gray-300">Please select a property to view analytics data.</div>
        ) : loading ? (
          <div className="text-center py-16 text-lg text-purple-600 dark:text-purple-400">Loading analytics data...</div>
        ) : error ? (
          <div className="text-center py-16 text-lg text-red-600 dark:text-red-400">{error}</div>
        ) : !analyticsData ? (
          <div className="text-center py-16 text-lg text-gray-500 dark:text-gray-300">No data available for the selected date range.</div>
        ) : (
          // ... existing dashboard charts and tables ...
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : analyticsData?.derivedMetrics?.totalUsers?.toLocaleString() || '0'}
                </span>
              </div>
              {/* Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : analyticsData?.derivedMetrics?.totalSessions?.toLocaleString() || '0'}
                </span>
              </div>
              {/* Page Views */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <Eye className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : analyticsData?.derivedMetrics?.totalPageViews?.toLocaleString() || '0'}
                </span>
              </div>
              {/* Bounce Rate */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Bounce Rate</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : analyticsData?.derivedMetrics?.avgBounceRate?.toFixed(1) + '%' || '0%'}
                </span>
              </div>
            </div>

            {/* --- ADDITIONAL METRIC CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* New Users */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <Users className="h-8 w-8 text-cyan-600 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">New Users</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : analyticsData?.derivedMetrics?.totalNewUsers?.toLocaleString() || '0'}
                </span>
              </div>
              {/* Returning Users */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <Users className="h-8 w-8 text-pink-600 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Returning Users</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : analyticsData?.derivedMetrics?.totalReturningUsers?.toLocaleString() || '0'}
                </span>
              </div>
              {/* Avg. Session Duration */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <BarChart3 className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Session Duration</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : analyticsData?.derivedMetrics?.avgSessionDuration ? formatSessionDuration(analyticsData.derivedMetrics.avgSessionDuration) : '0m 0s'}
                </span>
              </div>
              {/* Conversion Rate */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex flex-col items-center">
                <TrendingUp className="h-8 w-8 text-lime-600 mb-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : analyticsData?.derivedMetrics?.conversionRate?.toFixed(1) + '%' || '0%'}
                </span>
              </div>
            </div>

            {/* --- EXPORT/SHARE BUTTONS --- */}
            <div className="flex justify-end gap-4 mb-8">
              <button onClick={() => alert('Export feature coming soon!')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Export
              </button>
              <button onClick={() => alert('Share feature coming soon!')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Users className="h-5 w-5" /> Share
              </button>
            </div>

            {/* --- NEW CHARTS AND TABLES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* New vs Returning Users Line Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New vs Returning Users</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analyticsData?.newUsersData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="newUsers" stroke="#6366f1" name="New Users" />
                    <Line type="monotone" dataKey="returningUsers" stroke="#f59e42" name="Returning Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Avg. Session Duration Bar Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Avg. Session Duration</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData?.sessionDurationData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgSessionDuration" fill="#10b981" name="Avg. Duration (s)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Traffic Sources Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={analyticsData?.trafficSourcesData || []} dataKey="value" nameKey="source" cx="50%" cy="50%" outerRadius={80} label>
                      {(analyticsData?.trafficSourcesData || []).map((entry, index) => (
                        <Cell key={`cell-source-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Users by Country Bar Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Users by Country</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData?.geoData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#6366f1" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Traffic Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Traffic Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData?.basicMetrics || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalUsers" stroke="#6366f1" name="Users" />
                  <Line type="monotone" dataKey="sessions" stroke="#10b981" name="Sessions" />
                  <Line type="monotone" dataKey="screenPageViews" stroke="#f59e42" name="Page Views" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Device Breakdown Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Breakdown</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={analyticsData?.deviceData || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(analyticsData?.deviceData || []).map((entry, index) => (
                      <Cell key={`cell-device-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Pages Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Pages</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Page</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Users</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sessions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pageviews</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(analyticsData?.topPagesData || []).map((page, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{page.page}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{page.users.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{page.sessions.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{page.pageviews.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{page.bounceRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Search Console Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Google Search Console Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData?.searchConsoleData?.searchTrends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" stroke="#6366f1" name="Clicks" />
                  <Line type="monotone" dataKey="impressions" stroke="#10b981" name="Impressions" />
                  <Line type="monotone" dataKey="ctr" stroke="#f59e42" name="CTR (%)" />
                  <Line type="monotone" dataKey="position" stroke="#ef4444" name="Avg. Position" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Top Queries Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 overflow-x-auto">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Search Queries</h2>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Query</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Impressions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CTR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(analyticsData?.searchConsoleData?.topQueries || []).map((query, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{query.query}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{query.clicks.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{query.impressions.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{(query.ctr * 100).toFixed(1)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{query.position.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Top Referrers Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 overflow-x-auto">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Referrers</h2>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Referrer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(analyticsData?.trafficSourcesData || []).map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Analytics Data
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8" />
                  <span className="ml-2">Loading data...</span>
                </div>
              ) : analyticsData?.basicMetrics && analyticsData.basicMetrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Users
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Sessions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Page Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Bounce Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Session Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {analyticsData.basicMetrics.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.totalUsers.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.sessions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.screenPageViews.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.bounceRate.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatSessionDuration(item.averageSessionDuration ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No data available for the selected date range
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default DashboardOverviewPage; 