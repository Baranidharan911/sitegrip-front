"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Code2, FileText, Zap, ChevronDown, ChevronRight, Copy, Check, Globe, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { Tab } from '@headlessui/react';

export const dynamic = 'force-dynamic';

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
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [expandedView, setExpandedView] = useState(false);
  const [showAllDiff, setShowAllDiff] = useState(false);

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

  const formatHtml = (html: string) => {
    // Format HTML with proper indentation and line breaks
    let depth = 0;
    const lines = html
      .replace(/></g, '>\n<')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return lines.map((line, index) => {
      if (line.startsWith('</')) depth = Math.max(0, depth - 1);
      const indentedLine = '  '.repeat(depth) + line;
      if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
        depth++;
      }
      return { line: indentedLine, number: index + 1 };
    });
  };

  const highlightSyntax = (html: string) => {
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?)([\w-]+)([^&gt;]*&gt;)/g, '<span class="text-blue-600 dark:text-blue-400">$1</span><span class="text-purple-600 dark:text-purple-400">$2</span><span class="text-blue-600 dark:text-blue-400">$3</span>')
      .replace(/([\w-]+)(=)("?)([^"&gt;\s]*)\3?/g, '<span class="text-green-600 dark:text-green-400">$1</span><span class="text-gray-500">$2</span><span class="text-orange-600 dark:text-orange-400">$3$4$3</span>');
  };

  const findDifferences = (initial: string, rendered: string) => {
    const initialLines = formatHtml(initial);
    const renderedLines = formatHtml(rendered);
    
    const changes = [];
    const maxLength = Math.max(initialLines.length, renderedLines.length);
    
    for (let i = 0; i < maxLength; i++) {
      const initialLine = initialLines[i]?.line || '';
      const renderedLine = renderedLines[i]?.line || '';
      
      if (initialLine !== renderedLine) {
        changes.push({
          lineNumber: i + 1,
          type: !initialLine ? 'added' : !renderedLine ? 'removed' : 'modified',
          initial: initialLine,
          rendered: renderedLine
        });
      }
    }
    
    return changes.slice(0, 50); // Limit to first 50 changes
  };

  const tabList = [
    { key: 'diff', label: 'Diff Analysis', icon: <Zap className="w-4 h-4 mr-1 text-purple-500" /> },
    { key: 'initial', label: 'Initial HTML', icon: <FileText className="w-4 h-4 mr-1 text-blue-500" /> },
    { key: 'rendered', label: 'Rendered HTML', icon: <Code2 className="w-4 h-4 mr-1 text-green-500" /> },
  ];

  const CodeBlock = ({ html, title, copyKey }: { html: string; title: string; copyKey: string }) => {
    const formattedLines = formatHtml(html);
    
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            {title}
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              {formattedLines.length} lines
            </span>
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Toggle line numbers"
            >
              {showLineNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={() => setExpandedView(!expandedView)}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Toggle expanded view"
            >
              {expandedView ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={() => handleCopy(html, copyKey)}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Copy to clipboard"
            >
              {copiedStates[copyKey] ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className={`relative bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden`}>
          <div className="overflow-auto max-h-[60vh]">
            <pre className="text-xs font-mono leading-relaxed">
              {formattedLines.map((lineData, index) => (
                <div key={index} className="flex hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {showLineNumbers && (
                    <span className="select-none text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-3 py-1 text-right min-w-[60px] border-r border-gray-200 dark:border-gray-700">
                      {lineData.number}
                    </span>
                  )}
                  <span 
                    className="flex-1 px-4 py-1 text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: highlightSyntax(lineData.line) }}
                  />
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  // Memoize diff calculation
  const diffLines = useMemo(() => result ? findDifferences(result.initialHtml, result.renderedHtml) : [], [result]);
  const displayedDiffs = showAllDiff ? diffLines : diffLines.slice(0, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
              <Code2 className="text-white" size={28} />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
              JS Rendering Tester
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Compare raw HTML with JavaScript-rendered DOM
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full px-5 py-3 pl-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base shadow"
              />
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl text-base flex items-center gap-2 justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span className="hidden sm:inline">Testing...</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Test
                </>
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
            {/* Stats - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-gradient-to-br from-blue-500/90 to-cyan-500/90 backdrop-blur-md rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Initial</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{(result.initialHtml.length / 1024).toFixed(1)}KB</p>
                  <p className="text-sm text-blue-100">{result.initialHtml.split('\n').length} lines</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/90 to-emerald-500/90 backdrop-blur-md rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Code2 size={20} />
                  </div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Rendered</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{(result.renderedHtml.length / 1024).toFixed(1)}KB</p>
                  <p className="text-sm text-green-100">{result.renderedHtml.split('\n').length} lines</p>
                </div>
              </div>
            </div>
            
            {/* Difference Section - Column Layout */}
            <div className="bg-gradient-to-br from-purple-500/90 to-pink-500/90 backdrop-blur-md rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Zap size={20} />
                  </div>
                  <h3 className="text-lg font-semibold">HTML Difference Analysis</h3>
                </div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Comparison</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    {result.differences > 0 ? '+' : result.differences < 0 ? '-' : ''}
                    {(Math.abs(result.differences) / 1024).toFixed(1)}KB
                  </div>
                  <div className="text-xs text-purple-100">Size Change</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    {result.renderedHtml.split('\n').length - result.initialHtml.split('\n').length > 0 ? '+' : ''}
                    {result.renderedHtml.split('\n').length - result.initialHtml.split('\n').length}
                  </div>
                  <div className="text-xs text-purple-100">Line Changes</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    {result.differences > 0 ? '+' : result.differences < 0 ? '-' : ''}
                    {result.differences.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-100">Characters</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold mb-1">
                    {((Math.abs(result.differences) / result.initialHtml.length) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-100">Change Ratio</div>
                </div>
              </div>
            </div>

            {/* Tabbed Interface */}
            <Tab.Group>
              <Tab.List className="flex flex-wrap gap-2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-2 shadow-inner">
                {tabList.map((tab) => (
                  <Tab
                    key={tab.key}
                    className={({ selected }) =>
                      `flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none whitespace-nowrap ${
                        selected 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-700/60'
                      }`
                    }
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </Tab>
                ))}
              </Tab.List>
              
              <Tab.Panels className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                {/* Diff Analysis Tab */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">HTML Comparison Analysis</h3>
                      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Initial: {(result.initialHtml.length / 1024).toFixed(1)}KB</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Rendered: {(result.renderedHtml.length / 1024).toFixed(1)}KB</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Difference: {result.differences > 0 ? '+' : result.differences < 0 ? '-' : ''}{(Math.abs(result.differences) / 1024).toFixed(1)}KB</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Analysis Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Analysis Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Character Change:</span>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {result.differences > 0 ? '+' : result.differences < 0 ? '-' : ''}
                            {result.differences.toLocaleString()} chars
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Line Change:</span>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {result.renderedHtml.split('\n').length - result.initialHtml.split('\n').length > 0 ? '+' : ''}
                            {result.renderedHtml.split('\n').length - result.initialHtml.split('\n').length} lines
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Initial Lines:</span>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {result.initialHtml.split('\n').length}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Rendered Lines:</span>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {result.renderedHtml.split('\n').length}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Individual HTML Content Cards */}
                    <div className="space-y-6">
                      {/* Initial HTML Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Initial HTML</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Raw server response • {result.initialHtml.split('\n').length} lines</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopy(result.initialHtml, 'initialHtmlDiff')}
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-700/50 transition-colors"
                            title="Copy initial HTML"
                          >
                            {copiedStates['initialHtmlDiff'] ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                            <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-80 p-4 leading-relaxed whitespace-pre-wrap">
                              {result.initialHtml.split('\n').slice(0, 100).map((line, index) => (
                                <div key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded px-1">
                                  <span className="text-gray-400 dark:text-gray-600 select-none mr-3 inline-block w-8 text-right">
                                    {index + 1}
                                  </span>
                                  <span dangerouslySetInnerHTML={{ __html: highlightSyntax(line || ' ') }} />
                                </div>
                              ))}
                              {result.initialHtml.split('\n').length > 100 && (
                                <div className="text-gray-400 dark:text-gray-500 text-center py-2 italic">
                                  ... {result.initialHtml.split('\n').length - 100} more lines (switch to "Initial HTML" tab to see full content)
                                </div>
                              )}
                            </pre>
                          </div>
                        </div>
                      </div>
                      
                      {/* Rendered HTML Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Code2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Rendered HTML</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">After JavaScript execution • {result.renderedHtml.split('\n').length} lines</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopy(result.renderedHtml, 'renderedHtmlDiff')}
                            className="p-2 rounded-lg bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-700/50 transition-colors"
                            title="Copy rendered HTML"
                          >
                            {copiedStates['renderedHtmlDiff'] ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                            <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-80 p-4 leading-relaxed whitespace-pre-wrap">
                              {result.renderedHtml.split('\n').slice(0, 100).map((line, index) => (
                                <div key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded px-1">
                                  <span className="text-gray-400 dark:text-gray-600 select-none mr-3 inline-block w-8 text-right">
                                    {index + 1}
                                  </span>
                                  <span dangerouslySetInnerHTML={{ __html: highlightSyntax(line || ' ') }} />
                                </div>
                              ))}
                              {result.renderedHtml.split('\n').length > 100 && (
                                <div className="text-gray-400 dark:text-gray-500 text-center py-2 italic">
                                  ... {result.renderedHtml.split('\n').length - 100} more lines (switch to "Rendered HTML" tab to see full content)
                                </div>
                              )}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Render diff lines (limit to 100, show more button) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="p-4 max-h-[60vh] overflow-auto">
                        {displayedDiffs.length === 0 && (
                          <div className="text-gray-400 text-center py-4">No significant differences found.</div>
                        )}
                        {displayedDiffs.map((diff, idx) => (
                          <div key={idx} className={`flex items-start gap-2 py-1 px-2 rounded transition-colors ${diff.type === 'added' ? 'bg-green-50 dark:bg-green-900/20' : diff.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                            <span className="text-xs text-gray-400 w-10 text-right select-none">{diff.lineNumber}</span>
                            <span className="flex-1 font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                              {diff.type === 'added' && <span className="text-green-600 dark:text-green-400 mr-2">[+]</span>}
                              {diff.type === 'removed' && <span className="text-red-600 dark:text-red-400 mr-2">[-]</span>}
                              {diff.type === 'modified' && <span className="text-yellow-600 dark:text-yellow-400 mr-2">[~]</span>}
                              <span dangerouslySetInnerHTML={{ __html: highlightSyntax(diff.rendered || diff.initial) }} />
                            </span>
                          </div>
                        ))}
                        {!showAllDiff && diffLines.length > 100 && (
                          <div className="flex justify-center mt-4">
                            <button
                              className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow hover:from-purple-600 hover:to-blue-600 transition-all"
                              onClick={() => setShowAllDiff(true)}
                            >
                              Show More ({diffLines.length - 100} more)
                            </button>
                          </div>
                        )}
                        {showAllDiff && diffLines.length > 100 && (
                          <div className="flex justify-center mt-4">
                            <button
                              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                              onClick={() => setShowAllDiff(false)}
                            >
                              Show Less
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Tab.Panel>
                
                {/* Initial HTML Tab */}
                <Tab.Panel>
                  <CodeBlock 
                    html={result.initialHtml} 
                    title="Initial HTML Source" 
                    copyKey="initialHtmlFull" 
                  />
                </Tab.Panel>
                
                {/* Rendered HTML Tab */}
                <Tab.Panel>
                  <CodeBlock 
                    html={result.renderedHtml} 
                    title="JavaScript Rendered HTML" 
                    copyKey="renderedHtmlFull" 
                  />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </motion.div>
        )}
      </div>
    </div>
  );
} 