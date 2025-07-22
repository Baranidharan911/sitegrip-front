'use client';

import React, { useState, useEffect } from 'react';
import { indexingApi } from '@/lib/indexingApi';
import IndexedPagesDashboard from '@/components/Indexing/IndexedPagesDashboard';
import IndexedPagesCharts from '@/components/Indexing/IndexedPagesCharts';
import IndexedPagesTable from '@/components/Indexing/IndexedPagesTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw, BarChart3, Table, PieChart, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function IndexedPagesAnalyticsPage() {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [properties, setProperties] = useState<any[]>([]);
  const [indexedPagesData, setIndexedPagesData] = useState<any>(null);
  const [indexingSummary, setIndexingSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'charts' | 'table'>('dashboard');

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

  const loadData = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      // Load indexed pages data
      const pagesData = await indexingApi.getIndexedPages(selectedProperty, {
        days: 30,
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      setIndexedPagesData(pagesData.data);

      // Load indexing summary
      const summaryData = await indexingApi.getIndexingSummary(selectedProperty);
      setIndexingSummary(summaryData.data.summary);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load indexed pages data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProperty) {
      loadData();
    }
  }, [selectedProperty]);

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = (selectedPages: any[]) => {
    // Create CSV content
    const csvContent = [
      ['URL', 'Status', 'Clicks', 'Impressions', 'CTR', 'Position', 'Coverage State'],
      ...selectedPages.map(page => [
        page.url,
        page.indexed ? 'Indexed' : 'Not Indexed',
        page.clicks || 0,
        page.impressions || 0,
        page.ctr ? `${page.ctr}%` : '0%',
        page.position || 0,
        page.coverageState || 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `indexed-pages-${selectedProperty}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${selectedPages.length} pages to CSV`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Indexed Pages Analytics</h1>
              <p className="text-sm text-gray-600">Comprehensive analysis of your Google Search Console indexed pages</p>
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
              <Button onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {indexingSummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Total Pages</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {indexingSummary.totalPages.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Indexed Pages</p>
                    <p className="text-2xl font-bold text-green-900">
                      {indexingSummary.indexedPages.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">{indexingSummary.indexingRate}% rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PieChart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {indexedPagesData?.performance?.totalClicks.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Table className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Avg Position</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {indexedPagesData?.performance?.avgPosition || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center">
              <PieChart className="w-4 h-4 mr-2" />
              Charts & Analytics
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center">
              <Table className="w-4 h-4 mr-2" />
              Data Table
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <IndexedPagesDashboard />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            {indexedPagesData && indexingSummary ? (
              <IndexedPagesCharts 
                data={indexedPagesData} 
                summary={indexingSummary} 
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a property and load data to view charts and analytics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="table" className="space-y-6">
            {indexedPagesData?.pages ? (
              <IndexedPagesTable 
                pages={indexedPagesData.pages}
                onRefresh={handleRefresh}
                onExport={handleExport}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Table className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a property and load data to view the table.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        {indexedPagesData && (
          <div className="mt-8 p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Performance Overview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Clicks:</span>
                    <span className="font-medium">{indexedPagesData.performance?.totalClicks.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Impressions:</span>
                    <span className="font-medium">{indexedPagesData.performance?.totalImpressions.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average CTR:</span>
                    <span className="font-medium">{indexedPagesData.performance?.avgCTR || 0}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Indexing Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Indexed Pages:</span>
                    <span className="font-medium text-green-600">{indexedPagesData.pages.filter((p: any) => p.indexed).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Not Indexed:</span>
                    <span className="font-medium text-yellow-600">{indexedPagesData.pages.filter((p: any) => !p.indexed).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Indexing Rate:</span>
                    <span className="font-medium">{indexingSummary?.indexingRate || 0}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages with Data:</span>
                    <span className="font-medium">{indexedPagesData.pages.filter((p: any) => p.clicks || p.impressions).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Range:</span>
                    <span className="font-medium">Last 30 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 