'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Search, BarChart3, Download, RefreshCw, ChevronDown, Check, Globe, Smartphone, Monitor, Tablet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { toast } from 'react-hot-toast';
import { getStoredAuthToken } from '@/utils/auth';

// Inline UI Components (same as dashboard)
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

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}
const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: () => setIsOpen(!isOpen),
            isOpen
          });
        }
        if (React.isValidElement(child) && child.type === SelectContent) {
          return isOpen ? React.cloneElement(child as React.ReactElement<any>, {
            onSelect: (newValue: string) => {
              onValueChange(newValue);
              setIsOpen(false);
            },
            value
          }) : null;
        }
        return child;
      })}
    </div>
  );
};

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isOpen?: boolean;
}
const SelectTrigger = ({ children, isOpen, className, ...props }: SelectTriggerProps) => (
  <button
                    className={`flex h-10 w-full items-center justify-between rounded-md border bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className || 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
    {...props}
  >
    {children}
    <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
  </button>
);

interface SelectContentProps {
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  value?: string;
}
const SelectContent = ({ children, onSelect, value }: SelectContentProps) => (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-hidden rounded-md border bg-white dark:bg-slate-800 shadow-md">
    <div className="p-1">
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onSelect,
            isSelected: child.props.value === value
          });
        }
        return child;
      })}
    </div>
  </div>
);

interface SelectValueProps {
  placeholder?: string;
}
const SelectValue = ({ placeholder }: SelectValueProps) => (
  <span className="text-gray-500">{placeholder}</span>
);

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  isSelected?: boolean;
}
const SelectItem = ({ value, children, onSelect, isSelected }: SelectItemProps) => (
  <div
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''}`}
    onClick={() => onSelect?.(value)}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {isSelected && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
);

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

interface GSCPerformanceData {
  performance: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    chartData: Array<{
      date: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
    topQueries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      ctr: string;
      position: string;
    }>;
    topPages: Array<{
      page: string;
      clicks: number;
      impressions: number;
      ctr: string;
      position: string;
    }>;
    countries: Array<{
      country: string;
      clicks: number;
      impressions: number;
      ctr: string;
      position: string;
    }>;
    devices: Array<{
      device: string;
      clicks: number;
      impressions: number;
      ctr: string;
      position: string;
    }>;
    summary: {
      dateRange: string;
    };
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
    authMethod: string;
    timestamp: string;
  };
}

interface GSCProperty {
  site_url: string;
  permission_level: string;
  verified: boolean;
}

