// src/lib/databaseOptimizer.ts
// Database optimization for handling 50+ concurrent users

import { cacheUtils } from './cache';

interface DatabaseConfig {
  maxConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  enableQueryCache: boolean;
  enableConnectionPooling: boolean;
  enableQueryOptimization: boolean;
}

interface QueryPlan {
  query: string;
  estimatedCost: number;
  indexes: string[];
  optimization: string[];
}

interface ConnectionStats {
  active: number;
  idle: number;
  total: number;
  waiting: number;
}

class DatabaseOptimizer {
  private config: DatabaseConfig;
  private connectionPool: Map<string, any> = new Map();
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>();
  private queryStats = new Map<string, { count: number; avgTime: number; lastUsed: number }>();
  private indexes = new Set<string>();

  constructor(config: Partial<DatabaseConfig> = {}) {
    this.config = {
      maxConnections: 20,
      connectionTimeout: 30000,
      queryTimeout: 10000,
      enableQueryCache: true,
      enableConnectionPooling: true,
      enableQueryOptimization: true,
      ...config,
    };

    this.initializeIndexes();
  }

  // Connection pooling
  async getConnection(key: string): Promise<any> {
    if (!this.config.enableConnectionPooling) {
      return this.createConnection(key);
    }

    const existing = this.connectionPool.get(key);
    if (existing && !existing.inUse) {
      existing.inUse = true;
      existing.lastUsed = Date.now();
      return existing.connection;
    }

    if (this.connectionPool.size >= this.config.maxConnections) {
      this.cleanupConnections();
    }

    const connection = await this.createConnection(key);
    this.connectionPool.set(key, {
      connection,
      inUse: true,
      lastUsed: Date.now(),
      createdAt: Date.now(),
    });

    return connection;
  }

  releaseConnection(key: string): void {
    const poolEntry = this.connectionPool.get(key);
    if (poolEntry) {
      poolEntry.inUse = false;
      poolEntry.lastUsed = Date.now();
    }
  }

  // Query optimization
  async optimizedQuery<T>(
    query: string,
    params: any[] = [],
    options: {
      cache?: boolean;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const { cache = true, timeout = this.config.queryTimeout, retries = 3 } = options;
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(query, params);
    
    // Check cache first
    if (cache && this.config.enableQueryCache) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        this.updateQueryStats(cacheKey, 0); // Cache hit
        return cached.result;
      }
    }

    // Optimize query
    const optimizedQuery = this.optimizeQuery(query);
    
