'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
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
  Activity
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';
import { Chart, MetricCard } from '@/components/ui/chart';

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

export default function GSCDashboardPage() {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [indexedPages, setIndexedPages] = useState<IndexedPage[]>([]);
  const [indexingSummary, setIndexingSummary] = useState<IndexingSummary | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
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
      
      // Load indexed pages with performance data
      const pagesResponse = await indexingApi.getIndexedPages(selectedProperty, {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      setIndexedPages(pagesResponse.data.pages || []);
      setPerformanceData(pagesResponse.data.performance || null);
      
      // Load indexing summary
      const summaryResponse = await indexingApi.getIndexingSummary(selectedProperty);
      setIndexingSummary(summaryResponse.data.summary || null);
      
    } catch (error: any) {
      toast.error('Failed to load GSC data: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted and indexed': return 'bg-green-500';
      case 'Discovered – currently not indexed': return 'bg-yellow-500';
      case 'Crawled – currently not indexed': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted and indexed': return <CheckCircle className="w-4 h-4" />;
      case 'Discovered – currently not indexed': return <Clock className="w-4 h-4" />;
      case 'Crawled – currently not indexed': return <AlertCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Google Search Console Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time data and insights from Google Search Console
          </p>
        </div>
        <Button 
          onClick={loadGSCData} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Property Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-gray-500" />
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select GSC Property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.site_url} value={property.site_url}>
                    {property.site_url} ({property.property_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="indexing" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Indexing
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Pages
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Pages</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {indexingSummary?.totalPages.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Indexed Pages</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {indexingSummary?.indexedPages.toLocaleString() || '0'}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Indexing Rate</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {indexingSummary?.indexingRate || 0}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Clicks</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {performanceData?.totalClicks.toLocaleString() || '0'}
                    </p>
                  </div>
                  <MousePointer className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Indexing Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Indexing Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Indexing Rate</span>
                <span className="text-sm font-bold">{indexingSummary?.indexingRate || 0}%</span>
              </div>
              <Progress value={indexingSummary?.indexingRate || 0} className="h-3" />
              
              {/* Indexing Chart */}
              {indexingSummary && (
                <div className="h-64">
                  <Chart 
                    data={[
                      { label: 'Indexed', value: indexingSummary.indexedPages, color: '#10b981' },
                      { label: 'Not Indexed', value: indexingSummary.notIndexedPages, color: '#f59e0b' },
                      { label: 'Pending', value: indexingSummary.pendingPages, color: '#f97316' },
                      { label: 'Errors', value: indexingSummary.errorPages, color: '#ef4444' }
                    ]}
                    type="bar"
                    height={200}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          {performanceData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {performanceData.totalImpressions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total Impressions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {performanceData.avgCTR}%
                    </div>
                    <div className="text-sm text-gray-500">Average CTR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {performanceData.avgPosition}
                    </div>
                    <div className="text-sm text-gray-500">Average Position</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Indexing Tab */}
        <TabsContent value="indexing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Indexing Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart Placeholder */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                  <PieChart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">Indexing Status Chart</p>
                  <p className="text-xs text-gray-400">Chart visualization coming soon</p>
                </div>
                
                {/* Status Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Indexed</span>
                    </div>
                    <Badge variant="secondary">{indexingSummary?.indexedPages || 0}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Not Indexed</span>
                    </div>
                    <Badge variant="secondary">{indexingSummary?.notIndexedPages || 0}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <Badge variant="secondary">{indexingSummary?.pendingPages || 0}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Errors</span>
                    </div>
                    <Badge variant="secondary">{indexingSummary?.errorPages || 0}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Search Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Impressions</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {performanceData?.totalImpressions.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MousePointer className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Clicks</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {performanceData?.totalClicks.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">CTR</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {performanceData?.avgCTR || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Position</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {performanceData?.avgPosition || 0}
                    </span>
                  </div>
                </div>
                
                {/* Performance Chart Placeholder */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                  <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">Performance Trends</p>
                  <p className="text-xs text-gray-400">Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Indexed Pages ({indexedPages.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indexedPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(page.coverageState || '')}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{page.url}</p>
                          <p className="text-xs text-gray-500">
                            {page.lastCrawled ? `Last crawled: ${new Date(page.lastCrawled).toLocaleDateString()}` : 'Not crawled yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {page.clicks !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{page.clicks}</p>
                          <p className="text-xs text-gray-500">Clicks</p>
                        </div>
                      )}
                      
                      {page.impressions !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{page.impressions}</p>
                          <p className="text-xs text-gray-500">Impressions</p>
                        </div>
                      )}
                      
                      <Badge 
                        variant={page.indexed ? "default" : "secondary"}
                        className={getStatusColor(page.coverageState || '')}
                      >
                        {page.coverageState || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {indexedPages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No indexed pages found</p>
                    <p className="text-sm">Try refreshing the data or selecting a different property</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      {indexingSummary && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(indexingSummary.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
} 