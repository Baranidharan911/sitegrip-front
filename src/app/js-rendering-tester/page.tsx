"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Code2, FileText, Zap, ChevronDown, ChevronRight, Copy, Check, Globe, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { Tab } from '@headlessui/react';
import * as DiffDOM from 'diff-dom';
import jsPDF from 'jspdf';
import { Sparkles, FileText as FileTextIcon, Zap as ZapIcon, Eye as EyeIcon, Image as ImageIcon, Accessibility, Code2 as Code2Icon, Link as LinkIcon, Shield, BarChart3, CheckCircle, Star, TrendingUp, Globe as GlobeIcon, FileDown, Share2, Download, SlidersHorizontal } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ComparisonResult {
  initialHtml: string;
  renderedHtml: string;
  differences: number;
}

// Add a helper to compute DOM diff summary
const getDomDiffSummary = (initialHtml: string, renderedHtml: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const parser = new window.DOMParser();
    const initialDoc = parser.parseFromString(initialHtml, 'text/html');
    const renderedDoc = parser.parseFromString(renderedHtml, 'text/html');
    const dd = new DiffDOM.DiffDOM();
    const diffs = dd.diff(initialDoc.body, renderedDoc.body);
    // Summarize changes
    let added = 0, removed = 0, changed = 0, attrChanged = 0;
    diffs.forEach((diff: any) => {
      if (diff.action === 'addElement') added++;
      else if (diff.action === 'removeElement') removed++;
      else if (diff.action === 'modifyElement') changed++;
      else if (diff.action === 'modifyAttribute' || diff.action === 'removeAttribute' || diff.action === 'addAttribute') attrChanged++;
    });
    return { added, removed, changed, attrChanged, diffs };
  } catch (e) {
    return null;
  }
};

// Helper to extract SEO-relevant tags from HTML string
const extractSEOTags = (html: string) => {
  if (typeof window === 'undefined') return {};
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const getMeta = (name: string, attr = 'name') => {
    const el = doc.querySelector(`meta[${attr}='${name}']`);
    return el ? el.getAttribute('content') || '' : '';
  };
  const getLink = (rel: string) => {
    const el = doc.querySelector(`link[rel='${rel}']`);
    return el ? el.getAttribute('href') || '' : '';
  };
  const getAllMeta = (prefix: string, attr = 'property') => {
    const metas = Array.from(doc.querySelectorAll(`meta[${attr}^='${prefix}']`));
    return metas.reduce((acc, el) => {
      const key = el.getAttribute(attr) || '';
      acc[key] = el.getAttribute('content') || '';
      return acc;
    }, {} as Record<string, string>);
  };
  // Hreflang links
  const hreflangs = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]')).map(el => ({
    hreflang: el.getAttribute('hreflang') || '',
    href: el.getAttribute('href') || ''
  }));
  return {
    title: doc.querySelector('title')?.textContent || '',
    description: getMeta('description'),
    canonical: getLink('canonical'),
    robots: getMeta('robots'),
    openGraph: getAllMeta('og:', 'property'),
    twitter: getAllMeta('twitter:', 'name'),
    hreflangs
  };
};

// Helper to compare two sets of SEO tags
const compareSEOTags = (initial: any, rendered: any) => {
  const diffs: any[] = [];
  const keys = ['title', 'description', 'canonical', 'robots'];
  keys.forEach(key => {
    if (initial[key] !== rendered[key]) {
      diffs.push({ tag: key, initial: initial[key], rendered: rendered[key] });
    }
  });
  // OpenGraph
  const ogKeys = new Set([...Object.keys(initial.openGraph || {}), ...Object.keys(rendered.openGraph || {})]);
  ogKeys.forEach(key => {
    if ((initial.openGraph?.[key] || '') !== (rendered.openGraph?.[key] || '')) {
      diffs.push({ tag: `og:${key}`, initial: initial.openGraph?.[key] || '', rendered: rendered.openGraph?.[key] || '' });
    }
  });
  // Twitter
  const twKeys = new Set([...Object.keys(initial.twitter || {}), ...Object.keys(rendered.twitter || {})]);
  twKeys.forEach(key => {
    if ((initial.twitter?.[key] || '') !== (rendered.twitter?.[key] || '')) {
      diffs.push({ tag: `twitter:${key}`, initial: initial.twitter?.[key] || '', rendered: rendered.twitter?.[key] || '' });
    }
  });
  // Hreflang
  const hreflangSet = new Set([
    ...(initial.hreflangs || []).map((h: any) => h.hreflang),
    ...(rendered.hreflangs || []).map((h: any) => h.hreflang)
  ]);
  hreflangSet.forEach(hreflang => {
    const initialHref = (initial.hreflangs || []).find((h: any) => h.hreflang === hreflang)?.href || '';
    const renderedHref = (rendered.hreflangs || []).find((h: any) => h.hreflang === hreflang)?.href || '';
    if (initialHref !== renderedHref) {
      diffs.push({ tag: `hreflang:${hreflang}`, initial: initialHref, rendered: renderedHref });
    }
  });
  return diffs;
};

