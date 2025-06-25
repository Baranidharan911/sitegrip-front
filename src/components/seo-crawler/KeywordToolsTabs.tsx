'use client';

import { useState } from 'react';
import KeywordAnalysisPanel from '@/components/seo-crawler/KeywordAnalysisPanel';
import KeywordRecommendationPanel from '@/components/seo-crawler/KeywordRecommendationPanel';
import KeywordComparisonCard from '@/components/seo-crawler/KeywordComparisonCard';
import KeywordRankingPanel from '@/components/seo-crawler/KeywordRankingPanel';
import KeywordVolumePanel from '@/components/seo-crawler/KeywordVolumePanel';
import TrendingKeywordsPanel from '@/components/seo-crawler/TrendingKeywordsPanel';
import KeywordGapsPanel from '@/components/seo-crawler/KeywordGapsPanel';
import KeywordTrackingPanel from '@/components/seo-crawler/KeywordTrackingPanel';
import KeywordPerformanceChart from '@/components/seo-crawler/KeywordPerformanceChart';
import DomainKeywordProfile from '@/components/seo-crawler/DomainKeywordProfile';
import KeywordStatsPanel from '@/components/seo-crawler/KeywordStatsPanel';

interface KeywordToolsTabsProps {
  url: string;
  domain: string;
  bodyText?: string;
  title?: string;
  metaDescription?: string;
}

const tabs = [
  { id: 'analysis', label: '🔍 Analysis', icon: '🔍' },
  { id: 'recommendations', label: '💡 Recommendations', icon: '💡' },
  { id: 'ranking', label: '📊 Ranking', icon: '📊' },
  { id: 'volume', label: '📈 Volume', icon: '📈' },
  { id: 'comparison', label: '⚖️ Comparison', icon: '⚖️' },
  { id: 'tracking', label: '📍 Tracking', icon: '📍' },
  { id: 'performance', label: '📉 Performance', icon: '📉' },
  { id: 'trending', label: '🔥 Trending', icon: '🔥' },
  { id: 'gaps', label: '🕳️ Gaps', icon: '🕳️' },
  { id: 'domain', label: '🌐 Domain Profile', icon: '🌐' },
  { id: 'stats', label: '📊 Statistics', icon: '📊' }
];

export default function KeywordToolsTabs({ url, domain, bodyText, title, metaDescription }: KeywordToolsTabsProps) {
  const [activeTab, setActiveTab] = useState('analysis');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analysis':
        return <KeywordAnalysisPanel url={url} bodyText={bodyText || ''} title={title} metaDescription={metaDescription} />;
      case 'recommendations':
        return <KeywordRecommendationPanel url={url} bodyText={bodyText || ''} />;
      case 'ranking':
        return <KeywordRankingPanel url={url} domain={domain} />;
      case 'volume':
        return <KeywordVolumePanel />;
      case 'comparison':
        return <KeywordComparisonCard current="web development" proposed="professional full-stack development" />;
      case 'tracking':
        return <KeywordTrackingPanel url={url} />;
      case 'performance':
        return <KeywordPerformanceChart keyword="web development" url={url} />;
      case 'trending':
        return <TrendingKeywordsPanel domain={domain} />;
      case 'gaps':
        return <KeywordGapsPanel url={url} />;
      case 'domain':
        return <DomainKeywordProfile domain={domain} />;
      case 'stats':
        return <KeywordStatsPanel />;
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
