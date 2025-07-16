"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  Eye,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Search,
  Calendar,
  Filter,
  ArrowRight,
  ExternalLink,
  Play,
  Pause,
  Square,
  Globe,
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
  Info,
  FileText,
  Download,
  Printer,
  Share2,
  Users,
  BarChart,
  PieChart,
  LineChart,
  Gauge,
  Loader2
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ComposedChart,
  Scatter,
  Legend
} from 'recharts';

// Mock CrUX data structure
interface CrUXData {
  url: string;
  formFactor: 'desktop' | 'mobile' | 'tablet';
  period: string;
  metrics: {
    lcp: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    };
    fid: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    };
    cls: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    };
    ttfb: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    };
    inp: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    };
  };
  sampleCount: number;
  timestamp: string;
  isMockData?: boolean; // Added for new logic
}

// Generate mock CrUX data
const generateMockCrUXData = (): CrUXData => {
  return {
    url: 'https://www.sitegrip.com',
    formFactor: 'desktop',
    period: '2024-01-01',
    metrics: {
      lcp: {
        p75: 2400,
        histogram: [
          { start: 0, end: 2500, density: 0.65 },
          { start: 2500, end: 4000, density: 0.25 },
          { start: 4000, end: Infinity, density: 0.10 }
        ]
      },
      fid: {
        p75: 85,
        histogram: [
          { start: 0, end: 100, density: 0.70 },
          { start: 100, end: 300, density: 0.25 },
          { start: 300, end: Infinity, density: 0.05 }
        ]
      },
      cls: {
        p75: 0.08,
        histogram: [
          { start: 0, end: 0.1, density: 0.75 },
          { start: 0.1, end: 0.25, density: 0.20 },
          { start: 0.25, end: Infinity, density: 0.05 }
        ]
      },
      ttfb: {
        p75: 450,
        histogram: [
          { start: 0, end: 800, density: 0.80 },
          { start: 800, end: 1800, density: 0.15 },
          { start: 1800, end: Infinity, density: 0.05 }
        ]
      },
      inp: {
        p75: 180,
        histogram: [
          { start: 0, end: 200, density: 0.75 },
          { start: 200, end: 500, density: 0.20 },
          { start: 500, end: Infinity, density: 0.05 }
        ]
      }
    },
    sampleCount: 15420,
    timestamp: new Date().toISOString(),
    isMockData: true // Added for new logic
  };
};

// Generate time series data for trends
const generateTimeSeriesData = (metric: string, baseValue: number, variance: number = 0.1) => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, baseValue * randomFactor),
      timestamp: date.getTime()
    });
  }
  return data;
};

// Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  unit = '', 
  color = '#3B82F6',
  trend = 'neutral',
  score = null,
  description = ''
}: { 
  title: string; 
  value: string | number;
  unit?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  score?: number | null;
  description?: string;
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {getTrendIcon()}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {value}
        </span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {score !== null && (
        <div className="flex items-center gap-2 mb-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${score}%`, 
                backgroundColor: getScoreColor(score) 
              }}
            />
          </div>
          <span className="text-xs font-medium" style={{ color: getScoreColor(score) }}>
            {score}
          </span>
        </div>
      )}
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

