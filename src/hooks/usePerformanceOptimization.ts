import { useCallback, useEffect, useRef, useState } from 'react';

interface PerformanceOptimizationOptions {
  debounceMs?: number;
  throttleMs?: number;
  enableIntersectionObserver?: boolean;
  enableResizeObserver?: boolean;
}

export const usePerformanceOptimization = (options: PerformanceOptimizationOptions = {}) => {
  const {
    debounceMs = 150,
    throttleMs = 100,
    enableIntersectionObserver = true,
    enableResizeObserver = false,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const throttleRef = useRef<NodeJS.Timeout>();

  // Debounce function
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(func: T): T => {
      return ((...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => func(...args), debounceMs);
      }) as T;
    },
    [debounceMs]
  );

  // Throttle function
  const throttle = useCallback(
    <T extends (...args: any[]) => any>(func: T): T => {
      return ((...args: Parameters<T>) => {
        if (throttleRef.current) return;
        throttleRef.current = setTimeout(() => {
          func(...args);
          throttleRef.current = undefined;
        }, throttleMs);
      }) as T;
    },
    [throttleMs]
  );

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableIntersectionObserver || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [enableIntersectionObserver]);

  // Resize Observer for responsive optimizations
  useEffect(() => {
    if (!enableResizeObserver || !elementRef.current) return;

    const observer = new ResizeObserver(
      throttle((entries) => {
        entries.forEach((entry) => {
          // Handle resize events
          const { width, height } = entry.contentRect;
          // You can add custom resize logic here
        });
      })
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [enableResizeObserver, throttle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  // Performance measurement utilities
  const measureRender = useCallback((name: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${name} render time: ${duration.toFixed(2)}ms`);
      }
    };
  }, []);

  const measureInteraction = useCallback((name: string) => {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`👆 ${name} interaction time: ${duration.toFixed(2)}ms`);
      }
    };
  }, []);

  // Memory optimization utilities
  const memoizeValue = useCallback(<T>(value: T, deps: any[]): T => {
    // This is a simplified memoization - in practice, use useMemo
    return value;
  }, []);

  // Event optimization utilities
  const optimizeScroll = useCallback(
    (handler: (event: Event) => void) => throttle(handler),
    [throttle]
  );

  const optimizeResize = useCallback(
    (handler: (event: Event) => void) => debounce(handler),
    [debounce]
  );

  const optimizeInput = useCallback(
    (handler: (event: Event) => void) => debounce(handler),
    [debounce]
  );

  return {
    // State
    isVisible,
    isInViewport,
    elementRef,

    // Utilities
    debounce,
    throttle,
    measureRender,
    measureInteraction,
    memoizeValue,

    // Event optimizers
    optimizeScroll,
    optimizeResize,
    optimizeInput,
  };
}; 