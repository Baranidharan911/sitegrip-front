// src/hooks/useMemoryOptimization.ts
// Custom hook for memory optimization and leak prevention

import { useEffect, useRef, useCallback } from 'react';
import { memoryUtils } from '@/lib/memoryManager';

interface UseMemoryOptimizationOptions {
  enabled?: boolean;
  cleanupOnUnmount?: boolean;
  monitorInterval?: number;
  memoryThreshold?: number;
}

export const useMemoryOptimization = (options: UseMemoryOptimizationOptions = {}) => {
  const {
    enabled = true,
    cleanupOnUnmount = true,
    monitorInterval = 30000,
    memoryThreshold = 90
  } = options;

  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const eventListenersRef = useRef<Map<string, () => void>>(new Map());
  const monitoringRef = useRef<NodeJS.Timeout | null>(null);

  // Register interval for cleanup
  const registerInterval = useCallback((interval: NodeJS.Timeout) => {
    intervalsRef.current.add(interval);
    memoryUtils.registerInterval(interval);
  }, []);

  // Register event listener for cleanup
  const registerEventListener = useCallback((event: string, cleanup: () => void) => {
    eventListenersRef.current.set(event, cleanup);
    memoryUtils.registerEventListener(event, cleanup);
  }, []);

  // Create a safe interval that gets cleaned up
  const createSafeInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    registerInterval(interval);
    return interval;
  }, [registerInterval]);

  // Create a safe timeout that gets cleaned up
  const createSafeTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      callback();
      intervalsRef.current.delete(timeout as any);
    }, delay);
    registerInterval(timeout as any);
    return timeout;
  }, [registerInterval]);

  // Add event listener with cleanup
  const addEventListener = useCallback((
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(event, listener, options);
    
    const cleanup = () => {
      target.removeEventListener(event, listener, options);
    };
    
    registerEventListener(`${target.constructor.name}-${event}`, cleanup);
    
    return cleanup;
  }, [registerEventListener]);

  // Monitor memory usage
  const startMemoryMonitoring = useCallback(() => {
    if (!enabled || monitoringRef.current) return;

    monitoringRef.current = createSafeInterval(() => {
      const usage = memoryUtils.getUsage();
      if (usage && usage.percentage > memoryThreshold) {
        console.warn(`⚠️ Component memory usage high: ${usage.percentage.toFixed(1)}%`);
        memoryUtils.optimize();
      }
    }, monitorInterval);
  }, [enabled, memoryThreshold, monitorInterval, createSafeInterval]);

  // Stop memory monitoring
  const stopMemoryMonitoring = useCallback(() => {
    if (monitoringRef.current) {
      clearInterval(monitoringRef.current);
      monitoringRef.current = null;
    }
  }, []);

  // Clean up all resources
  const cleanup = useCallback(() => {
    // Clear all intervals
    intervalsRef.current.forEach(interval => {
      clearInterval(interval);
    });
    intervalsRef.current.clear();

    // Clear all event listeners
    eventListenersRef.current.forEach(cleanup => {
      cleanup();
    });
    eventListenersRef.current.clear();

    // Stop monitoring
    stopMemoryMonitoring();

    console.log('🧹 Component memory cleanup completed');
  }, [stopMemoryMonitoring]);

  // Get memory stats
  const getMemoryStats = useCallback(() => {
    return memoryUtils.getStats();
  }, []);

  // Check if memory is critical
  const isMemoryCritical = useCallback(() => {
    return memoryUtils.isCritical();
  }, []);

  // Optimize memory
  const optimizeMemory = useCallback(() => {
    memoryUtils.optimize();
  }, []);

  // Start monitoring on mount
  useEffect(() => {
    if (enabled) {
      startMemoryMonitoring();
    }

    return () => {
      if (cleanupOnUnmount) {
        cleanup();
      }
    };
  }, [enabled, cleanupOnUnmount, startMemoryMonitoring, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupOnUnmount) {
        cleanup();
      }
    };
  }, [cleanupOnUnmount, cleanup]);

  return {
    // Memory management
    registerInterval,
    registerEventListener,
    createSafeInterval,
    createSafeTimeout,
    addEventListener,
    
    // Monitoring
    startMemoryMonitoring,
    stopMemoryMonitoring,
    
    // Utilities
    cleanup,
    getMemoryStats,
    isMemoryCritical,
    optimizeMemory,
    
    // Current state
    intervalsCount: intervalsRef.current.size,
    eventListenersCount: eventListenersRef.current.size,
    isMonitoring: !!monitoringRef.current
  };
};

export default useMemoryOptimization; 