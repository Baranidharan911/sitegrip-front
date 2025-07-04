'use client';

import React from 'react';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';

export const MonitorStats: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Monitor Statistics
          </h2>
        </div>
        
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Detailed statistics coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}; 