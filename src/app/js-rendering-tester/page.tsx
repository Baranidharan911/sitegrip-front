'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Code2, FileText, Zap, ChevronDown, ChevronRight, Copy, Check, Globe } from 'lucide-react';

interface ComparisonResult {
  initialHtml: string;
  renderedHtml: string;
  differences: number;
}

export default function JsRenderingTesterPage() {
  const [url, setUrl] = useState('https://www.sitegrip.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<'initial' | 'rendered' | 'diff'>('diff');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    head: false,
    body: true,
    scripts: false
  });
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/js-rendering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      const data = await res.json();
      
      // Calculate rough differences
      const differences = Math.abs(data.renderedHtml.length - data.initialHtml.length);
      
      setResult({
        initialHtml: data.initialHtml,
        renderedHtml: data.renderedHtml,
        differences
      });
      setActiveTab('diff');
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const extractSection = (html: string, tag: string) => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = html.match(regex);
    return match ? match[0] : `<${tag}></${tag}>`;
  };

  const formatHtml = (html: string) => {
    // First, format the HTML with proper line breaks and indentation
    let formatted = html
      .replace(/></g, '>\n<')  // Add line breaks between tags
      .replace(/^\s+|\s+$/gm, '')  // Remove leading/trailing whitespace from each line
      .split('\n')
      .map((line, index) => {
        // Simple indentation based on tag depth
        const openTags = (line.match(/</g) || []).length;
        const closeTags = (line.match(/\//g) || []).length;
        const indent = Math.max(0, index * 0.5 - closeTags * 0.5);
        return '  '.repeat(Math.floor(indent)) + line.trim();
      })
      .join('\n');

    // Then apply syntax highlighting
    return formatted
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?[^&gt;]+&gt;)/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>')
      .replace(/(=")([^"]*?)(")/g, '=$1<span class="text-green-600 dark:text-green-400">$2</span>$3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Compact Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Code2 className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              JS Rendering Tester
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">
            Compare raw HTML with JavaScript-rendered DOM
          </p>
        </motion.div>

        {/* Compact URL Input */}
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
                className="w-full px-3 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Testing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={16} />
                  Test
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Compact Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}

        {/* Compact Results */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Compact Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-3 text-white text-center">
                <FileText size={20} className="mx-auto mb-1" />
                <p className="text-xs text-blue-100">Initial</p>
                <p className="text-lg font-bold">{(result.initialHtml.length / 1024).toFixed(1)}KB</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3 text-white text-center">
                <Code2 size={20} className="mx-auto mb-1" />
                <p className="text-xs text-green-100">Rendered</p>
                <p className="text-lg font-bold">{(result.renderedHtml.length / 1024).toFixed(1)}KB</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-3 text-white text-center">
                <Zap size={20} className="mx-auto mb-1" />
                <p className="text-xs text-purple-100">Difference</p>
                <p className="text-lg font-bold">+{(result.differences / 1024).toFixed(1)}KB</p>
              </div>
            </div>

            {/* Compact Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'initial', label: 'Initial', icon: FileText },
                  { id: 'rendered', label: 'Rendered', icon: Code2 },
                  { id: 'diff', label: 'Compare', icon: Zap }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'initial' && (
                    <motion.div
                      key="initial"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Raw HTML Source</h3>
                        <button
                          onClick={() => handleCopy(result.initialHtml, 'initial')}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          {copiedStates.initial ? <Check size={12} /> : <Copy size={12} />}
                          {copiedStates.initial ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-auto h-[50vh] font-mono text-xs">
                        <pre dangerouslySetInnerHTML={{ __html: formatHtml(result.initialHtml) }} />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'rendered' && (
                    <motion.div
                      key="rendered"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">JavaScript-Rendered DOM</h3>
                        <button
                          onClick={() => handleCopy(result.renderedHtml, 'rendered')}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          {copiedStates.rendered ? <Check size={12} /> : <Copy size={12} />}
                          {copiedStates.rendered ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 overflow-auto h-[50vh] font-mono text-xs">
                        <pre dangerouslySetInnerHTML={{ __html: formatHtml(result.renderedHtml) }} />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'diff' && (
                    <motion.div
                      key="diff"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Side-by-Side Comparison</h3>
                      
                      {/* Head Section */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSection('head')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm"
                        >
                          <span className="font-medium text-gray-800 dark:text-gray-200">HTML Head</span>
                          {expandedSections.head ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        {expandedSections.head && (
                          <div className="p-3 grid md:grid-cols-2 gap-3">
                            <div>
                              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Initial</h4>
                              <div className="bg-red-50 dark:bg-red-900/20 rounded p-2 font-mono text-xs overflow-auto max-h-32">
                                <pre dangerouslySetInnerHTML={{ __html: formatHtml(extractSection(result.initialHtml, 'head')) }} />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Rendered</h4>
                              <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 font-mono text-xs overflow-auto max-h-32">
                                <pre dangerouslySetInnerHTML={{ __html: formatHtml(extractSection(result.renderedHtml, 'head')) }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Body Section */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSection('body')}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition text-sm"
                        >
                          <span className="font-medium text-gray-800 dark:text-gray-200">HTML Body</span>
                          {expandedSections.body ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        {expandedSections.body && (
                          <div className="p-3 grid md:grid-cols-2 gap-3">
                            <div>
                              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Initial</h4>
                              <div className="bg-red-50 dark:bg-red-900/20 rounded p-2 font-mono text-xs overflow-auto max-h-40">
                                <pre dangerouslySetInnerHTML={{ __html: formatHtml(extractSection(result.initialHtml, 'body').slice(0, 1500) + '...') }} />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Rendered</h4>
                              <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 font-mono text-xs overflow-auto max-h-40">
                                <pre dangerouslySetInnerHTML={{ __html: formatHtml(extractSection(result.renderedHtml, 'body').slice(0, 1500) + '...') }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 