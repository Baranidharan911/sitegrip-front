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
    <div className={cn("relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4", className)} style={{ height }}>
      {title && (
        <div className="absolute top-2 left-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {title}
        </div>
      )}
      
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Simple horizontal grid lines */}
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
        
        {/* Clean line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Simple data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="hover:r-3 transition-all duration-200"
            />
          );
        })}
      </svg>
      
      {/* Simple Y-axis labels */}
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
    <div className={cn("relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4", className)} style={{ height }}>
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
      
      {/* Simple Y-axis labels */}
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
    <div className={cn("border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg", className)}>
      {title && (
        <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border shadow-sm">
          {title}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
        <div className="text-3xl font-bold" style={{ color: colors[metric] }}>
          {data.length > 0 ? formatValue(data[data.length - 1].value) : '0'}
        </div>
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border">
          {metric.toUpperCase()}
        </div>
      </div>
      
      <LineChart 
        data={data} 
        color={colors[metric]} 
        height={height - 80} 
        showArea={true}
      />
    </div>
  );
}

interface GaugeChartProps {
  value: number;
  maxValue: number;
  title?: string;
  color?: string;
  size?: number;
  className?: string;
}

export function GaugeChart({ 
  value, 
  maxValue, 
  title, 
  color = '#3b82f6', 
  size = 200, 
  className 
}: GaugeChartProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const angle = (percentage / 100) * 180; // 180 degrees for semi-circle
  
  return (
    <div className={cn("relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg", className)}>
      {title && (
        <div className="text-center text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border shadow-sm">
          {title}
        </div>
      )}
      
      <div className="flex justify-center">
        <div className="relative" style={{ width: size, height: size / 2 }}>
          <svg 
            width={size} 
            height={size / 2} 
            viewBox={`0 0 ${size} ${size / 2}`}
            className="transform -rotate-180"
          >
            {/* Background arc */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
              </linearGradient>
              <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            {/* Background arc */}
            <path
              d={`M 20,${size / 2 - 20} A ${size / 2 - 20},${size / 2 - 20} 0 0 1 ${size - 20},${size / 2 - 20}`}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
              className="dark:stroke-gray-600"
            />
            
            {/* Value arc */}
            <path
              d={`M 20,${size / 2 - 20} A ${size / 2 - 20},${size / 2 - 20} 0 0 1 ${size - 20},${size / 2 - 20}`}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(angle / 180) * Math.PI * (size / 2 - 20)} ${Math.PI * (size / 2 - 20)}`}
              filter="url(#gaugeShadow)"
            />
            
            {/* Center circle */}
            <circle
              cx={size / 2}
              cy={size / 2 - 20}
              r="8"
              fill="white"
              stroke={color}
              strokeWidth="3"
              filter="url(#gaugeShadow)"
            />
            
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick, index) => {
              const tickAngle = (tick / 100) * 180;
              const x1 = size / 2 + (size / 2 - 40) * Math.cos((tickAngle - 90) * Math.PI / 180);
              const y1 = (size / 2 - 20) + (size / 2 - 40) * Math.sin((tickAngle - 90) * Math.PI / 180);
              const x2 = size / 2 + (size / 2 - 50) * Math.cos((tickAngle - 90) * Math.PI / 180);
              const y2 = (size / 2 - 20) + (size / 2 - 50) * Math.sin((tickAngle - 90) * Math.PI / 180);
              
              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#6b7280"
                  strokeWidth="2"
                  className="dark:stroke-gray-400"
                />
              );
            })}
          </svg>
          
          {/* Value display */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-3xl font-bold" style={{ color }}>
              {value.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              / {maxValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {percentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className={cn("border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg", className)}>
      {title && (
        <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border shadow-sm">
          {title}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
        <div className="text-3xl font-bold" style={{ color: colors[metric] }}>
          {data.length > 0 ? formatValue(data[data.length - 1].value) : '0'}
        </div>
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border">
          {metric.toUpperCase()}
        </div>
      </div>
      
      <LineChart 
        data={data} 
        color={colors[metric]} 
        height={height - 80} 
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
    <div className={cn("border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg", className)}>
      {title && (
        <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border shadow-sm">
          {title}
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 shadow-md border-2 border-white"></div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label1}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 shadow-md border-2 border-white"></div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label2}</span>
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