// Helper to extract visible text content from HTML
const extractVisibleText = (html: string) => {
  if (typeof window === 'undefined') return [];
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // Remove script, style, noscript, and head
  ['script', 'style', 'noscript', 'head', 'title', 'meta', 'link'].forEach(sel => {
    doc.querySelectorAll(sel).forEach(el => el.remove());
  });
  // Get all visible text nodes
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.textContent) return NodeFilter.FILTER_REJECT;
      if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const texts: string[] = [];
  let node;
  while ((node = walker.nextNode())) {
    texts.push(node.textContent!.trim());
  }
  return texts;
};

// Helper to compare visible text content
const compareVisibleText = (initial: string[], rendered: string[]) => {
  const initialSet = new Set(initial);
  const renderedSet = new Set(rendered);
  const onlyInInitial = initial.filter(t => !renderedSet.has(t));
  const onlyInRendered = rendered.filter(t => !initialSet.has(t));
  return { onlyInInitial, onlyInRendered };
};

// Helper to extract resource URLs (scripts, images, links) from HTML
const extractResources = (html: string) => {
  if (typeof window === 'undefined') return { scripts: [], images: [], links: [] };
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const scripts = Array.from(doc.querySelectorAll('script[src]')).map(el => el.getAttribute('src') || '').filter(Boolean);
  const images = Array.from(doc.querySelectorAll('img[src]')).map(el => el.getAttribute('src') || '').filter(Boolean);
  const links = Array.from(doc.querySelectorAll('link[href]')).map(el => el.getAttribute('href') || '').filter(Boolean);
  return { scripts, images, links };
};

// Helper to compare resource lists
const compareResources = (initial: any, rendered: any) => {
  const diff = (a: string[], b: string[]) => a.filter(x => !b.includes(x));
  return {
    scriptsAdded: diff(rendered.scripts, initial.scripts),
    scriptsRemoved: diff(initial.scripts, rendered.scripts),
    imagesAdded: diff(rendered.images, initial.images),
    imagesRemoved: diff(initial.images, rendered.images),
    linksAdded: diff(rendered.links, initial.links),
    linksRemoved: diff(initial.links, rendered.links)
  };
};

// Helper to extract accessibility features from HTML
const extractAccessibility = (html: string) => {
  if (typeof window === 'undefined') return { imagesWithoutAlt: [], ariaElements: [] };
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // Images without alt
  const imagesWithoutAlt = Array.from(doc.querySelectorAll('img')).filter(img => !img.getAttribute('alt')).map(img => img.getAttribute('src') || '[no src]');
  // Elements with ARIA attributes
  const ariaElements = Array.from(doc.querySelectorAll('[aria-label], [aria-labelledby], [aria-hidden], [role]')).map(el => ({
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role') || '',
    ariaLabel: el.getAttribute('aria-label') || '',
    ariaLabelledby: el.getAttribute('aria-labelledby') || '',
    ariaHidden: el.getAttribute('aria-hidden') || ''
  }));
  return { imagesWithoutAlt, ariaElements };
};

// Helper to compare accessibility features
const compareAccessibility = (initial: any, rendered: any) => {
  const imagesLostAlt = initial.imagesWithoutAlt.filter((src: string) => !rendered.imagesWithoutAlt.includes(src));
  const imagesNewlyMissingAlt = rendered.imagesWithoutAlt.filter((src: string) => !initial.imagesWithoutAlt.includes(src));
  // Compare ARIA elements by stringified value
  const ariaInitialSet = new Set(initial.ariaElements.map((el: any) => JSON.stringify(el)));
  const ariaRenderedSet = new Set(rendered.ariaElements.map((el: any) => JSON.stringify(el)));
  const ariaLost = initial.ariaElements.filter((el: any) => !ariaRenderedSet.has(JSON.stringify(el)));
  const ariaGained = rendered.ariaElements.filter((el: any) => !ariaInitialSet.has(JSON.stringify(el)));
  return { imagesLostAlt, imagesNewlyMissingAlt, ariaLost, ariaGained };
};

// Helper to extract structured data (JSON-LD, Microdata, RDFa) from HTML
const extractStructuredData = (html: string) => {
  if (typeof window === 'undefined') return { jsonLd: [], microdata: [], rdfa: [] };
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // JSON-LD
  const jsonLd = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map(el => {
    try {
      return JSON.parse(el.textContent || '');
    } catch {
      return null;
    }
  }).filter(Boolean);
  // Microdata
  const microdata = Array.from(doc.querySelectorAll('[itemscope][itemtype]')).map(el => ({
    type: el.getAttribute('itemtype') || '',
    props: Array.from(el.querySelectorAll('[itemprop]')).map(p => ({
      prop: p.getAttribute('itemprop'),
      value: p.textContent || ''
    }))
  }));
  // RDFa
  const rdfa = Array.from(doc.querySelectorAll('[vocab], [typeof], [property], [resource]')).map(el => ({
    tag: el.tagName.toLowerCase(),
    vocab: el.getAttribute('vocab') || '',
    typeof: el.getAttribute('typeof') || '',
    property: el.getAttribute('property') || '',
    resource: el.getAttribute('resource') || ''
  }));
  return { jsonLd, microdata, rdfa };
};

