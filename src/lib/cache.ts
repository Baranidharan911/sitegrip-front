// src/lib/cache.ts
// High-performance caching system for handling 50+ concurrent users

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  evictions: number;
}

class HighPerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    memoryUsage: 0,
    evictions: 0,
  };
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private readonly MAX_MEMORY_USAGE = 100 * 1024 * 1024; // 100MB

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
    this.startCleanup();
  }

  // Set cache entry with TTL
  set<T>(key: string, value: T, ttl: number = 3600000): void {
    const now = Date.now();
    
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Check memory usage
    if (this.stats.memoryUsage > this.MAX_MEMORY_USAGE) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now,
    });

    this.stats.size = this.cache.size;
    this.updateMemoryUsage();
  }

  // Get cache entry with LRU updates
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;

    return entry.value;
  }

  // Batch get multiple keys
  mget<T>(keys: string[]): Map<string, T | null> {
    const results = new Map<string, T | null>();
    
    for (const key of keys) {
      results.set(key, this.get<T>(key));
    }
    
    return results;
  }

  // Batch set multiple entries
  mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    for (const { key, value, ttl } of entries) {
      this.set(key, value, ttl);
    }
  }

  // Delete cache entry
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
    }
    return deleted;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.memoryUsage = 0;
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache keys
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Check if key exists
  has(key: string): boolean {
    return this.cache.has(key);
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Evict least recently used entry
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  // Evict oldest entries by timestamp
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Evict 20% of oldest entries
    const toEvict = Math.ceil(entries.length * 0.2);
    
    for (let i = 0; i < toEvict; i++) {
      this.cache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }

  // Update memory usage estimation
  private updateMemoryUsage(): void {
    // Rough estimation: 100 bytes per entry + value size
    this.stats.memoryUsage = this.cache.size * 100;
  }

  // Start cleanup interval
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
    }
  }

  // Stop cleanup interval
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Connection pool for API calls
class ConnectionPool {
  private connections: Map<string, { connection: any; lastUsed: number; inUse: boolean }> = new Map();
  private maxConnections: number;
  private connectionTimeout: number;

  constructor(maxConnections: number = 10, connectionTimeout: number = 30000) {
    this.maxConnections = maxConnections;
    this.connectionTimeout = connectionTimeout;
  }

  async getConnection(key: string): Promise<any> {
    const existing = this.connections.get(key);
    
    if (existing && !existing.inUse) {
      existing.inUse = true;
      existing.lastUsed = Date.now();
      return existing.connection;
    }

    if (this.connections.size >= this.maxConnections) {
      this.cleanupOldConnections();
    }

    const connection = await this.createConnection(key);
    this.connections.set(key, {
      connection,
      lastUsed: Date.now(),
      inUse: true,
    });

    return connection;
  }

  releaseConnection(key: string): void {
    const connection = this.connections.get(key);
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = Date.now();
    }
  }

  private async createConnection(key: string): Promise<any> {
    // Simulate connection creation
    return { key, createdAt: Date.now() };
  }

  private cleanupOldConnections(): void {
    const now = Date.now();
    for (const [key, conn] of this.connections.entries()) {
      if (now - conn.lastUsed > this.connectionTimeout) {
        this.connections.delete(key);
      }
    }
  }
}

// Global cache instances
export const apiCache = new HighPerformanceCache(2000); // 2000 entries for API responses
export const userCache = new HighPerformanceCache(500);  // 500 entries for user data
export const sessionCache = new HighPerformanceCache(1000); // 1000 entries for sessions

// Connection pools
export const apiConnectionPool = new ConnectionPool(20, 60000); // 20 connections, 1 minute timeout
export const databaseConnectionPool = new ConnectionPool(10, 300000); // 10 connections, 5 minutes timeout

// Cache decorator for functions
export function cached<T extends (...args: any[]) => any>(
  cache: HighPerformanceCache,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 3600000
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const key = keyGenerator(...args);
      const cached = cache.get<ReturnType<T>>(key);
      
      if (cached !== null) {
        return cached;
      }

      const result = await method.apply(this, args);
      cache.set(key, result, ttl);
      return result;
    };
  };
}

// Utility functions
export const cacheUtils = {
  // Generate cache key from function name and arguments
  generateKey: (functionName: string, ...args: any[]): string => {
    return `${functionName}:${JSON.stringify(args)}`;
  },

  // Cache API responses
  cacheApiResponse: async <T>(
    key: string,
    apiCall: () => Promise<T>,
    ttl: number = 300000 // 5 minutes default
  ): Promise<T> => {
    const cached = apiCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await apiCall();
    apiCache.set(key, result, ttl);
    return result;
  },

  // Cache user data
  cacheUserData: <T>(userId: string, data: T, ttl: number = 1800000): void => {
    userCache.set(`user:${userId}`, data, ttl);
  },

  // Get cached user data
  getCachedUserData: <T>(userId: string): T | null => {
    return userCache.get<T>(`user:${userId}`);
  },

  // Invalidate user cache
  invalidateUserCache: (userId: string): void => {
    userCache.delete(`user:${userId}`);
  },

  // Cache session data
  cacheSessionData: <T>(sessionId: string, data: T, ttl: number = 3600000): void => {
    sessionCache.set(`session:${sessionId}`, data, ttl);
  },

  // Get cached session data
  getCachedSessionData: <T>(sessionId: string): T | null => {
    return sessionCache.get<T>(`session:${sessionId}`);
  },

  // Get cache statistics
  getStats: () => ({
    api: apiCache.getStats(),
    user: userCache.getStats(),
    session: sessionCache.getStats(),
  }),

  // Clear all caches
  clearAll: () => {
    apiCache.clear();
    userCache.clear();
    sessionCache.clear();
  },
};

export default HighPerformanceCache; 