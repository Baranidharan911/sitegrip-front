"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Globe, Shield, Copy, Check, AlertCircle, CheckCircle, ChevronDown, ChevronUp, FileText, Share2, Printer, Download, Link } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

// Import Firebase and export utilities
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { exportComponentToPDF } from '@/utils/exportPDF';

export const dynamic = 'force-dynamic';

interface HeaderResult {
  status: number;
  statusText: string;
  headers: { [key: string]: string };
  url: string;
  audit?: Record<string, {
    label: string;
    present: boolean;
    value: string | null;
    status: 'pass' | 'warn' | 'fail';
    explanation: string;
    docs: string;
    required: boolean;
  }>;
  structuredData?: {
    jsonLd: Array<{
      type: string;
      context: string;
      content: any;
      validation: {
        valid: boolean;
        errors: string[];
        warnings: string[];
      };
      index: number;
    }>;
    rdfa: Array<{
      content: string;
      index: number;
      validation: {
        valid: boolean;
        errors: string[];
      };
    }>;
    microdata: Array<{
      content: string;
      index: number;
      validation: {
        valid: boolean;
        errors: string[];
      };
    }>;
    summary: {
      total: number;
      jsonLdCount: number;
      rdfaCount: number;
      microdataCount: number;
      hasOrganization: boolean;
      hasWebPage: boolean;
      hasArticle: boolean;
      hasProduct: boolean;
      hasBreadcrumb: boolean;
      hasLocalBusiness: boolean;
      hasEvent: boolean;
      hasReview: boolean;
    };
  };
  canonicalAnalysis?: {
    present: boolean;
    count: number;
    urls: string[];
    issues: string[];
    recommendations: string[];
    status: 'pass' | 'warn' | 'fail';
  };
}

