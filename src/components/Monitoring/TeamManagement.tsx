'use client';

import React from 'react';
import { Users, Plus, UserPlus } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Team Management
            </h2>
          </div>
          <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2">
            <Plus size={16} />
            Invite Member
          </button>
        </div>
        
        <div className="text-center py-8">
          <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Team management features coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}; 