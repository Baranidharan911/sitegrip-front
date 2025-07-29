'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppContent from '@/components/Layout/AppContent';
import { BarChart3, FileText, TrendingUp, Shield, Zap, Smartphone, Link as LinkIcon, Database, Search, Globe } from 'lucide-react';
 
export default function IndexingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Google Indexing',
      href: '/indexing',
      icon: FileText,
      active: pathname === '/indexing',
      description: 'Submit URLs to search engines'
    },
    {
      name: 'Index Analytics',
      href: '/indexing/analytics',
      icon: BarChart3,
      active: pathname === '/indexing/analytics',
      description: 'Check indexing status'
    },
    // GSC Section
    {
      name: 'GSC Dashboard',
      href: '/indexing/gsc-dashboard',
      icon: Database,
      active: pathname === '/indexing/gsc-dashboard',
      description: 'Google Search Console overview'
    },
    {
      name: 'GSC Indexing',
      href: '/indexing/gsc-indexing',
      icon: FileText,
      active: pathname === '/indexing/gsc-indexing',
      description: 'Page indexing details & reasons'
    },
    {
      name: 'GSC Performance',
      href: '/indexing/gsc-performance',
      icon: TrendingUp,
      active: pathname === '/indexing/gsc-performance',
      description: 'Search performance metrics'
    },
    {
      name: 'GSC Experience',
      href: '/indexing/gsc-experience',
      icon: Zap,
      active: pathname === '/indexing/gsc-experience',
      description: 'Core Web Vitals & UX'
    },
    {
      name: 'GSC Security',
      href: '/indexing/gsc-security',
      icon: Shield,
      active: pathname === '/indexing/gsc-security',
      description: 'HTTPS & security analysis'
    },
    {
      name: 'GSC Connect',
      href: '/indexing/gsc-connect',
      icon: Globe,
      active: pathname === '/indexing/gsc-connect',
      description: 'Manage GSC connection'
    },
  ];

  // Separate core indexing tabs from GSC tabs for better organization
  const coreIndexingTabs = tabs.slice(0, 2);
  const gscTabs = tabs.slice(2);

  return (
    <AppContent>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            {/* Core Indexing Section */}
            <div className="px-6 pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Search Engine Indexing</h3>
            </div>
            <nav className="flex space-x-8 px-6 pb-2" aria-label="Indexing Tabs">
              {coreIndexingTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      tab.active
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    title={tab.description}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </Link>
                );
              })}
            </nav>

            {/* GSC Section */}
            <div className="px-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Google Search Console</h3>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 px-6 pb-4" aria-label="GSC Tabs">
              {gscTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      tab.active
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    title={tab.description}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Page Content */}
        <div>{children}</div>
      </div>
    </AppContent>
  );
} 