'use client';

import { useEffect, useState, useRef } from 'react';
import { useIndexingBackend } from '@/hooks/useIndexingBackend';
import EnhancedIndexingForm from './EnhancedIndexingForm';
import IndexingDashboard from './IndexingDashboard';
import EnhancedIndexingTable from './EnhancedIndexingTable';
import { Toaster } from 'react-hot-toast';

export default function EnhancedIndexingPage() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [projectId, setProjectId] = useState('default-project');
  const hasLoadedData = useRef(false);
  
  const {
    loading,
    indexingEntries,
    statistics,
    quotaInfo,
    authState,
    submitUrls,
    submitUrlsFromWebsite,
    submitUrlsFromFile,
    discoverFromGSC,
    updateStatus,
    retryEntry,
    deleteEntry,
    loadDashboardData,
    loadMoreEntries,
    checkStatus,
  } = useIndexingBackend();

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only access localStorage after component is mounted
    if (!mounted) return;
    
    // Load user from localStorage and check authentication
    const loadUserAndCheckAuth = async () => {
      const storedUser = localStorage.getItem('Sitegrip-user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const newUser = userData.user || userData;
          
          // Reset data loading flag if user changed
          if (currentUser?.uid !== newUser?.uid) {
            hasLoadedData.current = false;
          }
          
          setCurrentUser(newUser);
          
          // Check if we have a valid token
          const token = userData.token || userData.idToken || null;
          if (token) {
            // Validate token is not expired (basic check)
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const isExpired = payload.exp * 1000 < Date.now();
                
                if (!isExpired) {
                  setAuthToken(token);
                } else {
                  console.log('Token expired, will need to refresh');
                  setAuthToken(null);
                }
              }
            } catch (error) {
              console.warn('Failed to parse token:', error);
              setAuthToken(token); // Use token anyway
            }
          }
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
        }
      }
    };

    loadUserAndCheckAuth();
  }, [mounted, currentUser?.uid]);

  useEffect(() => {
    if (mounted && currentUser && authToken && projectId && !hasLoadedData.current) {
      console.log('Loading dashboard data for authenticated user...');
      hasLoadedData.current = true;
      loadDashboardData(projectId);
    }
  }, [mounted, currentUser, authToken, projectId, loadDashboardData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      hasLoadedData.current = false;
    };
  }, []);

  // Don't render anything until component is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleDiscoverFromGSC = async (
    propertyUrl: string, 
    options: { maxPages: number; includeExcluded: boolean; includeErrors: boolean }
  ) => {
    if (!currentUser) {
      return;
    }
    await discoverFromGSC(propertyUrl, projectId, options, 'medium');
  };

  const handleRefresh = () => {
    hasLoadedData.current = false;
    loadDashboardData(projectId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Google Indexing API
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Submit your URLs to Google for indexing using your own Google Search Console account
            </p>
          </div>

          {/* Dashboard */}
          <IndexingDashboard />

          {/* Submission Form */}
          <EnhancedIndexingForm
            onSubmitUrls={async (urls, priority) => { await submitUrls(urls, projectId, priority); }}
            onSubmitWebsite={async (websiteUrl, priority) => { await submitUrlsFromWebsite(websiteUrl, projectId, priority); }}
            onSubmitFile={async (file, priority) => { await submitUrlsFromFile(file, projectId, priority); }}
            onDiscoverFromGSC={handleDiscoverFromGSC}
            loading={loading}
            quotaInfo={quotaInfo}
            authState={authState}
          />

          {/* Recent Entries Table */}
          <div>
            <EnhancedIndexingTable
              entries={indexingEntries}
              loading={loading}
              onRetry={retryEntry}
              onDelete={deleteEntry}
              onRefresh={handleRefresh}
              onCheckStatus={checkStatus}
            />
          </div>

        </div>
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
    </div>
  );
} 
