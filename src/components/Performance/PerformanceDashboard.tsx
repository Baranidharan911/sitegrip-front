'use client';

import React, { useState, useEffect } from 'react';
import { usePerformance } from '../../hooks/usePerformance';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import {
  Activity,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Share2,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  Gauge,
  Target,
  Timer,
  Database,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface PerformanceDashboardProps {
  className?: string;
}

const COLORS = {
  A: '#10B981', // Green
  B: '#3B82F6', // Blue
  C: '#F59E0B', // Yellow
  D: '#EF4444', // Red
  F: '#7F1D1D', // Dark Red
};

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className = '' }) => {
  const {
    reports,
    interactions,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getPerformanceSummary,
    clearMetrics,
    measurePerformance,
  } = usePerformance();

  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'interactions' | 'trends'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const summary = getPerformanceSummary();

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      measurePerformance();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, measurePerformance]);

  // Start monitoring on mount
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getGradeColor = (grade: string) => COLORS[grade as keyof typeof COLORS] || '#6B7280';

  const exportData = () => {
    const data = {
      summary,
      reports,
      interactions,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareReport = () => {
    if (navigator.share && summary) {
      navigator.share({
        title: 'SiteGrip Performance Report',
        text: `Performance Score: ${summary.averageScore.toFixed(1)}/100 (${summary.latestReport.grade})`,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      const text = `Performance Score: ${summary?.averageScore.toFixed(1)}/100 (${summary?.latestReport.grade})\nURL: ${window.location.href}`;
      navigator.clipboard.writeText(text);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Performance Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Score</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={measurePerformance}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={exportData}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={shareReport}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - summary.averageScore / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    style={{ color: getGradeColor(summary.latestReport.grade) }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: getGradeColor(summary.latestReport.grade) }}>
                    {summary.averageScore.toFixed(0)}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Average Score</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color: getGradeColor(summary.latestReport.grade) }}>
                {summary.latestReport.grade}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Current Grade</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(summary.averageLoadTime)}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Avg Load Time</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
            <button
              onClick={measurePerformance}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Measure Performance
            </button>
          </div>
        )}
      </div>

      {/* Core Web Vitals */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'LCP',
              value: formatTime(summary.latestReport.metrics.largestContentfulPaint || 0),
              icon: <Target className="h-5 w-5" />,
              status: (summary.latestReport.metrics.largestContentfulPaint || 0) <= 2500 ? 'good' : 'poor',
              description: 'Largest Contentful Paint'
            },
            {
              label: 'FID',
              value: formatTime(summary.latestReport.metrics.firstInputDelay || 0),
              icon: <Zap className="h-5 w-5" />,
              status: (summary.latestReport.metrics.firstInputDelay || 0) <= 100 ? 'good' : 'poor',
              description: 'First Input Delay'
            },
            {
              label: 'CLS',
              value: (summary.latestReport.metrics.cumulativeLayoutShift || 0).toFixed(3),
              icon: <BarChart3 className="h-5 w-5" />,
              status: (summary.latestReport.metrics.cumulativeLayoutShift || 0) <= 0.1 ? 'good' : 'poor',
              description: 'Cumulative Layout Shift'
            },
            {
              label: 'FCP',
              value: formatTime(summary.latestReport.metrics.firstContentfulPaint || 0),
              icon: <Clock className="h-5 w-5" />,
              status: (summary.latestReport.metrics.firstContentfulPaint || 0) <= 1800 ? 'good' : 'poor',
              description: 'First Contentful Paint'
            }
          ].map((metric) => (
            <div key={metric.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${metric.status === 'good' ? 'text-green-600 bg-green-100 dark:bg-green-900' : 'text-red-600 bg-red-100 dark:bg-red-900'}`}>
                    {metric.icon}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{metric.label}</span>
                </div>
                {metric.status === 'good' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{metric.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Resource Metrics */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.latestReport.metrics.totalResources || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Resources</p>
            </div>
            <div className="text-center">
              <Globe className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatBytes(summary.latestReport.metrics.totalSize || 0)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
            </div>
            <div className="text-center">
              <Monitor className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.latestReport.metrics.domSize || 0}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">DOM Nodes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      {/* Performance Trends Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reports.slice(-10).map((report, index) => ({
            time: index + 1,
            score: report.score,
            loadTime: report.metrics.loadTime,
            fcp: report.metrics.firstContentfulPaint,
            lcp: report.metrics.largestContentfulPaint,
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="loadTime" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="fcp" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="lcp" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Grade Distribution */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(summary.gradeDistribution).map(([grade, count]) => ({
                  name: grade,
                  value: count,
                  color: getGradeColor(grade),
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {Object.entries(summary.gradeDistribution).map(([grade, count], index) => (
                  <Cell key={`cell-${index}`} fill={getGradeColor(grade)} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  const renderInteractions = () => (
    <div className="space-y-6">
      {/* Interaction Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interaction Performance</h3>
        {summary && Object.keys(summary.interactionStats).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(summary.interactionStats).map(([name, stats]) => (
              <div key={name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.count} interactions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatTime(stats.avgTime)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No interaction data available</p>
          </div>
        )}
      </div>

      {/* Recent Interactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Interactions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {interactions.slice(-10).reverse().map((interaction, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{interaction.name}</p>
                {interaction.component && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{interaction.component}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatTime(interaction.duration)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(interaction.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      {/* Performance Over Time */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={reports.slice(-20).map((report, index) => ({
            time: new Date(report.timestamp).toLocaleTimeString(),
            score: report.score,
            loadTime: report.metrics.loadTime,
            fcp: report.metrics.firstContentfulPaint,
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="score" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            <Area type="monotone" dataKey="loadTime" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            <Area type="monotone" dataKey="fcp" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Reports</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summary.totalReports}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Interactions</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summary.totalInteractions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                <span className="font-semibold text-gray-900 dark:text-white">{summary.averageScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Load Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatTime(summary.averageLoadTime)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monitoring Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Real-time Monitoring</span>
                <div className={`flex items-center gap-2 ${isMonitoring ? 'text-green-600' : 'text-red-600'}`}>
                  {isMonitoring ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <span className="font-semibold">{isMonitoring ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Auto Refresh</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-semibold text-gray-900 dark:text-white">{autoRefresh ? 'On' : 'Off'}</span>
                </div>
              </div>
              {autoRefresh && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Refresh Interval</span>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                  >
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time performance monitoring and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearMetrics}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            Clear Data
          </button>
          <button
            onClick={measurePerformance}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Measure Now
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
          { id: 'metrics', label: 'Metrics', icon: <BarChart3 className="h-4 w-4" /> },
          { id: 'interactions', label: 'Interactions', icon: <Zap className="h-4 w-4" /> },
          { id: 'trends', label: 'Trends', icon: <TrendingUp className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'interactions' && renderInteractions()}
        {activeTab === 'trends' && renderTrends()}
      </div>
    </div>
  );
};

export default PerformanceDashboard; 