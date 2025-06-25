'use client';

import React from 'react';
import { useIndexingBackend } from '@/hooks/useIndexingBackend';
import EnhancedIndexingForm from './EnhancedIndexingForm';
import EnhancedIndexingTable from './EnhancedIndexingTable';
import IndexingDashboard from './IndexingDashboard';
import { useTheme } from 'next-themes';

export default function EnhancedIndexingPage() {
  const {
    urlInput,
    setUrlInput,
    isSubmitting,
    isLoading,
    indexingEntries,
    quotaInfo,
    statistics,
    projectId,
    handleSubmit,
    submitUrls,
    submitUrlsFromFile,
    updateEntryStatus,
    retryEntry,
    refreshData,
  } = useIndexingBackend();

  const { theme } = useTheme();

  const handleFormSubmit = async (urls: string[], priority: string) => {
    await submitUrls(urls, priority);
  };

  const handleFileSubmit = async (file: File, priority: string) => {
    await submitUrlsFromFile(file, priority);
  };

  const handleRetry = async (entry: any) => {
    await retryEntry(entry);
  };

  const handleUpdateStatus = async (entryId: string, status: string, errorMessage?: string) => {
    await updateEntryStatus(entryId, status, errorMessage);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        theme === 'dark'
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
      }`}
    >
      {/* Page Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-32 pb-12">
        <div className="w-full max-w-7xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
              SiteGrip Indexing
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Submit URLs for Google indexing with priority control, bulk processing, and real-time tracking.
            </p>
          </div>

          {/* Dashboard */}
          <IndexingDashboard
            statistics={statistics}
            quotaInfo={quotaInfo}
            onRefresh={refreshData}
            isLoading={isLoading}
          />

          {/* Form Section */}
          <EnhancedIndexingForm
            onSubmit={handleFormSubmit}
            onFileSubmit={handleFileSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Table Section */}
          <EnhancedIndexingTable
            entries={indexingEntries}
            onRetry={handleRetry}
            onUpdateStatus={handleUpdateStatus}
            isLoading={isLoading}
          />

          {/* Project Info */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Project ID: {projectId}</p>
            <p className="mt-1">
              Backend API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 