    // Execute with retries
    let lastError: Error | null = null;
    for (let i = 0; i < retries; i++) {
      try {
        const startTime = Date.now();
        const result = await this.executeQuery<T>(optimizedQuery, params, timeout);
        const executionTime = Date.now() - startTime;
        
        // Update statistics
        this.updateQueryStats(cacheKey, executionTime);
        
        // Cache result
        if (cache && this.config.enableQueryCache) {
          this.queryCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
            ttl: this.calculateCacheTTL(executionTime),
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Query attempt ${i + 1} failed:`, error);
        
        if (i < retries - 1) {
          await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
        }
      }
    }
    
    throw lastError || new Error('Query execution failed');
  }

  // Batch operations
  async batchQuery<T>(
    queries: Array<{ query: string; params?: any[] }>,
    options: {
      batchSize?: number;
      parallel?: boolean;
      transaction?: boolean;
    } = {}
  ): Promise<T[]> {
    const { batchSize = 10, parallel = true, transaction = false } = options;
    
    if (transaction) {
      return this.executeTransaction(queries);
    }
    
    if (parallel) {
      return this.executeParallelBatch(queries, batchSize);
    } else {
      return this.executeSequentialBatch(queries, batchSize);
    }
  }

  // Index management
  async createIndex(table: string, columns: string[], type: 'btree' | 'hash' | 'gin' = 'btree'): Promise<void> {
    const indexName = `${table}_${columns.join('_')}_idx`;
    
    if (this.indexes.has(indexName)) {
      return; // Index already exists
    }
    
    const query = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${table} USING ${type} (${columns.join(', ')})`;
    
    try {
      await this.optimizedQuery(query, [], { cache: false });
      this.indexes.add(indexName);
      console.log(`✅ Created index: ${indexName}`);
    } catch (error) {
      console.error(`❌ Failed to create index ${indexName}:`, error);
    }
  }

  // Query analysis
  async analyzeQuery(query: string): Promise<QueryPlan> {
    const plan = await this.optimizedQuery('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' + query);
    
    return {
      query,
      estimatedCost: this.extractCost(plan),
      indexes: this.extractIndexes(plan),
      optimization: this.generateOptimizations(query, plan),
    };
  }

  // Performance monitoring
  getConnectionStats(): ConnectionStats {
    let active = 0;
    let idle = 0;
    let waiting = 0;
    
    for (const [, entry] of this.connectionPool) {
      if (entry.inUse) {
        active++;
      } else {
        idle++;
      }
    }
    
    return {
      active,
      idle,
      total: this.connectionPool.size,
      waiting: Math.max(0, this.config.maxConnections - this.connectionPool.size),
    };
  }

  getQueryStats(): Map<string, { count: number; avgTime: number; lastUsed: number }> {
    return new Map(this.queryStats);
  }

  // Cache management
  clearQueryCache(): void {
    this.queryCache.clear();
  }

  getCacheStats(): { size: number; hitRate: number } {
    const totalQueries = this.queryStats.size;
    const cachedQueries = this.queryCache.size;
    const hitRate = totalQueries > 0 ? cachedQueries / totalQueries : 0;
    
    return { size: this.queryCache.size, hitRate };
  }

  // Private methods
  private async createConnection(key: string): Promise<any> {
    // Simulate connection creation
    return {
      id: key,
      createdAt: Date.now(),
      status: 'connected',
    };
  }

  private cleanupConnections(): void {
    const now = Date.now();
    const timeout = this.config.connectionTimeout;
    
    for (const [key, entry] of this.connectionPool.entries()) {
      if (now - entry.lastUsed > timeout) {
        this.connectionPool.delete(key);
      }
    }
  }

  private generateCacheKey(query: string, params: any[]): string {
    return `query:${btoa(query)}:${JSON.stringify(params)}`;
  }

  private optimizeQuery(query: string): string {
    if (!this.config.enableQueryOptimization) {
      return query;
    }

    let optimized = query;

    // Remove unnecessary whitespace
    optimized = optimized.replace(/\s+/g, ' ').trim();

    // Add LIMIT for large result sets
    if (!optimized.toLowerCase().includes('limit') && !optimized.toLowerCase().includes('count')) {
      optimized += ' LIMIT 1000';
    }

    // Optimize SELECT statements
    if (optimized.toLowerCase().startsWith('select')) {
      // Replace SELECT * with specific columns if possible
      if (optimized.includes('SELECT *')) {
        // This would require schema knowledge - simplified for now
        console.log('⚠️ Consider replacing SELECT * with specific columns');
      }
    }

    return optimized;
  }

  private async executeQuery<T>(query: string, params: any[], timeout: number): Promise<T> {
    // Simulate query execution
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Query timeout'));
      }, timeout);

      // Simulate async query execution
      setTimeout(() => {
        clearTimeout(timer);
        resolve({ success: true, data: [] } as T);
      }, Math.random() * 1000); // Random execution time
    });
  }

  private updateQueryStats(cacheKey: string, executionTime: number): void {
    const existing = this.queryStats.get(cacheKey) || { count: 0, avgTime: 0, lastUsed: 0 };
    
    existing.count++;
    existing.avgTime = (existing.avgTime * (existing.count - 1) + executionTime) / existing.count;
    existing.lastUsed = Date.now();
    
    this.queryStats.set(cacheKey, existing);
  }

  private calculateCacheTTL(executionTime: number): number {
    // Longer TTL for expensive queries
    if (executionTime > 1000) {
      return 300000; // 5 minutes
    } else if (executionTime > 100) {
      return 60000; // 1 minute
    } else {
      return 30000; // 30 seconds
    }
  }

  private async executeTransaction<T>(queries: Array<{ query: string; params?: any[] }>): Promise<T[]> {
    // Simulate transaction execution
    const results: T[] = [];
    
    try {
      for (const { query, params = [] } of queries) {
        const result = await this.optimizedQuery<T>(query, params, { cache: false });
        results.push(result);
      }
      return results;
    } catch (error) {
      // Rollback would happen here in real implementation
      throw error;
    }
  }

  private async executeParallelBatch<T>(
    queries: Array<{ query: string; params?: any[] }>,
    batchSize: number
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchPromises = batch.map(({ query, params = [] }) =>
        this.optimizedQuery<T>(query, params)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  private async executeSequentialBatch<T>(
    queries: Array<{ query: string; params?: any[] }>,
    batchSize: number
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      
      for (const { query, params = [] } of batch) {
        const result = await this.optimizedQuery<T>(query, params);
        results.push(result);
      }
    }
    
    return results;
  }

  private initializeIndexes(): void {
    // Common indexes for performance
    const commonIndexes = [
      { table: 'users', columns: ['email'], type: 'btree' as const },
      { table: 'users', columns: ['created_at'], type: 'btree' as const },
      { table: 'sessions', columns: ['user_id', 'expires_at'], type: 'btree' as const },
      { table: 'logs', columns: ['timestamp'], type: 'btree' as const },
    ];
    
    commonIndexes.forEach(({ table, columns, type }) => {
      this.createIndex(table, columns, type);
    });
  }

  private extractCost(plan: any): number {
    // Extract estimated cost from query plan
    return plan?.[0]?.Plan?.Total_Cost || 0;
  }

  private extractIndexes(plan: any): string[] {
    // Extract used indexes from query plan
    const indexes: string[] = [];
    
    const extractFromNode = (node: any) => {
      if (node.Index_Name) {
        indexes.push(node.Index_Name);
      }
      if (node.Plans) {
        node.Plans.forEach(extractFromNode);
      }
    };
    
    if (plan?.[0]?.Plan) {
      extractFromNode(plan[0].Plan);
    }
    
    return indexes;
  }

  private generateOptimizations(query: string, plan: any): string[] {
    const optimizations: string[] = [];
    
    // Basic optimization suggestions
    if (query.toLowerCase().includes('select *')) {
      optimizations.push('Replace SELECT * with specific columns');
    }
    
    if (!query.toLowerCase().includes('limit')) {
      optimizations.push('Add LIMIT clause to prevent large result sets');
    }
    
    if (query.toLowerCase().includes('order by') && !query.toLowerCase().includes('limit')) {
      optimizations.push('Add LIMIT when using ORDER BY');
    }
    
    return optimizations;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global database optimizer instance
export const databaseOptimizer = new DatabaseOptimizer({
  maxConnections: 25, // Increased for 50+ users
  connectionTimeout: 60000, // 1 minute
  queryTimeout: 15000, // 15 seconds
  enableQueryCache: true,
  enableConnectionPooling: true,
  enableQueryOptimization: true,
});

// Utility functions for easy access
export const databaseUtils = {
  // Optimized query execution
  query: <T>(query: string, params: any[] = [], options?: any) => {
    return databaseOptimizer.optimizedQuery<T>(query, params, options);
  },

  // Batch query execution
  batchQuery: <T>(queries: Array<{ query: string; params?: any[] }>, options?: any) => {
    return databaseOptimizer.batchQuery<T>(queries, options);
  },

  // Create indexes
  createIndex: (table: string, columns: string[], type?: 'btree' | 'hash' | 'gin') => {
    return databaseOptimizer.createIndex(table, columns, type);
  },

  // Analyze query performance
  analyzeQuery: (query: string) => {
    return databaseOptimizer.analyzeQuery(query);
  },

  // Get database statistics
  getStats: () => {
    return {
      connections: databaseOptimizer.getConnectionStats(),
      queries: databaseOptimizer.getQueryStats(),
      cache: databaseOptimizer.getCacheStats(),
    };
  },

  // Clear query cache
  clearCache: () => {
    databaseOptimizer.clearQueryCache();
  },
};

export default DatabaseOptimizer; 