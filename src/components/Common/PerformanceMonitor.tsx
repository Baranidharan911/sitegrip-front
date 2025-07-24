'use client';
import React, { useEffect, useRef, useCallback } from 'react';

interface PerformanceMonitorProps {
  enabled?: boolean;
  componentName?: string;
  memoryThreshold?: number; // Memory threshold in MB
  checkInterval?: number; // Check interval in milliseconds
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = process.env.NODE_ENV === 'development',
  componentName = 'Component',
  memoryThreshold = 100, // Default 100MB threshold
  checkInterval = 30000 // Check every 30 seconds instead of 10
}) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const memoryWarnings = useRef(0);

  // Memory cleanup function
  const cleanupMemory = useCallback(() => {
    // Clear console logs to reduce memory pressure
    if (process.env.NODE_ENV === 'development') {
      console.clear();
    }
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch (e) {
        // GC not available
      }
    }
    
    // Clear any cached data
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('performance') || name.includes('monitor')) {
            caches.delete(name);
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const renderTime = performance.now() - startTime.current;

    // Only log in development and limit frequency
    if (process.env.NODE_ENV === 'development' && renderCount.current % 10 === 0) {
      console.log(`⚡ ${componentName} Performance:`, {
        renderCount: renderCount.current,
        renderTime: `${renderTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    // Reset timer for next render
    startTime.current = performance.now();

    // Warn if render time is too high
    if (renderTime > 16) { // 60fps threshold
      console.warn(`⚠️ ${componentName} render time (${renderTime.toFixed(2)}ms) exceeds 16ms threshold`);
    }
  });

  // Monitor memory usage with better management
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const usagePercentage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        // Log memory usage less frequently
        if (memoryWarnings.current % 3 === 0) {
          console.log(`📊 Memory Usage: ${usedMB}MB / ${totalMB}MB (${usagePercentage.toFixed(1)}%)`);
        }
        
        // Trigger cleanup if memory usage is very high
        if (usagePercentage > 95) {
          console.warn(`🚨 Critical memory usage: ${usagePercentage.toFixed(1)}% - Triggering cleanup`);
          cleanupMemory();
          memoryWarnings.current = 0; // Reset counter after cleanup
        } else if (usagePercentage > 90) {
          console.warn(`⚠️ High memory usage: ${usagePercentage.toFixed(1)}%`);
          memoryWarnings.current++;
        } else if (usagePercentage > 80) {
          console.warn(`⚠️ Elevated memory usage: ${usagePercentage.toFixed(1)}%`);
          memoryWarnings.current++;
        }
      }
    };

    // Initial check
    checkMemory();
    
    // Set up interval with longer duration
    intervalRef.current = setInterval(checkMemory, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, checkInterval, cleanupMemory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      cleanupMemory();
    };
  }, [cleanupMemory]);

  // Don't render anything in production
  if (!enabled) return null;

  return null; // This component doesn't render anything visible
};

export default PerformanceMonitor; 