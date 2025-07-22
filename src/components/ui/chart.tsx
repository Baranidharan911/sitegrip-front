"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  data: ChartData[];
  type?: 'bar' | 'pie' | 'line';
  className?: string;
  height?: number;
}

export function Chart({ data, type = 'bar', className, height = 200 }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  if (type === 'bar') {
    return (
      <div className={cn("w-full", className)} style={{ height }}>
        <div className="flex items-end justify-between h-full gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: '20px'
                }}
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                {item.label}
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className={cn("relative w-full", className)} style={{ height }}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((currentAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={item.color || `hsl(${index * 60}, 70%, 60%)`}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-1 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)` }}
              />
              <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  className 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <div className={cn("p-6 rounded-lg border bg-white dark:bg-gray-800", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {change && (
            <p className="text-sm text-green-600 dark:text-green-400">{change}</p>
          )}
        </div>
        {Icon && <Icon className="w-8 h-8 text-gray-400" />}
      </div>
    </div>
  );
} 