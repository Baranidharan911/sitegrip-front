import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { indexingApi } from '@/lib/indexingApi';
import { IndexingEntry, IndexingStats, QuotaInfo, DashboardData, AuthState } from '@/types/indexing';
import { normalizeQuotaInfo, getTierInfo, formatQuotaDisplay } from '@/lib/dataUtils';
import { getStoredUserId } from '@/utils/auth';

// Helper function to get user data from localStorage
const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('Sitegrip-user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

export const useIndexingBackend = () => {
  const [loading, setLoading] = useState(false);
  const [indexingEntries, setIndexingEntries] = useState<IndexingEntry[]>([]);
  const [statistics, setStatistics] = useState<IndexingStats | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    properties: [],
    indexStatuses: []
  });

  // Get user ID from auth utility
  const getUserId = useCallback((): string => {
    return getStoredUserId() || 'anonymous';
  }, []);

  // Separate function to load quota info directly from the backend
  const loadQuotaInfo = useCallback(async () => {
    try {
      const userId = getUserId();
      console.log('🔄 Loading quota information for user:', userId);
      
      const quotaData = await indexingApi.getQuotaInfo();
      setQuotaInfo(quotaData);
      
      console.log('✅ Quota information loaded successfully:', quotaData);
      return quotaData;
    } catch (error) {
      console.error('❌ Failed to load quota information:', error);
      throw error;
    }
  }, []);

  const loadDashboardData = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const userId = getUserId();
      console.log('🔄 Loading dashboard data for project:', projectId, 'user:', userId);
      
      // Load quota info first to ensure we have correct tier-based limits
      try {
        await loadQuotaInfo();
      } catch (quotaError) {
        console.warn('⚠️ Failed to load quota info, continuing with dashboard data:', quotaError);
      }
      
      const dashboardData = await indexingApi.getDashboardData(userId);
      setIndexingEntries(dashboardData.recentEntries || []);
      setStatistics(dashboardData.statistics);
      
      // Use quota info from dedicated endpoint if dashboard doesn't have it
      if (dashboardData.quotaInfo) {
      setQuotaInfo(dashboardData.quotaInfo);
      }
      
      if (dashboardData.authState) {
        setAuthState(dashboardData.authState);
      }
      
      console.log('✅ Dashboard data loaded successfully:', dashboardData);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Authentication')) {
        toast.error('Please sign in with Google to access indexing features.');
      } else if (error instanceof Error && error.message.includes('401')) {
        toast.error('Authentication required. Please sign in again.');
      } else {
        toast.error('Failed to load quota information. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadQuotaInfo]);

  const refreshDashboardStatistics = useCallback(async () => {
    try {
      const userId = getUserId();
      console.log('🔄 Refreshing dashboard statistics (preserving Google data)...');
      
      const dashboardData = await indexingApi.getDashboardData(userId);
      
      // Only update statistics and quota info, preserve existing entries with Google data
      setStatistics(dashboardData.statistics);
      
      if (dashboardData.quotaInfo) {
        setQuotaInfo(dashboardData.quotaInfo);
      }
      
      if (dashboardData.authState) {
        setAuthState(dashboardData.authState);
      }
      
      console.log('✅ Dashboard statistics refreshed (entries preserved)');
    } catch (error: any) {
      console.warn('⚠️ Failed to refresh dashboard statistics:', error);
    }
  }, []);

  const submitUrls = useCallback(async (
    urls: string[], 
    projectId: string, 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    setLoading(true);
    try {
      const userId = getUserId();
      const user = getStoredUser();
      
      // Clean URLs but allow duplicates for manual submissions
      const cleanedUrls = urls.map(url => {
        try {
          const urlObj = new URL(url.trim());
          // Remove fragments and normalize
          urlObj.hash = '';
          return urlObj.toString();
        } catch {
          return url.trim();
        }
      }).filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));
      
      if (cleanedUrls.length === 0) {
        toast.error('No valid URLs found to submit.', { id: 'submit' });
        return { success: false, message: 'No valid URLs' };
      }
      
      toast.loading(`Submitting ${cleanedUrls.length} URLs for indexing...`, { id: 'submit' });
      
      let response;
      if (cleanedUrls.length === 1) {
        response = await indexingApi.submitSingleUrl(userId, cleanedUrls[0], priority, user?.projectId, user?.tier);
      } else {
        response = await indexingApi.submitBulkUrls(userId, cleanedUrls, priority, user?.projectId, user?.tier);
      }
      
      if (response.success) {
        toast.success(
          `Successfully submitted ${response.data?.successfulSubmissions || 0} URLs for indexing!`,
          { id: 'submit' }
        );
        
        // Update local state with new entries
        if (response.data?.entries) {
          setIndexingEntries(prev => [...response.data!.entries, ...prev]);
        }
        
        // Refresh stats and auth state
        try {
          const [statsResponse, authResponse] = await Promise.allSettled([
            indexingApi.getIndexingStats(userId),
            indexingApi.getAuthStatus(userId)
          ]);

          if (statsResponse.status === 'fulfilled') {
            setStatistics(statsResponse.value);
          }
          if (authResponse.status === 'fulfilled') {
            setAuthState(authResponse.value);
          }
        } catch (error) {
          console.log('Non-critical: Failed to update stats after submission:', error);
        }
        
        return response;
      } else {
        toast.error(response.message || 'Failed to submit URLs', { id: 'submit' });
        return response;
      }
    } catch (error) {
      console.error('Error submitting URLs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit URLs for indexing.';
      
      if (errorMessage.includes('Authentication') || errorMessage.includes('sign in')) {
        toast.error('Please sign in with Google to submit URLs for indexing.', { id: 'submit' });
      } else {
        toast.error(errorMessage, { id: 'submit' });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitUrlsFromWebsite = useCallback(async (
    websiteUrl: string, 
    projectId: string, 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    setLoading(true);
    try {
      // Check if website has already been discovered recently
      const websiteHostname = new URL(websiteUrl).hostname;
      const recentDiscoveries = indexingEntries.filter(entry => {
        try {
          const entryUrl = new URL(entry.url);
          const submittedDate = entry.created_at || entry.submitted_at || entry.submittedAt;
          const entryTime = submittedDate ? new Date(submittedDate).getTime() : 0;
          return entryUrl.hostname === websiteHostname && 
                 new Date().getTime() - entryTime < 24 * 60 * 60 * 1000; // Last 24 hours
        } catch {
          return false;
        }
      });
      
      if (recentDiscoveries.length > 0) {
        toast(`⚠️ Found ${recentDiscoveries.length} URLs from this website discovered in the last 24 hours. Proceeding with fresh discovery...`, { 
          id: 'recent-discovery-warning',
          icon: '⚠️',
          duration: 4000
        });
      }
      
      toast.loading('Discovering pages from website...', { id: 'website-discovery' });
      
      // Check if we're in browser environment before accessing localStorage
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        throw new Error('Browser environment required.');
      }
      
      const storedUser = localStorage.getItem('Sitegrip-user');
      if (!storedUser) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      const userData = JSON.parse(storedUser);
      const idToken = userData.token || userData.idToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Get existing URLs from this website to prevent duplicates during discovery
      const existingUrls = indexingEntries
        .filter(entry => {
          try {
            return new URL(entry.url).hostname === websiteHostname;
          } catch {
            return false;
          }
        })
        .map(entry => entry.url);
      
      const response = await fetch(`${apiUrl}/api/indexing/discover-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          websiteUrl: websiteUrl,
          priority: priority,
          maxPages: 10,
          excludeUrls: existingUrls // Send existing URLs to backend for deduplication
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const submitted = data.summary?.submitted || 0;
        toast.success(
          `Website discovery completed! Discovered ${data.summary?.total_discovered} pages, submitted ${submitted} URLs for indexing.`,
          { id: 'website-discovery' }
        );
        
        // Refresh the entries
        await loadDashboardData(projectId);
        
        return data;
      } else {
        toast.error(data.message || 'Failed to discover website pages', { id: 'website-discovery' });
        return data;
      }
    } catch (error) {
      console.error('Error discovering website:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to discover website pages.';
      toast.error(errorMessage, { id: 'website-discovery' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  const submitUrlsFromFile = useCallback(async (
    file: File, 
    projectId: string, 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    setLoading(true);
    try {
      toast.loading('Processing file and submitting URLs...', { id: 'file-submit' });
      
      // Read URLs from file
      const text = await file.text();
      const urls = text.split('\n')
        .map(url => url.trim())
        .filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));

      if (urls.length === 0) {
        throw new Error('No valid URLs found in file');
      }

      const response = await submitUrls(urls, projectId, priority);
      
      if (response.success) {
        toast.success(
          `Successfully processed file and submitted ${response.data?.successfulSubmissions || 0} URLs!`,
          { id: 'file-submit' }
        );
      } else {
        toast.error(response.message || 'Failed to process file', { id: 'file-submit' });
      }
      
      return response;
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file. Please check the file format.', { id: 'file-submit' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [submitUrls]);

  const discoverFromGSC = useCallback(async (
    propertyUrl: string,
    projectId: string,
    options: { maxPages: number; includeExcluded: boolean; includeErrors: boolean },
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    setLoading(true);
    try {
      toast.loading('Discovering pages from Google Search Console...', { id: 'gsc-discovery' });
      
      const storedUser = localStorage.getItem('Sitegrip-user');
      if (!storedUser) {
        throw new Error('Authentication required. Please sign in.');
      }
      
      const userData = JSON.parse(storedUser);
      const idToken = userData.token || userData.idToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      // Get existing URLs from this property to prevent duplicates during discovery
      const existingPropertyUrls = indexingEntries
        .filter(entry => {
          try {
            const entryUrl = new URL(entry.url);
            const propertyUrlObj = new URL(propertyUrl);
            return entryUrl.hostname === propertyUrlObj.hostname;
          } catch {
            return false;
          }
        })
        .map(entry => entry.url);
      
      const response = await fetch(`${apiUrl}/api/indexing/discover-gsc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          propertyUrl: propertyUrl,
          maxPages: options.maxPages,
          includeExcluded: options.includeExcluded,
          includeErrors: options.includeErrors,
          excludeUrls: existingPropertyUrls // Send existing URLs to backend for deduplication
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const submitted = data.summary?.submitted || 0;
        toast.success(
          `GSC discovery completed! Discovered ${data.summary?.total_discovered} pages, submitted ${submitted} URLs for indexing.`,
          { id: 'gsc-discovery' }
        );
        
        // Refresh the entries
        await loadDashboardData(projectId);
        
        return data;
      } else {
        toast.error(data.message || 'Failed to discover pages from Google Search Console', { id: 'gsc-discovery' });
        return data;
      }
    } catch (error) {
      console.error('Error discovering from GSC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to discover pages from Google Search Console.';
      toast.error(errorMessage, { id: 'gsc-discovery' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  const updateStatus = useCallback(async (entryId: string, status: string, errorMessage?: string) => {
    try {
      // This would need to be implemented in the backend
      console.log('Status update requested:', { entryId, status, errorMessage });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status.');
      throw error;
    }
  }, []);

  const retryEntry = useCallback(async (entry: IndexingEntry) => {
    try {
      const projectIdToUse = entry.projectId || 'default-project';
      await submitUrls([entry.url], projectIdToUse, entry.priority);
      toast.success('URL resubmitted for indexing');
    } catch (error) {
      console.error('Error retrying entry:', error);
      toast.error('Failed to retry URL submission.');
      throw error;
    }
  }, [submitUrls]);

  const deleteEntry = useCallback(async (entry: IndexingEntry) => {
    try {
      const userId = getUserId();
      const success = await indexingApi.deleteEntry(userId, entry.id);
      
      if (success) {
        setIndexingEntries(prev => prev.filter(e => e.id !== entry.id));
        toast.success('Entry deleted successfully');
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry.');
      throw error;
    }
  }, []);

  const loadMoreEntries = useCallback(async (page: number = 2) => {
    try {
      const userId = getUserId();
      const historyResponse = await indexingApi.getIndexingHistory(userId, page, 50);
      
      if (historyResponse.entries.length > 0) {
        setIndexingEntries(prev => [...prev, ...historyResponse.entries]);
      }
      
      return historyResponse.entries.length > 0;
    } catch (error) {
      console.error('Error loading more entries:', error);
      return false;
    }
  }, []);

  const getGoogleAuthUrl = useCallback(async (): Promise<string> => {
    try {
      const userId = getUserId();
      return await indexingApi.getGoogleAuthUrl(userId);
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw error;
    }
  }, []);

  const revokeGoogleAccess = useCallback(async (): Promise<void> => {
    try {
      const userId = getUserId();
      await indexingApi.revokeGoogleAccess(userId);
      
      // Update auth state
      setAuthState({
        isAuthenticated: false,
        properties: [],
        indexStatuses: []
      });
      
      toast.success('Google access revoked successfully');
    } catch (error) {
      console.error('Error revoking Google access:', error);
      toast.error('Failed to revoke Google access');
      throw error;
    }
  }, []);

  const refreshAuthStatus = useCallback(async (): Promise<void> => {
    try {
      const userId = getUserId();
      const authStatus = await indexingApi.getAuthStatus(userId);
      setAuthState(authStatus);
    } catch (error) {
      console.error('Error refreshing auth status:', error);
      // Don't throw error for auth status refresh
    }
  }, []);

  const checkStatus = useCallback(async (entries: IndexingEntry[]) => {
    if (entries.length === 0) return;
    
    setLoading(true);
    try {
      // Use enhanced status checking with real-time Google data and progress tracking
      const response = await indexingApi.checkStatusWithProgress(
        entries,
        (progress) => {
          const percentage = Math.round((progress.completed / progress.total) * 100);
          toast.loading(
            `🔍 Checking real-time status... ${percentage}% (${progress.completed}/${progress.total})`,
            { id: 'check-status' }
          );
        }
      );
      
      if (response.success) {
        // Ensure response has summary, create one if missing
        const summary = response.summary || {
          total: response.results?.length || 0,
          indexed: (response.results || []).filter((r: any) => 
            r.simplifiedStatus === 'indexed' || r.isIndexed
          ).length,
          pending: (response.results || []).filter((r: any) => 
            r.simplifiedStatus === 'pending' || r.isPending
          ).length,
          errors: (response.results || []).filter((r: any) => 
            r.simplifiedStatus === 'error' || r.hasError || r.error
          ).length,
          notIndexed: (response.results || []).filter((r: any) => 
            r.simplifiedStatus === 'not_indexed' || r.needsSubmission
          ).length,
        };
        
        const { indexed, pending, errors, notIndexed, total } = summary;
        
        toast.success(
          `✅ Real-time status check completed: ${indexed} indexed, ${pending} pending, ${notIndexed} not indexed`,
          { id: 'check-status', duration: 6000 }
        );
        
        // Update local state with real-time Google data
        if (response.results) {
          const updatedEntries = indexingEntries.map(entry => {
            const statusResult = response.results.find((r: any) => r.url === entry.url);
            if (statusResult) {
              return {
                ...entry,
                indexing_status: statusResult.isIndexed ? 'indexed' : 
                               statusResult.isPending ? 'pending' : 
                               statusResult.needsSubmission ? 'not_indexed' : 'unknown',
                latest_gsc_status: statusResult.gscStatus,
                status_checked_at: statusResult.lastUpdated,
                google_data: statusResult.googleData,
                human_status: statusResult.humanStatus,
                detailed_info: statusResult.detailedInfo,
                // Update other fields from Google inspection result
                coverage_state: statusResult.googleData?.coverageState,
                indexing_state: statusResult.googleData?.indexingState,
                last_crawl_time: statusResult.googleData?.lastCrawlTime,
                google_canonical: statusResult.googleData?.googleCanonical,
              };
            }
            return entry;
          });
          
          setIndexingEntries(updatedEntries);
          console.log('📊 Updated entries with real-time Google data:', updatedEntries.length);
        }
        
        // Show detailed summary in console for debugging
        console.log('📊 Real-time status check results:', {
          summary: response.summary,
          indexed_urls: response.results?.filter((r: any) => r.isIndexed).map((r: any) => r.url),
          pending_urls: response.results?.filter((r: any) => r.isPending).map((r: any) => r.url),
        });
            
        // Optional: Refresh dashboard statistics after a delay, but preserve Google data
        setTimeout(() => {
          refreshDashboardStatistics().catch(error => {
            console.warn('Dashboard statistics refresh after status check failed:', error);
          });
        }, 1500);
        
        return response;
      } else {
        toast.error(response.message || 'Real-time status check failed', { id: 'check-status' });
        return response;
      }
    } catch (error: any) {
      console.error('❌ Real-time status check failed:', error);
      toast.error('Real-time status check failed. Please try again.', { id: 'check-status' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [indexingEntries, loadDashboardData]);

  return {
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
    getGoogleAuthUrl,
    revokeGoogleAccess,
    refreshAuthStatus,
    checkStatus,
  };
}; 
