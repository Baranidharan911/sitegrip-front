"use client";

import { Fragment, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Globe, Gauge, Smartphone, Monitor, ChevronDown, ChevronUp, Info, FileText, Download, Printer, Share2 } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

// 1. Import Firebase and export utilities
// REMOVE these static imports:
// import { db, auth } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';
import { exportComponentToPDF } from '@/utils/exportPDF';

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
  const METRIC_META: Record<string, { label: string; unit?: string; description: string }> = {
    // Core Web Vitals
    LCP: { label: 'Largest Contentful Paint', unit: 's', description: 'Measures loading performance. Good <2.5s.' },
    FCP: { label: 'First Contentful Paint', unit: 's', description: 'Time to first content. Good <1.8s.' },
    CLS: { label: 'Cumulative Layout Shift', unit: '', description: 'Visual stability. Good <0.1.' },
    TTI: { label: 'Time to Interactive', unit: 's', description: 'Time to fully interactive. Good <5s.' },
    TBT: { label: 'Total Blocking Time', unit: 'ms', description: 'Time blocked by scripts. Good <200ms.' },
    SI: { label: 'Speed Index', unit: 's', description: 'Visual load speed. Good <4.3s.' },
    TTFB: { label: 'Time to First Byte', unit: 'ms', description: 'Server response time. Good <800ms.' },
    FID: { label: 'First Input Delay', unit: 'ms', description: 'Input responsiveness. Good <100ms.' },
    FMP: { label: 'First Meaningful Paint', unit: 's', description: 'First meaningful content. Lower is better.' },
    
    // Additional Performance Metrics
    FCI: { label: 'First CPU Idle', unit: 's', description: 'Time when page becomes minimally interactive.' },
    EIL: { label: 'Estimated Input Latency', unit: 'ms', description: 'Estimated time for next input to be processed.' },
    MPU: { label: 'Max Potential FID', unit: 'ms', description: 'Worst-case First Input Delay.' },
    
    // Resource Metrics
    totalResources: { label: 'Total Resources', unit: '', description: 'Number of HTTP requests made.' },
    totalSize: { label: 'Total Size', unit: 'bytes', description: 'Total transfer size of all resources.' },
    domSize: { label: 'DOM Size', unit: 'nodes', description: 'Number of DOM nodes.' },
    criticalRequestChains: { label: 'Critical Chains', unit: '', description: 'Number of critical request chains.' },
    
    // Image Optimization
    usesOptimizedImages: { label: 'Optimized Images', unit: '', description: 'Score for image optimization.' },
    usesWebpImages: { label: 'WebP Images', unit: '', description: 'Score for WebP image usage.' },
    usesResponsiveImages: { label: 'Responsive Images', unit: '', description: 'Score for responsive image usage.' },
    usesEfficientImageFormats: { label: 'Efficient Formats', unit: '', description: 'Score for efficient image formats.' },
    
    // Compression
    usesTextCompression: { label: 'Text Compression', unit: '', description: 'Score for text compression usage.' },
    
    // Accessibility
    colorContrast: { label: 'Color Contrast', unit: '', description: 'Score for color contrast compliance.' },
    documentTitle: { label: 'Document Title', unit: '', description: 'Score for document title presence.' },
    linkName: { label: 'Link Names', unit: '', description: 'Score for link accessibility.' },
    imageAlt: { label: 'Image Alt Text', unit: '', description: 'Score for image alt text presence.' },
    
    // SEO
    metaDescription: { label: 'Meta Description', unit: '', description: 'Score for meta description presence.' },
    hreflang: { label: 'Hreflang', unit: '', description: 'Score for hreflang implementation.' },
    canonical: { label: 'Canonical URL', unit: '', description: 'Score for canonical URL presence.' },
    robotsTxt: { label: 'Robots.txt', unit: '', description: 'Score for robots.txt presence.' },
    structuredData: { label: 'Structured Data', unit: '', description: 'Score for structured data implementation.' },
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
    if (!isFirebaseConfigured()) return;
    let unsub: any;
    (async () => {
      const firebaseModule = await import('@/lib/firebase');
      console.log('firebaseModule:', firebaseModule); // DEBUG
      const isFirestoreAvailable = firebaseModule.isFirestoreAvailable;
      const db = firebaseModule.db;
      const auth = firebaseModule.auth;
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
    console.log('firebaseModule:', firebaseModule); // DEBUG
    const isFirestoreAvailable = firebaseModule.isFirestoreAvailable;
    const db = firebaseModule.db;
    if (typeof isFirestoreAvailable !== 'function' || !isFirestoreAvailable() || !db) return;
    const firestoreDb = db as import('firebase/firestore').Firestore;
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    const q = query(collection(firestoreDb, 'webVitalsReports'), where('uid', '==', uid), orderBy('created', 'desc'), limit(10));
    const snap = await getDocs(q);
    setSavedReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // 4. On successful result, save to Firestore
  useEffect(() => {
    if (!result || !url || !isFirebaseConfigured()) return;
    const save = async () => {
      const firebaseModule = await import('@/lib/firebase');
      console.log('firebaseModule:', firebaseModule); // DEBUG
      const isFirestoreAvailable = firebaseModule.isFirestoreAvailable;
      const db = firebaseModule.db;
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
  const MetricCard = ({ label, value }: { label: string; value: string | number | null | undefined }) => {
    const meta = METRIC_META[label] || { label, unit: '', description: '' };
    let displayValue = value === null || value === undefined ? 'N/A' : value;
    let color = 'text-gray-400';
    let bgGradient = 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700';
    
    if (typeof value === 'number' && value > 0) {
      if (meta.unit === 's') displayValue = (value / 1000).toFixed(2) + 's';
      else if (meta.unit === 'ms') displayValue = value.toFixed(0) + 'ms';
      else displayValue = value.toString();
      
      // Color cues for health
      if (label === 'LCP') {
        color = value < 2500 ? 'text-green-600' : value < 4000 ? 'text-yellow-600' : 'text-red-600';
        bgGradient = value < 2500 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 
                    value < 4000 ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 
                    'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20';
      }
      if (label === 'CLS') {
        color = value < 0.1 ? 'text-green-600' : value < 0.25 ? 'text-yellow-600' : 'text-red-600';
        bgGradient = value < 0.1 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 
                    value < 0.25 ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 
                    'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20';
      }
      if (label === 'TTI' || label === 'FCP' || label === 'SI' || label === 'FMP') {
        color = value < 5000 ? 'text-green-600' : value < 8000 ? 'text-yellow-600' : 'text-red-600';
        bgGradient = value < 5000 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 
                    value < 8000 ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 
                    'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20';
      }
      if (label === 'TBT' || label === 'FID' || label === 'TTFB') {
        color = value < 200 ? 'text-green-600' : value < 600 ? 'text-yellow-600' : 'text-red-600';
        bgGradient = value < 200 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 
                    value < 600 ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 
                    'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20';
      }
    }
    
    return (
      <div className={`rounded-2xl p-4 sm:p-5 shadow-lg bg-gradient-to-br ${bgGradient} backdrop-blur-sm border border-white/20 dark:border-gray-700/50 flex flex-col justify-between min-h-[100px] sm:min-h-[110px] group transition-all duration-300 hover:shadow-xl hover:scale-105`}> 
        <div className="flex items-start justify-between w-full mb-3">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-tight pr-2">{meta.label}</span>
          <span className="cursor-pointer flex-shrink-0" data-tooltip-id={`tt-${label}`}> 
            <Info className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" /> 
          </span>
          <Tooltip id={`tt-${label}`}>{meta.description}</Tooltip>
        </div>
        <span className={`text-xl sm:text-2xl lg:text-3xl font-bold leading-tight ${color} transition-colors`}>{displayValue}</span>
      </div>
    );
  };

  // Replace ScoreBadge with ScoreRing for category scores
  const ScoreRing = ({ label, score }: { label: string; score: number | null | undefined }) => {
    let color = 'text-gray-400';
    let ring = 'stroke-gray-200';
    let bgGradient = 'from-gray-100 to-gray-200';
    
    if (score !== null && score !== undefined) {
      if (score >= 90) {
        color = 'text-green-600';
        ring = 'stroke-green-500';
        bgGradient = 'from-green-50 to-emerald-50';
      } else if (score >= 50) {
        color = 'text-yellow-600';
        ring = 'stroke-yellow-500';
        bgGradient = 'from-yellow-50 to-orange-50';
      } else {
        color = 'text-red-600';
        ring = 'stroke-red-500';
        bgGradient = 'from-red-50 to-pink-50';
      }
    }
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = score ? (score / 100) * circumference : 0;
    
    return (
      <div className={`flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br ${bgGradient} backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 hover:scale-105`}>
        <div className="relative">
          <svg width="100" height="100" className="mb-3">
            <circle 
              cx="50" cy="50" r={radius} 
              strokeWidth="10" 
              fill="none" 
              className="stroke-gray-200 dark:stroke-gray-700" 
            />
            <circle
              cx="50" cy="50" r={radius} 
              strokeWidth="10" 
              fill="none"
              className={`${ring} transition-all duration-1000`}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${color}`}>
              {score !== null && score !== undefined ? score : '--'}
            </span>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{label}</span>
      </div>
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

  // Helper: Screenshot display component for multiple images (horizontal filmstrip)
  const ScreenshotPanel = ({ screenshots, currentView }: {
    screenshots: string[];
    currentView: 'mobile' | 'desktop';
  }) => {
    const deviceConfig = {
      mobile: {
        name: 'Mobile',
        icon: Smartphone,
        iconColor: 'text-purple-500',
        dimensions: '375×812',
      },
      desktop: {
        name: 'Desktop',
        icon: Monitor,
        iconColor: 'text-blue-500',
        dimensions: '1920×1080',
      }
    };
    const config = deviceConfig[currentView];
    const IconComponent = config.icon;
    if (!screenshots || screenshots.length === 0) return null;
    return (
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📸 Screenshots</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Visual representation of how your site appears on {config.name.toLowerCase()} devices
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex flex-row gap-6 min-w-fit pb-2">
            {screenshots.map((img, i) => (
              <div key={i} className="flex flex-col items-center min-w-[180px] max-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                  <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                    {config.name} {i + 1}/{screenshots.length}
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl bg-white border-2 border-gray-200 shadow-lg w-full">
                  <img
                    src={`data:image/png;base64,${img}`}
                    alt={`${config.name} Screenshot Section ${i + 1}`}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Helper: Console Errors Panel
  const ConsoleErrorsPanel = ({ consoleErrors }: { consoleErrors?: string[] }) => {
    if (!consoleErrors || consoleErrors.length === 0) return null;
    
    return (
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Console Errors</h2>
            <p className="text-gray-600 dark:text-gray-300">JavaScript errors detected during page load</p>
          </div>
        </div>
        <div className="backdrop-blur-sm bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200/50 shadow-lg">
          <ul className="space-y-3">
            {consoleErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 dark:text-red-300 font-mono bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-red-200/50">
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Helper: Additional Checks Panel
  const AdditionalChecksPanel = ({ additionalChecks }: { additionalChecks?: any }) => {
    if (!additionalChecks) return null;
    
    return (
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🔍 Additional Checks</h2>
            <p className="text-gray-600 dark:text-gray-300">Comprehensive analysis of accessibility, SEO, and security</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Accessibility */}
          <div className="backdrop-blur-sm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">♿</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white">Accessibility</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Score:</span>
                <span className="font-bold text-gray-800 dark:text-white">{additionalChecks.accessibility?.score || 0}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Issues:</span>
                <span className="font-bold text-gray-800 dark:text-white">{additionalChecks.accessibility?.issues?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
                <span className={`font-bold ${additionalChecks.accessibility?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {additionalChecks.accessibility?.success ? '✅ Pass' : '❌ Fail'}
                </span>
              </div>
            </div>
          </div>
          
          {/* SEO */}
          <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🔍</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white">SEO</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Score:</span>
                <span className="font-bold text-gray-800 dark:text-white">{additionalChecks.seo?.score || 0}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Issues:</span>
                <span className="font-bold text-gray-800 dark:text-white">{additionalChecks.seo?.issues?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
                <span className={`font-bold ${additionalChecks.seo?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {additionalChecks.seo?.success ? '✅ Pass' : '❌ Fail'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Security */}
          <div className="backdrop-blur-sm bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🔒</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white">Security</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Score:</span>
                <span className="font-bold text-gray-800 dark:text-white">{additionalChecks.security?.score || 0}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Issues:</span>
                <span className="font-bold text-gray-800 dark:text-white">{additionalChecks.security?.issues?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
                <span className={`font-bold ${additionalChecks.security?.success ? 'text-green-600' : 'text-red-600'}`}>
                  {additionalChecks.security?.success ? '✅ Pass' : '❌ Fail'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  // Add a dedicated Accessibility Issues panel after DiagnosticsPanel
  const AccessibilityIssuesPanel = ({ audits }: { audits: any }) => {
    // audits is an object, not array
    const issues = audits
      ? Object.values(audits).filter((a: any) =>
          a.id === 'color-contrast' ||
          a.id === 'document-title' ||
          a.id === 'link-name'
        )
      : [];
    if (!issues || issues.length === 0) return null;
    return (
      <div className="rounded-xl p-3 sm:p-4 shadow bg-white/80 dark:bg-gray-900/80 border border-red-200 dark:border-red-700 mt-4 w-full overflow-hidden">
        <h3 className="font-semibold text-base sm:text-lg mb-2 text-red-700 dark:text-red-300 flex items-center gap-2">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
          Accessibility Issues
        </h3>
        <ul className="space-y-2">
          {issues.map((issue: any) => (
            <li key={issue.id} className="text-sm text-red-700 dark:text-red-300 font-medium">
              {issue.title}
              {issue.description && <span className="block text-xs text-gray-500 dark:text-gray-400">{issue.description}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

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

  // Helper: Core Web Vitals Assessment
  const getAssessment = (fieldData: any) => {
    // Google logic: LCP <2.5s, INP <200ms, CLS <0.1 (all green = pass)
    if (!fieldData) return { pass: false, reason: 'No field data' };
    const lcp = fieldData['LARGEST_CONTENTFUL_PAINT_MS']?.percentile;
    const inp = fieldData['INTERACTION_TO_NEXT_PAINT']?.percentile;
    const cls = fieldData['CUMULATIVE_LAYOUT_SHIFT_SCORE']?.percentile;
    const lcpPass = lcp !== undefined && lcp <= 2500;
    const inpPass = inp !== undefined && inp <= 200;
    const clsPass = cls !== undefined && cls <= 0.1;
    const pass = lcpPass && inpPass && clsPass;
    let reason = '';
    if (!lcpPass) reason += 'LCP too high. ';
    if (!inpPass) reason += 'INP too high. ';
    if (!clsPass) reason += 'CLS too high. ';
    if (pass) reason = 'All Core Web Vitals are good!';
    return { pass, reason: reason.trim() };
  };

  // Helper: Field Data Bar
  const FieldBar = ({ label, value, unit, thresholds }: { label: string, value: number, unit: string, thresholds: [number, number] }) => {
    let color = 'bg-green-500';
    if (value > thresholds[1]) color = 'bg-red-500';
    else if (value > thresholds[0]) color = 'bg-yellow-500';
    return (
      <div className="flex flex-col items-start mb-2 w-full">
        <div className="flex justify-between w-full">
          <span className="text-xs font-semibold text-gray-700">{label}</span>
          <span className="text-xs font-bold text-gray-900">{value}{unit}</span>
        </div>
        <div className="w-full h-2 rounded bg-gray-200 mt-1">
          <div className={`${color} h-2 rounded`} style={{ width: `${Math.min((value / (thresholds[1] * 1.5)) * 100, 100)}%` }} />
        </div>
        <div className="flex justify-between w-full text-[10px] text-gray-400 mt-1">
          <span>Good</span><span>Needs Improvement</span><span>Poor</span>
        </div>
      </div>
    );
  };

  // FULL REDESIGN STARTS HERE
  // Replace the entire return of WebVitalsCheckerPage with a new, modern, PageSpeed Insights-inspired layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center py-8 px-4">
      {/* Header and URL Input */}
      <div className="w-full max-w-4xl mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Web Vitals Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive performance analysis with screenshots, accessibility checks, and detailed metrics
          </p>
        </div>
        
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter a URL (e.g. https://example.com)"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg shadow-lg transition-all duration-300"
                />
              </div>
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="px-8 py-4 rounded-2xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg flex items-center gap-3 min-w-[160px] justify-center"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Gauge className="w-6 h-6" />}
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
      {/* Device Toggle */}
      {result && result[view] && !loading && (
        <div className="w-full max-w-4xl flex justify-center mb-8">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-2">
            <div className="flex">
              <button
                className={`px-8 py-3 font-semibold text-base transition-all duration-300 focus:outline-none rounded-xl flex items-center gap-2 ${
                  view === 'mobile' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
                onClick={() => setView('mobile')}
              >
                <Smartphone className="w-5 h-5" />
                Mobile
              </button>
              <button
                className={`px-8 py-3 font-semibold text-base transition-all duration-300 focus:outline-none rounded-xl flex items-center gap-2 ${
                  view === 'desktop' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
                onClick={() => setView('desktop')}
              >
                <Monitor className="w-5 h-5" />
                Desktop
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Results Section */}
      {result && result[view] && !loading && (
        <div className="w-full max-w-6xl space-y-8">
          {/* Analysis Timestamp */}
          {result.analysisTimestamp && (
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Analysis completed on: {new Date(result.analysisTimestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          {/* Core Web Vitals Assessment Card */}
          {result[view] && result[view].fieldData && (
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-6">
                <div className={`inline-flex items-center px-6 py-3 rounded-2xl font-bold text-lg shadow-lg ${
                  getAssessment(result[view]?.fieldData).pass 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                }`}>
                  {getAssessment(result[view]?.fieldData).pass ? '✅ Passed' : '❌ Failed'}
                  <span className="ml-2 text-base font-medium">
                    Core Web Vitals
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {getAssessment(result[view]?.fieldData).reason}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-2">  
                {/* LCP */}
                {(() => {
                  const lcp = result[view]?.fieldData?.['LARGEST_CONTENTFUL_PAINT_MS'];
                  if (lcp && lcp.percentile != null) {
                    return (
                      <FieldBar
                        label="LCP"
                        value={+(lcp.percentile / 1000).toFixed(2)}
                        unit="s"
                        thresholds={[2.5, 4]}
                      />
                    );
                  }
                  return null;
                })()}
                {/* INP */}
                {(() => {
                  const inp = result[view]?.fieldData?.['INTERACTION_TO_NEXT_PAINT'];
                  if (inp && inp.percentile != null) {
                    return (
                      <FieldBar
                        label="INP"
                        value={Math.round(inp.percentile)}
                        unit="ms"
                        thresholds={[200, 500]}
                      />
                    );
                  }
                  return null;
                })()}
                {/* CLS */}
                {(() => {
                  const cls = result[view]?.fieldData?.['CUMULATIVE_LAYOUT_SHIFT_SCORE'];
                  if (cls && cls.percentile != null) {
                    return (
                      <FieldBar
                        label="CLS"
                        value={+(cls.percentile).toFixed(3)}
                        unit=""
                        thresholds={[0.1, 0.25]}
                      />
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2 text-base">Other Notable Metrics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {result[view]?.fieldData?.['FIRST_CONTENTFUL_PAINT_MS'] &&
                    result[view]?.fieldData?.['FIRST_CONTENTFUL_PAINT_MS'].percentile != null && (
                      <FieldBar label="FCP" value={+(result[view]?.fieldData?.['FIRST_CONTENTFUL_PAINT_MS'].percentile / 1000).toFixed(2)} unit="s" thresholds={[1.8, 3]} />
                    )}
                  {result[view]?.fieldData?.['EXPERIMENTAL_TIME_TO_FIRST_BYTE'] &&
                    result[view]?.fieldData?.['EXPERIMENTAL_TIME_TO_FIRST_BYTE'].percentile != null && (
                      <FieldBar label="TTFB" value={+(result[view]?.fieldData?.['EXPERIMENTAL_TIME_TO_FIRST_BYTE'].percentile / 1000).toFixed(2)} unit="s" thresholds={[0.8, 1.8]} />
                    )}
                </div>
              </div>
            </div>
          )}
          {/* Lab Data Section */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Lab Data (Simulated)</h2>
                <p className="text-gray-600 dark:text-gray-300">Performance metrics from controlled testing environment</p>
              </div>
            </div>
            {/* Category Scores */}
            {result[view]?.scores && (
              <div className="flex flex-wrap gap-6 justify-center mb-8">
                {Object.entries(result[view]?.scores).map(([label, score]) => (
                  <ScoreRing key={label} label={label} score={score} />
                ))}
              </div>
            )}
            {/* Lab Metrics */}
            {result[view]?.metrics && (
              <>
                {/* Core Web Vitals */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Core Web Vitals</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.entries(result[view]?.metrics)
                      .filter(([label]) => ['lcp', 'fcp', 'cls', 'tti', 'tbt', 'fid'].includes(label))
                      .map(([label, value]) => {
                        let displayValue: string | number = 'N/A';
                        if (typeof value === 'number' && value > 0) {
                          if (["lcp", "fcp", "tti"].includes(label)) displayValue = (value / 1000).toFixed(2);
                          else if (["tbt", "fid"].includes(label)) displayValue = Math.round(value);
                          else if (label === "cls") displayValue = value.toFixed(3);
                          else displayValue = value.toString();
                        }
                        return <MetricCard key={label} label={label} value={displayValue} />;
                      })}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Performance Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.entries(result[view]?.metrics)
                      .filter(([label]) => ['si', 'ttfb', 'fmp', 'fci', 'eil', 'mpu'].includes(label))
                      .map(([label, value]) => {
                        let displayValue: string | number = 'N/A';
                        if (typeof value === 'number' && value > 0) {
                          if (["si", "fmp", "fci"].includes(label)) displayValue = (value / 1000).toFixed(2);
                          else if (["eil", "mpu"].includes(label)) displayValue = Math.round(value);
                          else if (label === "ttfb") displayValue = (value / 1000).toFixed(2);
                          else displayValue = value.toString();
                        }
                        return <MetricCard key={label} label={label} value={displayValue} />;
                      })}
                  </div>
                </div>

                {/* Resource Metrics */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Resource Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.entries(result[view]?.metrics)
                      .filter(([label]) => ['totalResources', 'totalSize', 'domSize', 'criticalRequestChains'].includes(label))
                      .map(([label, value]) => {
                        let displayValue: string | number = 'N/A';
                        if (typeof value === 'number' && value > 0) {
                          if (label === "totalSize") {
                            const mb = value / (1024 * 1024);
                            displayValue = mb > 1 ? `${mb.toFixed(2)} MB` : `${(value / 1024).toFixed(2)} KB`;
                          } else {
                            displayValue = value.toString();
                          }
                        }
                        return <MetricCard key={label} label={label} value={displayValue} />;
                      })}
                  </div>
                </div>

                {/* Optimization Scores */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Optimization Scores</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.entries(result[view]?.metrics)
                      .filter(([label]) => ['usesOptimizedImages', 'usesWebpImages', 'usesResponsiveImages', 'usesEfficientImageFormats', 'usesTextCompression'].includes(label))
                      .map(([label, value]) => {
                        const displayValue = typeof value === 'number' ? `${Math.round(value * 100)}%` : 'N/A';
                        return <MetricCard key={label} label={label} value={displayValue} />;
                      })}
                  </div>
                </div>

                {/* Accessibility Scores */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">Accessibility Scores</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.entries(result[view]?.metrics)
                      .filter(([label]) => ['colorContrast', 'documentTitle', 'linkName', 'imageAlt'].includes(label))
                      .map(([label, value]) => {
                        const displayValue = typeof value === 'number' ? `${Math.round(value * 100)}%` : 'N/A';
                        return <MetricCard key={label} label={label} value={displayValue} />;
                      })}
                  </div>
                </div>

                {/* SEO Scores */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">SEO Scores</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Object.entries(result[view]?.metrics)
                      .filter(([label]) => ['metaDescription', 'hreflang', 'canonical', 'robotsTxt', 'structuredData'].includes(label))
                      .map(([label, value]) => {
                        const displayValue = typeof value === 'number' ? `${Math.round(value * 100)}%` : 'N/A';
                        return <MetricCard key={label} label={label} value={displayValue} />;
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Diagnose performance issues */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Diagnose performance issues</h2>
            {result[view]?.warnings && result[view]?.warnings.length > 0 && (
              <Banner type="warning" message={result[view]?.warnings.join(', ')} />
            )}
            {result[view]?.opportunities && (
              <OpportunitiesPanel opportunities={result[view]?.opportunities || []} />
            )}
            {result[view]?.resourceSummary && (
              <ResourceSummaryChart resourceSummary={result[view]?.resourceSummary || []} />
            )}
            {result[view]?.diagnostics && (
              <DiagnosticsPanel diagnostics={result[view]?.diagnostics} />
            )}
            {result[view]?.passedAudits && (
              <AuditsPanel audits={result[view]?.passedAudits || []} label="Passed Audits" color="text-green-700 dark:text-green-400" />
            )}
            {result[view]?.manualAudits && (
              <AuditsPanel audits={result[view]?.manualAudits || []} label="Manual Audits" color="text-blue-700 dark:text-blue-400" />
            )}
            {result[view]?.notApplicableAudits && (
              <AuditsPanel audits={result[view]?.notApplicableAudits || []} label="Not Applicable Audits" color="text-gray-700 dark:text-gray-400" />
            )}
            {result[view]?.audits && (
              <AccessibilityIssuesPanel audits={result[view]?.audits} />
            )}
          </div>
          {/* Screenshots */}
          <ScreenshotPanel 
            screenshots={result[view]?.screenshots || []}
            currentView={view}
          />
          
          {/* Additional Checks */}
          <AdditionalChecksPanel additionalChecks={result.additionalChecks} />
          
          {/* Console Errors */}
          <ConsoleErrorsPanel consoleErrors={result[view]?.consoleErrors} />
          
          {/* Environment & Details */}
          {result[view] && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <EnvironmentPanel
                env={result[view]?.environment}
                warnings={result[view]?.warnings || []}
                fetchTime={result[view]?.fetchTime}
                finalUrl={result[view]?.finalUrl}
                userAgent={result[view]?.userAgent}
                timing={result[view]?.timing}
              />
            </div>
          )}
        </div>
      )}
      {/* Error State */}
      {error && (
        <div className="w-full max-w-4xl backdrop-blur-xl bg-red-50/70 dark:bg-red-900/20 border border-red-200/50 dark:border-red-700/50 rounded-2xl p-6 mt-6 shadow-xl">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">❌</span>
            </div>
            <p className="text-red-700 dark:text-red-300 text-center text-lg font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
} 