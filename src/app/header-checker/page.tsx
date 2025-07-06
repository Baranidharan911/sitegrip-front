'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Globe, Shield, Copy, Check, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface HeaderResult {
  status: number;
  statusText: string;
  headers: { [key: string]: string };
  url: string;
}

export default function HeaderCheckerPage() {
  const [url, setUrl] = useState('https://www.sitegrip.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HeaderResult | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [headersExpanded, setHeadersExpanded] = useState(true);

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

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const highlightedHeaders = ['content-type', 'x-robots-tag', 'canonical', 'location', 'cache-control', 'set-cookie'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <Shield className="text-white" size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-lg">
              HTTP Header Checker
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Analyze HTTP response headers and status codes
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full px-5 py-3 pl-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow"
              />
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl text-base flex items-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Checking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield size={20} />
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
            className="space-y-6"
          >
            {/* Status */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Response Status</h3>
                <div className={`px-4 py-1 rounded-full text-lg font-bold ${getStatusColor(result.status)} animate-pulse shadow-md`}> {result.status} {result.statusText} </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Final URL: {result.url}</p>
            </div>

            {/* Headers - Collapsible */}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer select-none" onClick={() => setHeadersExpanded((v) => !v)}>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">HTTP Headers</h3>
                  <span className="text-xs text-blue-500">({Object.keys(result.headers).length})</span>
                </div>
                {headersExpanded ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-blue-500" />}
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
                          className={`flex items-start justify-between gap-2 p-4 last:border-b-0 transition-colors duration-150 ${isHighlighted ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-base font-medium text-gray-800 dark:text-gray-200">
                                {key}
                              </span>
                              {isHighlighted && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 animate-pulse">
                                  <CheckCircle size={12} className="mr-1" />
                                  Important
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-gray-600 dark:text-gray-400 mt-1 break-all">
                              {value}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(value, key)}
                            className="ml-2 p-1 rounded bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shadow hover:bg-blue-100 dark:hover:bg-blue-900/30 transition flex items-center gap-1"
                          >
                            {copiedStates[key] ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => handleCopy(JSON.stringify(result.headers, null, 2), 'headers')}
                  className="flex items-center gap-1 px-4 py-2 text-xs bg-white/80 dark:bg-gray-800/80 rounded shadow hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                >
                  {copiedStates.headers ? <Check size={16} /> : <Copy size={16} />}
                  {copiedStates.headers ? 'Copied!' : 'Copy All'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 