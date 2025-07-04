'use client';

import React from 'react';
import { Globe, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export const StatusPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Public Status Page
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <h3 className="font-medium text-green-900 dark:text-green-100">
                All Systems Operational
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                All services are running smoothly
              </p>
            </div>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Status page configuration coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 