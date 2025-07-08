"use client";

import { Fragment, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Globe, Gauge, Smartphone, Monitor, ChevronDown, ChevronUp, Info, FileText, Download, Printer, Share2 } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

// 1. Import Firebase and export utilities
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { exportComponentToPDF } from '@/utils/exportPDF';

export const dynamic = 'force-dynamic';

interface PageSpeedMetrics {
  metrics: Record<string, number | null>;
  scores: Record<string, number | null>;
  opportunities: Array<{ id: string; title: string; description: string; savingsMs: number; score: number }>;
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
}

interface WebVitalsResult {
  mobile: PageSpeedMetrics;
  desktop: PageSpeedMetrics;
  url: string;
}

// Metric metadata for labels, units, and descriptions
const METRIC_META: Record<string, { label: string; unit?: string; description: string }> = {
  LCP: { label: 'Largest Contentful Paint', unit: 's', description: 'Measures loading performance. Good <2.5s.' },
  FCP: { label: 'First Contentful Paint', unit: 's', description: 'Time to first content. Good <1.8s.' },
  CLS: { label: 'Cumulative Layout Shift', unit: '', description: 'Visual stability. Good <0.1.' },
  TTI: { label: 'Time to Interactive', unit: 's', description: 'Time to fully interactive. Good <5s.' },
  TBT: { label: 'Total Blocking Time', unit: 'ms', description: 'Time blocked by scripts. Good <200ms.' },
  SI: { label: 'Speed Index', unit: 's', description: 'Visual load speed. Good <4.3s.' },
  TTFB: { label: 'Time to First Byte', unit: 'ms', description: 'Server response time. Good <800ms.' },
  FID: { label: 'First Input Delay', unit: 'ms', description: 'Input responsiveness. Good <100ms.' },
  FMP: { label: 'First Meaningful Paint', unit: 's', description: 'First meaningful content. Lower is better.' },
};

