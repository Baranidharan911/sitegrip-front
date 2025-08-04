"use client";

import { useState, useEffect } from 'react';
import { 
  Loader2, 
  Globe, 
  Smartphone, 
  Monitor, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  FileText, 
  Download, 
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
  Square,
  Copy,
  BookOpen,
  Lightbulb,
  Gauge,
  Smartphone as MobileIcon,
  Monitor as DesktopIcon
} from 'lucide-react';

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
  opportunities: Array<{ 
    id: string; 
    title: string; 
    description: string; 
    savingsMs: number; 
    score: number; 
    category: string;
    details?: any;
  }>;
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
  insights?: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    savingsMs?: number;
    savingsBytes?: number;
    details?: any;
  }>;
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
};

// Performance Score Component (Circular Gauge)
const PerformanceScore = ({ 
  score, 
  title = "Performance",
  size = "large"
}: { 
  score: number | null; 
  title?: string;
  size?: "small" | "medium" | "large";
}) => {
  if (score === null) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#0F9D58';
    if (score >= 50) return '#F4B400';
    return '#DB4437';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const scoreColor = getScoreColor(score);
  const sizeClasses = {
    small: { radius: 30, strokeWidth: 4, fontSize: 'text-lg' },
    medium: { radius: 50, strokeWidth: 6, fontSize: 'text-2xl' },
    large: { radius: 80, strokeWidth: 8, fontSize: 'text-4xl' }
  };

  const { radius, strokeWidth, fontSize } = sizeClasses[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={radius * 2 + 20} height={radius * 2 + 20} className="transform -rotate-90">
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontSize}`} style={{ color: scoreColor }}>
            {score.toFixed(0)}
          </span>
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{getScoreLabel(score)}</div>
      </div>
    </div>
  );
};

// Metric Display Component
const MetricDisplay = ({ 
  label, 
  value, 
  unit = '', 
  status = 'good',
  description = ''
}: { 
  label: string; 
  value: string | number | null | undefined;
  unit?: string;
  status?: 'good' | 'needs-improvement' | 'poor';
  description?: string;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'poor': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        {getStatusIcon(status)}
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          {description && <div className="text-sm text-gray-500">{description}</div>}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-bold text-lg ${getStatusColor(status)}`}>
          {value === null || value === undefined ? 'N/A' : value}{unit}
        </div>
      </div>
    </div>
  );
};

