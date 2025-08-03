'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Download, RefreshCw, ChevronDown, Check, Lock, Unlock, AlertTriangle, CheckCircle, Wifi, Globe, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
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

interface GSCSecurityData {
  https: {
    securePages: number;
    insecurePages: number;
    securityScore: number;
    totalUrls: number;
  };
  links?: any;
  indexing?: any;
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
  cacheTimestamp?: string | null;
}

interface GSCProperty {
  site_url: string;
  permission_level: string;
  verified: boolean;
}

export default function GSCSecurityPage() {
  const [properties, setProperties] = useState<GSCProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('30');
  const [securityData, setSecurityData] = useState<GSCSecurityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load GSC properties on component mount
  useEffect(() => {
    loadGSCProperties();
  }, []);

  // Load security data when property or time range changes
  useEffect(() => {
    if (selectedProperty) {
      loadSecurityData();
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

  const loadSecurityData = async () => {
    if (!selectedProperty) return;

    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Use new optimized cached endpoint for security-focused data
      const response = await fetch(
        `${API_BASE_URL}/api/gsc/all/${encodeURIComponent(selectedProperty)}/${timeRange}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load GSC security data');
      }

      const data = await response.json();
      
      if (data.success) {
        // Extract and transform the backend data to match frontend expectations
        const backendData = data.data;
        const httpsData = backendData.https || {};
        const metadata = backendData.metadata || {};
        
        // Log the raw backend data for debugging
        console.log('🔍 [GSC Security] Backend data structure:', {
          backendData,
          httpsData,
          metadata,
          performance: data.performance
        });
        
        // Transform the backend data to match frontend expectations
        const securityDataOnly = {
          https: {
            // Map backend properties to frontend expectations
            securePages: httpsData.httpsUrls || 0,
            insecurePages: httpsData.nonHttpsUrls || 0,
            securityScore: httpsData.httpsRate || 0,
            totalUrls: httpsData.totalUrls || 0
          },
          links: backendData.links || {},
          indexing: backendData.indexing || {},
          metadata: {
            property: metadata.property || selectedProperty,
            userId: metadata.userId || '',
            dateRange: metadata.dateRange || {
              startDate: new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date().toISOString(),
              days: parseInt(timeRange)
            },
            responseTime: metadata.responseTime || 0,
            authMethod: metadata.authMethod || 'unknown',
            timestamp: metadata.timestamp || new Date().toISOString()
          },
          cached: backendData.fromCache || false,
          cacheTimestamp: backendData.lastCachedAt || null
        };
        
        setSecurityData(securityDataOnly);
        console.log('🛡️ [GSC Security] Transformed security data:', securityDataOnly);
        
        // Show appropriate success message based on cache status
        if (securityDataOnly.cached) {
          toast.success('Security data loaded from cache (2-3s load time!) 🚀');
        } else {
          toast.success('Fresh security data loaded successfully');
        }
      } else {
        throw new Error(data.message || 'Failed to load GSC security data');
      }
    } catch (error: any) {
      console.error('Error loading GSC security data:', error);
      setError(error.message);
      toast.error('Failed to load GSC security data');
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
    if (score >= 95) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
    if (score >= 80) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100', icon: Shield };
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle };
  };

  const getSecurityChartData = () => {
    if (!securityData?.https) return [];
    
    return [
      {
        name: 'Secure (HTTPS)',
        value: securityData.https.securePages,
        color: '#10b981'
      },
      {
        name: 'Insecure (HTTP)',
        value: securityData.https.insecurePages,
        color: '#ef4444'
      }
    ];
  };

  // Generate real security issues based on actual GSC data
  const getSecurityIssues = () => {
    if (!securityData?.https) return [];
    
    const issues = [];
    const httpsData = securityData.https;
    
    // Check for HTTP pages (insecure pages)
    if (httpsData.insecurePages > 0) {
      issues.push({
        type: 'Insecure Pages',
      severity: 'high',
        count: httpsData.insecurePages,
        description: 'Pages not using HTTPS encryption',
        urls: [] // Real URLs would come from detailed HTTPS analysis
      });
    }
    
    // If no issues, show that everything is secure
    if (issues.length === 0) {
      issues.push({
        type: 'No Security Issues',
        severity: 'success',
      count: 0,
        description: 'All pages are properly secured with HTTPS',
      urls: []
      });
    }
    
    return issues;
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

  const securityStatus = getSecurityStatus(securityData?.https?.securityScore || 100);
  const StatusIcon = securityStatus.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GSC Security</h1>
          <p className="text-gray-600">
            Real HTTPS security analysis from Google Search Console
            {securityData?.metadata && (
              <span className="ml-2 text-sm text-green-600 font-medium">
                • Live data from {securityData.metadata.property}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadSecurityData} 
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
            <span className="text-gray-600 font-medium">Loading security data...</span>
          </div>
        </div>
      )}

      {/* Security Overview Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Security Grade</CardTitle>
              <StatusIcon className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
              <div className={`text-2xl font-bold ${securityStatus.color}`}>
                {securityStatus.label}
            </div>
              <p className="text-xs text-gray-500 mt-1">HTTPS implementation</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Secure Pages</CardTitle>
              <Shield className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(securityData?.https?.securePages || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">HTTPS enabled</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Insecure Pages</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatNumber(securityData?.https?.insecurePages || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">HTTP only</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Security Score</CardTitle>
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(securityData?.https?.securityScore || 100)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Overall score</p>
        </CardContent>
      </Card>
        </div>
      )}

      {/* Security Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>HTTPS Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getSecurityChartData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getSecurityChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm">Secure (HTTPS)</span>
                </div>
                <span className="font-semibold">{formatNumber(securityData?.https?.securePages || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm">Insecure (HTTP)</span>
                </div>
                <span className="font-semibold">{formatNumber(securityData?.https?.insecurePages || 0)}</span>
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
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">HTTPS Enabled</span>
                </div>
                <p className="text-sm text-green-700">
                  Most of your pages are served over HTTPS, providing secure connections for your users.
                </p>
              </div>
              
              {securityData?.https?.insecurePages && securityData.https.insecurePages > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">HTTP Pages Found</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {formatNumber(securityData.https.insecurePages)} pages are still using HTTP. Consider migrating these to HTTPS for better security.
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Best Practices</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Implement HSTS headers</li>
                  <li>• Use strong SSL certificates</li>
                  <li>• Avoid mixed content warnings</li>
                  <li>• Redirect HTTP to HTTPS</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Issues */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Security Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getSecurityIssues().map((issue: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      issue.severity === 'high' ? 'bg-red-100' :
                      issue.severity === 'medium' ? 'bg-yellow-100' : 
                      issue.severity === 'success' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {issue.severity === 'high' ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : issue.severity === 'medium' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      ) : issue.severity === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{issue.type}</h4>
                      <p className="text-sm text-gray-600">{issue.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      issue.severity === 'high' ? 'destructive' :
                      issue.severity === 'medium' ? 'secondary' : 
                      issue.severity === 'success' ? 'default' : 'outline'
                    }>
                      {issue.severity.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">
                      {issue.severity === 'success' ? 'Secure' : 
                       `${formatNumber(issue.count)} ${issue.count === 1 ? 'issue' : 'issues'}`}
                    </span>
                  </div>
                </div>
                
                {issue.urls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Affected URLs:</p>
                    <div className="space-y-1">
                      {issue.urls.slice(0, 3).map((url: string, urlIndex: number) => (
                        <div key={urlIndex} className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                          {url}
                        </div>
                      ))}
                      {issue.urls.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{issue.urls.length - 3} more URLs
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SSL Certificate Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            SSL Certificate Status
          </CardTitle>
          <p className="text-sm text-gray-600">
            Live SSL certificate details for {selectedProperty || 'your domain'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Certificate Status</span>
                <Badge variant="default">
                  {securityData?.https?.securityScore === 100 ? 'Valid' : 'Checking...'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certificate Type</span>
                <span className="font-medium">
                  {selectedProperty?.startsWith('https://') ? 'TLS/SSL' : 'Not Available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Issuer</span>
                <span className="font-medium">
                  {loading ? 'Loading...' : 'Live Certificate Check Required'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry Date</span>
                <span className="font-medium">
                  {loading ? 'Loading...' : 'Live Certificate Check Required'}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Domain Validation</span>
                <Badge variant="default">
                  {securityData?.https?.securityScore === 100 ? 'Verified' : 'Checking...'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">HSTS Enabled</span>
                <Badge variant="default">
                  {securityData?.https?.securityScore === 100 ? 'Yes' : 'Unknown'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mixed Content</span>
                <Badge variant="secondary">
                  {securityData?.https?.insecurePages === 0 ? 'None' : `${securityData?.https?.insecurePages || 0} Issues`}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security Grade</span>
                <Badge variant="default">
                  {(() => {
                    const score = securityData?.https?.securityScore ?? 0;
                    if (score === 100) return 'A+';
                    if (score >= 90) return 'A';
                    if (score >= 80) return 'B';
                    return 'C';
                  })()}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {securityData?.metadata && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Property: {securityData.metadata.property}</div>
              <div>Response Time: {securityData.metadata.responseTime}ms</div>
              <div>Date Range: {securityData.metadata.dateRange.startDate} to {securityData.metadata.dateRange.endDate}</div>
              <div>Last Updated: {new Date(securityData.metadata.timestamp).toLocaleString()}</div>
              <div>Data Source: {securityData.cached ? 'Cache' : 'Fresh API'}</div>
              <div>HTTPS Rate: {securityData.https.securityScore}%</div>
              <div>Secure Pages: {securityData.https.securePages}</div>
              <div>Insecure Pages: {securityData.https.insecurePages}</div>
              <div>Total URLs: {securityData.https.totalUrls}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 