'use client';

import React, { useState, useEffect } from 'react';
import { indexingApi } from '@/lib/indexingApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Globe, Clock, Eye, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface IndexedPagesData {
  property: string;
  summary: {
    totalIndexedPages: number;
    pagesWithData: number;
    dateRange: string;
    lastUpdated: string;
  };
  pages: Array<{
    url: string;
    indexed: boolean;
    lastCrawled?: string;
    coverageState?: string;
    indexingState?: string;
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
  performance?: {
    totalClicks: number;
    totalImpressions: number;
    avgCTR: number;
    avgPosition: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
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

export default function IndexedPagesDashboard() {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [indexedPagesData, setIndexedPagesData] = useState<IndexedPagesData | null>(null);
  const [indexingSummary, setIndexingSummary] = useState<IndexingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [includePerformance, setIncludePerformance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('clicks');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load GSC properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await indexingApi.getGSCProperties();
      setProperties(response);
      if (response.length > 0) {
        setSelectedProperty(response[0].site_url);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
      toast.error('Failed to load Google Search Console properties');
    }
  };

  const loadIndexedPages = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const data = await indexingApi.getIndexedPages(selectedProperty, {
        days: 30,
        page: currentPage,
        pageSize,
        includePerformance
      });
      setIndexedPagesData(data.data);
    } catch (error) {
      console.error('Failed to load indexed pages:', error);
      toast.error('Failed to load indexed pages data');
    } finally {
      setLoading(false);
    }
  };

  const loadIndexingSummary = async () => {
    if (!selectedProperty) return;
    
    try {
      const data = await indexingApi.getIndexingSummary(selectedProperty);
      setIndexingSummary(data.data.summary);
    } catch (error) {
      console.error('Failed to load indexing summary:', error);
      toast.error('Failed to load indexing summary');
    }
  };

  useEffect(() => {
    if (selectedProperty) {
      loadIndexedPages();
      loadIndexingSummary();
    }
  }, [selectedProperty, currentPage, pageSize, includePerformance]);

  const filteredPages = indexedPagesData?.pages.filter(page => 
    page.url.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedPages = [...filteredPages].sort((a, b) => {
    const aValue = (a[sortBy as keyof typeof a] as number) || 0;
    const bValue = (b[sortBy as keyof typeof b] as number) || 0;
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getStatusColor = (indexed: boolean, coverageState?: string) => {
    if (indexed) return 'bg-green-100 text-green-800 border-green-200';
    if (coverageState?.includes('not indexed')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (coverageState?.includes('error')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (indexed: boolean, coverageState?: string) => {
    if (indexed) return <Eye className="w-4 h-4 text-green-600" />;
    if (coverageState?.includes('not indexed')) return <Clock className="w-4 h-4 text-yellow-600" />;
    if (coverageState?.includes('error')) return <Zap className="w-4 h-4 text-red-600" />;
    return <Globe className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Indexed Pages Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your Google Search Console indexed pages and performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((prop) => (
                <SelectItem key={prop.site_url} value={prop.site_url}>
                  {prop.site_url}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => loadIndexedPages()} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {indexingSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Total Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{indexingSummary.totalPages.toLocaleString()}</div>
              <p className="text-xs text-blue-600 mt-1">All pages in GSC</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Indexed Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{indexingSummary.indexedPages.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                <Progress value={indexingSummary.indexingRate} className="w-16 h-2 mr-2" />
                <span className="text-xs text-green-600">{indexingSummary.indexingRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{indexingSummary.pendingPages.toLocaleString()}</div>
              <p className="text-xs text-yellow-600 mt-1">Awaiting indexing</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{indexingSummary.errorPages.toLocaleString()}</div>
              <p className="text-xs text-red-600 mt-1">Indexing issues</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Overview */}
      {indexedPagesData?.performance && (
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Performance Overview (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {indexedPagesData.performance.totalClicks.toLocaleString()}
                </div>
                <p className="text-sm text-purple-600">Total Clicks</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {indexedPagesData.performance.totalImpressions.toLocaleString()}
                </div>
                <p className="text-sm text-purple-600">Total Impressions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {indexedPagesData.performance.avgCTR}%
                </div>
                <p className="text-sm text-purple-600">Avg CTR</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">
                  {indexedPagesData.performance.avgPosition}
                </div>
                <p className="text-sm text-purple-600">Avg Position</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center">
            <PieChart className="w-4 h-4 mr-2" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search pages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clicks">Clicks</SelectItem>
                    <SelectItem value="impressions">Impressions</SelectItem>
                    <SelectItem value="ctr">CTR</SelectItem>
                    <SelectItem value="position">Position</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pages List */}
          <Card>
            <CardHeader>
              <CardTitle>Indexed Pages ({sortedPages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedPages.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(page.indexed, page.coverageState)}
                      <div>
                        <div className="font-medium text-gray-900 truncate max-w-md">
                          {page.url}
                        </div>
                        <div className="text-sm text-gray-500">
                          {page.coverageState || 'Unknown status'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {includePerformance && page.clicks !== undefined && (
                        <div className="text-right">
                          <div className="font-medium">{page.clicks.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Clicks</div>
                        </div>
                      )}
                      {includePerformance && page.impressions !== undefined && (
                        <div className="text-right">
                          <div className="font-medium">{page.impressions.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Impressions</div>
                        </div>
                      )}
                      <Badge className={getStatusColor(page.indexed, page.coverageState)}>
                        {page.indexed ? 'Indexed' : 'Not Indexed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grid View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedPages.map((page, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        {getStatusIcon(page.indexed, page.coverageState)}
                        <Badge className={getStatusColor(page.indexed, page.coverageState)}>
                          {page.indexed ? 'Indexed' : 'Not Indexed'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {page.url}
                        </div>
                        {includePerformance && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="font-medium">{page.clicks?.toLocaleString() || 0}</div>
                              <div className="text-gray-500">Clicks</div>
                            </div>
                            <div>
                              <div className="font-medium">{page.impressions?.toLocaleString() || 0}</div>
                              <div className="text-gray-500">Impressions</div>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {page.coverageState || 'Unknown status'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Indexing Status Chart */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Indexing Status Distribution</h3>
                  <div className="space-y-2">
                    {indexingSummary && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Indexed</span>
                          <span className="text-sm font-medium">{indexingSummary.indexingRate}%</span>
                        </div>
                        <Progress value={indexingSummary.indexingRate} className="h-2" />
                      </>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Metrics</h3>
                  {indexedPagesData?.performance && (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Avg CTR</span>
                        <span className="text-sm font-medium">{indexedPagesData.performance.avgCTR}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Position</span>
                        <span className="text-sm font-medium">{indexedPagesData.performance.avgPosition}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {indexedPagesData?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, indexedPagesData.pagination.totalItems)} of {indexedPagesData.pagination.totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!indexedPagesData.pagination.hasPrevious}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {indexedPagesData.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!indexedPagesData.pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 