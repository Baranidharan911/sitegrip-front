// src/app/api/health/route.ts
// Health check endpoint for monitoring system performance with 50+ concurrent users

import { NextRequest, NextResponse } from 'next/server';
import { performanceOptimizer } from '@/lib/performanceOptimizer';
import { databaseOptimizer } from '@/lib/databaseOptimizer';
import { apiOptimizer } from '@/lib/apiOptimizer';
import { cacheUtils } from '@/lib/cache';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: CheckResult;
    cache: CheckResult;
    api: CheckResult;
    memory: CheckResult;
    performance: CheckResult;
  };
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    cacheHitRate: number;
    errorRate: number;
    requestsPerSecond: number;
  };
  warnings: string[];
  errors: string[];
}

interface CheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  responseTime?: number;
  details?: any;
}

// Global request counter for RPS calculation
let requestCount = 0;
let lastRequestTime = Date.now();
let requestsPerSecond = 0;

// Update RPS calculation
function updateRPS() {
  const now = Date.now();
  const timeDiff = now - lastRequestTime;
  
  if (timeDiff >= 1000) {
    requestsPerSecond = requestCount;
    requestCount = 0;
    lastRequestTime = now;
  }
  
  requestCount++;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  updateRPS();

  try {
    // Perform health checks
    const checks = await performHealthChecks();
    
    // Calculate metrics
    const metrics = await calculateMetrics();
    
    // Determine overall status
    const status = determineOverallStatus(checks);
    
    // Collect warnings and errors
    const warnings = collectWarnings(checks, metrics);
    const errors = collectErrors(checks);

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metrics,
      warnings,
      errors,
    };

    const responseTime = Date.now() - startTime;

    // Add performance headers
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Response-Time': `${responseTime}ms`,
      'X-Requests-Per-Second': requestsPerSecond.toString(),
      'X-Health-Status': status,
    };

    return NextResponse.json(healthStatus, { 
      status: status === 'unhealthy' ? 503 : 200,
      headers 
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': 'unhealthy',
      }
    });
  }
}

// Perform comprehensive health checks
async function performHealthChecks(): Promise<HealthStatus['checks']> {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    api: await checkAPI(),
    memory: await checkMemory(),
    performance: await checkPerformance(),
  };

  return checks;
}

