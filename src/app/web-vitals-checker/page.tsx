"use client";

import { Fragment, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Globe, 
  Gauge, 
  Smartphone, 
  Monitor, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  FileText, 
  Download, 
  Printer, 
  Share2,
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
  Square
} from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { exportComponentToPDF } from '@/utils/exportPDF';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Helper to check if Firebase config is present
function isFirebaseConfigured() {
  if (typeof window === 'undefined') return false;
  const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return !!firebaseConfig;
}

export const dynamic = 'force-dynamic';

interface PageSpeedMetrics {
  metrics: Record<string, number | null>;
  scores: Record<string, number | null>;
  opportunities: Array<{ id: string; title: string; description: string; savingsMs: number; score: number; category: string }>;
  diagnostics: Record<string, any> | null;
  resourceSummary: Array<any>;
  passedAudits: Array<{ id: string; title: string }>;
  notApplicableAudits: Array<{ id: string; title: string }>;
  manualAudits: Array<{ id: string; title: string }>;
  fieldData: Record<string, any> | null;
  originFieldData: Record<string, any> | null;
  environment: Record<string, any>;
  warnings: string[];
  fetchTime: string;
  finalUrl: string;
  userAgent: string;
  timing: Record<string, any>;
  audits?: any;
  auditDetails?: Record<string, any[]>;
  screenshot?: string;
  screenshots?: string[];
  consoleErrors?: string[];
  loadTime?: number;
}

interface WebVitalsResult {
  mobile: PageSpeedMetrics;
  desktop: PageSpeedMetrics;
  url: string;
  additionalChecks?: {
    accessibility: any;
    seo: any;
    security: any;
  };
  analysisTimestamp?: string;
}

// Metric metadata for labels, units, and descriptions
const METRIC_META: Record<string, { label: string; unit?: string; description: string; color?: string }> = {
  // Core Web Vitals
  LCP: { label: 'Largest Contentful Paint', unit: 's', description: 'Measures loading performance. Good <2.5s.', color: '#3B82F6' },
  FCP: { label: 'First Contentful Paint', unit: 's', description: 'Time to first content. Good <1.8s.', color: '#10B981' },
  CLS: { label: 'Cumulative Layout Shift', unit: '', description: 'Visual stability. Good <0.1.', color: '#F59E0B' },
  TTI: { label: 'Time to Interactive', unit: 's', description: 'Time to fully interactive. Good <5s.', color: '#8B5CF6' },
  TBT: { label: 'Total Blocking Time', unit: 'ms', description: 'Time blocked by scripts. Good <200ms.', color: '#EF4444' },
  SI: { label: 'Speed Index', unit: 's', description: 'Visual load speed. Good <4.3s.', color: '#06B6D4' },
  TTFB: { label: 'Time to First Byte', unit: 'ms', description: 'Server response time. Good <800ms.', color: '#84CC16' },
  FID: { label: 'First Input Delay', unit: 'ms', description: 'Input responsiveness. Good <100ms.', color: '#F97316' },
  FMP: { label: 'First Meaningful Paint', unit: 's', description: 'First meaningful content. Lower is better.', color: '#EC4899' },
  
  // Additional Performance Metrics
  FCI: { label: 'First CPU Idle', unit: 's', description: 'Time when page becomes minimally interactive.', color: '#6366F1' },
  EIL: { label: 'Estimated Input Latency', unit: 'ms', description: 'Estimated time for next input to be processed.', color: '#14B8A6' },
  MPU: { label: 'Max Potential FID', unit: 'ms', description: 'Worst-case First Input Delay.', color: '#F43F5E' },
  
  // Resource Metrics
  totalResources: { label: 'Total Resources', unit: '', description: 'Number of HTTP requests made.', color: '#0EA5E9' },
  totalSize: { label: 'Total Size', unit: 'bytes', description: 'Total transfer size of all resources.', color: '#A855F7' },
  domSize: { label: 'DOM Size', unit: 'nodes', description: 'Number of DOM nodes.', color: '#EAB308' },
  criticalRequestChains: { label: 'Critical Chains', unit: '', description: 'Number of critical request chains.', color: '#22C55E' },
};

// Mock time series data for demonstration
const generateTimeSeriesData = (metric: string, baseValue: number, variance: number = 0.1) => {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    const value = Math.max(0, baseValue * randomFactor);
    
    // Generate comparison data (1 week earlier)
    const weekAgoValue = Math.max(0, baseValue * randomFactor * (0.9 + Math.random() * 0.2));
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: value,
      weekAgo: weekAgoValue,
      timestamp: date.getTime()
    });
  }
  return data;
};

