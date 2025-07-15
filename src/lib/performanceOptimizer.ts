// src/lib/performanceOptimizer.ts
// Comprehensive performance optimization for handling 50+ concurrent users

import { cacheUtils, apiCache, userCache, sessionCache } from './cache';

interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  cacheHitRate: number;
  errorRate: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

class PerformanceOptimizer {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private memoryThreshold = 0.8; // 80% memory usage threshold
  private cpuThreshold = 0.7; // 70% CPU usage threshold

  constructor() {
    this.startMonitoring();
  }

  // Database query optimization
  optimizeQuery(query: string, params: any[] = []): { optimizedQuery: string; optimizedParams: any[] } {
    // Add query caching
    const queryKey = this.generateQueryKey(query, params);
    const cached = apiCache.get<{ optimizedQuery: string; optimizedParams: any[] }>(queryKey);
    
    if (cached && cached.optimizedQuery && cached.optimizedParams) {
      return cached;
    }

    // Basic query optimization
    let optimizedQuery = query;
    let optimizedParams = [...params];

    // Remove unnecessary whitespace
    optimizedQuery = optimizedQuery.replace(/\s+/g, ' ').trim();

    // Add LIMIT if not present for large result sets
    if (!optimizedQuery.toLowerCase().includes('limit') && !optimizedQuery.toLowerCase().includes('count')) {
      optimizedQuery += ' LIMIT 1000';
    }

    // Cache the optimized query
    const result = { optimizedQuery, optimizedParams };
    apiCache.set(queryKey, result, 300000); // 5 minutes

    return result;
  }

  // API rate limiting
  createRateLimiter(key: string, config: RateLimitConfig): RateLimiter {
    if (!this.rateLimiters.has(key)) {
      this.rateLimiters.set(key, new RateLimiter(config));
    }
    return this.rateLimiters.get(key)!;
  }

  // Memory management
  checkMemoryUsage(): boolean {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      if (usage > this.memoryThreshold) {
        this.cleanupMemory();
        return false;
      }
    }
    return true;
  }

  // Load balancing for API calls
  async loadBalancedApiCall<T>(
    endpoints: string[],
    apiCall: (endpoint: string) => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    const shuffledEndpoints = this.shuffleArray([...endpoints]);
    
    for (let i = 0; i < shuffledEndpoints.length; i++) {
      const endpoint = shuffledEndpoints[i];
      
      try {
        const result = await this.withTimeout(apiCall(endpoint), 10000); // 10s timeout
        return result;
      } catch (error) {
        console.warn(`API call failed for endpoint ${endpoint}:`, error);
        
        if (i === shuffledEndpoints.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('All API endpoints failed');
  }

  // Connection pooling
  async withConnectionPool<T>(
    poolKey: string,
    operation: (connection: any) => Promise<T>
  ): Promise<T> {
    // Simulate connection pool usage
    const connection = await this.getConnection(poolKey);
    
    try {
      const result = await operation(connection);
      return result;
    } finally {
      this.releaseConnection(poolKey, connection);
    }
  }

  // Performance monitoring
  recordMetric(key: string, metric: Partial<PerformanceMetrics>): void {
    const existing = this.metrics.get(key) || {
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0,
      cacheHitRate: 0,
      errorRate: 0,
    };

    this.metrics.set(key, { ...existing, ...metric });
  }

  // Get performance statistics
  getPerformanceStats(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  // Batch operations
  async batchOperations<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
      
      // Add small delay between batches to prevent overwhelming
      if (i + batchSize < operations.length) {
        await this.delay(100);
      }
    }
    
    return results;
  }

  // Resource optimization
  optimizeResources(): void {
    // Optimize images
    this.optimizeImages();
    
    // Optimize scripts
    this.optimizeScripts();
    
    // Optimize styles
    this.optimizeStyles();
  }

  // Private methods
  private generateQueryKey(query: string, params: any[]): string {
    return `query:${btoa(query)}:${JSON.stringify(params)}`;
  }

  private cleanupMemory(): void {
    // Clear old cache entries
    apiCache.clear();
    userCache.clear();
    sessionCache.clear();
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }

  private async getConnection(key: string): Promise<any> {
    // Simulate connection acquisition
    return { id: key, createdAt: Date.now() };
  }

  private releaseConnection(key: string, connection: any): void {
    // Simulate connection release
    console.log(`Released connection ${key}`);
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.checkMemoryUsage();
      this.recordSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  private recordSystemMetrics(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      this.recordMetric('system', {
        memoryUsage,
        activeConnections: this.rateLimiters.size,
        cacheHitRate: this.calculateCacheHitRate(),
      });
    }
  }

  private calculateCacheHitRate(): number {
    const stats = cacheUtils.getStats();
    const totalHits = stats.api.hits + stats.user.hits + stats.session.hits;
    const totalRequests = totalHits + stats.api.misses + stats.user.misses + stats.session.misses;
    
    return totalRequests > 0 ? totalHits / totalRequests : 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private optimizeImages(): void {
    // Implement image optimization logic
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
    });
  }

  private optimizeScripts(): void {
    // Implement script optimization logic
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (!script.async && !script.defer) {
        script.defer = true;
      }
    });
  }

  private optimizeStyles(): void {
    // Implement style optimization logic
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    styles.forEach(style => {
      if (style instanceof HTMLLinkElement && !style.media) {
        style.media = 'all';
      }
    });
  }
}

