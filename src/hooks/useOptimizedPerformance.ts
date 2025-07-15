// src/hooks/useOptimizedPerformance.ts
// Comprehensive performance optimization hook for 50+ concurrent users

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { performanceOptimizer } from '@/lib/performanceOptimizer';
import { databaseOptimizer } from '@/lib/databaseOptimizer';
import { apiOptimizer } from '@/lib/apiOptimizer';
import { cacheUtils } from '@/lib/cache';

interface PerformanceConfig {
  enableMonitoring: boolean;
  enableCaching: boolean;
  enableBatching: boolean;
  enableRateLimiting: boolean;
  enableConnectionPooling: boolean;
  enableQueryOptimization: boolean;
  enableMemoryManagement: boolean;
  enableLoadBalancing: boolean;
}

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  errorRate: number;
  activeConnections: number;
  queueLength: number;
}

interface OptimizationStats {
  api: {
    totalRequests: number;
    cachedResponses: number;
    batchedRequests: number;
    rateLimitedRequests: number;
    failedRequests: number;
  };
  database: {
    connections: {
      active: number;
      idle: number;
      total: number;
      waiting: number;
    };
    queries: Map<string, { count: number; avgTime: number; lastUsed: number }>;
    cache: {
      size: number;
      hitRate: number;
    };
  };
  cache: {
    api: { hits: number; misses: number; size: number; memoryUsage: number; evictions: number };
    user: { hits: number; misses: number; size: number; memoryUsage: number; evictions: number };
    session: { hits: number; misses: number; size: number; memoryUsage: number; evictions: number };
  };
}