export default function HeaderCheckerPage() {
  const [url, setUrl] = useState('https://www.sitegrip.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [headersExpanded, setHeadersExpanded] = useState(true);

  // Add state for user and saved reports
  const [user, setUser] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  // On mount, listen for auth state and load saved reports
  useEffect(() => {
    if (!auth) return;
    
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadReports(u.uid);
      else setSavedReports([]);
    });
    return () => unsub();
  }, []);

  const loadReports = async (uid: string) => {
    if (!db) return;
    const q = query(collection(db, 'headerReports'), where('uid', '==', uid), orderBy('created', 'desc'), limit(10));
    const snap = await getDocs(q);
    setSavedReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const saveReport = async (data: any) => {
    if (!db) return;
    await addDoc(collection(db, 'headerReports'), data);
  };

  // On successful result, save to Firestore
  useEffect(() => {
    if (result && url) {
      const save = async () => {
        if (!db) return;
        await addDoc(collection(db, 'headerReports'), {
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
      const res = await fetch('/api/header-checker', {
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

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Export/share/report functions
  const handleExportPDF = () => exportComponentToPDF('header-checker-dashboard', 'header-checker-report.pdf');
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'header-checker-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handlePrint = () => window.print();
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?url=' + encodeURIComponent(url));
    alert('Shareable link copied!');
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const highlightedHeaders = ['content-type', 'x-robots-tag', 'canonical', 'location', 'cache-control', 'set-cookie'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] p-2 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Shield className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
              HTTP Header Checker
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto px-4">
            Analyze HTTP response headers and status codes
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
                  Checking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  Check
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
          <div id="header-checker-dashboard" className="px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Export/share/report buttons */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
                <button
                  onClick={handleExportPDF}
                  className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  <span className="hidden sm:inline">Export JSON</span>
                  <span className="sm:hidden">JSON</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  <span className="hidden sm:inline">Print Report</span>
                  <span className="sm:hidden">Print</span>
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 sm:px-6 py-2 rounded-full font-semibold text-xs sm:text-base transition-all duration-200 focus:outline-none shadow bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-1 sm:gap-2"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" /> 
                  <span className="hidden sm:inline">Share Link</span>
                  <span className="sm:hidden">Share</span>
                </button>
              </div>

              {/* Status */}
              <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Response Status</h3>
                  <div className={`px-3 sm:px-4 py-1 rounded-full text-base sm:text-lg font-bold ${getStatusColor(result.status)} animate-pulse shadow-md text-center`}> 
                    {result.status} {result.statusText} 
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 break-all">Final URL: {result.url}</p>
              </div>

              {/* Security Headers Audit */}
              {result.audit && (
                <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                        <Shield className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Headers Audit</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Analysis of security best practices</p>
                      </div>
                    </div>
                    
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {(() => {
                        const stats = {
                          pass: Object.values(result.audit).filter(h => h.status === 'pass').length,
                          warn: Object.values(result.audit).filter(h => h.status === 'warn').length,
                          fail: Object.values(result.audit).filter(h => h.status === 'fail').length,
                          total: Object.keys(result.audit).length
                        };
                        return (
                          <>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.pass}</div>
                              <div className="text-xs text-green-600 dark:text-green-400">Pass</div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.warn}</div>
                              <div className="text-xs text-yellow-600 dark:text-yellow-400">Warning</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.fail}</div>
                              <div className="text-xs text-red-600 dark:text-red-400">Fail</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.total}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Audit Results */}
                    <div className="space-y-3">
                      {Object.entries(result.audit).map(([key, header]) => {
                        const statusColors = {
                          pass: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10',
                          warn: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10',
                          fail: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                        };
                        const statusIcons = {
                          pass: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
                          warn: <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
                          fail: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        };
                        
                        return (
                          <div key={key} className={`border rounded-lg p-4 ${statusColors[header.status]}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {statusIcons[header.status]}
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                    {header.label}
                                  </h4>
                                  {header.required && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                      Required
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    header.status === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                    header.status === 'warn' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                  }`}>
                                    {header.status.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 break-words">
                                  {header.explanation}
                                </p>
                                {header.value && (
                                  <div className="bg-white/80 dark:bg-gray-800/80 rounded p-2 mb-2">
                                    <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                                      {header.value}
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <a
                                    href={header.docs}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3" />
                                    Learn More
                                  </a>
                                  {header.value && (
                                    <button
                                      onClick={() => handleCopy(header.value!, key)}
                                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                                    >
                                      {copiedStates[key] ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      {copiedStates[key] ? 'Copied!' : 'Copy'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Canonical Tag Analysis */}
              {result.canonicalAnalysis && (
                <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
                        <Link className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Canonical Tag Analysis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Checks for canonical tag presence, duplicates, and misuse</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        result.canonicalAnalysis.status === 'pass' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        result.canonicalAnalysis.status === 'warn' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {result.canonicalAnalysis.status === 'pass' && <CheckCircle className="w-4 h-4 mr-1" />}
                        {result.canonicalAnalysis.status === 'warn' && <AlertCircle className="w-4 h-4 mr-1" />}
                        {result.canonicalAnalysis.status === 'fail' && <AlertCircle className="w-4 h-4 mr-1" />}
                        {result.canonicalAnalysis.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{result.canonicalAnalysis.count} found</span>
                    </div>
                    {result.canonicalAnalysis.urls.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Canonical URLs:</h4>
                        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          {result.canonicalAnalysis.urls.map((url, i) => (
                            <li key={i} className="break-all flex items-center gap-2">
                              <Link className="w-3 h-3 text-pink-500" />
                              <span>{url}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.canonicalAnalysis.issues.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-red-700 dark:text-red-400 text-xs mb-1">Issues:</h4>
                        <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                          {result.canonicalAnalysis.issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <AlertCircle className="w-3 h-3 mt-0.5" />
                              <span className="break-words">{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.canonicalAnalysis.recommendations.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 text-xs mb-1">Recommendations:</h4>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                          {result.canonicalAnalysis.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <Check className="w-3 h-3 mt-0.5" />
                              <span className="break-words">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Structured Data Analysis */}
              {result.structuredData && (
                <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                        <FileText className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Structured Data Analysis</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Schema.org, JSON-LD, RDFa, and Microdata detection</p>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.structuredData.summary.total}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">Total Items</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.structuredData.summary.jsonLdCount}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">JSON-LD</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{result.structuredData.summary.rdfaCount}</div>
                        <div className="text-xs text-purple-600 dark:text-purple-400">RDFa</div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{result.structuredData.summary.microdataCount}</div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">Microdata</div>
                      </div>
                    </div>

                    {/* Schema Types Found */}
                    {Object.entries(result.structuredData.summary).some(([key, value]) => key.startsWith('has') && value) && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Schema Types Found</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.structuredData.summary.hasOrganization && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              Organization
                            </span>
                          )}
                          {result.structuredData.summary.hasWebPage && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              WebPage
                            </span>
                          )}
                          {result.structuredData.summary.hasArticle && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                              Article
                            </span>
                          )}
                          {result.structuredData.summary.hasProduct && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                              Product
                            </span>
                          )}
                          {result.structuredData.summary.hasBreadcrumb && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                              Breadcrumb
                            </span>
                          )}
                          {result.structuredData.summary.hasLocalBusiness && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
                              LocalBusiness
                            </span>
                          )}
                          {result.structuredData.summary.hasEvent && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300">
                              Event
                            </span>
                          )}
                          {result.structuredData.summary.hasReview && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300">
                              Review
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* JSON-LD Results */}
                    {result.structuredData.jsonLd.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          JSON-LD Structured Data ({result.structuredData.jsonLd.length})
                        </h4>
                        <div className="space-y-3">
                          {result.structuredData.jsonLd.map((item, index) => (
                            <div key={index} className={`border rounded-lg p-4 ${
                              item.validation.valid ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {item.type} ({item.context})
                                </h5>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  item.validation.valid ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                }`}>
                                  {item.validation.valid ? 'Valid' : 'Issues Found'}
                                </span>
                              </div>
                              
                              {item.validation.errors.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Errors:</p>
                                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                                    {item.validation.errors.map((error, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <span className="text-red-500 mt-0.5">•</span>
                                        <span className="break-words">{error}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {item.validation.warnings.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Warnings:</p>
                                  <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                                    {item.validation.warnings.map((warning, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <span className="text-yellow-500 mt-0.5">•</span>
                                        <span className="break-words">{warning}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div className="bg-white/80 dark:bg-gray-800/80 rounded p-2">
                                <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                                  {JSON.stringify(item.content, null, 2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RDFa Results */}
                    {result.structuredData.rdfa.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          RDFa Structured Data ({result.structuredData.rdfa.length})
                        </h4>
                        <div className="space-y-2">
                          {result.structuredData.rdfa.slice(0, 5).map((item, index) => (
                            <div key={index} className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 rounded p-3">
                              <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                                {item.content}
                              </p>
                            </div>
                          ))}
                          {result.structuredData.rdfa.length > 5 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              Showing first 5 of {result.structuredData.rdfa.length} RDFa elements
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Microdata Results */}
                    {result.structuredData.microdata.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-orange-600" />
                          Microdata ({result.structuredData.microdata.length})
                        </h4>
                        <div className="space-y-2">
                          {result.structuredData.microdata.slice(0, 5).map((item, index) => (
                            <div key={index} className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10 rounded p-3">
                              <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                                {item.content}
                              </p>
                            </div>
                          ))}
                          {result.structuredData.microdata.length > 5 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              Showing first 5 of {result.structuredData.microdata.length} microdata elements
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* No Structured Data Found */}
                    {result.structuredData.summary.total === 0 && (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Structured Data Found</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          This page doesn't contain any structured data (JSON-LD, RDFa, or Microdata).
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Recommendations:</h5>
                          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            <li>• Add JSON-LD structured data for better SEO</li>
                            <li>• Include Organization and WebPage schemas</li>
                            <li>• Add schema markup for articles, products, or events</li>
                            <li>• Use Google's Structured Data Testing Tool to validate</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Headers - Collapsible */}
              <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer select-none" onClick={() => setHeadersExpanded((v) => !v)}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">HTTP Headers</h3>
                    <span className="text-xs text-purple-500">({Object.keys(result.headers).length})</span>
                  </div>
                  {headersExpanded ? <ChevronUp className="w-5 h-5 text-purple-500" /> : <ChevronDown className="w-5 h-5 text-purple-500" />}
                </div>
                <AnimatePresence initial={false}>
                  {headersExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700"
                    >
                      {Object.entries(result.headers).map(([key, value]) => {
                        const isHighlighted = highlightedHeaders.includes(key.toLowerCase());
                        return (
                          <div
                            key={key}
                            className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3 sm:p-4 last:border-b-0 transition-colors duration-150 ${isHighlighted ? 'bg-purple-50 dark:bg-purple-900/10 border-l-4 border-l-purple-500' : ''}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm sm:text-base font-medium text-gray-900 dark:text-white break-all">
                                  {key}
                                </span>
                                {isHighlighted && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 animate-pulse flex-shrink-0">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Important
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
                                {value}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCopy(value, key)}
                              className="self-end sm:self-auto ml-0 sm:ml-2 p-1 rounded bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shadow hover:bg-purple-100 dark:hover:bg-purple-900/30 transition flex items-center gap-1"
                            >
                              {copiedStates[key] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button
                    onClick={() => handleCopy(JSON.stringify(result.headers, null, 2), 'headers')}
                    className="flex items-center gap-1 px-3 sm:px-4 py-2 text-xs bg-white/80 dark:bg-gray-800/80 rounded shadow hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
                  >
                    {copiedStates.headers ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedStates.headers ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
              </div>

              {/* Recent Reports (if user is logged in) */}
              {user && savedReports.length > 0 && (
                <div className="bg-white/80 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h3>
                  <div className="space-y-2">
                    {savedReports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{report.url}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Status: {report.result?.status} • {report.created?.toDate?.()?.toLocaleDateString() || 'Recently'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setUrl(report.url);
                            setResult(report.result);
                          }}
                          className="self-end sm:self-auto px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 