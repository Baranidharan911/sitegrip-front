declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    performance?: Performance;
  }
}

import { useEffect, useCallback, useRef, useState } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  
  // Additional metrics
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
  timeToFirstByte: number;
  
  // Resource metrics
  totalResources: number;
  totalSize: number;
  domSize: number;
  
  // Custom metrics
  componentRenderTime: number;
  apiResponseTime: number;
  navigationTime: number;
}

interface PerformanceReport {
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: PerformanceMetrics;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

interface InteractionMetrics {
  name: string;
  duration: number;
  timestamp: number;
  component?: string;
}

export const usePerformance = () => {
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [interactions, setInteractions] = useState<InteractionMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const lcpObserverRef = useRef<PerformanceObserver | null>(null);
  const clsObserverRef = useRef<PerformanceObserver | null>(null);
  const fidObserverRef = useRef<PerformanceObserver | null>(null);

  const calculateScore = useCallback((metrics: Partial<PerformanceMetrics>): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' } => {
    let score = 100;
    
    // LCP scoring (25% weight)
    if (metrics.largestContentfulPaint) {
      if (metrics.largestContentfulPaint <= 2500) score -= 0;
      else if (metrics.largestContentfulPaint <= 4000) score -= 10;
      else if (metrics.largestContentfulPaint <= 6000) score -= 20;
      else score -= 25;
    }
    
    // FID scoring (25% weight)
    if (metrics.firstInputDelay) {
      if (metrics.firstInputDelay <= 100) score -= 0;
      else if (metrics.firstInputDelay <= 300) score -= 10;
      else if (metrics.firstInputDelay <= 500) score -= 20;
      else score -= 25;
    }
    
    // CLS scoring (25% weight)
    if (metrics.cumulativeLayoutShift) {
      if (metrics.cumulativeLayoutShift <= 0.1) score -= 0;
      else if (metrics.cumulativeLayoutShift <= 0.25) score -= 10;
      else if (metrics.cumulativeLayoutShift <= 0.5) score -= 20;
      else score -= 25;
    }
    
    // FCP scoring (15% weight)
    if (metrics.firstContentfulPaint) {
      if (metrics.firstContentfulPaint <= 1800) score -= 0;
      else if (metrics.firstContentfulPaint <= 3000) score -= 5;
      else if (metrics.firstContentfulPaint <= 5000) score -= 10;
      else score -= 15;
    }
    
    // TTI scoring (10% weight)
    if (metrics.timeToInteractive) {
      if (metrics.timeToInteractive <= 5000) score -= 0;
      else if (metrics.timeToInteractive <= 8000) score -= 5;
      else if (metrics.timeToInteractive <= 12000) score -= 8;
      else score -= 10;
    }
    
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    return { score: Math.max(0, score), grade };
  }, []);

  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined') return;

