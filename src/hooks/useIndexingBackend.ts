import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { indexingApi } from '@/lib/indexingApi';
import { IndexingEntry, IndexingStats, QuotaInfo, DashboardData, AuthState } from '@/types/indexing';
import { getStoredUserId } from '@/utils/auth';

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

  const loadDashboardData = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const userId = getUserId();
      console.log('Loading dashboard data for project:', projectId, 'user:', userId);
      
      const dashboardData = await indexingApi.getDashboardData(userId);
      setIndexingEntries(dashboardData.recentEntries || []);
      setStatistics(dashboardData.statistics);
      setQuotaInfo(dashboardData.quotaInfo);
      
      if (dashboardData.authState) {
        setAuthState(dashboardData.authState);
      }
      
      console.log('Dashboard data loaded successfully:', dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('Authentication')) {
        toast.error('Please sign in with Google to access indexing features.');
      } else {
        toast.error('Failed to load indexing data. Please check your connection.');
      }
    } finally {
      setLoading(false);
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
      toast.loading('Submitting URLs for indexing...', { id: 'submit' });
      
      let response;
      if (urls.length === 1) {
        response = await indexingApi.submitSingleUrl(userId, urls[0], priority);
      } else {
        response = await indexingApi.submitBulkUrls(userId, urls, priority);
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
      
      const response = await fetch(`${apiUrl}/api/indexing/discover-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          websiteUrl: websiteUrl,
          priority: priority,
          maxPages: 10
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
          includeErrors: options.includeErrors
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
      toast.loading(`Checking status for ${entries.length} URLs...`, { id: 'check-status' });
      
      const response = await indexingApi.checkStatus(entries);
      
      if (response.success) {
        toast.success(
          `Status check completed: ${response.data.indexed_count} indexed, ${response.data.not_indexed_count} not indexed`,
          { id: 'check-status' }
        );
        
        // Force a complete dashboard data refresh after status check
        console.log('🔄 Refreshing dashboard data after status check...');
        
        // Add a small delay to allow database updates to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const userId = getUserId();
          const dashboardData = await indexingApi.getDashboardData(userId);
          setIndexingEntries(dashboardData.recentEntries || []);
          setStatistics(dashboardData.statistics);
          setQuotaInfo(dashboardData.quotaInfo);
          
          if (dashboardData.authState) {
            setAuthState(dashboardData.authState);
          }
          
          console.log('✅ Dashboard refreshed successfully after status check');
        } catch (refreshError) {
          console.error('Failed to refresh dashboard after status check:', refreshError);
          
          // Fallback: try to refresh just the entries
          try {
            const userId = getUserId();
            const historyResponse = await indexingApi.getIndexingHistory(userId, 1, 50);
            setIndexingEntries(historyResponse.entries || []);
            
            // Also try to update statistics
            const statsResponse = await indexingApi.getIndexingStats(userId);
            setStatistics(statsResponse);
          } catch (fallbackError) {
            console.error('Fallback refresh also failed:', fallbackError);
          }
        }
        
        return response;
      } else {
        toast.error(response.message || 'Status check failed', { id: 'check-status' });
        return response;
      }
    } catch (error) {
      console.error('Error checking status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check indexing status.';
      toast.error(errorMessage, { id: 'check-status' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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
    loadMoreEntries,
    getGoogleAuthUrl,
    revokeGoogleAccess,
    refreshAuthStatus,
    checkStatus,
  };
}; 
