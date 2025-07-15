// src/components/Common/PerformanceOptimizer.tsx
// React component for performance optimization and monitoring

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useOptimizedPerformance } from '@/hooks/useOptimizedPerformance';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  enableCaching?: boolean;
  enableBatching?: boolean;
  enableRateLimiting?: boolean;
  showWarnings?: boolean;
  showStats?: boolean;
}

interface PerformanceWarning {
  id: string;
  type: 'memory' | 'api' | 'database' | 'cache' | 'general';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  enableMonitoring = true,
  enableCaching = true,
  enableBatching = true,
  enableRateLimiting = true,
  showWarnings = process.env.NODE_ENV === 'development',
  showStats = process.env.NODE_ENV === 'development',
}) => {
  const {
    metrics,
    stats,
    isOptimized,
    warnings,
    errors,
    systemHealth,
    updateStats,
  } = useOptimizedPerformance({
    enableMonitoring,
    enableCaching,
    enableBatching,
    enableRateLimiting,
    enableConnectionPooling: true,
    enableQueryOptimization: true,
    enableMemoryManagement: true,
    enableLoadBalancing: true,
  });

  const [performanceWarnings, setPerformanceWarnings] = useState<PerformanceWarning[]>([]);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);

  // Monitor performance and generate warnings
  useEffect(() => {
    if (!enableMonitoring) return;

    const checkPerformance = () => {
      const newWarnings: PerformanceWarning[] = [];

      // Memory usage warnings
      if (metrics.memoryUsage > 0.8) {
        newWarnings.push({
          id: `memory-${Date.now()}`,
          type: 'memory',
          message: `High memory usage: ${(metrics.memoryUsage * 100).toFixed(1)}%`,
          severity: metrics.memoryUsage > 0.9 ? 'critical' : 'high',
          timestamp: Date.now(),
        });
      }

      // Response time warnings
      if (metrics.responseTime > 1000) {
        newWarnings.push({
          id: `response-${Date.now()}`,
          type: 'api',
          message: `Slow response time: ${metrics.responseTime.toFixed(0)}ms`,
          severity: metrics.responseTime > 3000 ? 'critical' : 'medium',
          timestamp: Date.now(),
        });
      }

      // Cache hit rate warnings
      if (metrics.cacheHitRate < 0.5) {
        newWarnings.push({
          id: `cache-${Date.now()}`,
          type: 'cache',
          message: `Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
          severity: 'medium',
          timestamp: Date.now(),
        });
      }

      // Error rate warnings
      if (metrics.errorRate > 0.1) {
        newWarnings.push({
          id: `error-${Date.now()}`,
          type: 'general',
          message: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`,
          severity: 'high',
          timestamp: Date.now(),
        });
      }

      setPerformanceWarnings(prev => {
        const combined = [...prev, ...newWarnings];
        // Keep only last 10 warnings
        return combined.slice(-10);
      });
    };

    const interval = setInterval(checkPerformance, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [enableMonitoring, metrics]);

  // Performance optimization tips
  const optimizationTips = useMemo(() => [
    {
      id: 'memory',
      title: 'Memory Management',
      tips: [
        'Use React.memo for expensive components',
        'Implement proper cleanup in useEffect',
        'Avoid memory leaks with event listeners',
        'Use lazy loading for large components',
      ],
    },
    {
      id: 'api',
      title: 'API Optimization',
      tips: [
        'Implement request batching',
        'Use caching for repeated requests',
        'Implement rate limiting',
        'Use connection pooling',
      ],
    },
    {
      id: 'cache',
      title: 'Caching Strategy',
      tips: [
        'Cache frequently accessed data',
        'Implement cache invalidation',
        'Use appropriate cache TTL',
        'Monitor cache hit rates',
      ],
    },
    {
      id: 'database',
      title: 'Database Optimization',
      tips: [
        'Optimize database queries',
        'Use proper indexing',
        'Implement query caching',
        'Monitor query performance',
      ],
    },
  ], []);

  // Get warning count by severity
  const warningCounts = useMemo(() => {
    return performanceWarnings.reduce((acc, warning) => {
      acc[warning.severity] = (acc[warning.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [performanceWarnings]);

  // Get severity color
  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  }, []);

  // Performance panel component
  const PerformancePanel = () => (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Performance Monitor
        </h3>
        <button
          onClick={() => setShowPerformancePanel(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Memory Usage:</span>
          <span className={`font-medium ${metrics.memoryUsage > 0.8 ? 'text-red-500' : 'text-green-500'}`}>
            {(metrics.memoryUsage * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Response Time:</span>
          <span className={`font-medium ${metrics.responseTime > 1000 ? 'text-red-500' : 'text-green-500'}`}>
            {metrics.responseTime.toFixed(0)}ms
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Cache Hit Rate:</span>
          <span className={`font-medium ${metrics.cacheHitRate < 0.5 ? 'text-red-500' : 'text-green-500'}`}>
            {(metrics.cacheHitRate * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Warnings */}
      {performanceWarnings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Warnings</h4>
          <div className="space-y-1">
            {performanceWarnings.slice(-3).map((warning) => (
              <div
                key={warning.id}
                className="text-xs p-2 rounded"
                style={{ backgroundColor: `${getSeverityColor(warning.severity)}20` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getSeverityColor(warning.severity) }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{warning.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={updateStats}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
        <button
          onClick={() => setPerformanceWarnings([])}
          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
    </div>
  );

  // Warning indicator
  const WarningIndicator = () => {
    const totalWarnings = performanceWarnings.length;
    const criticalWarnings = warningCounts.critical || 0;
    const highWarnings = warningCounts.high || 0;

    if (totalWarnings === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowPerformancePanel(!showPerformancePanel)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${
            criticalWarnings > 0 ? 'bg-red-500' : highWarnings > 0 ? 'bg-orange-500' : 'bg-yellow-500'
          }`}
        >
          <span>⚠️</span>
          <span>{totalWarnings}</span>
          {showPerformancePanel && <span>▼</span>}
        </button>
      </div>
    );
  };

  return (
    <>
      {children}

      {/* Performance warnings */}
      {showWarnings && (
        <WarningIndicator />
      )}

      {/* Performance panel */}
      {showStats && showPerformancePanel && (
        <PerformancePanel />
      )}

      {/* Performance tips overlay */}
      {showStats && performanceWarnings.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-xs z-40">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Optimization Tips
          </h4>
          <div className="space-y-2">
            {optimizationTips.slice(0, 2).map((tip) => (
              <div key={tip.id} className="text-xs">
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {tip.title}
                </h5>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  {tip.tips.slice(0, 2).map((tipText, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{tipText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance status indicator */}
      {showStats && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            isOptimized 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isOptimized ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <span>{isOptimized ? 'Optimized' : 'Optimizing...'}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceOptimizer; 