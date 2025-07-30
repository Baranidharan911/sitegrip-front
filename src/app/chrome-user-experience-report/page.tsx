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

// Real CrUX data structure (no mock data)
interface CrUXData {
  url: string;
  formFactor: 'DESKTOP' | 'PHONE' | 'TABLET';
  period: string;
  metrics: {
    lcp: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    } | null;
    cls: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    } | null;
    ttfb: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    } | null;
    inp: {
      p75: number;
      histogram: Array<{ start: number; end: number; density: number }>;
    } | null;
  };
  sampleCount: number;
  timestamp: string;
  isMockData: boolean;
}

// Metric thresholds for Core Web Vitals
const METRIC_THRESHOLDS = {
  lcp: { good: 2500, needsImprovement: 4000, unit: 'ms', name: 'Largest Contentful Paint' },
  cls: { good: 0.1, needsImprovement: 0.25, unit: '', name: 'Cumulative Layout Shift' },
  ttfb: { good: 800, needsImprovement: 1800, unit: 'ms', name: 'Time to First Byte' },
  inp: { good: 200, needsImprovement: 500, unit: 'ms', name: 'Interaction to Next Paint' }
};

// Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  threshold, 
  icon: Icon, 
  color, 
  unit,
  histogram,
  available 
}: {
  title: string;
  value: number;
  threshold: { good: number; needsImprovement: number };
  icon: any;
  color: string;
  unit: string;
  histogram?: Array<{ start: number; end: number; density: number }>;
  available: boolean;
}) => {
  if (!available) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-100`}>
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">No data available</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Insufficient traffic data</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (value: number) => {
    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (value: number) => {
    if (value <= threshold.good) return 'Good';
    if (value <= threshold.needsImprovement) return 'Needs Improvement';
    return 'Poor';
  };

  const scoreColor = getScoreColor(value);
  const scoreLabel = getScoreLabel(value);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className={`text-sm font-medium ${scoreColor}`}>{scoreLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {value.toLocaleString()}{unit}
          </div>
          <div className="text-xs text-gray-500">
            75th percentile
          </div>
        </div>
      </div>
      
      {histogram && (
        <div className="mt-4">
          <div className="flex space-x-1 h-2 bg-gray-100 rounded">
            {histogram.map((bin, index) => (
              <div
                key={index}
                className={`rounded ${
                  bin.start <= threshold.good ? 'bg-green-500' :
                  bin.start <= threshold.needsImprovement ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${bin.density * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Good</span>
            <span>Needs Improvement</span>
            <span>Poor</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Form Factor Filter Component
const FormFactorFilter = ({ 
  value, 
  onChange 
}: { 
  value: 'DESKTOP' | 'PHONE' | 'TABLET'; 
  onChange: (value: 'DESKTOP' | 'PHONE' | 'TABLET') => void; 
}) => {
  const options = [
    { value: 'DESKTOP', label: 'Desktop', icon: Monitor },
    { value: 'PHONE', label: 'Mobile', icon: Smartphone },
    { value: 'TABLET', label: 'Tablet', icon: Globe }
  ];

  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <button
          key={option.value}
                     onClick={() => onChange(option.value as 'DESKTOP' | 'PHONE' | 'TABLET')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            value === option.value
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <option.icon className="h-4 w-4" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function ChromeUserExperienceReportPage() {
  const [url, setUrl] = useState('https://www.google.com');
  const [cruxData, setCruxData] = useState<CrUXData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formFactor, setFormFactor] = useState<'DESKTOP' | 'PHONE' | 'TABLET'>('DESKTOP');

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
        body: JSON.stringify({ 
          url: targetUrl,
          formFactor: formFactor
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch CrUX data');
      }

      const data = await response.json();
      setCruxData(data);
      
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  // Calculate overall score
  const getOverallScore = () => {
    if (!cruxData) return null;
    
    const metrics = cruxData.metrics;
    const availableMetrics = Object.entries(metrics).filter(([_, metric]) => metric !== null);
    
    if (availableMetrics.length === 0) return null;
    
    let totalScore = 0;
    availableMetrics.forEach(([key, metric]) => {
      if (metric) {
        const threshold = METRIC_THRESHOLDS[key as keyof typeof METRIC_THRESHOLDS];
        if (metric.p75 <= threshold.good) totalScore += 100;
        else if (metric.p75 <= threshold.needsImprovement) totalScore += 50;
        else totalScore += 0;
      }
    });
    
    return Math.round(totalScore / availableMetrics.length);
  };

  const overallScore = getOverallScore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chrome User Experience Report
                </h1>
                <p className="text-gray-600">
                  Real user performance data from Google's Chrome UX Report
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* URL Input and Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !url.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Type
              </label>
              <FormFactorFilter value={formFactor} onChange={setFormFactor} />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Fetching Real User Data
              </h3>
              <p className="text-blue-700">
                Getting performance data from Google's Chrome User Experience Report...
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {cruxData && !loading && (
          <div className="space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Performance Overview</h2>
                  <p className="text-gray-600 mt-1">
                    Real user data for {cruxData.url} ({cruxData.formFactor.toLowerCase()})
                  </p>
                </div>
                {overallScore !== null && (
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      overallScore >= 90 ? 'text-green-600' :
                      overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {overallScore}
                    </div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">{cruxData.period}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Data Type:</span>
                  <span className="font-medium">Real Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">{new Date(cruxData.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Source:</span>
                  <span className="font-medium">Chrome UX Report</span>
                </div>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Core Web Vitals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title={METRIC_THRESHOLDS.lcp.name}
                  value={cruxData.metrics.lcp?.p75 || 0}
                  threshold={METRIC_THRESHOLDS.lcp}
                  icon={Clock}
                  color="bg-blue-500"
                  unit={METRIC_THRESHOLDS.lcp.unit}
                  histogram={cruxData.metrics.lcp?.histogram}
                  available={cruxData.metrics.lcp !== null}
                />
                
                <MetricCard
                  title={METRIC_THRESHOLDS.inp.name}
                  value={cruxData.metrics.inp?.p75 || 0}
                  threshold={METRIC_THRESHOLDS.inp}
                  icon={Zap}
                  color="bg-green-500"
                  unit={METRIC_THRESHOLDS.inp.unit}
                  histogram={cruxData.metrics.inp?.histogram}
                  available={cruxData.metrics.inp !== null}
                />
                
                <MetricCard
                  title={METRIC_THRESHOLDS.cls.name}
                  value={cruxData.metrics.cls?.p75 || 0}
                  threshold={METRIC_THRESHOLDS.cls}
                  icon={Shield}
                  color="bg-purple-500"
                  unit={METRIC_THRESHOLDS.cls.unit}
                  histogram={cruxData.metrics.cls?.histogram}
                  available={cruxData.metrics.cls !== null}
                />
                
                <MetricCard
                  title={METRIC_THRESHOLDS.ttfb.name}
                  value={cruxData.metrics.ttfb?.p75 || 0}
                  threshold={METRIC_THRESHOLDS.ttfb}
                  icon={Activity}
                  color="bg-orange-500"
                  unit={METRIC_THRESHOLDS.ttfb.unit}
                  histogram={cruxData.metrics.ttfb?.histogram}
                  available={cruxData.metrics.ttfb !== null}
                />
              </div>
            </div>

            {/* Data Availability Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">About This Data</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This data comes from real Chrome users who visited this website. 
                    Metrics marked as "No data available" indicate insufficient traffic for that metric. 
                    Try testing with more popular websites to see complete data sets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!cruxData && !loading && !error && (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chrome User Experience Report
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Enter a website URL above to get real user performance data from Google's Chrome UX Report.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Try these popular sites:</h4>
              <div className="space-y-1 text-sm">
                {['https://www.google.com', 'https://www.youtube.com', 'https://www.wikipedia.org'].map((sampleUrl) => (
                  <button
                    key={sampleUrl}
                    onClick={() => setUrl(sampleUrl)}
                    className="block w-full text-left text-blue-600 hover:text-blue-800"
                  >
                    {sampleUrl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 