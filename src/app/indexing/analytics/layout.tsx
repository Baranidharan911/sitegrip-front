import React from 'react';
import { Metadata } from 'next';
import Breadcrumb from '@/components/Common/Breadcrumb';

export const metadata: Metadata = {
  title: 'Indexing Analytics - WebWatch',
  description: 'Comprehensive analytics and insights for your indexing performance',
};

export default function IndexingAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Breadcrumb
        pageName="Indexing Analytics"
        pageDescription="Track your indexing performance with detailed analytics and insights"
      />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
} 