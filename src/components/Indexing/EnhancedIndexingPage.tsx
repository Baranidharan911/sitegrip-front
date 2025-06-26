'use client';

import { useEffect, useState } from 'react';
import { useIndexingBackend } from '@/hooks/useIndexingBackend';
import EnhancedIndexingForm from './EnhancedIndexingForm';
import IndexingDashboard from './IndexingDashboard';
import EnhancedIndexingTable from './EnhancedIndexingTable';
import GoogleAuthButton from './GoogleAuthButton';
import { Toaster } from 'react-hot-toast';

export default function EnhancedIndexingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projectId, setProjectId] = useState('default-project');
  
  const {
    loading,
    indexingEntries,
    statistics,
    quotaInfo,
    submitUrls,
    submitUrlsFromFile,
    retryEntry,
    deleteEntry,
    loadDashboardData,
  } = useIndexingBackend();

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('Sitegrip-user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData.user || userData);
    }
  }, []);

  useEffect(() => {
    if (currentUser && projectId) {
      loadDashboardData(projectId);
    }
  }, [currentUser, projectId, loadDashboardData]);

  const handleSubmitUrls = async (urls: string[], priority: 'low' | 'medium' | 'high') => {
    if (!currentUser) {
      return;
    }
    await submitUrls(urls, projectId, priority);
  };

  const handleSubmitFile = async (file: File, priority: 'low' | 'medium' | 'high') => {
    if (!currentUser) {
      return;
    }
    await submitUrlsFromFile(file, projectId, priority);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You need to be signed in to access the indexing functionality.
            </p>
            <GoogleAuthButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            URL Indexing Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Submit URLs for search engine indexing and monitor their status
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-8">
          <IndexingDashboard
            statistics={statistics}
            quotaInfo={quotaInfo}
            loading={loading}
            onRefresh={() => loadDashboardData(projectId)}
          />
        </div>

        {/* Submit Form */}
        <div className="mb-8">
          <EnhancedIndexingForm
            onSubmitUrls={handleSubmitUrls}
            onSubmitFile={handleSubmitFile}
            loading={loading}
            quotaInfo={quotaInfo}
          />
        </div>

        {/* Recent Entries Table */}
        <div>
          <EnhancedIndexingTable
            entries={indexingEntries}
            loading={loading}
            onRetry={retryEntry}
            onDelete={deleteEntry}
            onRefresh={() => loadDashboardData(projectId)}
          />
        </div>
      </div>
    </div>
  );
} 