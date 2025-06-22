'use client';

import React from 'react';
import IndexingForm from './IndexingForm';
import IndexingTable from './IndexingTable';
import { useIndexing } from '@/hooks/useIndexing';
import AppHeader from '../Layout/AppHeader';
import { useTheme } from 'next-themes';

export default function IndexingPage() {
  const {
    urlInput,
    setUrlInput,
    handleSubmit,
    indexingRequests,
    isSubmitting,
  } = useIndexing();

  const { theme } = useTheme();

  const hasResults = indexingRequests.length > 0;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        theme === 'dark'
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
      }`}
    >

      {/* Page Content */}
      <main
        className={`flex-1 flex flex-col items-center justify-start px-4 pt-32 pb-12`}
      >
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-800 dark:text-indigo-300">
              Fast Page Indexing
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Instantly submit URLs to speed up discovery by search engines.
            </p>
          </div>

          {/* Form Section */}
          <IndexingForm
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Table Section */}
          {hasResults && (
            <IndexingTable
              requests={indexingRequests}
              onRetry={(e, url) => handleSubmit(e, url)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