    const metrics: Partial<PerformanceMetrics> = {};

    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      metrics.timeToFirstByte = navigation.responseStart - navigation.requestStart;
      metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
    }

    // Paint timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      }
      if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Largest Contentful Paint
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      metrics.largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
    }

    // Cumulative Layout Shift
    const clsEntries = performance.getEntriesByType('layout-shift');
    let cls = 0;
    clsEntries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });
    metrics.cumulativeLayoutShift = cls;

    // Resource metrics
    const resources = performance.getEntriesByType('resource');
    metrics.totalResources = resources.length;
    metrics.totalSize = resources.reduce((sum, resource: any) => sum + (resource.transferSize || 0), 0);

    // DOM size
    metrics.domSize = document.querySelectorAll('*').length;

    // Calculate score
    const { score, grade } = calculateScore(metrics);

    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: metrics as PerformanceMetrics,
      score,
      grade,
    };

    setReports(prev => [...prev, report]);

    // Log metrics for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance Metrics:', {
        ...metrics,
        score,
        grade,
        url: window.location.href,
      });
    }

    // Send metrics to analytics (if configured)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metrics', {
        event_category: 'Performance',
        event_label: 'Page Load',
        value: Math.round(score),
        custom_map: {
          load_time: metrics.loadTime,
          dom_content_loaded: metrics.domContentLoaded,
          first_paint: metrics.firstPaint,
          first_contentful_paint: metrics.firstContentfulPaint,
          largest_contentful_paint: metrics.largestContentfulPaint,
          cumulative_layout_shift: metrics.cumulativeLayoutShift,
          time_to_interactive: metrics.timeToInteractive,
          total_blocking_time: metrics.totalBlockingTime,
          speed_index: metrics.speedIndex,
          time_to_first_byte: metrics.timeToFirstByte,
          total_resources: metrics.totalResources,
          total_size: metrics.totalSize,
          dom_size: metrics.domSize,
          performance_score: score,
          performance_grade: grade,
        }
      });
    }

    return report;
  }, [calculateScore]);

  const measureInteraction = useCallback((interactionName: string, component?: string) => {
    if (typeof window === 'undefined') return () => {};

    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      const interaction: InteractionMetrics = {
        name: interactionName,
        duration,
        timestamp: Date.now(),
        component,
      };
      
      setInteractions(prev => [...prev, interaction]);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ Interaction: ${interactionName} took ${duration.toFixed(2)}ms`);
      }

      // Send interaction metrics to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'interaction_timing', {
          event_category: 'Performance',
          event_label: interactionName,
          value: Math.round(duration),
          custom_map: {
            component: component || 'unknown',
            interaction_name: interactionName,
            duration_ms: duration,
          }
        });
      }
    };
  }, []);

  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      // Track API performance
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'api_performance', {
          event_category: 'Performance',
          event_label: endpoint,
          value: Math.round(duration),
          custom_map: {
            endpoint,
            response_time_ms: duration,
            status: 'success',
          }
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Track API errors
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'api_error', {
          event_category: 'Performance',
          event_label: endpoint,
          value: Math.round(duration),
          custom_map: {
            endpoint,
            response_time_ms: duration,
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          }
        });
      }
      
      throw error;
    }
  }, []);

  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'fetch') => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'fetch':
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        break;
    }

    document.head.appendChild(link);
  }, []);

  const prefetchPage = useCallback((url: string) => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }, []);

  const startMonitoring = useCallback(() => {
    if (typeof window === 'undefined' || isMonitoring) return;

    setIsMonitoring(true);

    // Monitor LCP
    if ('PerformanceObserver' in window) {
      lcpObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          console.log('📊 LCP:', lastEntry.startTime);
        }
      });
      lcpObserverRef.current.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Monitor CLS
    if ('PerformanceObserver' in window) {
      clsObserverRef.current = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        console.log('📊 CLS:', cls);
      });
      clsObserverRef.current.observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor FID
    if ('PerformanceObserver' in window) {
      fidObserverRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming;
          console.log('📊 FID:', fidEntry.processingStart - fidEntry.startTime);
        }
      });
      fidObserverRef.current.observe({ entryTypes: ['first-input'] });
    }
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    if (lcpObserverRef.current) {
      lcpObserverRef.current.disconnect();
      lcpObserverRef.current = null;
    }
    
    if (clsObserverRef.current) {
      clsObserverRef.current.disconnect();
      clsObserverRef.current = null;
    }
    
    if (fidObserverRef.current) {
      fidObserverRef.current.disconnect();
      fidObserverRef.current = null;
    }
  }, []);

  const getPerformanceSummary = useCallback(() => {
    if (reports.length === 0) return null;

    const latestReport = reports[reports.length - 1];
    const avgScore = reports.reduce((sum, report) => sum + report.score, 0) / reports.length;
    const avgLoadTime = reports.reduce((sum, report) => sum + report.metrics.loadTime, 0) / reports.length;
    
    const interactionStats = interactions.reduce((stats, interaction) => {
      if (!stats[interaction.name]) {
        stats[interaction.name] = { count: 0, totalTime: 0, avgTime: 0 };
      }
      stats[interaction.name].count++;
      stats[interaction.name].totalTime += interaction.duration;
      stats[interaction.name].avgTime = stats[interaction.name].totalTime / stats[interaction.name].count;
      return stats;
    }, {} as Record<string, { count: number; totalTime: number; avgTime: number }>);

    return {
      latestReport,
      averageScore: avgScore,
      averageLoadTime: avgLoadTime,
      totalReports: reports.length,
      totalInteractions: interactions.length,
      interactionStats,
      gradeDistribution: reports.reduce((dist, report) => {
        dist[report.grade] = (dist[report.grade] || 0) + 1;
        return dist;
      }, {} as Record<string, number>),
    };
  }, [reports, interactions]);

  const clearMetrics = useCallback(() => {
    setReports([]);
    setInteractions([]);
  }, []);

  useEffect(() => {
    // Measure performance after page load
    const handleLoad = () => {
      setTimeout(measurePerformance, 0);
    };

    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('load', handleLoad);
      stopMonitoring();
    };
  }, [measurePerformance, stopMonitoring]);

  return {
    measurePerformance,
    measureInteraction,
    measureApiCall,
    preloadResource,
    prefetchPage,
    startMonitoring,
    stopMonitoring,
    getPerformanceSummary,
    clearMetrics,
    reports,
    interactions,
    isMonitoring,
  };
};

// Performance optimization utilities
export const optimizeImages = () => {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
};

export const optimizeFonts = () => {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const criticalFonts = [
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
  ];

  criticalFonts.forEach((fontUrl) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

export const optimizeThirdPartyScripts = () => {
  if (typeof window === 'undefined') return;

  // Defer non-critical third-party scripts
  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach((script) => {
    script.setAttribute('defer', '');
  });
}; 