// Helper to compare structured data
const compareStructuredData = (initial: any, rendered: any) => {
  // Compare JSON-LD by stringified value
  const jsonLdInitialSet = new Set(initial.jsonLd.map((d: any) => JSON.stringify(d)));
  const jsonLdRenderedSet = new Set(rendered.jsonLd.map((d: any) => JSON.stringify(d)));
  const jsonLdAdded = rendered.jsonLd.filter((d: any) => !jsonLdInitialSet.has(JSON.stringify(d)));
  const jsonLdRemoved = initial.jsonLd.filter((d: any) => !jsonLdRenderedSet.has(JSON.stringify(d)));
  // Microdata
  const microdataInitialSet = new Set(initial.microdata.map((d: any) => JSON.stringify(d)));
  const microdataRenderedSet = new Set(rendered.microdata.map((d: any) => JSON.stringify(d)));
  const microdataAdded = rendered.microdata.filter((d: any) => !microdataInitialSet.has(JSON.stringify(d)));
  const microdataRemoved = initial.microdata.filter((d: any) => !microdataRenderedSet.has(JSON.stringify(d)));
  // RDFa
  const rdfaInitialSet = new Set(initial.rdfa.map((d: any) => JSON.stringify(d)));
  const rdfaRenderedSet = new Set(rendered.rdfa.map((d: any) => JSON.stringify(d)));
  const rdfaAdded = rendered.rdfa.filter((d: any) => !rdfaInitialSet.has(JSON.stringify(d)));
  const rdfaRemoved = initial.rdfa.filter((d: any) => !rdfaRenderedSet.has(JSON.stringify(d)));
  return { jsonLdAdded, jsonLdRemoved, microdataAdded, microdataRemoved, rdfaAdded, rdfaRemoved };
};

// Helper to extract crawlability/indexability info from HTML
const extractCrawlability = (html: string, baseUrl: string) => {
  if (typeof window === 'undefined') return { robots: '', xRobots: '', internalLinks: [], externalLinks: [] };
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // Robots meta
  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  // X-Robots-Tag (not available in HTML, but placeholder)
  const xRobots = '';
  // Links
  const anchors = Array.from(doc.querySelectorAll('a[href]'));
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  anchors.forEach(a => {
    const href = a.getAttribute('href') || '';
    if (!href) return;
    try {
      const url = new URL(href, baseUrl);
      if (url.hostname === new URL(baseUrl).hostname) {
        internalLinks.push(url.href);
      } else {
        externalLinks.push(url.href);
      }
    } catch {
      // Ignore invalid URLs
    }
  });
  return { robots, xRobots, internalLinks, externalLinks };
};

// Helper to compare crawlability/indexability info
const compareCrawlability = (initial: any, rendered: any) => {
  const robotsChanged = initial.robots !== rendered.robots;
  // X-Robots-Tag not available in HTML, so skip
  const internalLost = initial.internalLinks.filter((l: string) => !rendered.internalLinks.includes(l));
  const internalGained = rendered.internalLinks.filter((l: string) => !initial.internalLinks.includes(l));
  const externalLost = initial.externalLinks.filter((l: string) => !rendered.externalLinks.includes(l));
  const externalGained = rendered.externalLinks.filter((l: string) => !initial.externalLinks.includes(l));
  return { robotsChanged, internalLost, internalGained, externalLost, externalGained };
};

