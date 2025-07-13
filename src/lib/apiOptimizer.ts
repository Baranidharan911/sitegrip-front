// src/lib/apiOptimizer.ts
// API optimization for handling 50+ concurrent users

import { cacheUtils } from './cache';

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  batchSize: number;
  enableCaching: boolean;
  enableBatching: boolean;
  enableRateLimiting: boolean;
}

interface ApiRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
  cached: boolean;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

class ApiOptimizer {
  private config: ApiConfig;
  private requestQueue: ApiRequest[] = [];
  private batchHandlers: Map<string, (response: ApiResponse<any>) => void> = new Map();
  private responseCache = new Map<string, { response: ApiResponse; timestamp: number; ttl: number }>();
  private rateLimiters = new Map<string, { requests: number[]; limit: number; window: number }>();
  private batchProcessor: NodeJS.Timeout | null = null;
  private stats = {
    totalRequests: 0,
    cachedResponses: 0,
    batchedRequests: 0,
    rateLimitedRequests: 0,
    failedRequests: 0,
  };

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: '',
      timeout: 10000,
      retries: 3,
      batchSize: 10,
      enableCaching: true,
      enableBatching: true,
      enableRateLimiting: true,
      ...config,
    };

    this.startBatchProcessor();
  }

  // Optimized API request
  async request<T>(
    method: string,
    url: string,
    data?: any,
    options: {
      headers?: Record<string, string>;
      priority?: 'low' | 'normal' | 'high' | 'critical';
      cache?: boolean;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      headers = {},
      priority = 'normal',
      cache = true,
      timeout = this.config.timeout,
      retries = this.config.retries,
    } = options;

    const requestId = this.generateRequestId();
    const fullUrl = this.buildUrl(url);
    const cacheKey = this.generateCacheKey(method, fullUrl, data);

    // Check cache first
    if (cache && this.config.enableCaching) {
      const cached = this.responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        this.stats.cachedResponses++;
        return { ...cached.response, cached: true };
      }
    }

    // Check rate limiting
    if (this.config.enableRateLimiting) {
      const rateLimitInfo = this.checkRateLimit(fullUrl);
      if (!rateLimitInfo.remaining) {
        this.stats.rateLimitedRequests++;
        throw new Error(`Rate limit exceeded. Reset in ${Math.ceil(rateLimitInfo.reset / 1000)}s`);
      }
    }

    // Create request
    const request: ApiRequest = {
      id: requestId,
      method,
      url: fullUrl,
      data,
      headers,
      priority,
      timestamp: Date.now(),
    };

    // Handle batching for GET requests
    if (this.config.enableBatching && method === 'GET' && priority === 'normal') {
      return this.batchRequest<T>(request);
    }

    // Execute request
    return this.executeRequest<T>(request, { timeout, retries, cache });
  }

  // Batch multiple requests
  async batchRequests<T>(requests: ApiRequest[]): Promise<ApiResponse<T>[]> {
    if (!this.config.enableBatching) {
      return Promise.all(requests.map(req => this.executeRequest<T>(req, {
        timeout: this.config.timeout,
        retries: this.config.retries,
        cache: true,
      })));
    }

    const batches = this.createBatches(requests, this.config.batchSize);
    const results: ApiResponse<T>[] = [];

    for (const batch of batches) {
      const batchResults = await this.executeBatch<T>(batch);
      results.push(...batchResults);
    }

    this.stats.batchedRequests += requests.length;
    return results;
  }

  // Preload critical resources
  async preloadResources(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(url => 
      this.request('GET', url, undefined, { 
        priority: 'low', 
        cache: true,
        timeout: 5000 
      }).catch(() => {
        // Ignore preload failures
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  // Warm up cache
  async warmCache(urls: string[]): Promise<void> {
    const warmPromises = urls.map(url =>
      this.request('GET', url, undefined, {
        priority: 'low',
        cache: true,
        timeout: 10000,
      }).catch(() => {
        // Ignore warm-up failures
      })
    );

    await Promise.allSettled(warmPromises);
  }

  // Get API statistics
  getStats() {
    return { ...this.stats };
  }

  // Clear response cache
  clearCache(): void {
    this.responseCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    const totalEntries = this.responseCache.size;
    const totalSize = Array.from(this.responseCache.values()).reduce(
      (sum, entry) => sum + JSON.stringify(entry.response).length,
      0
    );

    return {
      totalEntries,
      totalSize,
      hitRate: this.stats.totalRequests > 0 ? this.stats.cachedResponses / this.stats.totalRequests : 0,
    };
  }

  // Private methods
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    return `${this.config.baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  }

  private generateCacheKey(method: string, url: string, data?: any): string {
    const key = `${method}:${url}:${JSON.stringify(data || {})}`;
    return btoa(key);
  }

  private checkRateLimit(url: string): RateLimitInfo {
    const domain = new URL(url).hostname;
    const limiter = this.rateLimiters.get(domain);

    if (!limiter) {
      this.rateLimiters.set(domain, {
        requests: [],
        limit: 100, // Default limit
        window: 60000, // 1 minute window
      });
      return { remaining: 100, reset: 60000, limit: 100 };
    }

    const now = Date.now();
    const windowStart = now - limiter.window;

    // Remove old requests
    limiter.requests = limiter.requests.filter(time => time > windowStart);

    const remaining = Math.max(0, limiter.limit - limiter.requests.length);
    const reset = limiter.window - (now - (limiter.requests[0] || now));

    return { remaining, reset, limit: limiter.limit };
  }

  private async batchRequest<T>(request: ApiRequest): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.batchHandlers.delete(request.id);
        reject(new Error('Batch request timeout'));
      }, this.config.timeout);

      this.batchHandlers.set(request.id, (response: ApiResponse<T>) => {
        clearTimeout(timeout);
        resolve(response);
      });

      // Add to batch queue
      this.requestQueue.push(request);

      // Process batch if full
      if (this.requestQueue.length >= this.config.batchSize) {
        this.processBatch();
      }
    });
  }

  private async executeRequest<T>(
    request: ApiRequest,
    options: { timeout: number; retries: number; cache: boolean }
  ): Promise<ApiResponse<T>> {
    const { timeout, retries, cache } = options;
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const startTime = Date.now();
        const response = await this.makeHttpRequest<T>(request, timeout);
        const executionTime = Date.now() - startTime;

        this.stats.totalRequests++;

        // Cache successful responses
        if (cache && this.config.enableCaching && response.status === 200) {
          const cacheKey = this.generateCacheKey(request.method, request.url, request.data);
          this.responseCache.set(cacheKey, {
            response,
            timestamp: Date.now(),
            ttl: this.calculateCacheTTL(executionTime),
          });
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`API request attempt ${i + 1} failed:`, error);

        if (i < retries - 1) {
          await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
        }
      }
    }

    this.stats.failedRequests++;
    throw lastError || new Error('API request failed');
  }

  private async makeHttpRequest<T>(request: ApiRequest, timeout: number): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers,
        },
        body: request.data ? JSON.stringify(request.data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: Date.now(),
        cached: false,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async executeBatch<T>(requests: ApiRequest[]): Promise<ApiResponse<T>[]> {
    // Execute batch requests in parallel
    const promises = requests.map(req => this.executeRequest<T>(req, {
      timeout: this.config.timeout,
      retries: this.config.retries,
      cache: true,
    }));

    return Promise.all(promises);
  }

  private createBatches(requests: ApiRequest[], batchSize: number): ApiRequest[][] {
    const batches: ApiRequest[][] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    return batches;
  }

  private calculateCacheTTL(executionTime: number): number {
    // Longer TTL for expensive requests
    if (executionTime > 2000) {
      return 300000; // 5 minutes
    } else if (executionTime > 500) {
      return 60000; // 1 minute
    } else {
      return 30000; // 30 seconds
    }
  }

  private startBatchProcessor(): void {
    this.batchProcessor = setInterval(() => {
      if (this.requestQueue.length > 0) {
        this.processBatch();
      }
    }, 100); // Process batches every 100ms
  }

  private processBatch(): void {
    if (this.requestQueue.length === 0) return;

    const batch = this.requestQueue.splice(0, this.config.batchSize);
    this.executeBatch(batch).then(responses => {
      batch.forEach((request, index) => {
        const handler = this.batchHandlers.get(request.id);
        if (handler) {
          handler(responses[index]);
          this.batchHandlers.delete(request.id);
        }
      });
    }).catch(error => {
      batch.forEach(request => {
        const handler = this.batchHandlers.get(request.id);
        if (handler) {
          handler({ error } as any);
          this.batchHandlers.delete(request.id);
        }
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global API optimizer instance
export const apiOptimizer = new ApiOptimizer({
  timeout: 15000, // 15 seconds
  retries: 3,
  batchSize: 15, // Increased for 50+ users
  enableCaching: true,
  enableBatching: true,
  enableRateLimiting: true,
});

// Utility functions for easy access
export const apiUtils = {
  // Optimized GET request
  get: <T>(url: string, options?: any) => {
    return apiOptimizer.request<T>('GET', url, undefined, options);
  },

  // Optimized POST request
  post: <T>(url: string, data?: any, options?: any) => {
    return apiOptimizer.request<T>('POST', url, data, options);
  },

  // Optimized PUT request
  put: <T>(url: string, data?: any, options?: any) => {
    return apiOptimizer.request<T>('PUT', url, data, options);
  },

  // Optimized DELETE request
  delete: <T>(url: string, options?: any) => {
    return apiOptimizer.request<T>('DELETE', url, undefined, options);
  },

  // Batch requests
  batch: <T>(requests: ApiRequest[]) => {
    return apiOptimizer.batchRequests<T>(requests);
  },

  // Preload resources
  preload: (urls: string[]) => {
    return apiOptimizer.preloadResources(urls);
  },

  // Warm cache
  warmCache: (urls: string[]) => {
    return apiOptimizer.warmCache(urls);
  },

  // Get statistics
  getStats: () => {
    return apiOptimizer.getStats();
  },

  // Get cache statistics
  getCacheStats: () => {
    return apiOptimizer.getCacheStats();
  },

  // Clear cache
  clearCache: () => {
    apiOptimizer.clearCache();
  },
};

export default ApiOptimizer; 