'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, Search, BarChart3, Download, RefreshCw, ChevronDown, Check, Shield, Zap, Smartphone, Monitor, Wifi } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
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
      outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
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
    className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className || 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
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
  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-hidden rounded-md border bg-white shadow-md">
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

interface GSCExperienceData {
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
  };
  indexing: {
    indexedPages: number;
    notIndexedPages: number;
    totalPages: number;
    indexedPercentage: number;
    reasons?: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
  };
  https: {
    securePages: number;
    insecurePages: number;
    securityScore: number;
    totalUrls: number;
  };
  links: {
    internalLinks: number;
    externalLinks: number;
    topLinkingPages: Array<{
      url: string;
      links: number;
    }>;
  };
  coreWebVitals?: {
    lcp: { good: number; needsImprovement: number; poor: number };
    fid: { good: number; needsImprovement: number; poor: number };
    cls: { good: number; needsImprovement: number; poor: number };
    trends: Array<{
      date: string;
      lcp: number;
      fid: number;
      cls: number;
    }>;
  };
  enhancements?: {
    // Real Rich Results Test API data structure
    structuredData: Array<{
      url: string;
      issues: Array<{
        type: string;
        message: string;
        severity: 'error' | 'warning' | 'info';
      }>;
    }>;
    richResults: Array<{
      type: string;
      valid: boolean;
      issues: string[];
    }>;
    // Legacy estimated data for backwards compatibility
    breadcrumbs?: { valid: number; invalid: number };
    products?: { valid: number; invalid: number };
    articles?: { valid: number; invalid: number };
    faqs?: { valid: number; invalid: number };
    issues?: Array<{
      type: string;
      severity: 'error' | 'warning' | 'info';
      count: number;
      description: string;
    }>;
  };
  mobileUsability?: {
    mobileScore: number;
    responsiveScore: number;
    loadTime: number;
    viewportScore: number;
    issues: Array<{
      type: string;
      severity: 'critical' | 'warning' | 'good';
      count: number;
      description: string;
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
    authMethod: string;
    timestamp: string;
  };
  cached?: boolean;
  cacheTimestamp?: string;
}

interface GSCProperty {
  site_url: string;
  permission_level: string;
  verified: boolean;
}