// Enhanced ImageSlider with animated handle and labels
const ImageSlider = ({ before, after }: { before: string; after: string }) => {
  const [slider, setSlider] = useState(50);
  return (
    <div className="relative w-full max-w-2xl mx-auto h-80 mb-8 select-none group">
      <div className="absolute inset-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl backdrop-blur-xl bg-white/30 dark:bg-gray-900/30">
        <img src={before} alt="Before (Raw HTML)" className="absolute inset-0 w-full h-full object-cover transition-all duration-500" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }} />
        <img src={after} alt="After (JS Rendered)" className="absolute inset-0 w-full h-full object-cover transition-all duration-500" style={{ clipPath: `inset(0 0 0 ${slider}%)` }} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={slider}
        onChange={e => setSlider(Number(e.target.value))}
        className="absolute left-0 right-0 bottom-2 w-full z-10 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full appearance-none focus:outline-none"
        style={{ accentColor: '#8b5cf6' }}
      />
      <div className="absolute left-2 bottom-8 flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-lg backdrop-blur-md">
        <Eye size={14} className="mr-1 text-blue-500" /> Raw HTML
      </div>
      <div className="absolute right-2 bottom-8 flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-lg backdrop-blur-md">
        <Zap size={14} className="mr-1 text-purple-500" /> JS Rendered
      </div>
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-20">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 transition-all duration-300 group-hover:scale-110">
          <SlidersHorizontal size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
};

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
  // Add state for screenshots
  const [screenshots, setScreenshots] = useState<{ before?: string; after?: string }>({});
  // Add state for selected analysis options
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['visual', 'dom', 'seo', 'content', 'resources', 'accessibility', 'structured', 'crawl']);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setScreenshots({});
    try {
      const res = await fetch('/api/js-rendering/test', {
        method: 'GET',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed');
      }
      const data = await res.json();
      setScreenshots({
        before: data.initialScreenshot ? `data:image/png;base64,${data.initialScreenshot}` : undefined,
        after: data.renderedScreenshot ? `data:image/png;base64,${data.renderedScreenshot}` : undefined,
      });
      // Calculate rough differences
      const differences = Math.abs(data.renderedHtmlLength - data.initialHtmlLength);
      setResult({
        initialHtml: '', // Not used for now
        renderedHtml: '', // Not used for now
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

    return lines.map((line: string, index: number) => {
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

  const ANALYSIS_OPTIONS = [
    { key: 'visual', label: 'Visual Snapshots' },
    { key: 'dom', label: 'DOM Diff' },
    { key: 'seo', label: 'SEO Tags' },
    { key: 'content', label: 'Content Visibility' },
    { key: 'resources', label: 'Resource Loading' },
    { key: 'accessibility', label: 'Accessibility' },
    { key: 'structured', label: 'Structured Data' },
    { key: 'crawl', label: 'Crawlability' },
  ];

  // Handler for toggling analysis options
  const handleToggleOption = (key: string) => {
    setSelectedOptions(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const CodeBlock = ({ html, title, copyKey }: { html: string; title: string; copyKey: string }) => {
    const formattedLines = formatHtml(html);
    
    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            {title}
                                    <span className="text-xs text-gray-700 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              {formattedLines.length} lines
            </span>
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Toggle line numbers"
            >
              {showLineNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              onClick={() => setExpandedView(!expandedView)}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Toggle expanded view"
            >
              {expandedView ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={() => handleCopy(html, copyKey)}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Copy to clipboard"
            >
              {copiedStates[copyKey] ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className={`relative bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden`}>
          <div className="overflow-auto max-h-[60vh]">
            <pre className="text-xs font-mono leading-relaxed">
              {formattedLines.map((lineData: any, index: number) => (
                <div key={index} className="flex hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {showLineNumbers && (
                    <span className="select-none text-gray-600 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-3 py-1 text-right min-w-[60px] border-r border-gray-200 dark:border-gray-700">
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

  // Memoize DOM diff summary
  const domDiffSummary = useMemo(() => {
    if (!result) return null;
    return getDomDiffSummary(result.initialHtml, result.renderedHtml);
  }, [result]);

  // Memoize SEO tag extraction and comparison
  const seoInitial = useMemo(() => result ? extractSEOTags(result.initialHtml) : null, [result]);
  const seoRendered = useMemo(() => result ? extractSEOTags(result.renderedHtml) : null, [result]);
  const seoDiffs = useMemo(() => (seoInitial && seoRendered) ? compareSEOTags(seoInitial, seoRendered) : [], [seoInitial, seoRendered]);

  // Memoize visible text extraction and comparison
  const visibleInitial = useMemo(() => result ? extractVisibleText(result.initialHtml) : [], [result]);
  const visibleRendered = useMemo(() => result ? extractVisibleText(result.renderedHtml) : [], [result]);
  const visibleDiff = useMemo(() => compareVisibleText(visibleInitial, visibleRendered), [visibleInitial, visibleRendered]);

  // Memoize resource extraction and comparison
  const resourcesInitial = useMemo(() => result ? extractResources(result.initialHtml) : { scripts: [], images: [], links: [] }, [result]);
  const resourcesRendered = useMemo(() => result ? extractResources(result.renderedHtml) : { scripts: [], images: [], links: [] }, [result]);
  const resourcesDiff = useMemo(() => compareResources(resourcesInitial, resourcesRendered), [resourcesInitial, resourcesRendered]);

  // Memoize accessibility extraction and comparison
  const accessibilityInitial = useMemo(() => result ? extractAccessibility(result.initialHtml) : { imagesWithoutAlt: [], ariaElements: [] }, [result]);
  const accessibilityRendered = useMemo(() => result ? extractAccessibility(result.renderedHtml) : { imagesWithoutAlt: [], ariaElements: [] }, [result]);
  const accessibilityDiff = useMemo(() => compareAccessibility(accessibilityInitial, accessibilityRendered), [accessibilityInitial, accessibilityRendered]);

  // Memoize structured data extraction and comparison
  const structuredInitial = useMemo(() => result ? extractStructuredData(result.initialHtml) : { jsonLd: [], microdata: [], rdfa: [] }, [result]);
  const structuredRendered = useMemo(() => result ? extractStructuredData(result.renderedHtml) : { jsonLd: [], microdata: [], rdfa: [] }, [result]);
  const structuredDiff = useMemo(() => compareStructuredData(structuredInitial, structuredRendered), [structuredInitial, structuredRendered]);

  // Memoize crawlability extraction and comparison
  const crawlInitial = useMemo(() => result ? extractCrawlability(result.initialHtml, url) : { robots: '', xRobots: '', internalLinks: [], externalLinks: [] }, [result, url]);
  const crawlRendered = useMemo(() => result ? extractCrawlability(result.renderedHtml, url) : { robots: '', xRobots: '', internalLinks: [], externalLinks: [] }, [result, url]);
  const crawlDiff = useMemo(() => compareCrawlability(crawlInitial, crawlRendered), [crawlInitial, crawlRendered]);

  // Export handlers
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('JS Rendering Tester Report', 10, 10);
    doc.text('See the app for full details and visual diff.', 10, 20);
    doc.save('js-rendering-tester-report.pdf');
  };
  const handleExportCSV = () => {
    let csv = 'Type,Tag,Initial,Rendered\n';
    if (seoDiffs && seoDiffs.length > 0) {
      seoDiffs.forEach(diff => {
        csv += `SEO,${diff.tag},"${diff.initial}","${diff.rendered}"\n`;
      });
    }
    // Add more sections as needed
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'js-rendering-tester-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Shareable link copied to clipboard!');
  };

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
          <p className="text-gray-700 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Compare raw HTML with JavaScript-rendered DOM
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
                      className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-site.com"
                className="w-full px-5 py-3 pl-12 rounded-full border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base shadow text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
              />
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
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
                              <Tab.List className="flex flex-wrap gap-2 bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl p-2 shadow-inner">
                {tabList.map((tab: any) => (
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
                  <div className="space-y-8">
                    {/* Customizable Analysis Options */}
                    <div className="flex flex-wrap gap-3 mb-4 items-center animate-fade-in">
                      <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-1"><Sparkles size={16} className="text-purple-500" /> Show Analysis:</span>
                      {ANALYSIS_OPTIONS.map(opt => (
                        <label key={opt.key} className="flex items-center gap-1 text-xs font-medium cursor-pointer transition-all hover:scale-105">
                          <input
                            type="checkbox"
                            checked={selectedOptions.includes(opt.key)}
                            onChange={() => handleToggleOption(opt.key)}
                            className="accent-purple-500 rounded focus:ring-2 focus:ring-purple-400"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {/* Export/Share Buttons */}
                    <div className="flex flex-wrap gap-2 justify-end mb-4 animate-fade-in">
                      <button onClick={handleExportPDF} className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-2" title="Export as PDF"><FileDown size={16} /> Export PDF</button>
                      <button onClick={handleExportCSV} className="px-5 py-2 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 text-white font-semibold shadow-lg hover:from-green-600 hover:to-cyan-600 transition-all flex items-center gap-2" title="Export as CSV"><Download size={16} /> Export CSV</button>
                      <button onClick={handleShareLink} className="px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-pink-500 text-white font-semibold shadow-lg hover:from-yellow-600 hover:to-pink-600 transition-all flex items-center gap-2" title="Copy shareable link"><Share2 size={16} /> Share Link</button>
                    </div>
                    {/* Visual Snapshots Section */}
                    {selectedOptions.includes('visual') && screenshots.before && screenshots.after && (
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900/40 dark:to-gray-800/40 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-4 shadow-xl backdrop-blur-xl animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><ImageIcon size={18} className="text-blue-400" /> Visual Comparison <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">Before/After</span></h4>
                        <ImageSlider before={screenshots.before} after={screenshots.after} />
                        <div className="text-xs text-gray-600 dark:text-gray-400 text-center">Drag the slider to compare the page before and after JavaScript rendering.</div>
                      </motion.div>
                    )}
                    {/* DOM Diff Summary */}
                    {selectedOptions.includes('dom') && domDiffSummary && (
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800 mb-4 shadow-xl backdrop-blur-xl animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><Code2 size={18} className="text-purple-400" /> Element-Level DOM Diff</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-2">
                          <div><span className="text-gray-700 dark:text-gray-400">Elements Added:</span> <span className="font-semibold text-green-700 dark:text-green-400">+{domDiffSummary.added}</span></div>
                          <div><span className="text-gray-700 dark:text-gray-400">Elements Removed:</span> <span className="font-semibold text-red-700 dark:text-red-400">-{domDiffSummary.removed}</span></div>
                          <div><span className="text-gray-700 dark:text-gray-400">Elements Changed:</span> <span className="font-semibold text-yellow-700 dark:text-yellow-400">{domDiffSummary.changed}</span></div>
                          <div><span className="text-gray-700 dark:text-blue-400">Attributes Changed:</span> <span className="font-semibold text-blue-700 dark:text-blue-400">{domDiffSummary.attrChanged}</span></div>
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-600 dark:text-gray-400">Show raw diff details</summary>
                          <pre className="text-xs text-gray-700 dark:text-gray-300 mt-2 overflow-x-auto">{JSON.stringify(domDiffSummary.diffs, null, 2)}</pre>
                        </details>
                      </motion.div>
                    )}
                    {/* SEO Tag Diff Summary */}
                    {selectedOptions.includes('seo') && seoDiffs && seoDiffs.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-gradient-to-r from-yellow-50 to-pink-50 dark:from-yellow-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800 mb-4 shadow-xl backdrop-blur-xl animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><Star size={18} className="text-yellow-400" /> SEO Tag Differences</h4>
                        <div className="space-y-2">
                          {seoDiffs.map((diff: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm">
                              <span className="font-semibold text-purple-700 dark:text-purple-400 w-32">{diff.tag}</span>
                              <span className="flex-1 text-gray-700 dark:text-gray-300"><span className="font-semibold">Initial:</span> {diff.initial || <span className='italic text-gray-400'>None</span>}</span>
                              <span className="flex-1 text-gray-700 dark:text-gray-300"><span className="font-semibold">Rendered:</span> {diff.rendered || <span className='italic text-gray-400'>None</span>}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Content Visibility Analysis */}
                    {selectedOptions.includes('content') && (visibleDiff.onlyInInitial.length > 0 || visibleDiff.onlyInRendered.length > 0) && (
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-pink-200 dark:border-pink-800 mb-4 shadow-xl backdrop-blur-xl animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><FileText size={18} className="text-pink-400" /> Content Visibility Analysis</h4>
                        {visibleDiff.onlyInInitial.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-red-700 dark:text-red-400">Text only in Initial (raw HTML, not visible after JS):</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {visibleDiff.onlyInInitial.slice(0, 10).map((t: string, i: number) => <li key={i}>{t}</li>)}
                              {visibleDiff.onlyInInitial.length > 10 && <li>...and {visibleDiff.onlyInInitial.length - 10} more</li>}
                            </ul>
                          </div>
                        )}
                        {visibleDiff.onlyInRendered.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-green-700 dark:text-green-400">Text only in Rendered (added by JS, not in raw HTML):</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {visibleDiff.onlyInRendered.slice(0, 10).map((t: string, i: number) => <li key={i}>{t}</li>)}
                              {visibleDiff.onlyInRendered.length > 10 && <li>...and {visibleDiff.onlyInRendered.length - 10} more</li>}
                            </ul>
                          </div>
                        )}
                        {(visibleDiff.onlyInInitial.length > 0 && visibleDiff.onlyInRendered.length > 0) && (
                          <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-400 font-semibold">Possible cloaking detected: content differs between raw and JS-rendered HTML.</div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* Resource Loading & Performance Analysis */}
                    {selectedOptions.includes('resources') && (resourcesDiff.scriptsAdded.length > 0 || resourcesDiff.scriptsRemoved.length > 0 || resourcesDiff.imagesAdded.length > 0 || resourcesDiff.imagesRemoved.length > 0 || resourcesDiff.linksAdded.length > 0 || resourcesDiff.linksRemoved.length > 0) && (
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 mb-4 shadow-xl backdrop-blur-xl animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><BarChart3 size={18} className="text-cyan-400" /> Resource Loading & Performance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-semibold text-blue-700 dark:text-blue-400">Scripts Added by JS:</span>
                            <ul className="list-disc ml-6">
                              {resourcesDiff.scriptsAdded.slice(0, 5).map((src: string, i: number) => <li key={i}>{src}</li>)}
                              {resourcesDiff.scriptsAdded.length > 5 && <li>...and {resourcesDiff.scriptsAdded.length - 5} more</li>}
                            </ul>
                            <span className="font-semibold text-red-700 dark:text-red-400">Scripts Removed after JS:</span>
                            <ul className="list-disc ml-6">
                              {resourcesDiff.scriptsRemoved.slice(0, 5).map((src: string, i: number) => <li key={i}>{src}</li>)}
                              {resourcesDiff.scriptsRemoved.length > 5 && <li>...and {resourcesDiff.scriptsRemoved.length - 5} more</li>}
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold text-green-700 dark:text-green-400">Images Added by JS:</span>
                            <ul className="list-disc ml-6">
                              {resourcesDiff.imagesAdded.slice(0, 5).map((src: string, i: number) => <li key={i}>{src}</li>)}
                              {resourcesDiff.imagesAdded.length > 5 && <li>...and {resourcesDiff.imagesAdded.length - 5} more</li>}
                            </ul>
                            <span className="font-semibold text-red-700 dark:text-red-400">Images Removed after JS:</span>
                            <ul className="list-disc ml-6">
                              {resourcesDiff.imagesRemoved.slice(0, 5).map((src: string, i: number) => <li key={i}>{src}</li>)}
                              {resourcesDiff.imagesRemoved.length > 5 && <li>...and {resourcesDiff.imagesRemoved.length - 5} more</li>}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-2 text-xs">
                          <span className="font-semibold text-cyan-700 dark:text-cyan-400">Links Added by JS:</span> {resourcesDiff.linksAdded.length}
                          <span className="ml-4 font-semibold text-cyan-700 dark:text-cyan-400">Links Removed after JS:</span> {resourcesDiff.linksRemoved.length}
                        </div>
                        <div className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">Performance timings (DOMContentLoaded, full render) require backend/browser instrumentation and are not available in this version.</div>
                      </motion.div>
                    )}
                    
                    {/* Accessibility Analysis */}
                    {selectedOptions.includes('accessibility') && (accessibilityDiff.imagesNewlyMissingAlt.length > 0 || accessibilityDiff.ariaLost.length > 0) && (
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-green-200 dark:border-yellow-800 mb-4 shadow-xl backdrop-blur-xl animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><Accessibility size={18} className="text-green-400" /> Accessibility Analysis</h4>
                        {accessibilityDiff.imagesNewlyMissingAlt.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-red-700 dark:text-red-400">Images missing alt after JS:</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {accessibilityDiff.imagesNewlyMissingAlt.slice(0, 10).map((src: string, i: number) => <li key={i}>{src}</li>)}
                              {accessibilityDiff.imagesNewlyMissingAlt.length > 10 && <li>...and {accessibilityDiff.imagesNewlyMissingAlt.length - 10} more</li>}
                            </ul>
                          </div>
                        )}
                        {accessibilityDiff.ariaLost.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-yellow-700 dark:text-yellow-400">ARIA/role attributes lost after JS:</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {accessibilityDiff.ariaLost.slice(0, 10).map((el: any, i: number) => <li key={i}>{JSON.stringify(el)}</li>)}
                              {accessibilityDiff.ariaLost.length > 10 && <li>...and {accessibilityDiff.ariaLost.length - 10} more</li>}
                            </ul>
                          </div>
                        )}
                        {(accessibilityDiff.imagesNewlyMissingAlt.length > 0 || accessibilityDiff.ariaLost.length > 0) && (
                          <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-400 font-semibold">Accessibility may be degraded after JS rendering.</div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* Structured Data Analysis */}
                    {selectedOptions.includes('structured') && (structuredDiff.jsonLdAdded.length > 0 || structuredDiff.jsonLdRemoved.length > 0 || structuredDiff.microdataAdded.length > 0 || structuredDiff.microdataRemoved.length > 0 || structuredDiff.rdfaAdded.length > 0 || structuredDiff.rdfaRemoved.length > 0) && (
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 mb-4 shadow-xl backdrop-blur-xl animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><Shield size={18} className="text-indigo-400" /> Structured Data Analysis</h4>
                        {structuredDiff.jsonLdAdded.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-green-700 dark:text-green-400">JSON-LD Added by JS:</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {structuredDiff.jsonLdAdded.slice(0, 3).map((d: any, i: number) => <li key={i}><pre>{JSON.stringify(d, null, 2)}</pre></li>)}
                              {structuredDiff.jsonLdAdded.length > 3 && <li>...and {structuredDiff.jsonLdAdded.length - 3} more</li>}
                            </ul>
                          </div>
                        )}
                        {structuredDiff.jsonLdRemoved.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-red-700 dark:text-red-400">JSON-LD Removed after JS:</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {structuredDiff.jsonLdRemoved.slice(0, 3).map((d: any, i: number) => <li key={i}><pre>{JSON.stringify(d, null, 2)}</pre></li>)}
                              {structuredDiff.jsonLdRemoved.length > 3 && <li>...and {structuredDiff.jsonLdRemoved.length - 3} more</li>}
                            </ul>
                          </div>
                        )}
                        {structuredDiff.microdataAdded.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-green-700 dark:text-green-400">Microdata Added by JS:</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {structuredDiff.microdataAdded.slice(0, 3).map((d: any, i: number) => <li key={i}><pre>{JSON.stringify(d, null, 2)}</pre></li>)}
                              {structuredDiff.microdataAdded.length > 3 && <li>...and {structuredDiff.microdataAdded.length - 3} more</li>}
                            </ul>
                          </div>
                        )}
                        {structuredDiff.microdataRemoved.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-red-700 dark:text-red-400">Microdata Removed after JS:</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {structuredDiff.microdataRemoved.slice(0, 3).map((d: any, i: number) => <li key={i}><pre>{JSON.stringify(d, null, 2)}</pre></li>)}
                              {structuredDiff.microdataRemoved.length > 3 && <li>...and {structuredDiff.microdataRemoved.length - 3} more</li>}
                            </ul>
                          </div>
                        )}
                        {structuredDiff.rdfaAdded.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-green-700 dark:text-green-400">RDFa Added by JS:</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {structuredDiff.rdfaAdded.slice(0, 3).map((d: any, i: number) => <li key={i}><pre>{JSON.stringify(d, null, 2)}</pre></li>)}
                              {structuredDiff.rdfaAdded.length > 3 && <li>...and {structuredDiff.rdfaAdded.length - 3} more</li>}
                            </ul>
                          </div>
                        )}
                        {structuredDiff.rdfaRemoved.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-red-700 dark:text-red-400">RDFa Removed after JS:</span>
                            <ul className="list-disc ml-6 text-xs text-gray-700 dark:text-gray-300">
                              {structuredDiff.rdfaRemoved.slice(0, 3).map((d: any, i: number) => <li key={i}><pre>{JSON.stringify(d, null, 2)}</pre></li>)}
                              {structuredDiff.rdfaRemoved.length > 3 && <li>...and {structuredDiff.rdfaRemoved.length - 3} more</li>}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* Crawlability & Indexability Analysis */}
                    {selectedOptions.includes('crawl') && (crawlDiff.robotsChanged || crawlDiff.internalLost.length > 0 || crawlDiff.externalLost.length > 0) && (
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-gradient-to-r from-gray-50 to-gray-200 dark:from-gray-900/20 dark:to-gray-700/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-4 shadow-xl backdrop-blur-xl animate-fade-in">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2"><LinkIcon size={18} className="text-gray-400" /> Crawlability & Indexability Analysis</h4>
                        {crawlDiff.robotsChanged && (
                          <div className="mb-2 text-xs">
                            <span className="font-semibold text-yellow-700 dark:text-yellow-400">Robots meta changed after JS:</span><br />
                            <span className="text-gray-700 dark:text-gray-300">Initial: {crawlInitial.robots || <span className='italic text-gray-400'>None</span>}</span><br />
                            <span className="text-gray-700 dark:text-gray-300">Rendered: {crawlRendered.robots || <span className='italic text-gray-400'>None</span>}</span>
                          </div>
                        )}
                        {crawlDiff.internalLost.length > 0 && (
                          <div className="mb-2 text-xs">
                            <span className="font-semibold text-red-700 dark:text-red-400">Internal links missing after JS:</span>
                            <ul className="list-disc ml-6">
                              {crawlDiff.internalLost.slice(0, 10).map((l: string, i: number) => <li key={i}>{l}</li>)}
                              {crawlDiff.internalLost.length > 10 && <li>...and {crawlDiff.internalLost.length - 10} more</li>}
                            </ul>
                          </div>
                        )}
                        {crawlDiff.externalLost.length > 0 && (
                          <div className="mb-2 text-xs">
                            <span className="font-semibold text-red-700 dark:text-red-400">External links missing after JS:</span>
                            <ul className="list-disc ml-6">
                              {crawlDiff.externalLost.slice(0, 10).map((l: string, i: number) => <li key={i}>{l}</li>)}
                              {crawlDiff.externalLost.length > 10 && <li>...and {crawlDiff.externalLost.length - 10} more</li>}
                            </ul>
                          </div>
                        )}
                        {(crawlDiff.internalLost.length > 0 || crawlDiff.externalLost.length > 0) && (
                          <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-400 font-semibold">Warning: Important navigation or links may be missing after JS rendering. This can impact SEO and crawlability.</div>
                        )}
                      </motion.div>
                    )}
                    
                    {/* Analysis Summary */}
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 shadow-xl backdrop-blur-xl animate-fade-in">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Analysis Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-700 dark:text-gray-400">Character Change:</span>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {result.differences > 0 ? '+' : result.differences < 0 ? '-' : ''}
                            {result.differences.toLocaleString()} chars
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 dark:text-gray-400">Line Change:</span>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {result.renderedHtml.split('\n').length - result.initialHtml.split('\n').length > 0 ? '+' : ''}
                            {result.renderedHtml.split('\n').length - result.initialHtml.split('\n').length} lines
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 dark:text-gray-400">Initial Lines:</span>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {result.initialHtml.split('\n').length}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 dark:text-gray-400">Rendered Lines:</span>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {result.renderedHtml.split('\n').length}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Individual HTML Content Cards */}
                    <div className="space-y-6">
                      {/* Initial HTML Card */}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl backdrop-blur-xl">
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Initial HTML</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-400">Raw server response • {result.initialHtml.split('\n').length} lines</p>
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
                              {result.initialHtml.split('\n').slice(0, 100).map((line: string, index: number) => (
                                <div key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded px-1">
                                  <span className="text-gray-600 dark:text-gray-600 select-none mr-3 inline-block w-8 text-right">
                                    {index + 1}
                                  </span>
                                  <span dangerouslySetInnerHTML={{ __html: highlightSyntax(line || ' ') }} />
                                </div>
                              ))}
                              {result.initialHtml.split('\n').length > 100 && (
                                <div className="text-gray-600 dark:text-gray-500 text-center py-2 italic">
                                  ... {result.initialHtml.split('\n').length - 100} more lines (switch to "Initial HTML" tab to see full content)
                                </div>
                              )}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Rendered HTML Card */}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl backdrop-blur-xl">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Code2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Rendered HTML</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-400">After JavaScript execution • {result.renderedHtml.split('\n').length} lines</p>
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
                              {result.renderedHtml.split('\n').slice(0, 100).map((line: string, index: number) => (
                                <div key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded px-1">
                                  <span className="text-gray-600 dark:text-gray-600 select-none mr-3 inline-block w-8 text-right">
                                    {index + 1}
                                  </span>
                                  <span dangerouslySetInnerHTML={{ __html: highlightSyntax(line || ' ') }} />
                                </div>
                              ))}
                              {result.renderedHtml.split('\n').length > 100 && (
                                <div className="text-gray-600 dark:text-gray-500 text-center py-2 italic">
                                  ... {result.renderedHtml.split('\n').length - 100} more lines (switch to "Rendered HTML" tab to see full content)
                                </div>
                              )}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Render diff lines (limit to 100, show more button) */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl backdrop-blur-xl">
                      <div className="p-4 max-h-[60vh] overflow-auto">
                        {displayedDiffs.length === 0 && (
                          <div className="text-gray-600 text-center py-4">No significant differences found.</div>
                        )}
                        {displayedDiffs.map((diff: any, idx: number) => (
                          <div key={idx} className={`flex items-start gap-2 py-1 px-2 rounded transition-colors ${diff.type === 'added' ? 'bg-green-50 dark:bg-green-900/20' : diff.type === 'removed' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                            <span className="text-xs text-gray-600 w-10 text-right select-none">{diff.lineNumber}</span>
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
                    </motion.div>
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