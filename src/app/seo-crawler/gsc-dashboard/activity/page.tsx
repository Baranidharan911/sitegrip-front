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

export default function GSCActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      // Try to load real activity data
      const response = await indexingApi.getIndexedPages('', {
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

        {/* Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
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
          /* Activities List */
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