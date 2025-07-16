'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AppContent from '@/components/Layout/AppContent';
import { BarChart3, FileText, TrendingUp } from 'lucide-react';
 
export default function IndexingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Dashboard',
      href: '/indexing',
      icon: FileText,
      active: pathname === '/indexing',
    },
    {
      name: 'Analytics',
      href: '/indexing/analytics',
      icon: BarChart3,
      active: pathname === '/indexing/analytics',
    },
  ];

  return (
    <AppContent>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      tab.active
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
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