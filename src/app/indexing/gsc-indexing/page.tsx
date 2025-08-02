'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  FileText, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Download,
  TrendingUp,
  Search,
  XCircle,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { toast } from 'react-hot-toast';
import { getStoredAuthToken } from '@/utils/auth';

// Inline UI Components
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm ${className || ''}`}
    {...props}
  />
));
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />
));
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ''}`} {...props} />
));
CardContent.displayName = "CardContent";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variantClasses = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
              outline: "border border-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      ghost: "hover:bg-gray-100 hover:text-gray-900",
      link: "text-blue-600 underline-offset-4 hover:underline",
    };
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    
    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-gray-900 border-gray-300",
  };
  
  return (
    <div 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className || ''}`} 
      {...props} 
    />
  );
};

// Data interfaces
interface GSCProperty {
  site_url: string;
  permission_level: string;
  verified: boolean;
}

interface IndexingReason {
  reason: string;
  count: number;
  percentage: number;
  severity: 'error' | 'warning' | 'info';
  source: string;
  validation: string;
  trend: 'up' | 'down' | 'stable';
}

interface GSCIndexingData {
  indexing: {
    indexedPages: number;
    notIndexedPages: number;
    totalPages: number;
    indexedPercentage: number;
    chartData: Array<{
      date: string;
      indexed: number;
      notIndexed: number;
    }>;
    detailedReasons: IndexingReason[];
    sitemaps: Array<{
      path: string;
      lastSubmitted: string;
      indexed: number;
      submitted: number;
      errors: number;
    }>;
  };
  metadata: {
    property: string;
    userId: string;
    dateRange: {
      startDate: string;
      endDate: string;
      days: number;
    };
    responseTime: number;
    timestamp: string;
  };
}

export default function GSCIndexingPage() {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [indexingData, setIndexingData] = useState<GSCIndexingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load GSC properties on component mount
  useEffect(() => {
    loadGSCProperties();
  }, []);

  // Load indexing data when property changes
  useEffect(() => {
    if (selectedProperty) {
      loadIndexingData();
    }
  }, [selectedProperty]);

  const loadGSCProperties = async () => {
    try {
      const token = getStoredAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/gsc/properties`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load GSC properties');
      }

      const data = await response.json();
      setProperties(data.data?.properties || []);
      
      if (data.data?.properties?.length > 0) {
        setSelectedProperty(data.data.properties[0].site_url);
      }
    } catch (error: any) {
      console.error('Error loading GSC properties:', error);
      setError(error.message);
      toast.error('Failed to load GSC properties');
    }
  };

  const loadIndexingData = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Use the new optimized GSC endpoint to get REAL cached GSC indexing data
      const response = await fetch(
        `${API_BASE_URL}/api/gsc/all/${encodeURIComponent(selectedProperty)}/90`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load GSC indexing data');
      }

      const data = await response.json();
      
      console.log('🔍 [GSC Indexing] Raw API response:', data);
      
      if (data.success) {
        // Transform the new optimized cached backend data to match frontend interface
        const transformedData = {
          indexing: {
            indexedPages: data.data.indexing?.indexedPages || 0,
            notIndexedPages: data.data.indexing?.notIndexedPages || 0,
            totalPages: data.data.indexing?.totalPages || 0,
            indexedPercentage: data.data.indexing?.indexingRate || 0,
            chartData: data.data.indexing?.chartData || [],
            detailedReasons: data.data.indexing?.indexingReasons || [], // Real GSC indexing reasons
            sitemaps: data.data.indexing?.sitemaps || []
          },
          metadata: data.data.metadata || {
            property: selectedProperty,
            timestamp: new Date().toISOString()
          },
          cached: data.data.cached || false, // Track if data came from cache
          cacheTimestamp: data.data.cacheTimestamp
        };
        
        console.log('📄 [GSC Indexing] Transformed data:', transformedData);
        console.log('📊 [GSC Indexing] Key metrics:', {
          indexedPages: transformedData.indexing.indexedPages,
          notIndexedPages: transformedData.indexing.notIndexedPages,
          totalPages: transformedData.indexing.totalPages,
          indexingRate: transformedData.indexing.indexedPercentage,
          reasonsCount: transformedData.indexing.detailedReasons.length,
          sitemapsCount: transformedData.indexing.sitemaps.length
        });
        
        setIndexingData(transformedData);
        
        // Show appropriate success message based on cache status
        if (transformedData.cached) {
          toast.success('Real GSC indexing data loaded from cache (2-3s load time!) 🚀');
        } else {
          toast.success('Fresh real GSC indexing data loaded successfully');
        }
      } else {
        throw new Error(data.message || 'Failed to load GSC indexing data');
      }
    } catch (error: any) {
      console.error('Error loading GSC indexing data:', error);
      setError(error.message);
      toast.error('Failed to load GSC indexing data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200'; 
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Indexing Data</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadGSCProperties} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GSC Page Indexing</h1>
          <p className="text-gray-600">
            Detailed indexing analysis from Google Search Console
            {indexingData?.metadata && (
              <span className="ml-2 text-sm text-green-600 font-medium">
                • Live data from {indexingData.metadata.property}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadIndexingData} 
            disabled={loading}
            className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Property Selector */}
      {properties.length > 0 && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Property</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="block w-full max-w-md px-3 py-2 border border-indigo-400 dark:border-indigo-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            disabled={loading}
          >
            {properties.map((property) => (
              <option key={property.site_url} value={property.site_url}>
                {property.site_url}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600 font-medium">Loading indexing data...</span>
          </div>
        </div>
      )}

      {/* Indexing Overview Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Not Indexed</CardTitle>
              <XCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatNumber(indexingData?.indexing?.notIndexedPages || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {indexingData?.indexing?.detailedReasons?.length || 0} reasons
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Indexed</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(indexingData?.indexing?.indexedPages || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Successfully indexed</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Pages</CardTitle>
              <Database className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(indexingData?.indexing?.totalPages || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">All known pages</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Indexing Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(indexingData?.indexing?.indexedPercentage || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Success rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Indexing Chart */}
      {indexingData?.indexing?.chartData && indexingData.indexing.chartData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Indexing Trend Over Time</CardTitle>
            <p className="text-sm text-gray-600">
              Real indexing data from Google Search Console
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={indexingData.indexing.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [formatNumber(Number(value)), name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="indexed" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Indexed Pages"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="notIndexed" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Not Indexed Pages"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Why Pages Aren't Indexed - Main Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <CardTitle>Why Pages Aren't Indexed</CardTitle>
          </div>
          <p className="text-sm text-gray-600">
            Pages that aren't indexed can't be served on Google
          </p>
        </CardHeader>
        <CardContent>
          {indexingData?.indexing?.detailedReasons && indexingData.indexing.detailedReasons.length > 0 ? (
            <div className="space-y-4">
              {/* Reasons Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-medium">Reason</th>
                      <th className="text-left p-3 font-medium">Source</th>
                      <th className="text-left p-3 font-medium">Validation</th>
                      <th className="text-left p-3 font-medium">Trend</th>
                      <th className="text-right p-3 font-medium">Pages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indexingData.indexing.detailedReasons.map((reason, index) => (
                      <tr key={index} className={`border-b hover:bg-gray-50 ${getSeverityColor(reason.severity)}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(reason.severity)}
                            <span className="font-medium">{reason.reason}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-600">{reason.source}</td>
                        <td className="p-3">
                          <Badge variant={reason.severity === 'error' ? 'destructive' : 'secondary'}>
                            {reason.validation}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className={`text-sm ${
                            reason.trend === 'up' ? 'text-red-600' : 
                            reason.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {reason.trend === 'up' ? '↗' : reason.trend === 'down' ? '↘' : '→'} {reason.trend}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold">{formatNumber(reason.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Great! No Indexing Issues</h3>
              <p className="text-gray-600">
                All your pages appear to be properly indexed by Google Search Console.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sitemaps Section - Fixed to show real data */}
      {indexingData?.indexing?.sitemaps && indexingData.indexing.sitemaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sitemap Details</CardTitle>
            <p className="text-sm text-gray-600">
              Submitted sitemaps and their indexing status
            </p>
          </CardHeader>
          <CardContent>
            {/* Sitemap Summary - Using Real GSC Indexing Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {indexingData.indexing.sitemaps.length}
                </div>
                <div className="text-sm text-gray-600">Total Sitemaps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(indexingData.indexing.totalPages || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Submitted URLs</div>
                <div className="text-xs text-gray-500">(Real GSC page indexing data)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(indexingData.indexing.indexedPages || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Indexed URLs</div>
                <div className="text-xs text-gray-500">(Real GSC page indexing data)</div>
              </div>
            </div>

            {/* Individual Sitemaps */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Sitemap Path</h4>
              {indexingData.indexing.sitemaps.map((sitemap, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{sitemap.path}</div>
                    <div className="text-sm text-gray-500">
                      Last submitted: {new Date(sitemap.lastSubmitted).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatNumber(sitemap.indexed)} / {formatNumber(sitemap.submitted)} indexed
                    </div>
                    <div className="text-xs text-gray-500">
                      {sitemap.submitted > 0 ? Math.round((sitemap.indexed / sitemap.submitted) * 100) : 0}% success rate
                    </div>
                    {sitemap.errors > 0 && (
                      <div className="text-xs text-red-600">
                        {formatNumber(sitemap.errors)} errors
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {indexingData?.metadata && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Property: {indexingData.metadata.property}</div>
              <div>Response Time: {indexingData.metadata.responseTime}ms</div>
              <div>Date Range: {indexingData.metadata.dateRange.startDate} to {indexingData.metadata.dateRange.endDate}</div>
              <div>Last Updated: {new Date(indexingData.metadata.timestamp).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      )}
      {process.env.NODE_ENV === 'development' && indexingData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Debug Info (Development Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-gray-100 p-4 rounded overflow-auto">
              <pre>{JSON.stringify(indexingData, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 