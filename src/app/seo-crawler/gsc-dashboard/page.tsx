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
  Activity,
  Database,
  FileText,
  Sparkles
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { toast } from 'sonner';
import { Chart, MetricCard } from '@/components/ui/chart';
import { LineChart, AreaChart, BarChart as GSCBarChart, PerformanceChart, ComparisonChart, GaugeChart } from '@/components/ui/charts';

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
  ctr?: number; // Percentage (0-100)
  position?: number; // Average position (1-100)
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
      
      // Load indexed pages with performance data
      const pagesResponse = await indexingApi.getIndexedPages(selectedProperty, {
        days: parseInt(dateRange),
        page: 1,
        pageSize: 100,
        includePerformance: true
      });
      
      setIndexedPages(pagesResponse.data.pages || []);
      setPerformanceData(pagesResponse.data.performance || null);
      setCoverageData(pagesResponse.data.coverage || null);
      setSitemapsData(pagesResponse.data.sitemaps || []);
      setEnhancementsData(pagesResponse.data.enhancements || null);
      
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

  // Generate sample historical data for charts
  const generateHistoricalData = () => {
    const days = 30;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 50) + 10,
        impressions: Math.floor(Math.random() * 200) + 50,
        ctr: (Math.random() * 0.1) + 0.05,
        position: (Math.random() * 20) + 10
      });
    }
    
    return data;
  };

  useEffect(() => {
    setHistoricalData(generateHistoricalData());
  }, []);

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Google Search Console Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time data and insights from Google Search Console
          </p>
        </div>
        <Button 
          onClick={loadGSCData} 
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Property Selector */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Globe className="w-4 h-4 text-gray-500" />
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
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="gsc-data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            GSC Data
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Pages</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {indexedPages.length.toLocaleString()}
                    </p>
                  </div>
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Indexed Pages</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {indexedPages.filter(page => page.indexed).length.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Indexing Rate</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {indexedPages.length > 0 ? Math.round((indexedPages.filter(page => page.indexed).length / indexedPages.length) * 100) : 0}%
                    </p>
                  </div>
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {performanceData?.totalClicks.toLocaleString() || '0'}
                    </p>
                  </div>
                  <MousePointer className="w-5 h-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Indexing Progress */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Target className="w-5 h-5" />
                Indexing Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Progress Bar */}
                <div className="flex flex-col justify-center">
                  <div className="mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
                  </div>
                  <Progress 
                    value={indexedPages.length > 0 ? (indexedPages.filter(page => page.indexed).length / indexedPages.length) * 100 : 0} 
                    className="h-3" 
                  />
                  <div className="mt-2 text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {indexedPages.length > 0 ? Math.round((indexedPages.filter(page => page.indexed).length / indexedPages.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
                
                {/* Indexing Status Chart */}
                <div className="lg:col-span-2">
                  {indexedPages.length > 0 && (
                    <GSCBarChart 
                      data={[
                        { 
                          label: 'Indexed', 
                          value: indexedPages.filter(page => page.indexed).length, 
                          color: '#10b981' 
                        },
                        { 
                          label: 'Not Indexed', 
                          value: indexedPages.filter(page => !page.indexed).length, 
                          color: '#f59e0b' 
                        },
                        { 
                          label: 'Pending', 
                          value: indexedPages.filter(page => page.coverageState === 'Discovered – currently not indexed').length, 
                          color: '#f97316' 
                        },
                        { 
                          label: 'Errors', 
                          value: indexedPages.filter(page => page.coverageState === 'Error').length, 
                          color: '#ef4444' 
                        }
                      ]}
                      title="Status Distribution"
                      height={150}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Charts */}
          {historicalData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PerformanceChart
                data={historicalData.map(d => ({ date: d.date, value: d.clicks }))}
                metric="clicks"
                title="Clicks Over Time"
                height={200}
              />
              <PerformanceChart
                data={historicalData.map(d => ({ date: d.date, value: d.impressions }))}
                metric="impressions"
                title="Impressions Over Time"
                height={200}
              />
            </div>
          )}

          {/* CTR and Position Charts */}
          {historicalData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PerformanceChart
                data={historicalData.map(d => ({ date: d.date, value: d.ctr }))}
                metric="ctr"
                title="Click-Through Rate"
                height={200}
              />
              <PerformanceChart
                data={historicalData.map(d => ({ date: d.date, value: d.position }))}
                metric="position"
                title="Average Position"
                height={200}
              />
            </div>
          )}

          {/* Comparison Chart */}
          {historicalData && (
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonChart
                  data1={historicalData.map(d => ({ date: d.date, value: d.clicks }))}
                  data2={historicalData.map(d => ({ date: d.date, value: d.impressions / 10 }))}
                  label1="Clicks"
                  label2="Impressions (scaled)"
                  title="Clicks vs Impressions Trend"
                  height={200}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Indexing Tab */}
        <TabsContent value="indexing" className="space-y-4">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Target className="w-5 h-5" />
                Indexing Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Indexed</span>
                    </div>
                    <Badge variant="secondary">{indexedPages.filter(page => page.indexed).length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium">Not Indexed</span>
                    </div>
                    <Badge variant="secondary">{indexedPages.filter(page => !page.indexed).length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <Badge variant="secondary">{indexedPages.filter(page => page.coverageState === 'Discovered – currently not indexed').length}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Errors</span>
                    </div>
                    <Badge variant="secondary">{indexedPages.filter(page => page.coverageState === 'Error').length}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Search Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Performance Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Impressions</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      {performanceData?.totalImpressions.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MousePointer className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Clicks</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      {performanceData?.totalClicks.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-white">CTR</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      {performanceData?.avgCTR || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Position</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">
                      {performanceData?.avgPosition || 0}
                    </span>
                  </div>
                </div>
                
                {/* Performance Charts */}
                {historicalData && (
                  <div className="space-y-3">
                    <AreaChart
                      data={historicalData.map(d => ({ date: d.date, value: d.impressions }))}
                      title="Impressions Trend"
                      color="#3b82f6"
                      height={100}
                    />
                    <AreaChart
                      data={historicalData.map(d => ({ date: d.date, value: d.clicks }))}
                      title="Clicks Trend"
                      color="#10b981"
                      height={100}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends Analysis */}
          {historicalData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    CTR vs Position Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComparisonChart
                    data1={historicalData.map(d => ({ date: d.date, value: d.ctr * 100 }))}
                    data2={historicalData.map(d => ({ date: d.date, value: d.position }))}
                    label1="CTR (%)"
                    label2="Position"
                    title="CTR vs Position Correlation"
                    height={200}
                  />
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GSCBarChart
                    data={[
                      { label: 'High CTR', value: historicalData.filter(d => d.ctr > 0.1).length, color: '#10b981' },
                      { label: 'Medium CTR', value: historicalData.filter(d => d.ctr > 0.05 && d.ctr <= 0.1).length, color: '#f59e0b' },
                      { label: 'Low CTR', value: historicalData.filter(d => d.ctr <= 0.05).length, color: '#ef4444' }
                    ]}
                    title="CTR Performance Distribution"
                    height={200}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
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
              <div className="space-y-3">
                {indexedPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                      
                      {page.ctr !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{page.ctr.toFixed(2)}%</p>
                          <p className="text-xs text-gray-500">CTR</p>
                        </div>
                      )}
                      
                      {page.position !== undefined && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{page.position.toFixed(1)}</p>
                          <p className="text-xs text-gray-500">Position</p>
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

        {/* GSC Data Tab */}
        <TabsContent value="gsc-data" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coverage Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Coverage Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coverageData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{coverageData.totalSubmitted}</div>
                        <div className="text-sm text-gray-600">Total Submitted</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{coverageData.totalIndexed}</div>
                        <div className="text-sm text-gray-600">Total Indexed</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{coverageData.totalExcluded}</div>
                        <div className="text-sm text-gray-600">Total Excluded</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{coverageData.totalError}</div>
                        <div className="text-sm text-gray-600">Total Errors</div>
                      </div>
                    </div>
                    
                    {/* Coverage Chart */}
                    <div className="mt-6">
                      <GSCBarChart
                        data={[
                          { label: 'Indexed', value: coverageData.totalIndexed, color: '#10b981' },
                          { label: 'Excluded', value: coverageData.totalExcluded, color: '#f59e0b' },
                          { label: 'Errors', value: coverageData.totalError, color: '#ef4444' }
                        ]}
                        title="Coverage Distribution"
                        height={150}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No coverage data available</div>
                )}
              </CardContent>
            </Card>

            {/* Sitemaps Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Sitemaps ({sitemapsData.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sitemapsData.length > 0 ? (
                  <div className="space-y-3">
                    {sitemapsData.slice(0, 5).map((sitemap, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{sitemap.path}</p>
                          <p className="text-xs text-gray-500">
                            {sitemap.contents} URLs • {sitemap.errors} errors
                          </p>
                        </div>
                        <Badge variant={sitemap.isPending ? "secondary" : "default"}>
                          {sitemap.isPending ? "Pending" : "Active"}
                        </Badge>
                      </div>
                    ))}
                    {sitemapsData.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{sitemapsData.length - 5} more sitemaps
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No sitemaps found</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhancements Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Enhancements & Rich Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enhancementsData ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{enhancementsData.structuredData.length}</div>
                    <div className="text-sm text-gray-600">Structured Data</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{enhancementsData.mobileUsability.length}</div>
                    <div className="text-sm text-gray-600">Mobile Usability</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{enhancementsData.coreWebVitals.length}</div>
                    <div className="text-sm text-gray-600">Core Web Vitals</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{enhancementsData.richResults.length}</div>
                    <div className="text-sm text-gray-600">Rich Results</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">No enhancements data available</div>
              )}
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