// Enhanced Time Series Chart Component with Recharts
const TimeSeriesChart = ({ 
  data, 
  title, 
  color = '#3B82F6', 
  unit = '', 
  height = 200,
  showLegend = true,
  showArea = true
}: { 
  data: Array<{ date: string; value: number; weekAgo?: number; timestamp: number }>;
  title: string;
  color?: string;
  unit?: string;
  height?: number;
  showLegend?: boolean;
  showArea?: boolean;
}) => {
  if (!data || data.length === 0) return null;

  const formatValue = (value: number) => {
    if (unit === 's') return `${value.toFixed(2)}s`;
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === ' MB') return `${value.toFixed(2)}MB`;
    if (unit === ' KB') return `${value.toFixed(2)}KB`;
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {showLegend && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span>Last 24h</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span>1 week ago</span>
            </div>
          </div>
        )}
      </div>
      
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
          {showArea ? (
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          )}
          {data[0]?.weekAgo !== undefined && (
            <Line
              type="monotone"
              dataKey="weekAgo"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Summary stats */}
      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span>Min: {formatValue(Math.min(...data.map(d => d.value)))}</span>
        <span>Max: {formatValue(Math.max(...data.map(d => d.value)))}</span>
        <span>Last: {formatValue(data[data.length - 1]?.value || 0)}</span>
      </div>
    </div>
  );
};

// Enhanced Metric Card
const MetricCard = ({ 
  label, 
  value, 
  unit = '', 
  color = '#3B82F6',
  trend = 'neutral',
  size = 'medium'
}: { 
  label: string; 
  value: string | number | null | undefined;
  unit?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  size?: 'small' | 'medium' | 'large';
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default: return null;
    }
  };

  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${sizeClasses[size]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        {getTrendIcon()}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">
          {value === null || value === undefined ? 'N/A' : value}
        </span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: '60%', 
            backgroundColor: color 
          }}
        />
      </div>
    </div>
  );
};

