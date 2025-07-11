declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export const usePerformance = () => {
  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined') return;

    const metrics: Partial<PerformanceMetrics> = {};

    // Navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
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

    // Log metrics for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance Metrics:', metrics);
    }

    // Send metrics to analytics (if configured)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metrics', {
        event_category: 'Performance',
        event_label: 'Page Load',
        value: Math.round(metrics.loadTime || 0),
        custom_map: {
          load_time: metrics.loadTime,
          dom_content_loaded: metrics.domContentLoaded,
          first_paint: metrics.firstPaint,
          first_contentful_paint: metrics.firstContentfulPaint,
          largest_contentful_paint: metrics.largestContentfulPaint,
          cumulative_layout_shift: metrics.cumulativeLayoutShift,
        }
      });
    }

    return metrics;
  }, []);

  const measureInteraction = useCallback((interactionName: string) => {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ Interaction: ${interactionName} took ${duration.toFixed(2)}ms`);
      }

      // Send interaction metrics to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'interaction_timing', {
          event_category: 'Performance',
          event_label: interactionName,
          value: Math.round(duration),
        });
      }
    };
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

  useEffect(() => {
    // Measure performance after page load
    const handleLoad = () => {
      setTimeout(measurePerformance, 0);
    };

    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [measurePerformance]);

  return {
    measurePerformance,
    measureInteraction,
    preloadResource,
    prefetchPage,
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