// Rate limiter class
class RateLimiter {
  private requests: number[] = [];
  private windowMs: number;
  private maxRequests: number;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
  }

  isAllowed(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Remove old requests
    this.requests = this.requests.filter(time => time > windowStart);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.requests = this.requests.filter(time => time > windowStart);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}

// Global performance optimizer instance
export const performanceOptimizer = new PerformanceOptimizer();

// Utility functions for easy access
export const performanceUtils = {
  // Optimize API calls with caching and rate limiting
  optimizedApiCall: async <T>(
    key: string,
    apiCall: () => Promise<T>,
    options: {
      ttl?: number;
      rateLimit?: RateLimitConfig;
      retries?: number;
    } = {}
  ): Promise<T> => {
    const { ttl = 300000, rateLimit, retries = 3 } = options;
    
    // Check rate limiting
    if (rateLimit) {
      const limiter = performanceOptimizer.createRateLimiter(key, rateLimit);
      if (!limiter.isAllowed()) {
        throw new Error('Rate limit exceeded');
      }
    }
    
    // Use cached response if available
    return cacheUtils.cacheApiResponse(key, apiCall, ttl);
  },

  // Optimize database queries
  optimizedQuery: (query: string, params: any[] = []) => {
    return performanceOptimizer.optimizeQuery(query, params);
  },

  // Batch operations
  batchOperations: <T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 10
  ) => {
    return performanceOptimizer.batchOperations(operations, batchSize);
  },

  // Load balanced API calls
  loadBalancedApiCall: <T>(
    endpoints: string[],
    apiCall: (endpoint: string) => Promise<T>,
    retries: number = 3
  ) => {
    return performanceOptimizer.loadBalancedApiCall(endpoints, apiCall, retries);
  },

  // Record performance metrics
  recordMetric: (key: string, metric: Partial<PerformanceMetrics>) => {
    performanceOptimizer.recordMetric(key, metric);
  },

  // Get performance statistics
  getStats: () => {
    return performanceOptimizer.getPerformanceStats();
  },

  // Check system health
  checkSystemHealth: () => {
    return {
      memoryOk: performanceOptimizer.checkMemoryUsage(),
      cacheStats: cacheUtils.getStats(),
      performanceStats: performanceOptimizer.getPerformanceStats(),
    };
  },
};

export default PerformanceOptimizer; 