// Performance Score Card
const PerformanceScoreCard = ({ 
  title, 
  score, 
  color = '#3B82F6',
  description = ''
}: { 
  title: string; 
  score: number | null; 
  color?: string;
  description?: string;
}) => {
  if (score === null) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const scoreColor = getScoreColor(score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <h3 className="text-sm font-medium text-gray-600 mb-3">{title}</h3>
      <div className="relative inline-flex items-center justify-center mb-3">
        <svg width="100" height="100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={scoreColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color: scoreColor }}>
            {score.toFixed(0)}
          </span>
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
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
    path: ['desktop', 'mobile'],
    testname: ['firstView', 'repeatView'],
    browser: ['chrome', 'firefox', 'safari'],
    connectivity: ['4g', '3g', '2g'],
    function: ['median', 'mean', 'p95']
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

export default function WebVitalsCheckerPage() {
  const [url, setUrl] = useState('https://www.sitegrip.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebVitalsResult | null>(null);
  const [view, setView] = useState<'mobile' | 'desktop'>('mobile');
  const [filters, setFilters] = useState({
    path: 'desktop',
    testname: 'firstView',
    browser: 'chrome',
    connectivity: '4g',
    function: 'median'
  });

  // Mock data for demonstration
  const [mockData, setMockData] = useState({
    lcp: generateTimeSeriesData('LCP', 2.1, 0.15),
    fcp: generateTimeSeriesData('FCP', 1.2, 0.1),
    cls: generateTimeSeriesData('CLS', 0.05, 0.2),
    tbt: generateTimeSeriesData('TBT', 150, 0.25)
  });

  const [user, setUser] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    let unsub: any;
    (async () => {
      const firebaseModule = await import('@/lib/firebase');
      const isFirestoreAvailable = firebaseModule.isFirestoreAvailable;
      const db = firebaseModule.getFirestoreInstance ? firebaseModule.getFirestoreInstance() : null;
      const auth = firebaseModule.getAuthInstance ? firebaseModule.getAuthInstance() : null;
      if (typeof isFirestoreAvailable !== 'function' || !isFirestoreAvailable() || !db || !auth) return;
      const { onAuthStateChanged } = await import('firebase/auth');
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        if (u) loadReports(u.uid);
        else setSavedReports([]);
      });
    })();
    return () => unsub && unsub();
  }, []);

  const loadReports = async (uid: string) => {
    if (!isFirebaseConfigured()) return;
    const firebaseModule = await import('@/lib/firebase');
    const isFirestoreAvailable = firebaseModule.isFirestoreAvailable;
    const db = firebaseModule.getFirestoreInstance ? firebaseModule.getFirestoreInstance() : null;
    if (typeof isFirestoreAvailable !== 'function' || !isFirestoreAvailable() || !db) return;
    const firestoreDb = db as import('firebase/firestore').Firestore;
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const q = query(collection(firestoreDb, 'webVitalsReports'), where('uid', '==', uid), orderBy('created', 'desc'), limit(10));
    const snap = await getDocs(q);
    setSavedReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (!result || !url || !isFirebaseConfigured()) return;
    const save = async () => {
      const firebaseModule = await import('@/lib/firebase');
      const isFirestoreAvailable = firebaseModule.isFirestoreAvailable;
      const db = firebaseModule.getFirestoreInstance ? firebaseModule.getFirestoreInstance() : null;
      if (typeof isFirestoreAvailable !== 'function' || !isFirestoreAvailable() || !db) return;
      const firestoreDb = db as import('firebase/firestore').Firestore;
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(firestoreDb, 'webVitalsReports'), {
        uid: user?.uid || null,
        url,
        result,
        created: serverTimestamp(),
      });
      if (user) loadReports(user.uid);
    };
    save();
  }, [result]);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Page Metrics</h1>
            </div>
            <div className="text-sm text-gray-500">Home &gt; Dashboards &gt; Page metrics</div>
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
                    placeholder="Enter URL to analyze..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleCheck}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {/* Results Section */}
        {result && result[view] && !loading && (
          <div className="space-y-6">
            {/* Page Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{result.url}</h2>
                  <p className="text-sm text-gray-500">
                    Analysis completed on {new Date(result.analysisTimestamp || Date.now()).toLocaleString()}
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

            {/* Performance Scores */}
            {result[view]?.scores && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Scores</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result[view]?.scores).map(([label, score]) => (
                    <PerformanceScoreCard
                      key={label}
                      title={label.charAt(0).toUpperCase() + label.slice(1)}
                      score={score}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Google Web Vitals Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Google Web Vitals Trends</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Last 7 days</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeSeriesChart
                  data={mockData.lcp}
                  title="First Contentful Paint (FCP)"
                  color="#10B981"
                  unit="s"
                />
                <TimeSeriesChart
                  data={mockData.fcp}
                  title="Largest Contentful Paint (LCP)"
                  color="#3B82F6"
                  unit="s"
                />
                <TimeSeriesChart
                  data={mockData.tbt}
                  title="Total Blocking Time (TBT)"
                  color="#F59E0B"
                  unit="ms"
                />
                <TimeSeriesChart
                  data={mockData.cls}
                  title="Cumulative Layout Shift (CLS)"
                  color="#EF4444"
                  unit=""
                />
              </div>
            </div>

            {/* Key Metrics */}
            {result[view]?.metrics && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(result[view]?.metrics)
                    .filter(([label]) => ['lcp', 'fcp', 'cls', 'tti', 'tbt', 'fid', 'si', 'ttfb'].includes(label))
                    .map(([label, value]) => {
                      let displayValue: string | number = 'N/A';
                      let unit = '';
                      let color = METRIC_META[label.toUpperCase()]?.color || '#3B82F6';
                      
                      if (typeof value === 'number' && value > 0) {
                        if (["lcp", "fcp", "tti", "si"].includes(label)) {
                          displayValue = (value / 1000).toFixed(2);
                          unit = 's';
                        } else if (["tbt", "fid", "ttfb"].includes(label)) {
                          displayValue = Math.round(value);
                          unit = 'ms';
                        } else if (label === "cls") {
                          displayValue = value.toFixed(3);
                        } else {
                          displayValue = value.toString();
                        }
                      }
                      
                      return (
                        <MetricCard
                          key={label}
                          label={METRIC_META[label.toUpperCase()]?.label || label.toUpperCase()}
                          value={displayValue}
                          unit={unit}
                          color={color}
                        />
                      );
                    })}
                </div>
              </div>
            )}

            {/* Resource Metrics */}
            {result[view]?.metrics && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(result[view]?.metrics)
                    .filter(([label]) => ['totalResources', 'totalSize', 'domSize'].includes(label))
                    .map(([label, value]) => {
                      let displayValue: string | number = 'N/A';
                      let unit = '';
                      
                      if (typeof value === 'number' && value > 0) {
                        if (label === "totalSize") {
                          const mb = value / (1024 * 1024);
                          displayValue = mb > 1 ? mb.toFixed(2) : (value / 1024).toFixed(2);
                          unit = mb > 1 ? ' MB' : ' KB';
                        } else {
                          displayValue = value.toString();
                        }
                      }
                      
                      return (
                        <MetricCard
                          key={label}
                          label={METRIC_META[label]?.label || label}
                          value={displayValue}
                          unit={unit}
                          color={METRIC_META[label]?.color || '#3B82F6'}
                        />
                      );
                    })}
                </div>
              </div>
            )}

            {/* Page Size Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Size Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TimeSeriesChart
                  data={generateTimeSeriesData('Total Size', 2.5, 0.1)}
                  title="Total Page Size"
                  color="#8B5CF6"
                  unit=" MB"
                />
                <TimeSeriesChart
                  data={generateTimeSeriesData('Requests', 96, 0.05)}
                  title="Total Requests"
                  color="#06B6D4"
                  unit=""
                />
              </div>
            </div>

            {/* CPU Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU Performance [Chrome only]</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Long Tasks"
                  value="5"
                  color="#EF4444"
                  size="large"
                />
                <MetricCard
                  label="Long Tasks Before FCP"
                  value="1"
                  color="#F59E0B"
                  size="large"
                />
                <MetricCard
                  label="Total Blocking Time"
                  value="135"
                  unit=" ms"
                  color="#10B981"
                  size="large"
                />
                <MetricCard
                  label="Longest Long Task"
                  value="376"
                  unit=" ms"
                  color="#EF4444"
                  size="large"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 