export default function WebVitalsCheckerPage() {
  const [url, setUrl] = useState('https://www.sitegrip.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebVitalsResult | null>(null);
  const [view, setView] = useState<'mobile' | 'desktop'>('mobile');

  // 2. Add state for user and saved reports
  const [user, setUser] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  // 3. On mount, listen for auth state and load saved reports
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadReports(u.uid);
      else setSavedReports([]);
    });
    return () => unsub();
  }, []);
  const loadReports = async (uid: string) => {
    const q = query(collection(db, 'webVitalsReports'), where('uid', '==', uid), orderBy('created', 'desc'), limit(10));
    const snap = await getDocs(q);
    setSavedReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // 4. On successful result, save to Firestore
  useEffect(() => {
    if (result && url) {
      const save = async () => {
        await addDoc(collection(db, 'webVitalsReports'), {
          uid: user?.uid || null,
          url,
          result,
          created: serverTimestamp(),
        });
        if (user) loadReports(user.uid);
      };
      save();
    }
    // eslint-disable-next-line
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

  const formatLCP = (lcp: number) => `${(lcp / 1000).toFixed(1)}s`;
  const formatFID = (fid: number) => `${fid.toFixed(0)}ms`;
  const formatCLS = (cls: number) => cls.toFixed(3);

  const CircularGauge = ({ score, size = 80 }: { score: number; size?: number }) => {
    const radius = size / 2 - 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${getScoreColor(score)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score.toFixed(0)}
          </span>
        </div>
      </div>
    );
  };

  // Enhanced MetricCard with responsive design
  const MetricCard = ({ label, value }: { label: string; value: number | null | undefined }) => {
    const meta = METRIC_META[label] || { label, unit: '', description: '' };
    let displayValue = 'N/A';
    let color = 'text-gray-400';
    if (typeof value === 'number' && value > 0) {
      if (meta.unit === 's') displayValue = (value / 1000).toFixed(2) + 's';
      else if (meta.unit === 'ms') displayValue = value.toFixed(0) + 'ms';
      else displayValue = value.toString();
      // Color cues for health (example for LCP, CLS, TTI, TBT, FCP, SI, TTFB, FID)
      if (label === 'LCP') color = value < 2500 ? 'text-green-600' : value < 4000 ? 'text-yellow-600' : 'text-red-600';
      if (label === 'CLS') color = value < 0.1 ? 'text-green-600' : value < 0.25 ? 'text-yellow-600' : 'text-red-600';
      if (label === 'TTI' || label === 'FCP' || label === 'SI' || label === 'FMP') color = value < 5000 ? 'text-green-600' : value < 8000 ? 'text-yellow-600' : 'text-red-600';
      if (label === 'TBT' || label === 'FID' || label === 'TTFB') color = value < 200 ? 'text-green-600' : value < 600 ? 'text-yellow-600' : 'text-red-600';
    }
    return (
      <div className="rounded-xl p-3 sm:p-4 shadow bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 flex flex-col justify-between min-h-[80px] sm:min-h-[90px] group transition hover:shadow-lg"> 
        <div className="flex items-start justify-between w-full mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight pr-1">{meta.label}</span>
          <span className="cursor-pointer flex-shrink-0" data-tooltip-id={`tt-${label}`}> 
            <Info className="w-3 h-3 text-blue-400 group-hover:text-blue-600" /> 
          </span>
          <Tooltip id={`tt-${label}`}>{meta.description}</Tooltip>
        </div>
        <span className={`text-lg sm:text-xl lg:text-2xl font-bold leading-tight ${color}`}>{displayValue}</span>
      </div>
    );
  };

  // Helper: Color-coded badge for category scores with responsive design
  const ScoreBadge = ({ label, score }: { label: string; score: number | null | undefined }) => {
    let color = 'bg-gray-200 text-gray-700';
    if (score !== null && score !== undefined) {
      if (score >= 90) color = 'bg-green-100 text-green-700';
      else if (score >= 50) color = 'bg-yellow-100 text-yellow-700';
      else color = 'bg-red-100 text-red-700';
    }
    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm ${color}`}>
        {label}: {score !== null && score !== undefined ? score : '--'}
      </span>
    );
  };

  // Helper: Opportunities panel with responsive design
  const OpportunitiesPanel = ({ opportunities }: { opportunities: any[] }) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="rounded-xl p-3 sm:p-4 shadow bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 mt-4 w-full overflow-hidden">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen((v) => !v)}>
          <h3 className="font-semibold text-base sm:text-lg text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5" /> 
            <span className="hidden sm:inline">Opportunities</span>
            <span className="sm:hidden">Opportunities</span>
          </h3>
          {open ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        {open && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-2 overflow-hidden">
            {opportunities.length === 0 ? (
              <li className="text-gray-500 py-2 text-sm">No major opportunities detected.</li>
            ) : opportunities.map((op, i) => (
              <li key={op.id} className="py-3 sm:py-4 flex flex-col gap-2">
                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed break-words">{op.title}</span>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed break-words whitespace-normal">{op.description}</span>
                <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-300 font-medium">
                  Estimated Savings: {op.savingsMs ? op.savingsMs.toFixed(0) + ' ms' : '--'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Helper: Diagnostics panel with responsive grid
  const DiagnosticsPanel = ({ diagnostics }: { diagnostics: any }) => (
    <div className="rounded-xl p-3 sm:p-4 shadow bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 mt-4 w-full overflow-hidden">
      <h3 className="font-semibold text-base sm:text-lg mb-2 text-pink-700 dark:text-pink-300 flex items-center gap-2">
        <Gauge className="w-4 h-4 sm:w-5 sm:h-5" /> 
        <span className="hidden sm:inline">Diagnostics</span>
        <span className="sm:hidden">Diagnostics</span>
      </h3>
      {diagnostics ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(diagnostics).map(([key, value]) => (
            <li key={key} className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 break-words">
              <span className="font-semibold mr-1">{key}:</span> <span className="break-all">{String(value)}</span>
            </li>
          ))}
        </ul>
      ) : <div className="text-gray-500 text-sm">No diagnostics available.</div>}
    </div>
  );

  // Helper: Resource summary as a bar chart with responsive design
  const ResourceSummaryChart = ({ resourceSummary }: { resourceSummary: any[] }) => {
    if (!resourceSummary || resourceSummary.length === 0) return null;
    const max = Math.max(...resourceSummary.map((r) => r.transferSize || 0));
    return (
      <div className="rounded-xl p-3 sm:p-4 shadow bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 mt-4 w-full overflow-hidden">
        <h3 className="font-semibold text-base sm:text-lg mb-2 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5" /> 
          <span className="hidden sm:inline">Resource Breakdown</span>
          <span className="sm:hidden">Resources</span>
        </h3>
        <div className="space-y-2">
          {resourceSummary.map((r) => (
            <div key={r.resourceType} className="flex items-center gap-2">
              <span className="w-16 sm:w-24 text-xs text-gray-700 dark:text-gray-200 flex-shrink-0">{r.resourceType}</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded h-2 sm:h-3 relative">
                <div
                  className="bg-blue-500 h-2 sm:h-3 rounded"
                  style={{ width: `${((r.transferSize || 0) / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">{r.transferSize} bytes</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper: Field data panel with responsive grid
  const FieldDataPanel = ({ fieldData, label }: { fieldData: any, label: string }) => (
    <div className="rounded-xl p-3 sm:p-4 shadow bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 mt-4 w-full overflow-hidden">
      <h3 className="font-semibold text-base sm:text-lg mb-2 text-green-700 dark:text-green-300 flex items-center gap-2">
        <Gauge className="w-4 h-4 sm:w-5 sm:h-5" /> 
        {label} (Real User Data)
      </h3>
      {fieldData ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(fieldData).map(([key, value]: any) => (
            <li key={key} className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 break-words">
              <span className="font-semibold mr-1">{key}:</span> <span className="break-all">{value.percentile ? value.percentile + ' ms' : JSON.stringify(value)}</span>
            </li>
          ))}
        </ul>
      ) : <div className="text-gray-500 text-sm">No field data available.</div>}
    </div>
  );

  // Helper: Environment info with responsive layout
  const EnvironmentPanel = ({ env, warnings, fetchTime, finalUrl, userAgent, timing }: { env: any, warnings: string[], fetchTime: string, finalUrl: string, userAgent: string, timing: any }) => (
    <div className="rounded-xl p-3 sm:p-4 shadow bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 mt-4 w-full overflow-hidden">
      <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Gauge className="w-4 h-4 sm:w-5 sm:h-5" /> 
        <span className="hidden sm:inline">Environment & Details</span>
        <span className="sm:hidden">Environment</span>
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
        <li><span className="font-semibold mr-1">Fetch Time:</span> {fetchTime}</li>
        <li><span className="font-semibold mr-1">Final URL:</span> <span className="break-all">{finalUrl}</span></li>
        <li className="sm:col-span-2"><span className="font-semibold mr-1">User Agent:</span> <span className="break-all">{userAgent}</span></li>
        <li><span className="font-semibold mr-1">Emulated Device:</span> {env?.hostUserAgent || '--'}</li>
        <li><span className="font-semibold mr-1">Network:</span> {env?.networkUserAgent || '--'}</li>
        <li><span className="font-semibold mr-1">Timing:</span> {timing?.total ? timing.total + ' ms' : '--'}</li>
      </ul>
      {warnings && warnings.length > 0 && (
        <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
          <span className="font-semibold">Warnings:</span> {warnings.join(', ')}
        </div>
      )}
    </div>
  );

  // Collapsible audits panel with responsive design
  const AuditsPanel = ({ audits, label, color }: { audits: { id: string; title: string }[]; label: string; color: string }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="rounded-xl p-3 sm:p-4 shadow bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 mt-4 w-full overflow-hidden">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen((v) => !v)}>
          <h3 className={`font-semibold text-base sm:text-lg ${color} flex items-center gap-2`}>
            <Gauge className="w-4 h-4 sm:w-5 sm:h-5" /> 
            {label}
          </h3>
          {open ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        {open && (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-2 max-h-48 overflow-y-auto">
            {audits.length === 0 ? (
              <li className="text-gray-500 py-2 text-sm">None.</li>
            ) : audits.map((a) => (
              <li key={a.id} className="py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 break-words">{a.title}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Error/Warning banner with responsive text
  const Banner = ({ type, message }: { type: 'error' | 'warning'; message: string }) => (
    <div className={`rounded-lg p-3 mb-4 ${type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>
      <p className="text-sm text-center">{message}</p>
    </div>
  );

  // 5. Export/share/report buttons
  const handleExportPDF = () => exportComponentToPDF('web-vitals-dashboard', 'web-vitals-report.pdf');
  const handleExportCSV = () => {/* implement CSV export */};
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'web-vitals-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handlePrint = () => window.print();
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?url=' + encodeURIComponent(url));
    alert('Shareable link copied!');
  };

  // 6. Add export/share/report buttons to the dashboard UI (above results)
  // 7. Add logo/branding placeholder at the top
  // 8. Add section to view recent saved reports (if user is logged in)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Gauge className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
              Core Web Vitals Checker
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto px-4">
            Analyze your website's Core Web Vitals performance metrics
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mx-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full px-4 sm:px-5 py-3 pl-10 sm:pl-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base shadow"
              />
              <Globe className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analyze
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mx-4"
          >
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        {result && !loading && (
          <div id="web-vitals-dashboard" className="px-2 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              {/* Error/Warning banners */}
              {result && result[view].warnings && result[view].warnings.length > 0 && (
                <Banner type="warning" message={result[view].warnings.join(', ')} />
              )}
              
              {/* Toggle for Mobile/Desktop */}
              <div className="flex justify-center gap-1 sm:gap-2 lg:gap-4 mb-4 px-2">
                <button
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 focus:outline-none shadow ${view === 'mobile' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'}`}
                  onClick={() => setView('mobile')}
                >
                  <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> 
                  <span className="hidden sm:inline">Mobile</span>
                  <span className="sm:hidden">M</span>
                </button>
                <button
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 focus:outline-none shadow ${view === 'desktop' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'}`}
                  onClick={() => setView('desktop')}
                >
                  <Monitor className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> 
                  <span className="hidden sm:inline">Desktop</span>
                  <span className="sm:hidden">D</span>
                </button>
              </div>

              {/* Export/share/report buttons */}
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 lg:gap-4 mt-4 sm:mt-6 px-2">
                <button
                  onClick={handleExportPDF}
                  className="px-3 sm:px-4 lg:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> 
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 sm:px-4 lg:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> 
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-3 sm:px-4 lg:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> 
                  <span className="hidden sm:inline">Export JSON</span>
                  <span className="sm:hidden">JSON</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 sm:px-4 lg:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <Printer className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> 
                  <span className="hidden sm:inline">Print Report</span>
                  <span className="sm:hidden">Print</span>
                </button>
                <button
                  onClick={handleShare}
                  className="px-3 sm:px-4 lg:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm lg:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> 
                  <span className="hidden sm:inline">Share Link</span>
                  <span className="sm:hidden">Share</span>
                </button>
              </div>

              {/* Category Scores */}
              {result && result[view].scores && (
                <div className="flex flex-wrap gap-1 sm:gap-2 lg:gap-3 justify-center mb-4 px-2">
                  {Object.entries(result[view].scores).map(([label, score]) => (
                    <ScoreBadge key={label} label={label} score={score} />
                  ))}
                </div>
              )}
              
              {/* Lab Metrics */}
              {result && result[view].metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(result[view].metrics).map(([label, value]) => (
                    <MetricCard key={label} label={label} value={typeof value === 'number' ? value : null} />
                  ))}
                </div>
              )}
              
              {/* Opportunities */}
              {result && result[view].opportunities && (
                <OpportunitiesPanel opportunities={result[view].opportunities} />
              )}
              
              {/* Resource Summary */}
              {result && result[view].resourceSummary && (
                <ResourceSummaryChart resourceSummary={result[view].resourceSummary} />
              )}
              
              {/* Diagnostics */}
              {result && result[view].diagnostics && (
                <DiagnosticsPanel diagnostics={result[view].diagnostics} />
              )}
              
              {/* Audits */}
              {result && result[view].passedAudits && (
                <AuditsPanel audits={result[view].passedAudits} label="Passed Audits" color="text-green-700 dark:text-green-400" />
              )}
              {result && result[view].manualAudits && (
                <AuditsPanel audits={result[view].manualAudits} label="Manual Audits" color="text-blue-700 dark:text-blue-400" />
              )}
              {result && result[view].notApplicableAudits && (
                <AuditsPanel audits={result[view].notApplicableAudits} label="Not Applicable Audits" color="text-gray-700 dark:text-gray-400" />
              )}
              
              {/* Field Data (CrUX) */}
              {result && result[view].fieldData && (
                <FieldDataPanel fieldData={result[view].fieldData} label="Field Data" />
              )}
              {result && result[view].originFieldData && (
                <FieldDataPanel fieldData={result[view].originFieldData} label="Origin Field Data" />
              )}
              
              {/* Environment & Details */}
              {result && (
                <EnvironmentPanel
                  env={result[view].environment}
                  warnings={result[view].warnings}
                  fetchTime={result[view].fetchTime}
                  finalUrl={result[view].finalUrl}
                  userAgent={result[view].userAgent}
                  timing={result[view].timing}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 