// Database health check
async function checkDatabase(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const stats = databaseOptimizer.getConnectionStats();
    const responseTime = Date.now() - startTime;

    // Check connection pool health
    const connectionHealth = stats.active <= stats.total * 0.8;
    const waitingConnections = stats.waiting === 0;

    if (!connectionHealth) {
      return {
        status: 'warn',
        message: 'High connection pool usage',
        responseTime,
        details: stats,
      };
    }

    if (!waitingConnections) {
      return {
        status: 'warn',
        message: 'Connection pool at capacity',
        responseTime,
        details: stats,
      };
    }

    return {
      status: 'pass',
      message: 'Database connections healthy',
      responseTime,
      details: stats,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Database check failed',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

// Cache health check
async function checkCache(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const stats = cacheUtils.getStats();
    const responseTime = Date.now() - startTime;

    // Check cache hit rate
    const totalCacheRequests = stats.api.hits + stats.api.misses;
    const hitRate = totalCacheRequests > 0 ? stats.api.hits / totalCacheRequests : 0;
    const memoryUsage = stats.api.memoryUsage;

    if (hitRate < 0.5) {
      return {
        status: 'warn',
        message: `Low cache hit rate: ${(hitRate * 100).toFixed(1)}%`,
        responseTime,
        details: stats,
      };
    }

    if (memoryUsage > 50 * 1024 * 1024) { // 50MB
      return {
        status: 'warn',
        message: 'High cache memory usage',
        responseTime,
        details: stats,
      };
    }

    return {
      status: 'pass',
      message: 'Cache system healthy',
      responseTime,
      details: stats,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Cache check failed',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

// API health check
async function checkAPI(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const stats = apiOptimizer.getStats();
    const responseTime = Date.now() - startTime;

    // Check error rate
    const totalRequests = stats.totalRequests;
    const failedRequests = stats.failedRequests;
    const errorRate = totalRequests > 0 ? failedRequests / totalRequests : 0;

    if (errorRate > 0.1) { // 10% error rate
      return {
        status: 'warn',
        message: `High API error rate: ${(errorRate * 100).toFixed(1)}%`,
        responseTime,
        details: stats,
      };
    }

    if (stats.rateLimitedRequests > 0) {
      return {
        status: 'warn',
        message: 'API rate limiting active',
        responseTime,
        details: stats,
      };
    }

    return {
      status: 'pass',
      message: 'API system healthy',
      responseTime,
      details: stats,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'API check failed',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

// Memory health check
async function checkMemory(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    let memoryUsage = 0;
    
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
    } else {
      // Server-side memory check
      const memUsage = process.memoryUsage();
      memoryUsage = memUsage.heapUsed / memUsage.heapTotal;
    }

    const responseTime = Date.now() - startTime;

    if (memoryUsage > 0.9) {
      return {
        status: 'fail',
        message: `Critical memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
        responseTime,
        details: { memoryUsage },
      };
    }

    if (memoryUsage > 0.8) {
      return {
        status: 'warn',
        message: `High memory usage: ${(memoryUsage * 100).toFixed(1)}%`,
        responseTime,
        details: { memoryUsage },
      };
    }

    return {
      status: 'pass',
      message: 'Memory usage healthy',
      responseTime,
      details: { memoryUsage },
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Memory check failed',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

// Performance health check
async function checkPerformance(): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const stats = performanceOptimizer.getPerformanceStats();
    const responseTime = Date.now() - startTime;

    // Check for performance issues
    const performanceIssues = Array.from(stats.values()).filter(
      metric => metric.responseTime > 1000 || metric.errorRate > 0.1
    );

    if (performanceIssues.length > 0) {
      return {
        status: 'warn',
        message: `${performanceIssues.length} performance issues detected`,
        responseTime,
        details: { issues: performanceIssues },
      };
    }

    return {
      status: 'pass',
      message: 'Performance metrics healthy',
      responseTime,
      details: stats,
    };
  } catch (error) {
    return {
      status: 'fail',
      message: 'Performance check failed',
      responseTime: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

// Calculate system metrics
async function calculateMetrics(): Promise<HealthStatus['metrics']> {
  const stats = performanceOptimizer.getPerformanceStats();
  const apiStats = apiOptimizer.getStats();
  const dbStats = databaseOptimizer.getConnectionStats();
  const cacheStats = cacheUtils.getStats();

  // Calculate average response time
  const responseTimes = Array.from(stats.values()).map(s => s.responseTime);
  const avgResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : 0;

  // Calculate memory usage
  let memoryUsage = 0;
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
  }

  // Calculate cache hit rate
  const totalCacheRequests = cacheStats.api.hits + cacheStats.api.misses;
  const cacheHitRate = totalCacheRequests > 0 
    ? cacheStats.api.hits / totalCacheRequests 
    : 0;

  // Calculate error rate
  const totalRequests = apiStats.totalRequests;
  const errorRate = totalRequests > 0 
    ? apiStats.failedRequests / totalRequests 
    : 0;

  return {
    responseTime: avgResponseTime,
    memoryUsage,
    cpuUsage: 0, // Would need system monitoring for this
    activeConnections: dbStats.active,
    cacheHitRate,
    errorRate,
    requestsPerSecond,
  };
}

// Determine overall health status
function determineOverallStatus(checks: HealthStatus['checks']): HealthStatus['status'] {
  const hasFailures = Object.values(checks).some(check => check.status === 'fail');
  const hasWarnings = Object.values(checks).some(check => check.status === 'warn');

  if (hasFailures) {
    return 'unhealthy';
  } else if (hasWarnings) {
    return 'degraded';
  } else {
    return 'healthy';
  }
}

// Collect warnings
function collectWarnings(checks: HealthStatus['checks'], metrics: HealthStatus['metrics']): string[] {
  const warnings: string[] = [];

  // Check-based warnings
  Object.entries(checks).forEach(([name, check]) => {
    if (check.status === 'warn') {
      warnings.push(`${name}: ${check.message}`);
    }
  });

  // Metric-based warnings
  if (metrics.memoryUsage > 0.8) {
    warnings.push(`High memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`);
  }

  if (metrics.responseTime > 1000) {
    warnings.push(`Slow response time: ${metrics.responseTime.toFixed(0)}ms`);
  }

  if (metrics.cacheHitRate < 0.5) {
    warnings.push(`Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
  }

  if (metrics.errorRate > 0.1) {
    warnings.push(`High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`);
  }

  return warnings;
}

// Collect errors
function collectErrors(checks: HealthStatus['checks']): string[] {
  return Object.entries(checks)
    .filter(([, check]) => check.status === 'fail')
    .map(([name, check]) => `${name}: ${check.message}`);
} 