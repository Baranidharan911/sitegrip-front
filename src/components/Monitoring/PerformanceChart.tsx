'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Clock, TrendingUp, TrendingDown, Zap, Target } from 'lucide-react';

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  uptime: number;
  errors: number;
  requests: number;
}

import { API_CONFIG, MONITORING_ENDPOINTS } from '../../lib/config';

// API base URL from configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

export const PerformanceChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [metric, setMetric] = useState<'responseTime' | 'uptime' | 'errors' | 'requests'>('responseTime');
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real performance data from backend
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${MONITORING_ENDPOINTS.PERFORMANCE}?timeRange=${timeRange}&metric=${metric}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const performanceData = await response.json();
      setData(performanceData);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      // Fallback to empty data if API fails
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if we have monitors
    if (data.length > 0 || timeRange === '24h') {
      fetchPerformanceData();
    }
  }, [timeRange, metric]);

  const getMetricConfig = (metric: string) => {
    switch (metric) {
      case 'responseTime':
        return {
          title: 'Response Time',
          color: '#3B82F6',
          unit: 'ms',
          icon: <Zap size={16} />
        };
      case 'uptime':
        return {
          title: 'Uptime',
          color: '#10B981',
          unit: '%',
          icon: <TrendingUp size={16} />
        };
      case 'errors':
        return {
          title: 'Errors',
          color: '#EF4444',
          unit: '',
          icon: <TrendingDown size={16} />
        };
      case 'requests':
        return {
          title: 'Requests',
          color: '#8B5CF6',
          unit: '',
          icon: <Target size={16} />
        };
      default:
        return {
          title: 'Response Time',
          color: '#3B82F6',
          unit: 'ms',
          icon: <Zap size={16} />
        };
    }
  };

  const config = getMetricConfig(metric);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {config.title}: {payload[0].value}{config.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-medium text-gray-900 dark:text-white">{config.title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as any)}
            className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="responseTime">Response Time</option>
            <option value="uptime">Uptime</option>
            <option value="errors">Errors</option>
            <option value="requests">Requests</option>
          </select>
          
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        {metric === 'uptime' ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={config.color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="timestamp" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[97, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={config.color}
              strokeWidth={2}
              fill="url(#uptimeGradient)"
            />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="timestamp" 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={config.color}
              strokeWidth={2}
              dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}; 