'use client';

import React, { useState, useEffect } from 'react';
import { usePerformance } from '../../hooks/usePerformance';
import { Activity, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceWidgetProps {
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({
  className = '',
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 30
}) => {
  const { measurePerformance, getPerformanceSummary, isMonitoring } = usePerformance();
  const [summary, setSummary] = useState(getPerformanceSummary());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updateSummary = () => {
      const newSummary = getPerformanceSummary();
      setSummary(newSummary);
      setLastUpdate(new Date());
    };

    if (autoRefresh) {
      const interval = setInterval(() => {
        measurePerformance();
        updateSummary();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, measurePerformance, getPerformanceSummary]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'B': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'C': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'D': return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'F': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!summary) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Performance</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Performance</span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(summary.latestReport.grade)}`}>
            {summary.latestReport.grade}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.averageScore.toFixed(0)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${summary.averageScore}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatTime(summary.averageLoadTime)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Load Time</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {summary.totalReports}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Reports</div>
        </div>
      </div>

      {/* Details (if enabled) */}
      {showDetails && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">LCP</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatTime(summary.latestReport.metrics.largestContentfulPaint || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">FID</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatTime(summary.latestReport.metrics.firstInputDelay || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">CLS</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(summary.latestReport.metrics.cumulativeLayoutShift || 0).toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Monitoring</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-blue-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Real-time</span>
        </div>
        {summary.averageScore < 70 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-yellow-600 dark:text-yellow-400">Needs attention</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceWidget; 