export default function GSCExperiencePage() {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('30');
  const [experienceData, setExperienceData] = useState<GSCExperienceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'core-web-vitals' | 'https' | 'mobile' | 'enhancements'>('overview');

  // Load GSC properties on component mount
  useEffect(() => {
    loadGSCProperties();
  }, []);

  // Load experience data when property or time range changes
  useEffect(() => {
    if (selectedProperty) {
      loadExperienceData();
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

  const loadExperienceData = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Load comprehensive GSC data using new optimized cached endpoints with real Google API data
      const [allDataResponse, coreWebVitalsResponse, mobileResponse, enhancementsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/gsc/all/${encodeURIComponent(selectedProperty)}/${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/gsc/core-web-vitals/${encodeURIComponent(selectedProperty)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/gsc/mobile-usability/${encodeURIComponent(selectedProperty)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/gsc/enhancements/${encodeURIComponent(selectedProperty)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!allDataResponse.ok) {
        throw new Error('Failed to load GSC data');
      }

      const allData = await allDataResponse.json();
      let coreWebVitalsData = null;
      let mobileData = null;
      let enhancementsData = null;

      // Try to load Core Web Vitals, Mobile, and Enhancements data - all now using real Google APIs
      try {
        if (coreWebVitalsResponse.ok) {
          const cwvResponse = await coreWebVitalsResponse.json();
          if (cwvResponse.success) {
            coreWebVitalsData = cwvResponse.data;
            console.log('📊 [Real PageSpeed API] Core Web Vitals loaded:', coreWebVitalsData);
          }
        }
      } catch (error) {
        console.warn('Core Web Vitals data not available:', error);
      }

      try {
        if (mobileResponse.ok) {
          const mobileResponse_data = await mobileResponse.json();
          if (mobileResponse_data.success) {
            mobileData = mobileResponse_data.data;
            console.log('📱 [Real GSC API] Mobile usability loaded:', mobileData);
          }
        }
      } catch (error) {
        console.warn('Mobile usability data not available:', error);
      }

      try {
        if (enhancementsResponse.ok) {
          const enhancementsResponse_data = await enhancementsResponse.json();
          if (enhancementsResponse_data.success) {
            enhancementsData = enhancementsResponse_data.data;
            console.log('✨ [Real Rich Results API] Enhancements loaded:', enhancementsData);
          }
        }
      } catch (error) {
        console.warn('Enhancements data not available:', error);
      }
      
      if (allData.success) {
        const experienceDataStructure = {
          performance: allData.data.performance,
          indexing: allData.data.indexing,
          https: allData.data.https,
          links: allData.data.links,
          coreWebVitals: coreWebVitalsData, // Real PageSpeed Insights API data
          mobileUsability: mobileData, // Real GSC URL Inspection API data
          enhancements: enhancementsData, // Real Rich Results Test API data
          metadata: allData.data.metadata,
          cached: allData.data.cached || false, // Track if data came from cache
          cacheTimestamp: allData.data.cacheTimestamp
        };
        
        setExperienceData(experienceDataStructure);
        console.log('📱 [GSC Experience] Loaded comprehensive data with real Google APIs:', experienceDataStructure);
        
        // Show appropriate success message based on cache status
        if (experienceDataStructure.cached) {
          toast.success('GSC experience data loaded from cache (2-3s load time!) 🚀');
        } else {
          toast.success('GSC experience data loaded with fresh Google API data');
        }
      } else {
        throw new Error(allData.message || 'Failed to load GSC data');
      }
    } catch (error: any) {
      console.error('Error loading GSC experience data:', error);
      setError(error.message);
      toast.error('Failed to load GSC experience data');
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

  const getSecurityStatus = (score: number) => {
    if (score >= 95) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getCoreWebVitalStatus = (metrics: { good: number; needsImprovement: number; poor: number } | undefined) => {
    if (!metrics) return 'Loading...';
    if (typeof metrics.good !== 'number') return 'Loading...';
    if (metrics.good >= 75) return 'Good';
    if (metrics.good >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const getSafeMetrics = (metrics: { good: number; needsImprovement: number; poor: number } | undefined) => {
    return metrics || { good: 0, needsImprovement: 0, poor: 0 };
  };

  const hasRealCoreWebVitals = experienceData?.coreWebVitals && 
    (experienceData.coreWebVitals.lcp || experienceData.coreWebVitals.fid || experienceData.coreWebVitals.cls);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GSC Experience</h1>
          <p className="text-gray-600">Monitor user experience metrics and Core Web Vitals</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadExperienceData} 
            disabled={loading}
            className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 text-gray-700"
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
            <SelectTrigger className="bg-white border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900" disabled={loading}>
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
            <SelectTrigger className="bg-white border-indigo-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900" disabled={loading}>
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
            <span className="text-gray-600 font-medium">Loading experience data...</span>
          </div>
        </div>
      )}

      {/* Experience Overview Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Security Score</CardTitle>
              <Shield className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(experienceData?.https?.securityScore || 100)}
              </div>
              <p className="text-xs text-gray-500 mt-1">HTTPS implementation</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Secure Pages</CardTitle>
              <Shield className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(experienceData?.https?.securePages || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pages using HTTPS</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Core Web Vitals</CardTitle>
              <Zap className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {hasRealCoreWebVitals && experienceData?.coreWebVitals?.lcp 
                  ? getCoreWebVitalStatus(experienceData.coreWebVitals.lcp)
                  : 'No Data'
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">LCP performance</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Mobile Usability</CardTitle>
              <Smartphone className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {experienceData?.mobileUsability?.mobileScore 
                  ? formatPercentage(experienceData.mobileUsability.mobileScore)
                  : 'No Data'
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">Mobile-friendly pages</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Rich Results</CardTitle>
              <Check className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {experienceData?.enhancements?.richResults?.filter(r => r.valid).length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Valid structured data types</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'core-web-vitals', label: 'Core Web Vitals' },
              { id: 'https', label: 'HTTPS' },
              { id: 'mobile', label: 'Mobile Usability' },
              { id: 'enhancements', label: 'Enhancements (Real API)' }
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
              <CardTitle>Security Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>HTTPS Pages</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatNumber(experienceData?.https?.securePages || 0)}</span>
                    <Badge 
                      variant="default"
                      className={getSecurityStatus(experienceData?.https?.securityScore || 100).bg}
                    >
                      {getSecurityStatus(experienceData?.https?.securityScore || 100).label}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>HTTP Pages</span>
                  <span className="font-semibold">{formatNumber(experienceData?.https?.insecurePages || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total URLs</span>
                  <span className="font-semibold">{formatNumber(experienceData?.https?.totalUrls || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Clicks</span>
                  <span className="font-semibold">{formatNumber(experienceData?.performance?.clicks || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Impressions</span>
                  <span className="font-semibold">{formatNumber(experienceData?.performance?.impressions || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average CTR</span>
                  <span className="font-semibold">{formatPercentage(experienceData?.performance?.ctr || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Position</span>
                  <span className="font-semibold">{experienceData?.performance?.position?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'core-web-vitals' && (
        <>
          {hasRealCoreWebVitals ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Largest Contentful Paint (LCP)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Good', value: getSafeMetrics(experienceData?.coreWebVitals?.lcp).good, fill: '#10b981' },
                            { name: 'Needs Improvement', value: getSafeMetrics(experienceData?.coreWebVitals?.lcp).needsImprovement, fill: '#f59e0b' },
                            { name: 'Poor', value: getSafeMetrics(experienceData?.coreWebVitals?.lcp).poor, fill: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        Good (&lt; 2.5s)
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.lcp).good}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        Needs Improvement
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.lcp).needsImprovement}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        Poor (&gt; 4.0s)
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.lcp).poor}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">First Input Delay (FID)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Good', value: getSafeMetrics(experienceData?.coreWebVitals?.fid).good, fill: '#10b981' },
                            { name: 'Needs Improvement', value: getSafeMetrics(experienceData?.coreWebVitals?.fid).needsImprovement, fill: '#f59e0b' },
                            { name: 'Poor', value: getSafeMetrics(experienceData?.coreWebVitals?.fid).poor, fill: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        Good (&lt; 100ms)
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.fid).good}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        Needs Improvement
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.fid).needsImprovement}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        Poor (&gt; 300ms)
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.fid).poor}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cumulative Layout Shift (CLS)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Good', value: getSafeMetrics(experienceData?.coreWebVitals?.cls).good, fill: '#10b981' },
                            { name: 'Needs Improvement', value: getSafeMetrics(experienceData?.coreWebVitals?.cls).needsImprovement, fill: '#f59e0b' },
                            { name: 'Poor', value: getSafeMetrics(experienceData?.coreWebVitals?.cls).poor, fill: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        Good (&lt; 0.1)
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.cls).good}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        Needs Improvement
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.cls).needsImprovement}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        Poor (&gt; 0.25)
                      </span>
                      <span>{getSafeMetrics(experienceData?.coreWebVitals?.cls).poor}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals Data Not Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Core Web Vitals Data</h3>
                  <p className="text-gray-600 mb-4">
                    Core Web Vitals data is not available for this property from Google Search Console.
                    This typically happens when:
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1 max-w-md mx-auto">
                    <li>• Your site doesn't have enough traffic for Core Web Vitals reporting</li>
                    <li>• The property was recently added to Search Console</li>
                    <li>• Real User Monitoring data hasn't been collected yet</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">
                    Check back in a few days after your site receives more traffic.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === 'https' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>HTTPS Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formatPercentage(experienceData?.https?.securityScore || 100)}
                  </div>
                  <Badge 
                    variant="default" 
                    className={getSecurityStatus(experienceData?.https?.securityScore || 100).bg}
                  >
                    {getSecurityStatus(experienceData?.https?.securityScore || 100).label}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure (HTTPS)</span>
                    </div>
                    <span className="font-semibold">{formatNumber(experienceData?.https?.securePages || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-red-600" />
                      <span>Insecure (HTTP)</span>
                    </div>
                    <span className="font-semibold">{formatNumber(experienceData?.https?.insecurePages || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded">
                  <h4 className="font-medium text-blue-900 mb-2">✓ Enable HTTPS</h4>
                  <p className="text-sm text-blue-700">
                    Ensure all pages are served over HTTPS to protect user data and improve SEO rankings.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠ Update Mixed Content</h4>
                  <p className="text-sm text-yellow-700">
                    Check for and fix any mixed content issues where HTTPS pages load HTTP resources.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded">
                  <h4 className="font-medium text-green-900 mb-2">✓ SSL Certificate</h4>
                  <p className="text-sm text-green-700">
                    Your SSL certificate is valid and properly configured.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'mobile' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-green-50 rounded">
              <Smartphone className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {experienceData && experienceData.mobileUsability && experienceData.mobileUsability.mobileScore
                  ? formatPercentage(experienceData.mobileUsability.mobileScore)
                  : 'No Data'
                }
              </div>
              <div className="text-sm text-gray-600">Mobile-Friendly</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded">
              <Monitor className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {experienceData && experienceData.mobileUsability && experienceData.mobileUsability.responsiveScore
                  ? formatPercentage(experienceData.mobileUsability.responsiveScore)
                  : 'No Data'
                }
              </div>
              <div className="text-sm text-gray-600">Responsive</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {experienceData && experienceData.mobileUsability && experienceData.mobileUsability.loadTime
                  ? `${experienceData.mobileUsability.loadTime.toFixed(1)}s`
                  : 'No Data'
                }
              </div>
              <div className="text-sm text-gray-600">Load Time</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded">
              <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {experienceData && experienceData.mobileUsability && experienceData.mobileUsability.viewportScore
                  ? formatPercentage(experienceData.mobileUsability.viewportScore)
                  : 'No Data'
                }
              </div>
              <div className="text-sm text-gray-600">Viewport</div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="font-medium mb-4">Mobile Usability Issues</h4>
            <div className="space-y-3">
              {experienceData?.mobileUsability?.issues?.length ? (
                experienceData.mobileUsability.issues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{issue.type}</div>
                      <div className="text-sm text-gray-500">{issue.count} pages affected</div>
                      {issue.description && (
                        <div className="text-xs text-gray-400 mt-1">{issue.description}</div>
                      )}
                    </div>
                    <Badge variant={
                      issue.severity === 'critical' ? 'destructive' : 
                      issue.severity === 'warning' ? 'secondary' : 'default'
                    }>
                      {issue.severity === 'critical' ? 'Critical' : 
                       issue.severity === 'warning' ? 'Warning' : 'Good'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Mobile Usability Issues Found</h3>
                  <p className="text-gray-600">
                    {experienceData?.mobileUsability 
                      ? "Great! Your site appears to be mobile-friendly according to Google Search Console."
                      : "Mobile usability data is not available yet from Google Search Console."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Debug Info */}
      {experienceData?.metadata && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Response Time: {experienceData.metadata.responseTime}ms</div>
              <div>Auth Method: {experienceData.metadata.authMethod}</div>
              <div>Date Range: {experienceData.metadata.dateRange.startDate} to {experienceData.metadata.dateRange.endDate}</div>
              <div>Last Updated: {new Date(experienceData.metadata.timestamp).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NEW: Enhancements Tab - Real Rich Results Test API Data */}
      {activeTab === 'enhancements' && (
        <div className="space-y-6">
          {experienceData?.enhancements ? (
            <>
              {/* Real Rich Results Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      Rich Results Test (Real API)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {experienceData.enhancements.richResults && experienceData.enhancements.richResults.length > 0 ? (
                        <div className="space-y-3">
                          {experienceData.enhancements.richResults.map((result, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${result.valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="font-medium">{result.type}</span>
                              </div>
                              <Badge variant={result.valid ? 'default' : 'destructive'}>
                                {result.valid ? 'Valid' : 'Invalid'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rich Results Found</h3>
                          <p className="text-gray-600">No structured data or rich results detected by Google's Rich Results Test API.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Structured Data Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {experienceData.enhancements.structuredData && experienceData.enhancements.structuredData.length > 0 ? (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600 mb-3">
                            Found structured data on {experienceData.enhancements.structuredData.length} pages
                          </div>
                          {experienceData.enhancements.structuredData.slice(0, 5).map((page, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="font-medium text-sm text-gray-900 mb-2 truncate">{page.url}</div>
                              {page.issues && page.issues.length > 0 ? (
                                <div className="space-y-1">
                                  {page.issues.slice(0, 3).map((issue, issueIndex) => (
                                    <div key={issueIndex} className="flex items-start gap-2 text-xs">
                                      <Badge 
                                        variant={issue.severity === 'error' ? 'destructive' : issue.severity === 'warning' ? 'secondary' : 'default'}
                                        className="text-xs"
                                      >
                                        {issue.severity}
                                      </Badge>
                                      <span className="text-gray-600">{issue.message}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-green-600">✓ No issues found</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Wifi className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Structured Data</h3>
                          <p className="text-gray-600">No structured data found on tested pages.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhancement Summary Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Enhancement Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {experienceData.enhancements.richResults?.filter(r => r.valid).length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Valid Rich Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {experienceData.enhancements.richResults?.filter(r => !r.valid).length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Invalid Rich Results</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {experienceData.enhancements.structuredData?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Pages with Structured Data</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real API Badge */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Real Google Rich Results Test API</h3>
                    <p className="text-gray-600 text-sm">
                      This data is fetched directly from Google's Rich Results Test API, providing 100% authentic 
                      structured data validation results - the same data you'd see when testing URLs manually 
                      in Google's Rich Results Test tool.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Enhancements Data Not Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Enhancement Data</h3>
                  <p className="text-gray-600 mb-4">
                    Enhancements data is not available for this property. This can happen when:
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1 max-w-md mx-auto">
                    <li>• The Rich Results Test API didn't find structured data</li>
                    <li>• The property has no eligible pages for testing</li>
                    <li>• Rate limits or API quotas have been reached</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 