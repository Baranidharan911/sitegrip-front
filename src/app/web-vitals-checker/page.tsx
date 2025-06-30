'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Globe, Gauge, Smartphone, Monitor } from 'lucide-react';

interface WebVitalsResult {
  mobile: {
    lcp: number;
    fid: number;
    cls: number;
    performanceScore: number;
  };
  desktop: {
    lcp: number;
    fid: number;
    cls: number;
    performanceScore: number;
  };
  url: string;
}

export default function WebVitalsCheckerPage() {
  const [url, setUrl] = useState('https://www.sitegrip.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebVitalsResult | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Gauge className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Core Web Vitals Checker
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">
            Analyze your website's Core Web Vitals performance metrics
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full px-3 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gauge size={16} />
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
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Performance Scores */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="text-blue-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Mobile Performance</h3>
                </div>
                <div className="flex items-center justify-center">
                  <CircularGauge score={result.mobile.performanceScore} size={120} />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor className="text-purple-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Desktop Performance</h3>
                </div>
                <div className="flex items-center justify-center">
                  <CircularGauge score={result.desktop.performanceScore} size={120} />
                </div>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Core Web Vitals Breakdown</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Mobile Vitals */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="text-blue-500" size={20} />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Mobile</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">LCP (Largest Contentful Paint)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading performance</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatLCP(result.mobile.lcp)}</p>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              result.mobile.lcp <= 2500 ? 'bg-green-500' : 
                              result.mobile.lcp <= 4000 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (result.mobile.lcp / 4000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">FID (First Input Delay)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Interactivity</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatFID(result.mobile.fid)}</p>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              result.mobile.fid <= 100 ? 'bg-green-500' : 
                              result.mobile.fid <= 300 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (result.mobile.fid / 300) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">CLS (Cumulative Layout Shift)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Visual stability</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCLS(result.mobile.cls)}</p>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              result.mobile.cls <= 0.1 ? 'bg-green-500' : 
                              result.mobile.cls <= 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (result.mobile.cls / 0.25) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Vitals */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Monitor className="text-purple-500" size={20} />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Desktop</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">LCP (Largest Contentful Paint)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading performance</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatLCP(result.desktop.lcp)}</p>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              result.desktop.lcp <= 2500 ? 'bg-green-500' : 
                              result.desktop.lcp <= 4000 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (result.desktop.lcp / 4000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">FID (First Input Delay)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Interactivity</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatFID(result.desktop.fid)}</p>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              result.desktop.fid <= 100 ? 'bg-green-500' : 
                              result.desktop.fid <= 300 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (result.desktop.fid / 300) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">CLS (Cumulative Layout Shift)</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Visual stability</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCLS(result.desktop.cls)}</p>
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              result.desktop.cls <= 0.1 ? 'bg-green-500' : 
                              result.desktop.cls <= 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (result.desktop.cls / 0.25) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 