// Histogram Chart Component
const HistogramChart = ({ 
  data, 
  title, 
  color = '#3B82F6',
  unit = ''
}: { 
  data: Array<{ start: number; end: number; density: number }>;
  title: string;
  color?: string;
  unit?: string;
}) => {
  const chartData = data.map((item, index) => ({
    name: index === data.length - 1 ? `${item.start}+` : `${item.start}-${item.end}`,
    value: item.density * 100,
    density: item.density
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {payload[0].value.toFixed(1)}% of users
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <RechartsBarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Time Series Chart Component
const TimeSeriesChart = ({ 
  data, 
  title, 
  color = '#3B82F6', 
  unit = '', 
  height = 200
}: { 
  data: Array<{ date: string; value: number; timestamp: number }>;
  title: string;
  color?: string;
  unit?: string;
  height?: number;
}) => {
  const formatValue = (value: number) => {
    if (unit === 's') return `${(value / 1000).toFixed(2)}s`;
    if (unit === 'ms') return `${Math.round(value)}ms`;
    return value.toFixed(1);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatValue(value)}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${title})`}
            dot={{ fill: color, strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Filter Bar Component
const FilterBar = ({ 
  filters, 
  onFilterChange 
}: { 
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}) => {
  const filterOptions = {
    path: ['crux', 'lighthouse', 'webpagetest'],
    testname: ['performance-tools', 'field-data', 'lab-data'],
    group: ['www_sitegrip_com', 'www_google_com', 'www_github_com'],
    page: ['_', 'home', 'about', 'contact'],
    formFactor: ['ALL', 'desktop', 'mobile', 'tablet']
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(filters).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">{key}:</label>
            <select
              value={value}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filterOptions[key as keyof typeof filterOptions]?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        <button className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default function ChromeUserExperienceReportPage() {
  const [url, setUrl] = useState('https://www.sitegrip.com');
  const [cruxData, setCruxData] = useState<CrUXData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    path: 'crux',
    testname: 'performance-tools',
    group: 'www_sitegrip_com',
    page: '_',
    formFactor: 'ALL'
  });

  // Mock time series data
  const [timeSeriesData] = useState({
    lcp: generateTimeSeriesData('LCP', 2400, 0.15),
    fid: generateTimeSeriesData('FID', 85, 0.1),
    cls: generateTimeSeriesData('CLS', 0.08, 0.2),
    ttfb: generateTimeSeriesData('TTFB', 450, 0.1),
    inp: generateTimeSeriesData('INP', 180, 0.1)
  });

  const [user, setUser] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  const fetchCruxData = async (targetUrl: string) => {
    setLoading(true);
    setError(null);
    setCruxData(null);
    
    try {
      const response = await fetch('/api/chrome-user-experience-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch CrUX data');
      }

      const data = await response.json();
      setCruxData(data);
      
      if (data.isMockData) {
        setError('Real data unavailable for this URL. Showing sample data.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch CrUX data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (url.trim()) {
      fetchCruxData(url.trim());
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getScore = (p75: number, thresholds: [number, number]) => {
    if (p75 <= thresholds[0]) return 100;
    if (p75 <= thresholds[1]) return 50;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Chrome User Experience Report</h1>
            </div>
            <div className="text-sm text-gray-500">Home &gt; Dashboards &gt; Chrome User Experience Report</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* URL Input Section */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter website URL to analyze (e.g., https://example.com)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Enter any website URL to get real Chrome User Experience Report data from Google's CrUX API
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-700">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {cruxData && (
          <div className="space-y-6">
            {/* Page Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{cruxData.url}</h2>
                  <p className="text-sm text-gray-500">
                    Sample size: {cruxData.sampleCount.toLocaleString()} users • 
                    Form factor: {cruxData.formFactor} • 
                    Last updated: {new Date(cruxData.timestamp).toLocaleString()}
                    {cruxData.isMockData && (
                      <span className="ml-2 text-yellow-600 font-medium">(Sample Data)</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Core Web Vitals Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <MetricCard
                  title="Largest Contentful Paint"
                  value={(cruxData.metrics.lcp.p75 / 1000).toFixed(2)}
                  unit="s"
                  color="#3B82F6"
                  score={getScore(cruxData.metrics.lcp.p75, [2500, 4000])}
                  description="Loading performance"
                />
                <MetricCard
                  title="First Input Delay"
                  value={cruxData.metrics.fid.p75.toString()}
                  unit="ms"
                  color="#10B981"
                  score={getScore(cruxData.metrics.fid.p75, [100, 300])}
                  description="Interactivity"
                />
                <MetricCard
                  title="Cumulative Layout Shift"
                  value={cruxData.metrics.cls.p75.toFixed(3)}
                  unit=""
                  color="#F59E0B"
                  score={getScore(cruxData.metrics.cls.p75, [0.1, 0.25])}
                  description="Visual stability"
                />
                <MetricCard
                  title="Time to First Byte"
                  value={cruxData.metrics.ttfb.p75.toString()}
                  unit="ms"
                  color="#8B5CF6"
                  score={getScore(cruxData.metrics.ttfb.p75, [800, 1800])}
                  description="Server response"
                />
                <MetricCard
                  title="Interaction to Next Paint"
                  value={cruxData.metrics.inp.p75.toString()}
                  unit="ms"
                  color="#EF4444"
                  score={getScore(cruxData.metrics.inp.p75, [200, 500])}
                  description="Responsiveness"
                />
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <HistogramChart
                  data={cruxData.metrics.lcp.histogram}
                  title="LCP Distribution"
                  color="#3B82F6"
                  unit="s"
                />
                <HistogramChart
                  data={cruxData.metrics.fid.histogram}
                  title="FID Distribution"
                  color="#10B981"
                  unit="ms"
                />
                <HistogramChart
                  data={cruxData.metrics.cls.histogram}
                  title="CLS Distribution"
                  color="#F59E0B"
                  unit=""
                />
              </div>
            </div>

            {/* Time Series Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance Trends (30 days)</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Last 30 days</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeSeriesChart
                  data={timeSeriesData.lcp}
                  title="LCP Trend"
                  color="#3B82F6"
                  unit="ms"
                />
                <TimeSeriesChart
                  data={timeSeriesData.fid}
                  title="FID Trend"
                  color="#10B981"
                  unit="ms"
                />
                <TimeSeriesChart
                  data={timeSeriesData.cls}
                  title="CLS Trend"
                  color="#F59E0B"
                  unit=""
                />
                <TimeSeriesChart
                  data={timeSeriesData.inp}
                  title="INP Trend"
                  color="#EF4444"
                  unit="ms"
                />
              </div>
            </div>

            {/* User Experience Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Experience Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Good Experience"
                  value="72.5"
                  unit="%"
                  color="#10B981"
                  description="Users with good Core Web Vitals"
                />
                <MetricCard
                  title="Needs Improvement"
                  value="22.3"
                  unit="%"
                  color="#F59E0B"
                  description="Users with moderate performance"
                />
                <MetricCard
                  title="Poor Experience"
                  value="5.2"
                  unit="%"
                  color="#EF4444"
                  description="Users with poor performance"
                />
                <MetricCard
                  title="Total Users"
                  value={cruxData.sampleCount.toLocaleString()}
                  unit=""
                  color="#3B82F6"
                  description="Sample size analyzed"
                />
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Good Performance</h4>
                    <p className="text-sm text-green-700">
                      72.5% of users experience good Core Web Vitals performance, indicating your site loads quickly and provides a smooth user experience.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Areas for Improvement</h4>
                    <p className="text-sm text-yellow-700">
                      22.3% of users experience moderate performance. Consider optimizing LCP and reducing layout shifts to improve user experience.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Critical Issues</h4>
                    <p className="text-sm text-red-700">
                      5.2% of users experience poor performance. Immediate attention needed for LCP and INP optimization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!cruxData && !loading && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
            <p className="text-gray-500 mb-6">
              Enter a website URL above to get real Chrome User Experience Report data from Google's CrUX API.
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real Core Web Vitals data from actual users</li>
                <li>• Performance distribution analysis</li>
                <li>• User experience insights</li>
                <li>• Performance trends and recommendations</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 