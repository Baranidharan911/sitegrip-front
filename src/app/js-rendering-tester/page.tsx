'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Code2, FileText, Zap, ChevronDown, ChevronRight, Copy, Check, Globe } from 'lucide-react';
import { Tab } from '@headlessui/react';

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

  // Add tab state for modern tabbed interface
  const tabList = [
    { key: 'diff', label: 'Diff', icon: <Zap className="w-4 h-4 mr-1 text-purple-500" /> },
    { key: 'initial', label: 'Initial HTML', icon: <FileText className="w-4 h-4 mr-1 text-blue-500" /> },
    { key: 'rendered', label: 'Rendered HTML', icon: <Code2 className="w-4 h-4 mr-1 text-green-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Code2 className="text-white" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-lg">
              JS Rendering Tester
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto">
            Compare raw HTML with JavaScript-rendered DOM
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

        {/* Results with animated tabs and syntax highlighting */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Stats */}
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

            {/* Animated Tabs */}
            <Tab.Group>
              <Tab.List className="flex space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
                {tabList.map((tab, idx) => (
                  <Tab
                    key={tab.key}
                    className={({ selected }) =>
                      `flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none ${selected ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`
                    }
                  >
                    {tab.icon}{tab.label}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                {/* Diff Tab */}
                <Tab.Panel>
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="font-bold mb-2">HTML Length Difference</h3>
                    <p className="mb-4">{result.differences} characters difference between initial and rendered HTML.</p>
                    {/* Animated diff visualization (simple) */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Initial HTML</h4>
                        <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto text-xs border border-gray-200 dark:border-gray-700">
                          {result.initialHtml.slice(0, 500)}{result.initialHtml.length > 500 ? '... (truncated)' : ''}
                        </pre>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Rendered HTML</h4>
                        <pre className="bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-x-auto text-xs border border-gray-200 dark:border-gray-700">
                          {result.renderedHtml.slice(0, 500)}{result.renderedHtml.length > 500 ? '... (truncated)' : ''}
                        </pre>
                      </div>
                    </div>
                  </div>
                </Tab.Panel>
                {/* Initial HTML Tab */}
                <Tab.Panel>
                  <div className="relative">
                    <button
                      onClick={() => handleCopy(result.initialHtml, 'initial')}
                      className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-1"
                    >
                      {copiedStates.initial ? <Check size={12} /> : <Copy size={12} />}
                      {copiedStates.initial ? 'Copied!' : 'Copy'}
                    </button>
                    <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto text-xs border border-gray-200 dark:border-gray-700 mt-6">
                      {result.initialHtml}
                    </pre>
                  </div>
                </Tab.Panel>
                {/* Rendered HTML Tab */}
                <Tab.Panel>
                  <div className="relative">
                    <button
                      onClick={() => handleCopy(result.renderedHtml, 'rendered')}
                      className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-1"
                    >
                      {copiedStates.rendered ? <Check size={12} /> : <Copy size={12} />}
                      {copiedStates.rendered ? 'Copied!' : 'Copy'}
                    </button>
                    <pre className="bg-gray-100 dark:bg-gray-800 rounded p-4 overflow-x-auto text-xs border border-gray-200 dark:border-gray-700 mt-6">
                      {result.renderedHtml}
                    </pre>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </motion.div>
        )}
      </div>
    </div>
  );
} 