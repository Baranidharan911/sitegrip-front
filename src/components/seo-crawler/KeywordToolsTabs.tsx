'use client';

import { useState } from 'react';
import KeywordTrackingPanel from '@/components/seo-crawler/KeywordTrackingPanel';

interface KeywordToolsTabsProps {
  url: string;
}

const tabs = [
  { id: 'tracking', label: '📍 Tracking', icon: '📍' }
];

export default function KeywordToolsTabs({ url }: KeywordToolsTabsProps) {
  const [activeTab, setActiveTab] = useState('tracking');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tracking':
        return <KeywordTrackingPanel url={url} />;
      default:
        return <div>Select a tab to view keyword tools</div>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-700">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label.split(' ')[1] || tab.label}</span>
              <span className="sm:hidden">{tab.icon}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <div className="transition-all duration-300 ease-in-out">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
