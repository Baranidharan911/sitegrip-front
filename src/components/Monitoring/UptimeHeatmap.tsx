'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeatmapData {
  date: string;
  uptime: number;
  incidents: number;
}

import { API_CONFIG, MONITORING_ENDPOINTS } from '../../lib/config';

// API base URL from configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

export const UptimeHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real heatmap data from backend
  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${MONITORING_ENDPOINTS.HEATMAP}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setHeatmapData(data);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
      // Fallback to empty data if API fails
      setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if we have monitors
    if (heatmapData.length > 0) {
      fetchHeatmapData();
    }
  }, []);

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.5) return 'bg-green-500';
    if (uptime >= 99) return 'bg-green-400';
    if (uptime >= 98) return 'bg-green-300';
    if (uptime >= 95) return 'bg-yellow-400';
    if (uptime >= 90) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Group data by weeks
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (heatmapData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No uptime data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm" />
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <div className="w-3 h-3 bg-orange-400 rounded-sm" />
            <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
            <div className="w-3 h-3 bg-green-300 rounded-sm" />
            <div className="w-3 h-3 bg-green-400 rounded-sm" />
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
          </div>
          <span>More</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last 90 days
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2">
            <div className="h-3" /> {/* Spacer for month labels */}
            {dayLabels.map(day => (
              <div key={day} className="h-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex flex-col gap-1">
            {/* Month labels */}
            <div className="flex gap-1 h-3">
              {weeks.map((week, weekIndex) => {
                const firstDay = new Date(week[0].date);
                const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                
                return (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {isFirstWeekOfMonth && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {monthLabels[firstDay.getMonth()]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Week grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                      className={`w-3 h-3 rounded-sm ${getUptimeColor(day.uptime)} hover:ring-2 hover:ring-blue-500 cursor-pointer`}
                      title={`${day.date}: ${day.uptime.toFixed(1)}% uptime ${day.incidents > 0 ? `(${day.incidents} incidents)` : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {heatmapData.filter(d => d.uptime >= 99.5).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Perfect Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {heatmapData.filter(d => d.uptime >= 95 && d.uptime < 99.5).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Degraded Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {heatmapData.filter(d => d.uptime < 95).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Down Days</div>
        </div>
      </div>
    </div>
  );
}; 