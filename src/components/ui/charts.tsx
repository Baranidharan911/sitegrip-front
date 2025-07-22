"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface LineChartProps {
  data: ChartDataPoint[];
  title?: string;
  color?: string;
  height?: number;
  showArea?: boolean;
  className?: string;
}

interface AreaChartProps {
  data: ChartDataPoint[];
  title?: string;
  color?: string;
  height?: number;
  className?: string;
}

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  className?: string;
}

export function LineChart({ data, title, color = '#3b82f6', height = 200, showArea = false, className }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center border rounded-lg", className)} style={{ height }}>
        <div className="text-center text-gray-500">
          <div className="text-sm">No data available</div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = showArea ? `${points} 100,0` : '';

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {title && (
        <div className="absolute top-2 left-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </div>
      )}
      
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.5"
            className="dark:stroke-gray-700"
          />
        ))}
        
        {/* Area fill */}
        {showArea && (
          <polygon
            points={areaPoints}
            fill={color}
            fillOpacity="0.1"
          />
        )}
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
              className="hover:r-2 transition-all duration-200"
            />
          );
        })}
      </svg>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pointer-events-none">
        <span>{maxValue.toLocaleString()}</span>
        <span>{Math.round((maxValue + minValue) / 2).toLocaleString()}</span>
        <span>{minValue.toLocaleString()}</span>
      </div>
    </div>
  );
}

export function AreaChart({ data, title, color = '#3b82f6', height = 200, className }: AreaChartProps) {
  return (
    <LineChart 
      data={data} 
      title={title} 
      color={color} 
      height={height} 
      showArea={true} 
      className={className} 
    />
  );
}

export function BarChart({ data, title, height = 200, className }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center border rounded-lg", className)} style={{ height }}>
        <div className="text-center text-gray-500">
          <div className="text-sm">No data available</div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {title && (
        <div className="absolute top-2 left-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </div>
      )}
      
      <div className="flex items-end justify-between h-full gap-1 pt-8">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t transition-all duration-300 hover:opacity-80"
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)`,
                minHeight: '4px'
              }}
            />
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center truncate w-full">
              {item.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pointer-events-none">
        <span>{maxValue.toLocaleString()}</span>
        <span>{Math.round(maxValue / 2).toLocaleString()}</span>
        <span>0</span>
      </div>
    </div>
  );
}

export function PerformanceChart({ 
  data, 
  metric = 'clicks',
  title,
  height = 200,
  className 
}: {
  data: ChartDataPoint[];
  metric?: 'clicks' | 'impressions' | 'ctr' | 'position';
  title?: string;
  height?: number;
  className?: string;
}) {
  const colors = {
    clicks: '#10b981',
    impressions: '#3b82f6',
    ctr: '#f59e0b',
    position: '#8b5cf6'
  };

  const formatValue = (value: number) => {
    switch (metric) {
      case 'ctr':
        return `${(value * 100).toFixed(2)}%`;
      case 'position':
        return value.toFixed(1);
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className={cn("border rounded-lg p-4 bg-white dark:bg-gray-800", className)}>
      {title && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          {title}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-bold" style={{ color: colors[metric] }}>
          {data.length > 0 ? formatValue(data[data.length - 1].value) : '0'}
        </div>
        <div className="text-xs text-gray-500">
          {metric.toUpperCase()}
        </div>
      </div>
      
      <LineChart 
        data={data} 
        color={colors[metric]} 
        height={height - 60} 
        showArea={true}
      />
    </div>
  );
}

export function ComparisonChart({ 
  data1, 
  data2, 
  label1, 
  label2,
  title,
  height = 200,
  className 
}: {
  data1: ChartDataPoint[];
  data2: ChartDataPoint[];
  label1: string;
  label2: string;
  title?: string;
  height?: number;
  className?: string;
}) {
  return (
    <div className={cn("border rounded-lg p-4 bg-white dark:bg-gray-800", className)}>
      {title && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          {title}
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">{label1}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">{label2}</span>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <LineChart data={data1} color="#3b82f6" height={height} showArea={true} />
        <div className="absolute inset-0">
          <LineChart data={data2} color="#10b981" height={height} showArea={true} />
        </div>
      </div>
    </div>
  );
} 