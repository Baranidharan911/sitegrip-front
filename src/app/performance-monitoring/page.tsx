'use client';

import React from 'react';
import PerformanceDashboard from '../../components/Performance/PerformanceDashboard';
import { usePerformance } from '../../hooks/usePerformance';
import { Activity, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

const PerformanceMonitoringPage: React.FC = () => {
  const { isMonitoring, startMonitoring, stopMonitoring } = usePerformance();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Performance Monitoring
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time performance analytics and optimization insights
              </p>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monitoring: {isMonitoring ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time metrics collection
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isMonitoring
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                }`}
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
            </div>
          </div>
        </div>

        {/* Performance Dashboard */}
        <PerformanceDashboard />

        {/* Additional Insights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Trends</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Track your application's performance over time and identify optimization opportunities.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Core Web Vitals</span>
                <span className="font-medium text-gray-900 dark:text-white">Real-time</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Resource Loading</span>
                <span className="font-medium text-gray-900 dark:text-white">Optimized</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">User Interactions</span>
                <span className="font-medium text-gray-900 dark:text-white">Tracked</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Optimization Tips</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get actionable insights to improve your application's performance.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Image optimization</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Code splitting</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Caching strategy</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts & Notifications</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Stay informed about performance issues and optimization opportunities.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Performance Alerts</span>
                <span className="font-medium text-green-600 dark:text-green-400">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Threshold Monitoring</span>
                <span className="font-medium text-green-600 dark:text-green-400">Enabled</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Auto Reports</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">Weekly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Explanation */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Understanding Performance Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Core Web Vitals</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">LCP (Largest Contentful Paint)</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Measures loading performance. Good: &lt;2.5s, Needs improvement: 2.5s-4s, Poor: &gt;4s
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">FID (First Input Delay)</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Measures interactivity. Good: &lt;100ms, Needs improvement: 100ms-300ms, Poor: &gt;300ms
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">CLS (Cumulative Layout Shift)</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Measures visual stability. Good: &lt;0.1, Needs improvement: 0.1-0.25, Poor: &gt;0.25
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Metrics</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">FCP (First Contentful Paint)</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Time to first content. Good: &lt;1.8s, Needs improvement: 1.8s-3s, Poor: &gt;3s
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">TTI (Time to Interactive)</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Time to fully interactive. Good: &lt;5s, Needs improvement: 5s-8s, Poor: &gt;8s
                  </p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">TBT (Total Blocking Time)</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Time blocked by scripts. Good: &lt;200ms, Needs improvement: 200ms-600ms, Poor: &gt;600ms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoringPage; 