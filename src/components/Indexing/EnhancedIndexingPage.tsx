'use client';

import { useEffect, useState, useRef } from 'react';
import { useIndexingBackend } from '@/hooks/useIndexingBackend';
import EnhancedIndexingForm from './EnhancedIndexingForm';
import EnhancedIndexingTable from './EnhancedIndexingTable';
import { Toaster } from 'react-hot-toast';
import { Globe, Zap, TrendingUp, Shield } from 'lucide-react';

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
    loadQuotaInfo,
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
      console.log('🔄 Loading dashboard data for authenticated user...');
      hasLoadedData.current = true;
      
      // Load dashboard data immediately to get real quota information
      loadDashboardData(projectId).then(() => {
        console.log('✅ Dashboard data loaded successfully with quota info');
      }).catch((error) => {
        console.error('❌ Failed to load dashboard data:', error);
        hasLoadedData.current = false; // Allow retry
      });
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Site Grip</h3>
          <p className="text-gray-600 dark:text-gray-400">Preparing your indexing dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Hero Header */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Google Indexing API
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Submit your URLs to Google for indexing using your own Google Search Console account. 
              Track real-time status and optimize your website's search visibility.
            </p>
            
            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Zap className="w-4 h-4 text-blue-600" />
                Real-time Status Tracking
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Bulk URL Submission
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4 text-purple-600" />
                Secure Google Integration
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <EnhancedIndexingForm
              onSubmitUrls={async (urls, priority) => { await submitUrls(urls, projectId, priority); }}
              onSubmitWebsite={async (websiteUrl, priority) => { await submitUrlsFromWebsite(websiteUrl, projectId, priority); }}
              onSubmitFile={async (file, priority) => { await submitUrlsFromFile(file, projectId, priority); }}
              onDiscoverFromGSC={handleDiscoverFromGSC}
              loading={loading}
              quotaInfo={quotaInfo}
              authState={authState}
            />
          </div>

          {/* Queue Status Section */}
          {quotaInfo && quotaInfo.queueInfo && quotaInfo.queueInfo.totalQueued > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      URLs in Queue
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {quotaInfo.queueInfo.totalQueued} URLs waiting for automatic processing
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {quotaInfo.queueInfo.totalQueued}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Queued URLs
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Wait Time</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {quotaInfo.queueInfo.avgWaitTime > 0 ? `${quotaInfo.queueInfo.avgWaitTime}h` : 'Next reset'}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Processing</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Daily Reset
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Oldest in Queue</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {quotaInfo.queueInfo.oldestQueuedAt 
                      ? new Date(quotaInfo.queueInfo.oldestQueuedAt).toLocaleDateString()
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>ℹ️ Auto-Processing:</strong> Your queued URLs will be automatically submitted when your daily quota resets at midnight UTC. 
                  You'll be notified when processing is complete.
                </p>
              </div>
            </div>
          )}

          {/* Recent Entries Table */}
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
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </div>
  );
} 
