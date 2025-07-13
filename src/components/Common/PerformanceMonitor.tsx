'use client';
import React, { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  enabled?: boolean;
  componentName?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  componentName = 'Component'
}) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const renderTime = performance.now() - startTime.current;

    // Log performance metrics
    console.log(`⚡ ${componentName} Performance:`, {
      renderCount: renderCount.current,
      renderTime: `${renderTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    });

    // Reset timer for next render
    startTime.current = performance.now();

    // Warn if render time is too high
    if (renderTime > 16) { // 60fps threshold
      console.warn(`⚠️ ${componentName} render time (${renderTime.toFixed(2)}ms) exceeds 16ms threshold`);
    }
  });

  // Monitor memory usage in development
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        
        if (usedMB > 100) { // Warn if memory usage is high
          console.warn(`⚠️ High memory usage: ${usedMB}MB / ${totalMB}MB`);
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  // Don't render anything in production
  if (!enabled) return null;

  return null; // This component doesn't render anything visible
};

export default PerformanceMonitor; 