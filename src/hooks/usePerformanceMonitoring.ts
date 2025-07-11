import { useState, useEffect, useCallback, useRef } from 'react';
import { usePerformance } from './usePerformance';

interface PerformanceSummary {
  totalReports: number;
  totalInteractions: number;
  averageScore: number;
  averageLoadTime: number;
  gradeDistribution: Record<string, number>;
  interactionStats: Record<string, { count: number; totalTime: number; avgTime: number }>;
  timeRange: string;
}

interface PerformanceTrend {
  hour: string;
  avgScore: number;
  avgLoadTime: number;
  count: number;
}

interface UsePerformanceMonitoringOptions {
  autoCollect?: boolean;
  collectInterval?: number; // seconds
  apiEndpoint?: string;
}

export const usePerformanceMonitoring = (options: UsePerformanceMonitoringOptions = {}) => {
  const {
    autoCollect = true,
    collectInterval = 60,
    apiEndpoint = '/api/performance'
  } = options;

  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { measurePerformance, measureInteraction, reports, interactions } = usePerformance();

  const collectPerformanceData = useCallback(async () => {
    if (reports.length === 0) return;

    try {
      const latestReport = reports[reports.length - 1];
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance',
          data: {
            url: latestReport.url,
            userAgent: latestReport.userAgent,
            metrics: latestReport.metrics,
            score: latestReport.score,
            grade: latestReport.grade,
            sessionId: sessionStorage.getItem('sessionId') || undefined,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to collect performance data');
      }

      console.log('📊 Performance data collected successfully');
    } catch (err) {
      console.error('❌ Failed to collect performance data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [reports, apiEndpoint]);

  const collectInteractionData = useCallback(async () => {
    if (interactions.length === 0) return;

    try {
      const latestInteractions = interactions.slice(-10); // Collect last 10 interactions
      
      for (const interaction of latestInteractions) {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'interaction',
            data: {
              name: interaction.name,
              duration: interaction.duration,
              timestamp: interaction.timestamp,
              component: interaction.component,
              sessionId: sessionStorage.getItem('sessionId') || undefined,
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to collect interaction data');
        }
      }

      console.log('📊 Interaction data collected successfully');
    } catch (err) {
      console.error('❌ Failed to collect interaction data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [interactions, apiEndpoint]);

  const fetchSummary = useCallback(async (timeRange: string = '24h') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiEndpoint}?action=summary&timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance summary');
      }

      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
      } else {
        throw new Error(data.error || 'Failed to fetch summary');
      }
    } catch (err) {
      console.error('❌ Failed to fetch performance summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  const fetchTrends = useCallback(async () => {
    try {
      const response = await fetch(`${apiEndpoint}?action=trends`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch performance trends');
      }

      const data = await response.json();
      
      if (data.success) {
        setTrends(data.trends);
      } else {
        throw new Error(data.error || 'Failed to fetch trends');
      }
    } catch (err) {
      console.error('❌ Failed to fetch performance trends:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [apiEndpoint]);

  const startCollecting = useCallback(() => {
    if (isCollecting) return;

    setIsCollecting(true);
    
    // Generate session ID if not exists
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }

    // Initial collection
    collectPerformanceData();
    collectInteractionData();

    // Set up interval for continuous collection
    intervalRef.current = setInterval(() => {
      collectPerformanceData();
      collectInteractionData();
    }, collectInterval * 1000);

    console.log('🚀 Performance monitoring started');
  }, [isCollecting, collectPerformanceData, collectInteractionData, collectInterval]);

  const stopCollecting = useCallback(() => {
    setIsCollecting(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    console.log('🛑 Performance monitoring stopped');
  }, []);

  const clearData = useCallback(async () => {
    try {
      const response = await fetch(`${apiEndpoint}?action=all`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to clear performance data');
      }

      setSummary(null);
      setTrends([]);
      console.log('🗑️ Performance data cleared');
    } catch (err) {
      console.error('❌ Failed to clear performance data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [apiEndpoint]);

  const getPerformanceInsights = useCallback(() => {
    if (!summary) return [];

    const insights = [];

    // Score insights
    if (summary.averageScore < 70) {
      insights.push({
        type: 'warning',
        title: 'Low Performance Score',
        message: `Your average performance score is ${summary.averageScore.toFixed(1)}/100. Consider optimizing Core Web Vitals.`,
        priority: 'high'
      });
    } else if (summary.averageScore < 90) {
      insights.push({
        type: 'info',
        title: 'Performance Improvement Opportunity',
        message: `Your performance score is ${summary.averageScore.toFixed(1)}/100. There's room for optimization.`,
        priority: 'medium'
      });
    }

    // Load time insights
    if (summary.averageLoadTime > 3000) {
      insights.push({
        type: 'warning',
        title: 'Slow Load Times',
        message: `Average load time is ${(summary.averageLoadTime / 1000).toFixed(2)}s. Consider optimizing resource loading.`,
        priority: 'high'
      });
    }

    // Grade distribution insights
    const gradeCounts = Object.entries(summary.gradeDistribution);
    const poorGrades = gradeCounts.filter(([grade]) => ['D', 'F'].includes(grade));
    
    if (poorGrades.length > 0) {
      insights.push({
        type: 'error',
        title: 'Poor Performance Grades Detected',
        message: `${poorGrades.length} performance measurements received poor grades. Immediate attention required.`,
        priority: 'critical'
      });
    }

    // Interaction insights
    const slowInteractions = Object.entries(summary.interactionStats)
      .filter(([_, stats]) => stats.avgTime > 100)
      .sort(([_, a], [__, b]) => b.avgTime - a.avgTime);

    if (slowInteractions.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Slow User Interactions',
        message: `${slowInteractions.length} interactions are taking longer than 100ms. Consider optimizing user interactions.`,
        priority: 'medium'
      });
    }

    return insights;
  }, [summary]);

  const getOptimizationRecommendations = useCallback(() => {
    if (!summary) return [];

    const recommendations = [];

    // LCP recommendations
    if (summary.averageScore < 80) {
      recommendations.push({
        category: 'Loading Performance',
        title: 'Optimize Largest Contentful Paint (LCP)',
        description: 'Improve loading performance by optimizing images, reducing server response times, and eliminating render-blocking resources.',
        impact: 'high',
        effort: 'medium'
      });
    }

    // FID recommendations
    if (summary.averageScore < 85) {
      recommendations.push({
        category: 'Interactivity',
        title: 'Reduce First Input Delay (FID)',
        description: 'Minimize JavaScript execution time and break up long tasks to improve interactivity.',
        impact: 'high',
        effort: 'medium'
      });
    }

    // CLS recommendations
    if (summary.averageScore < 90) {
      recommendations.push({
        category: 'Visual Stability',
        title: 'Improve Cumulative Layout Shift (CLS)',
        description: 'Set explicit width and height for images and other media elements to prevent layout shifts.',
        impact: 'medium',
        effort: 'low'
      });
    }

    // Resource optimization
    if (summary.totalReports > 10) {
      recommendations.push({
        category: 'Resource Optimization',
        title: 'Optimize Resource Loading',
        description: 'Implement lazy loading, code splitting, and resource compression to reduce bundle sizes.',
        impact: 'high',
        effort: 'high'
      });
    }

    return recommendations;
  }, [summary]);

  // Auto-start collection if enabled
  useEffect(() => {
    if (autoCollect) {
      startCollecting();
    }

    return () => {
      stopCollecting();
    };
  }, [autoCollect, startCollecting, stopCollecting]);

  // Fetch initial data
  useEffect(() => {
    fetchSummary();
    fetchTrends();
  }, [fetchSummary, fetchTrends]);

  return {
    // State
    summary,
    trends,
    loading,
    error,
    isCollecting,
    
    // Actions
    startCollecting,
    stopCollecting,
    fetchSummary,
    fetchTrends,
    clearData,
    collectPerformanceData,
    collectInteractionData,
    
    // Insights
    getPerformanceInsights,
    getOptimizationRecommendations,
    
    // Utilities
    measurePerformance,
    measureInteraction,
  };
}; 