export const useOptimizedPerformance = (config: Partial<PerformanceConfig> = {}) => {
  const {
    enableMonitoring = true,
    enableCaching = true,
    enableBatching = true,
    enableRateLimiting = true,
    enableConnectionPooling = true,
    enableQueryOptimization = true,
    enableMemoryManagement = true,
    enableLoadBalancing = true,
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    cacheHitRate: 0,
    errorRate: 0,
    activeConnections: 0,
    queueLength: 0,
  });

  const [stats, setStats] = useState<OptimizationStats | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Initialize performance optimizations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeOptimizations = async () => {
      try {
        // Initialize performance monitoring
        if (enableMonitoring) {
          initializePerformanceMonitoring();
        }

        // Initialize memory management
        if (enableMemoryManagement) {
          initializeMemoryManagement();
        }

        // Initialize connection pooling
        if (enableConnectionPooling) {
          await initializeConnectionPooling();
        }

        // Initialize load balancing
        if (enableLoadBalancing) {
          initializeLoadBalancing();
        }

        setIsOptimized(true);
        console.log('✅ Performance optimizations initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize performance optimizations:', error);
        setErrors(prev => [...prev, `Initialization failed: ${error}`]);
      }
    };

    initializeOptimizations();

    return () => {
      cleanup();
    };
  }, [enableMonitoring, enableMemoryManagement, enableConnectionPooling, enableLoadBalancing]);

  // Performance monitoring
  const initializePerformanceMonitoring = useCallback(() => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        performanceObserver.current = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              const measure = entry as PerformanceMeasure;
              setMetrics(prev => ({
                ...prev,
                responseTime: measure.duration,
              }));
            }
          }
        });

        performanceObserver.current.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const updateMemoryMetrics = () => {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage,
        }));

        // Warn if memory usage is high
        if (memoryUsage > 0.8) {
          setWarnings(prev => [...prev, `High memory usage: ${(memoryUsage * 100).toFixed(1)}%`]);
        }
      };

      updateMemoryMetrics();
      setInterval(updateMemoryMetrics, 10000); // Every 10 seconds
    }
  }, []);

  // Memory management
  const initializeMemoryManagement = useCallback(() => {
    const cleanupMemory = () => {
      // Clear old cache entries
      if (enableCaching) {
        cacheUtils.clearAll();
      }

      // Force garbage collection if available
      if (typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc();
      }
    };

    // Cleanup memory every 5 minutes
    setInterval(cleanupMemory, 300000);
  }, [enableCaching]);

  // Connection pooling
  const initializeConnectionPooling = useCallback(async () => {
    try {
      // Initialize database connection pool
      await databaseOptimizer.getConnection('default');
      
      // Initialize API connection pool
      await apiOptimizer.request('GET', '/health', undefined, { 
        priority: 'low',
        cache: false,
        timeout: 5000 
      });

      console.log('✅ Connection pools initialized');
    } catch (error) {
      console.warn('⚠️ Connection pool initialization failed:', error);
    }
  }, []);

  // Load balancing
  const initializeLoadBalancing = useCallback(() => {
    // Preload critical resources
    const criticalResources = [
      '/api/health',
      '/api/config',
      '/api/user/profile',
    ];

    apiOptimizer.preloadResources(criticalResources);
  }, []);

  // Optimized API calls
  const optimizedApiCall = useCallback(async <T>(
    endpoint: string,
    options: {
      method?: string;
      data?: any;
      headers?: Record<string, string>;
      priority?: 'low' | 'normal' | 'high' | 'critical';
      cache?: boolean;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> => {
    const {
      method = 'GET',
      data,
      headers = {},
      priority = 'normal',
      cache = enableCaching,
      timeout = 15000,
      retries = 3,
    } = options;

    try {
      const startTime = performance.now();
      
      const response = await apiOptimizer.request<T>(method, endpoint, data, {
        headers,
        priority,
        cache,
        timeout,
        retries,
      });

      const duration = performance.now() - startTime;
      
      // Record performance metric
      performanceOptimizer.recordMetric('api_call', {
        responseTime: duration,
      });

      return response.data;
    } catch (error) {
      // Record error metric
      performanceOptimizer.recordMetric('api_error', {
        errorRate: 1,
      });

      throw error;
    }
  }, [enableCaching]);

  // Optimized database queries
  const optimizedQuery = useCallback(async <T>(
    query: string,
    params: any[] = [],
    options: {
      cache?: boolean;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> => {
    const { cache = enableCaching, timeout = 10000, retries = 3 } = options;

    try {
      const startTime = performance.now();
      
      const result = await databaseOptimizer.optimizedQuery<T>(query, params, {
        cache,
        timeout,
        retries,
      });

      const duration = performance.now() - startTime;
      
      // Record performance metric
      performanceOptimizer.recordMetric('database_query', {
        responseTime: duration,
      });

      return result;
    } catch (error) {
      // Record error metric
      performanceOptimizer.recordMetric('database_error', {
        errorRate: 1,
      });

      throw error;
    }
  }, [enableCaching]);

  // Batch operations
  const batchOperations = useCallback(async <T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 10
  ): Promise<T[]> => {
    if (!enableBatching) {
      return Promise.all(operations.map(op => op()));
    }

    return performanceOptimizer.batchOperations(operations, batchSize);
  }, [enableBatching]);

  // Cache management
  const cacheData = useCallback(<T>(key: string, data: T, ttl: number = 300000): void => {
    if (enableCaching) {
      cacheUtils.cacheApiResponse(key, () => Promise.resolve(data), ttl);
    }
  }, [enableCaching]);

  const getCachedData = useCallback(<T>(key: string): T | null => {
    if (enableCaching) {
      return cacheUtils.getCachedUserData<T>(key);
    }
    return null;
  }, [enableCaching]);

  const clearCache = useCallback(() => {
    if (enableCaching) {
      cacheUtils.clearAll();
    }
  }, [enableCaching]);

  // Performance measurement
  const measurePerformance = useCallback((name: string, operation: () => Promise<any>) => {
    const startTime = performance.now();
    
    return operation().finally(() => {
      const duration = performance.now() - startTime;
      
      // Record performance metric
      performanceOptimizer.recordMetric(name, {
        responseTime: duration,
      });

      // Warn if operation is slow
      if (duration > 1000) {
        setWarnings(prev => [...prev, `Slow operation: ${name} took ${duration.toFixed(0)}ms`]);
      }
    });
  }, []);

  // Update statistics
  const updateStats = useCallback(() => {
    const apiStats = apiOptimizer.getStats();
    const databaseStats = databaseOptimizer.getConnectionStats();
    const cacheStats = cacheUtils.getStats();

    setStats({
      api: apiStats,
      database: {
        connections: databaseStats,
        queries: databaseOptimizer.getQueryStats(),
        cache: databaseOptimizer.getCacheStats(),
      },
      cache: cacheStats,
    });
  }, []);

  // Start monitoring
  useEffect(() => {
    if (!enableMonitoring) return;

    const startMonitoring = () => {
      // Update stats every 30 seconds
      monitoringInterval.current = setInterval(() => {
        updateStats();
        
        // Check system health
        const health = checkSystemHealth();
        
        if (!health.memoryOk) {
          setWarnings(prev => [...prev, 'High memory usage detected']);
        }
      }, 30000);

      // Initial stats update
      updateStats();
    };

    startMonitoring();

    return () => {
      if (monitoringInterval.current) {
        clearInterval(monitoringInterval.current);
      }
    };
  }, [enableMonitoring, updateStats]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }

    if (performanceObserver.current) {
      performanceObserver.current.disconnect();
    }

    // Clear warnings and errors
    setWarnings([]);
    setErrors([]);
  }, []);

  // Memoized values
  const performanceUtils = useMemo(() => ({
    optimizedApiCall,
    optimizedQuery,
    batchOperations,
    cacheData,
    getCachedData,
    clearCache,
    measurePerformance,
  }), [optimizedApiCall, optimizedQuery, batchOperations, cacheData, getCachedData, clearCache, measurePerformance]);

  // Utility function to check system health
  function checkSystemHealth() {
    return {
      memoryOk: typeof window !== 'undefined' && 'memory' in performance
        ? (performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize < 0.8
        : true,
      cacheStats: cacheUtils.getStats(),
      performanceStats: performanceOptimizer.getPerformanceStats(),
    };
  }

  const systemHealth = useMemo(() => {
    const health = checkSystemHealth();
    return {
      ...health,
      isOptimized,
      warnings: warnings.slice(-5), // Keep last 5 warnings
      errors: errors.slice(-5), // Keep last 5 errors
    };
  }, [isOptimized, warnings, errors]);

  return {
    // State
    metrics,
    stats,
    isOptimized,
    warnings,
    errors,
    systemHealth,

    // Utilities
    ...performanceUtils,

    // Management
    updateStats,
    cleanup,
  };
};

// Export utility functions for easy access
export const useOptimizedApi = () => {
  const { optimizedApiCall, batchOperations, cacheData, getCachedData } = useOptimizedPerformance();
  
  return {
    get: <T>(endpoint: string, options?: any) => optimizedApiCall<T>(endpoint, { method: 'GET', ...options }),
    post: <T>(endpoint: string, data?: any, options?: any) => optimizedApiCall<T>(endpoint, { method: 'POST', data, ...options }),
    put: <T>(endpoint: string, data?: any, options?: any) => optimizedApiCall<T>(endpoint, { method: 'PUT', data, ...options }),
    delete: <T>(endpoint: string, options?: any) => optimizedApiCall<T>(endpoint, { method: 'DELETE', ...options }),
    batch: batchOperations,
    cache: cacheData,
    getCached: getCachedData,
  };
};

export const useOptimizedDatabase = () => {
  const { optimizedQuery, batchOperations } = useOptimizedPerformance();
  
  return {
    query: optimizedQuery,
    batch: batchOperations,
  };
};

export default useOptimizedPerformance; 