// Insights Component
const InsightsSection = ({ insights }: { insights?: Array<any> }) => {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const toggleInsight = (id: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedInsights(newExpanded);
  };

  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">INSIGHTS</h3>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={insight.id || index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleInsight(insight.id || index.toString())}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium text-gray-900">{insight.title}</div>
                  {insight.savingsMs && (
                    <div className="text-sm text-red-600">
                      Est savings of {insight.savingsMs} ms
                    </div>
                  )}
                  {insight.savingsBytes && (
                    <div className="text-sm text-red-600">
                      Est savings of {insight.savingsBytes} KiB
                    </div>
                  )}
                </div>
              </div>
              {expandedInsights.has(insight.id || index.toString()) ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedInsights.has(insight.id || index.toString()) && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                {insight.details && (
                  <div className="bg-gray-50 rounded p-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(insight.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Filmstrip Component
const Filmstrip = ({ screenshots }: { screenshots?: string[] }) => {
  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Page Load Progression</h3>
        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          View Treemap
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {screenshots.map((screenshot, index) => (
          <div key={index} className="flex-shrink-0">
            <div className="relative">
              <img
                src={`data:image/png;base64,${screenshot}`}
                alt={`Screenshot ${index + 1}`}
                className="w-32 h-48 object-cover rounded border border-gray-300 shadow-sm"
              />
              <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                {index === 0 ? 'Initial' : `${index * 1000}ms`}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        These screenshots show the page loading progression over time
      </p>
    </div>
  );
};

export default function WebVitalsCheckerPage() {
  const [url, setUrl] = useState('https://www.sitegrip.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebVitalsResult | null>(null);
  const [view, setView] = useState<'mobile' | 'desktop'>('mobile');
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
        throw new Error(data.error || 'Failed to analyze URL');
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getMetricStatus = (metric: string, value: number) => {
    const thresholds = {
      LCP: { good: 2500, needsImprovement: 4000 },
      FCP: { good: 1800, needsImprovement: 3000 },
      CLS: { good: 0.1, needsImprovement: 0.25 },
      TTI: { good: 3800, needsImprovement: 7300 },
      TBT: { good: 200, needsImprovement: 600 },
      SI: { good: 3400, needsImprovement: 5800 },
      TTFB: { good: 800, needsImprovement: 1800 },
      FID: { good: 100, needsImprovement: 300 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const formatMetricValue = (metric: string, value: number | null) => {
    if (value === null) return 'N/A';
    
    if (['LCP', 'FCP', 'TTI', 'SI'].includes(metric)) {
      return (value / 1000).toFixed(1);
    }
    if (['TBT', 'TTFB', 'FID'].includes(metric)) {
      return Math.round(value).toString();
    }
    if (metric === 'CLS') {
      return value.toFixed(3);
    }
    return value.toString();
  };

  const getMetricUnit = (metric: string) => {
    if (['LCP', 'FCP', 'TTI', 'SI'].includes(metric)) return ' s';
    if (['TBT', 'TTFB', 'FID'].includes(metric)) return ' ms';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">PageSpeed Insights</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <BookOpen className="w-4 h-4" />
              Docs
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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

        {/* Device Toggle */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Device:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('mobile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    view === 'mobile' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MobileIcon className="w-4 h-4" />
                  Mobile
                </button>
                <button
                  onClick={() => setView('desktop')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    view === 'desktop' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <DesktopIcon className="w-4 h-4" />
                  Desktop
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && result[view] && !loading && (
          <div className="space-y-6">
            {/* Analysis Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{result.url}</h2>
                  <p className="text-sm text-gray-500">
                    Captured at {new Date(result.analysisTimestamp || Date.now()).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {view === 'mobile' ? 'Emulated Moto G Power' : 'Desktop'} with Lighthouse
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(result[view]?.scores).map(([label, score]) => (
                    <PerformanceScore
                      key={label}
                      title={label.charAt(0).toUpperCase() + label.slice(1)}
                      score={score}
                      size="medium"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {result[view]?.metrics && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">METRICS</h3>
                <div className="space-y-3">
                  {Object.entries(result[view]?.metrics)
                    .filter(([label]) => ['lcp', 'fcp', 'cls', 'tti', 'tbt', 'fid', 'si', 'ttfb'].includes(label))
                    .map(([label, value]) => {
                      const displayValue = formatMetricValue(label.toUpperCase(), value);
                      const unit = getMetricUnit(label.toUpperCase());
                      const status = getMetricStatus(label.toUpperCase(), value || 0);
                      
                      return (
                        <MetricDisplay
                          key={label}
                          label={METRIC_META[label.toUpperCase()]?.label || label.toUpperCase()}
                          value={displayValue}
                          unit={unit}
                          status={status}
                          description={METRIC_META[label.toUpperCase()]?.description}
                        />
                      );
                    })}
                </div>
              </div>
            )}

            {/* Insights */}
            {result[view]?.opportunities && result[view]?.opportunities.length > 0 && (
              <InsightsSection insights={result[view]?.opportunities} />
            )}

            {/* Screenshots */}
            {result[view]?.screenshots && (result[view]?.screenshots || []).length > 0 && (
              <Filmstrip screenshots={result[view]?.screenshots || []} />
            )}

            {/* Diagnostics */}
            {result[view]?.diagnostics && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">DIAGNOSTICS</h3>
                <div className="space-y-3">
                  {Object.entries(result[view]?.diagnostics || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{key}</span>
                      <span className="text-gray-900">{JSON.stringify(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing website performance...</p>
          </div>
        )}
      </div>
    </div>
  );
} 