export default function GSCPerformancePage() {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('30');
  const [performanceData, setPerformanceData] = useState<GSCPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'pages' | 'countries' | 'devices'>('overview');

  // Load GSC properties on component mount
  useEffect(() => {
    loadGSCProperties();
  }, []);

  // Load performance data when property or time range changes
  useEffect(() => {
    if (selectedProperty) {
      loadPerformanceData();
    }
  }, [selectedProperty, timeRange]);

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

  const loadPerformanceData = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Use new optimized cached endpoint for performance data
      const response = await fetch(
        `${API_BASE_URL}/api/gsc/all/${encodeURIComponent(selectedProperty)}/${timeRange}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load GSC performance data');
      }

      const data = await response.json();
      
      if (data.success) {
        // Extract performance data from the new optimized cached response
        const performanceDataOnly = {
          performance: data.data.performance,
          metadata: data.data.metadata,
          cached: data.data.cached || false,
          cacheTimestamp: data.data.cacheTimestamp
        };
        setPerformanceData(performanceDataOnly);
        console.log('📈 [GSC Performance] Loaded optimized cached performance data:', performanceDataOnly);
        
        // Show appropriate success message based on cache status
        if (performanceDataOnly.cached) {
          toast.success('Performance data loaded from cache (2-3s load time!) 🚀');
        } else {
          toast.success('Fresh performance data loaded successfully');
        }
      } else {
        throw new Error(data.message || 'Failed to load GSC performance data');
      }
    } catch (error: any) {
      console.error('Error loading GSC performance data:', error);
      setError(error.message);
      toast.error('Failed to load GSC performance data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number | string) => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    return `${numValue.toFixed(2)}%`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h1>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GSC Performance</h1>
          <p className="text-gray-600">Analyze your search performance metrics and trends</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadPerformanceData} 
            disabled={loading}
            className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-white dark:bg-slate-800 border-indigo-400 dark:border-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 dark:text-white" disabled={loading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="bg-white dark:bg-slate-800 border-indigo-400 dark:border-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 dark:text-white" disabled={loading}>
              <SelectValue placeholder="Select a website" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.site_url} value={property.site_url}>
                  {property.site_url}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600 font-medium">Loading performance data...</span>
          </div>
        </div>
      )}

      {/* Performance Overview Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Clicks</CardTitle>
              <Eye className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(performanceData?.performance?.clicks || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {performanceData?.performance?.summary?.dateRange || 'Last 30 days'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Impressions</CardTitle>
              <Search className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(performanceData?.performance?.impressions || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Search appearances</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Average CTR</CardTitle>
              <BarChart3 className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatPercentage(performanceData?.performance?.ctr || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Click-through rate</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Average Position</CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {performanceData?.performance?.position?.toFixed(1) || '0.0'}
              </div>
              <p className="text-xs text-gray-500 mt-1">Search ranking</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Chart */}
      {performanceData?.performance?.chartData && performanceData.performance.chartData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <p className="text-sm text-gray-600">
              Real data from Google Search Console for {performanceData.performance.summary?.dateRange}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData.performance.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [
                      name === 'clicks' || name === 'impressions' ? formatNumber(Number(value)) : 
                      name === 'ctr' ? `${value}%` : 
                      name === 'position' ? Number(value).toFixed(1) : value,
                      name
                    ]}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Clicks"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Impressions"
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="ctr" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="CTR (%)"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="position" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Avg Position"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Queries and Top Pages - Real GSC Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Queries */}
        {performanceData?.performance?.topQueries && performanceData.performance.topQueries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Queries</CardTitle>
              <p className="text-sm text-gray-600">
                Real search queries from Google Search Console
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.performance.topQueries.slice(0, 10).map((query, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">{query.query}</div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(query.clicks)} clicks • {formatNumber(query.impressions)} impressions
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-semibold">{query.ctr}%</div>
                      <div className="text-xs text-gray-500">Pos: {query.position}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Pages */}
        {performanceData?.performance?.topPages && performanceData.performance.topPages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <p className="text-sm text-gray-600">
                Best performing pages from Google Search Console
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.performance.topPages.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">{page.page}</div>
                      <div className="text-xs text-gray-500">
                        {formatNumber(page.clicks)} clicks • {formatNumber(page.impressions)} impressions
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-semibold">{page.ctr}%</div>
                      <div className="text-xs text-gray-500">Pos: {page.position}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'queries', label: 'Top Queries' },
              { id: 'pages', label: 'Top Pages' },
              { id: 'countries', label: 'Countries' },
              { id: 'devices', label: 'Devices' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData?.performance?.topQueries?.slice(0, 5).map((query, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium truncate">{query.query}</div>
                      <div className="text-sm text-gray-500">
                        {formatNumber(query.clicks)} clicks • {formatNumber(query.impressions)} impressions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatPercentage(query.ctr)}</div>
                      <div className="text-xs text-gray-500">Pos: {parseFloat(query.position).toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData?.performance?.devices?.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.device)}
                      <div>
                        <div className="font-medium">{device.device}</div>
                        <div className="text-sm text-gray-500">
                          {formatNumber(device.clicks)} clicks
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatPercentage(device.ctr)}</div>
                      <div className="text-xs text-gray-500">Pos: {parseFloat(device.position).toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'queries' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Search Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Query</th>
                    <th className="text-left p-3">Clicks</th>
                    <th className="text-left p-3">Impressions</th>
                    <th className="text-left p-3">CTR</th>
                    <th className="text-left p-3">Avg Position</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData?.performance?.topQueries?.map((query, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{query.query}</td>
                      <td className="p-3">{formatNumber(query.clicks)}</td>
                      <td className="p-3">{formatNumber(query.impressions)}</td>
                      <td className="p-3">{formatPercentage(query.ctr)}</td>
                      <td className="p-3">{parseFloat(query.position).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'pages' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Page</th>
                    <th className="text-left p-3">Clicks</th>
                    <th className="text-left p-3">Impressions</th>
                    <th className="text-left p-3">CTR</th>
                    <th className="text-left p-3">Avg Position</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData?.performance?.topPages?.map((page, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="max-w-xs truncate" title={page.page}>
                          {page.page}
                        </div>
                      </td>
                      <td className="p-3">{formatNumber(page.clicks)}</td>
                      <td className="p-3">{formatNumber(page.impressions)}</td>
                      <td className="p-3">{formatPercentage(page.ctr)}</td>
                      <td className="p-3">{parseFloat(page.position).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'countries' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Country</th>
                    <th className="text-left p-3">Clicks</th>
                    <th className="text-left p-3">Impressions</th>
                    <th className="text-left p-3">CTR</th>
                    <th className="text-left p-3">Avg Position</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData?.performance?.countries?.map((country, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{country.country}</td>
                      <td className="p-3">{formatNumber(country.clicks)}</td>
                      <td className="p-3">{formatNumber(country.impressions)}</td>
                      <td className="p-3">{formatPercentage(country.ctr)}</td>
                      <td className="p-3">{parseFloat(country.position).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'devices' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by Device</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Device</th>
                    <th className="text-left p-3">Clicks</th>
                    <th className="text-left p-3">Impressions</th>
                    <th className="text-left p-3">CTR</th>
                    <th className="text-left p-3">Avg Position</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData?.performance?.devices?.map((device, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.device)}
                          <span className="font-medium">{device.device}</span>
                        </div>
                      </td>
                      <td className="p-3">{formatNumber(device.clicks)}</td>
                      <td className="p-3">{formatNumber(device.impressions)}</td>
                      <td className="p-3">{formatPercentage(device.ctr)}</td>
                      <td className="p-3">{parseFloat(device.position).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {performanceData?.metadata && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Response Time: {performanceData.metadata.responseTime}ms</div>
              <div>Auth Method: {performanceData.metadata.authMethod}</div>
              <div>Date Range: {performanceData.metadata.dateRange.startDate} to {performanceData.metadata.dateRange.endDate}</div>
              <div>Last Updated: {new Date(performanceData.metadata.timestamp).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 