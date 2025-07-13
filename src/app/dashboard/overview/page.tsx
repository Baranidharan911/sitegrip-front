"use client";

import React, { useState, useEffect } from "react";
import { Loader2, BarChart3, Globe, Users, Eye, MousePointer, TrendingUp } from "lucide-react";
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

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
}

export default function DashboardOverviewPage() {
  const { loading: authLoading, error: authError, authState } = useGoogleAuth();
  const [analyticsProperties, setAnalyticsProperties] = useState<AnalyticsProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [dateRange, setDateRange] = useState({ from: "2025-01-01", to: "2025-01-31" });
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [error, setError] = useState("");

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

      if (!response.ok) {
        throw new Error('Failed to fetch analytics properties');
      }

      const data = await response.json();
      setAnalyticsProperties(data.properties || []);
    } catch (err) {
      setError('Failed to fetch Google Analytics properties');
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

      const response = await fetch('/api/analytics/data', {
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

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      
      // Transform the data to match our interface
      const transformedData = data.data.rows?.map((row: any) => ({
        date: row.dimensionValues[0].value,
        totalUsers: parseInt(row.metricValues[0].value),
        sessions: parseInt(row.metricValues[1].value),
        screenPageViews: parseInt(row.metricValues[2].value),
        bounceRate: parseFloat(row.metricValues[3].value),
      })) || [];

      setAnalyticsData(transformedData);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin" />
          <span>Loading authentication...</span>
        </div>
      </div>
    );
  }

  if (authError || !authState?.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in with Google to access your analytics data.</p>
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your website analytics and performance data
          </p>
        </div>

        {/* Property Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Website
          </h2>
          
          {loadingProperties ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="animate-spin" />
              <span>Loading your websites...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Analytics Property
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a website</option>
                  {analyticsProperties.map((property) => (
                    <option key={property.property} value={property.property}>
                      {property.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Date Range and Dashboard */}
        {selectedProperty && (
          <>
            {/* Date Range Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Date Range
              </h2>
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                      ) : (
                        analyticsData.reduce((sum, item) => sum + item.totalUsers, 0).toLocaleString()
                      )}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              {/* Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                      ) : (
                        analyticsData.reduce((sum, item) => sum + item.sessions, 0).toLocaleString()
                      )}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </div>

              {/* Page Views */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                      ) : (
                        analyticsData.reduce((sum, item) => sum + item.screenPageViews, 0).toLocaleString()
                      )}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              {/* Bounce Rate */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Bounce Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                      ) : (
                        analyticsData.length > 0
                          ? `${(analyticsData.reduce((sum, item) => sum + item.bounceRate, 0) / analyticsData.length).toFixed(1)}%`
                          : "0%"
                      )}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
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
              ) : analyticsData.length > 0 ? (
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
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {analyticsData.map((item, index) => (
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
} 