import { 
  IndexingEntry, 
  IndexingResponse, 
  IndexingStats, 
  QuotaInfo, 
  DashboardData, 
  AuthState, 
  GSCProperty, 
  IndexStatus,
  IndexingHistoryResponse,
  BulkIndexingRequest
} from '@/types/indexing';
import { normalizeQuotaInfo, normalizeIndexingStats } from './dataUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

console.log('🌐 [IndexingAPI] API_BASE_URL configured as:', API_BASE_URL);

// Helper function to get user ID from localStorage
const getUserId = (): string | null => {
  try {
    const userData = localStorage.getItem('Sitegrip-user');
    if (userData) {
      const user = JSON.parse(userData);
      // Handle both direct and nested user structures
      return user.uid || user.user?.uid || null;
    }
  } catch (error) {
    console.warn('Failed to get user ID from localStorage:', error);
  }
  return null;
};

// Helper function to get auth token from Firebase
const getAuthToken = async (): Promise<string | null> => {
  try {
    // First try to get token from Firebase Auth
    const { getAuthInstance } = await import('../lib/firebase');
    const auth = getAuthInstance();
    
    if (auth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        console.log('✅ [Auth Token] Got token from Firebase Auth');
        return token;
      } catch (tokenError) {
        console.warn('⚠️ [Auth Token] Failed to get token from Firebase Auth:', tokenError);
      }
    }
    
    // Fallback: Try to get token from localStorage
    console.log('🔄 [Auth Token] Firebase auth not ready, checking localStorage...');
    
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const userData = localStorage.getItem('Sitegrip-user');
        if (userData) {
          const parsed = JSON.parse(userData);
          // Handle both nested and direct user object structures
          const user = parsed.user || parsed;
          const token = user.idToken || user.token;
          
          if (token) {
            console.log('✅ [Auth Token] Got token from localStorage');
            
            // Basic token validation - check if it's not expired
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const isExpired = payload.exp * 1000 < Date.now();
                
                if (!isExpired) {
                  return token;
                } else {
                  console.warn('⚠️ [Auth Token] Token from localStorage is expired');
                  return null;
                }
              }
            } catch (parseError) {
              console.warn('⚠️ [Auth Token] Failed to parse token, but using anyway:', parseError);
              return token; // Use token anyway if we can't parse it
            }
          }
        }
      } catch (localStorageError) {
        console.warn('⚠️ [Auth Token] Failed to get token from localStorage:', localStorageError);
      }
    }
    
    console.log('❌ [Auth Token] No valid token found in Firebase Auth or localStorage');
    return null;
  } catch (error) {
    console.error('❌ [Auth Token] Failed to get auth token:', error);
    return null;
  }
};

// Enhanced fetch function with authentication
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getAuthToken();
  
  console.log('🔐 [IndexingAPI] Making request to:', url);
  console.log('🔐 [IndexingAPI] Token available:', !!token);
  if (token) {
    console.log('🔐 [IndexingAPI] Token preview:', token.substring(0, 20) + '...');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  console.log('🔐 [IndexingAPI] Request headers:', { ...headers, Authorization: headers.Authorization ? '[HIDDEN]' : 'NOT_SET' });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('🔐 [IndexingAPI] Response status:', response.status);
  
  if (!response.ok && response.status === 403) {
    console.error('❌ [IndexingAPI] 403 Forbidden - Authentication failed');
    console.error('❌ [IndexingAPI] URL:', url);
    console.error('❌ [IndexingAPI] Has token:', !!token);
    
    // Try to get error details
    try {
      const errorText = await response.clone().text();
      console.error('❌ [IndexingAPI] Error response:', errorText);
    } catch (e) {
      console.error('❌ [IndexingAPI] Could not read error response');
    }
  }

  return response;
};

class IndexingAPI {
  // Authentication endpoints
  async getAuthStatus(userId: string): Promise<AuthState> {
    try {
      console.log('🔍 [Frontend] Checking auth status for user:', userId);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/status`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Auth status request failed with status ${response.status}:`, errorData);
        throw new Error(errorData.message || `Auth status request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [Frontend] Auth status received:', data);

      return {
        isAuthenticated: data.isAuthenticated || false,
        user: data.user || null,
        properties: data.properties || [],
        indexStatuses: data.indexStatuses || [],
        selectedProperty: data.selectedProperty || null,
      };
    } catch (error: any) {
      console.error('❌ [Frontend] Auth status check failed:', error);
      throw error;
    }
  }

  async verifyTokenWithBackend(idToken: string, googleAccessToken?: string, googleRefreshToken?: string): Promise<any> {
    try {
      console.log('🔐 [Frontend] Verifying token with backend...');
      
      const endpoint = googleAccessToken 
        ? `${API_BASE_URL}/api/auth/verify-token-with-google`
        : `${API_BASE_URL}/api/auth/verify-token`;

      const body = googleAccessToken 
        ? { idToken, googleAccessToken, googleRefreshToken }
        : { idToken };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Backend verification failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [Frontend] Backend verification successful:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ [Frontend] Backend verification failed:', error);
      throw error;
    }
  }

  // Dashboard data
  async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      console.log('🔄 Loading dashboard data for user:', userId);
      
      // First verify authentication
      const authStatus = await this.getAuthStatus(userId);
      if (!authStatus.isAuthenticated) {
        throw new Error('User not authenticated');
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/dashboard`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Dashboard request failed with status ${response.status}:`, errorData);
        throw new Error(errorData.message || `Dashboard request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dashboard data loaded:', data);

      // Normalize backend data to handle both snake_case and camelCase
      const normalizedQuotaInfo = data.quotaInfo ? normalizeQuotaInfo(data.quotaInfo) : null;
      const normalizedStatistics = data.statistics ? normalizeIndexingStats(data.statistics) : null;

      return {
        statistics: normalizedStatistics,
        quotaInfo: normalizedQuotaInfo,
        recentEntries: data.recentEntries || [],
        recentHistory: data.recentHistory || [],
        authState: authStatus,
      };
    } catch (error: any) {
      console.error('❌ Failed to load dashboard data:', error);
      throw error;
    }
  }

  // Indexing operations
  async submitUrls(urls: string[], priority: 'low' | 'medium' | 'high' = 'medium', projectId?: string, tier?: string): Promise<IndexingResponse> {
    try {
      console.log('📤 Submitting URLs for indexing:', urls, 'projectId:', projectId, 'tier:', tier);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/submit`, {
        method: 'POST',
        body: JSON.stringify({ urls, priority, projectId, tier }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Submission failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ URLs submitted successfully:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ URL submission failed:', error);
      throw error;
    }
  }

  // Enhanced status checking with real-time Google data
  async checkStatus(entries: any[]): Promise<any> {
    try {
      console.log('🔍 Checking real-time status for entries:', entries.length);
      
      const urls = entries.map(entry => entry.url);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/check-status`, {
        method: 'POST',
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Status check failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Real-time status check completed:', data);
      
      // Process the results to provide detailed status information
      const processedResults = data.results?.map((result: any) => ({
        ...result,
        // Add processed status indicators
        isIndexed: result.simplifiedStatus === 'indexed',
        isPending: result.simplifiedStatus === 'pending',
        hasError: result.simplifiedStatus === 'error',
        needsSubmission: result.simplifiedStatus === 'not_indexed',
        // Extract detailed Google data
        googleData: {
          coverageState: result.inspectionResult?.indexStatusResult?.coverageState,
          indexingState: result.inspectionResult?.indexStatusResult?.indexingState,
          lastCrawlTime: result.inspectionResult?.indexStatusResult?.lastCrawlTime,
          googleCanonical: result.inspectionResult?.indexStatusResult?.googleCanonical,
          crawledAs: result.inspectionResult?.indexStatusResult?.crawledAs,
          pageFetchState: result.inspectionResult?.indexStatusResult?.pageFetchState,
        },
        // Human-readable status
        humanStatus: this.getHumanReadableStatus(result.simplifiedStatus, result.gscStatus),
        lastUpdated: new Date().toISOString()
      })) || [];
      
      return {
        ...data,
        results: processedResults,
        summary: {
          total: processedResults.length,
          indexed: processedResults.filter((r: any) => r.isIndexed).length,
          pending: processedResults.filter((r: any) => r.isPending).length,
          errors: processedResults.filter((r: any) => r.hasError).length,
          notIndexed: processedResults.filter((r: any) => r.needsSubmission).length,
        }
      };
    } catch (error: any) {
      console.error('❌ Real-time status check failed:', error);
      throw error;
    }
  }

  // Helper method to get human-readable status
  private getHumanReadableStatus(simplifiedStatus: string, gscStatus: string): string {
    switch (simplifiedStatus) {
      case 'indexed':
        return '🚀 Successfully Indexed';
      case 'pending':
        return '⏳ Pending Indexation';
      case 'not_indexed':
        return '❌ Not Indexed';
      case 'error':
        return '⚠️ Error Checking Status';
      case 'not_owned':
        return '🔒 Not Verified in GSC';
      default:
        return `📊 ${gscStatus || 'Unknown Status'}`;
    }
  }

  // New method for batch status checking with progress
  async checkStatusWithProgress(
    entries: any[], 
    onProgress?: (progress: { completed: number; total: number; current: string }) => void
  ): Promise<any> {
    const batchSize = 10; // Check 10 URLs at a time to avoid rate limits
    const results = [];
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      // Update progress
      onProgress?.({
        completed: i,
        total: entries.length,
        current: batch[0]?.url || 'Processing...'
      });
      
      try {
        const batchResult = await this.checkStatus(batch);
        
        // Ensure each result has the proper structure and boolean flags
        const processedBatchResults = (batchResult.results || []).map((result: any) => ({
          ...result,
          isIndexed: result.simplifiedStatus === 'indexed',
          isPending: result.simplifiedStatus === 'pending',
          hasError: result.simplifiedStatus === 'error' || result.error,
          needsSubmission: result.simplifiedStatus === 'not_indexed',
          googleData: {
            coverageState: result.inspectionResult?.indexStatusResult?.coverageState,
            indexingState: result.inspectionResult?.indexStatusResult?.indexingState,
            lastCrawlTime: result.inspectionResult?.indexStatusResult?.lastCrawlTime,
            googleCanonical: result.inspectionResult?.indexStatusResult?.googleCanonical,
            crawledAs: result.inspectionResult?.indexStatusResult?.crawledAs,
            pageFetchState: result.inspectionResult?.indexStatusResult?.pageFetchState,
          },
          humanStatus: this.getHumanReadableStatus(result.simplifiedStatus, result.gscStatus),
          detailedInfo: this.getDetailedStatusInfo(result),
          lastUpdated: new Date().toISOString()
        }));
        
        results.push(...processedBatchResults);
        
        // Small delay to respect rate limits
        if (i + batchSize < entries.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Batch ${i}-${i + batchSize} failed:`, error);
        // Add error results for failed batch
        batch.forEach(entry => {
          results.push({
            url: entry.url,
            simplifiedStatus: 'error',
            isIndexed: false,
            isPending: false,
            hasError: true,
            needsSubmission: false,
            error: 'Batch check failed',
            humanStatus: '⚠️ Check Failed',
            lastUpdated: new Date().toISOString()
          });
        });
      }
    }
    
    // Final progress update
    onProgress?.({
      completed: entries.length,
      total: entries.length,
      current: 'Completed'
    });
    
    // Create summary from processed results
    const summary = {
      total: results.length,
      indexed: results.filter(r => r.simplifiedStatus === 'indexed' || r.isIndexed).length,
      pending: results.filter(r => r.simplifiedStatus === 'pending' || r.isPending).length,
      errors: results.filter(r => r.simplifiedStatus === 'error' || r.hasError || r.error).length,
      notIndexed: results.filter(r => r.simplifiedStatus === 'not_indexed' || r.needsSubmission).length,
    };

    console.log('📊 checkStatusWithProgress creating summary:', summary, 'from results:', results.length);

    return {
      success: true,
      results,
      summary,
      timestamp: new Date().toISOString()
    };
  }

  // New method for single URL real-time check
  async checkSingleUrlStatus(url: string): Promise<any> {
    try {
      console.log('🔍 Checking single URL status:', url);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/check-status`, {
        method: 'POST',
        body: JSON.stringify({ urls: [url] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Status check failed: ${response.status}`);
      }

      const data = await response.json();
      const result = data.results?.[0];
      
      if (!result) {
        throw new Error('No status data received');
      }
      
      // Add detailed processing for single URL
      return {
        ...result,
        isIndexed: result.simplifiedStatus === 'indexed',
        isPending: result.simplifiedStatus === 'pending',
        hasError: result.simplifiedStatus === 'error',
        needsSubmission: result.simplifiedStatus === 'not_indexed',
        googleData: {
          coverageState: result.inspectionResult?.indexStatusResult?.coverageState,
          indexingState: result.inspectionResult?.indexStatusResult?.indexingState,
          lastCrawlTime: result.inspectionResult?.indexStatusResult?.lastCrawlTime,
          googleCanonical: result.inspectionResult?.indexStatusResult?.googleCanonical,
          crawledAs: result.inspectionResult?.indexStatusResult?.crawledAs,
          pageFetchState: result.inspectionResult?.indexStatusResult?.pageFetchState,
        },
        humanStatus: this.getHumanReadableStatus(result.simplifiedStatus, result.gscStatus),
        detailedInfo: this.getDetailedStatusInfo(result),
        lastUpdated: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('❌ Single URL status check failed:', error);
      throw error;
    }
  }

  // Helper method to get detailed status information
  private getDetailedStatusInfo(result: any): string[] {
    const info = [];
    
    if (result.inspectionResult?.indexStatusResult) {
      const indexResult = result.inspectionResult.indexStatusResult;
      
      if (indexResult.coverageState) {
        info.push(`Coverage: ${indexResult.coverageState}`);
      }
      
      if (indexResult.indexingState) {
        info.push(`Indexing: ${indexResult.indexingState}`);
      }
      
      if (indexResult.lastCrawlTime) {
        const crawlDate = new Date(indexResult.lastCrawlTime);
        info.push(`Last crawled: ${crawlDate.toLocaleDateString()}`);
      }
      
      if (indexResult.crawledAs) {
        info.push(`Crawled as: ${indexResult.crawledAs}`);
      }
    }
    
    return info;
  }

  // Check verified Search Console properties
  async checkVerifiedProperties(): Promise<{ success: boolean; properties: string[]; error?: string }> {
    try {
      console.log('🔍 [GSC] Checking verified Search Console properties...');
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/gsc/properties`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [GSC] Failed to get properties:', errorData);
        return {
          success: false,
          properties: [],
          error: errorData.message || `Failed to fetch properties: ${response.status}`
        };
      }
      
      const data = await response.json();
      console.log('✅ [GSC] Verified properties:', data.properties);
      
      return {
        success: true,
        properties: data.properties || [],
      };
    } catch (error: any) {
      console.error('❌ [GSC] Error checking properties:', error);
      return {
        success: false,
        properties: [],
        error: error.message
      };
    }
  }

  // Legacy method for single URL submission (for backward compatibility)
  async submitSingleUrl(userId: string, url: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium', projectId?: string, tier?: string): Promise<IndexingResponse> {
    try {
      console.log('📤 [IndexingAPI] Submitting single URL for indexing:', {
        url,
        userId,
        priority,
        projectId,
        tier,
        apiUrl: `${API_BASE_URL}/api/indexing/submit`
      });
      
      // Convert critical to high for API compatibility
      const apiPriority = priority === 'critical' ? 'high' : priority;
      
      const requestBody = { urls: [url], priority: apiPriority, projectId, tier };
      console.log('📤 [IndexingAPI] Request body:', requestBody);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/submit`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log('📤 [IndexingAPI] Response received:', response.status, response.statusText);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
          console.error('❌ [IndexingAPI] Error response data:', errorData);
        } catch (parseError) {
          console.error('❌ [IndexingAPI] Could not parse error response:', parseError);
          const errorText = await response.text();
          console.error('❌ [IndexingAPI] Raw error response:', errorText);
        }
        
        if (response.status === 403) {
          // Check if it's a Search Console property verification issue
          if (errorData.error && errorData.error.includes('verified Search Console properties')) {
            throw new Error(`Search Console Verification Required: ${errorData.error}\n\nTo fix this:\n1. Go to Google Search Console (search.google.com/search-console)\n2. Add and verify your domain\n3. Try submitting URLs again`);
          }
          throw new Error(`Authentication failed: ${errorData.message || errorData.error || 'Access forbidden. Please check your login status and try again.'}`);
        }
        
        throw new Error(errorData.message || `Submission failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Single URL submitted successfully:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Single URL submission failed:', error);
      throw error;
    }
  }

  // Legacy method for bulk URL submission (for backward compatibility)
  async submitBulkUrls(userId: string, urls: string[], priority: 'low' | 'medium' | 'high' | 'critical' = 'medium', projectId?: string, tier?: string): Promise<IndexingResponse> {
    try {
      console.log('📤 Bulk submitting URLs for indexing:', urls, 'projectId:', projectId, 'tier:', tier);
      
      // Convert critical to high for API compatibility
      const apiPriority = priority === 'critical' ? 'high' : priority;
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/submit`, {
        method: 'POST',
        body: JSON.stringify({ urls, priority: apiPriority, projectId, tier }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Bulk submission failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Bulk URLs submitted successfully:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Bulk URL submission failed:', error);
      throw error;
    }
  }

  async bulkSubmitUrls(request: BulkIndexingRequest): Promise<IndexingResponse> {
    try {
      console.log('📤 Bulk submitting URLs:', request);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/bulk-submit`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Bulk submission failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Bulk URLs submitted successfully:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Bulk URL submission failed:', error);
      throw error;
    }
  }

  // Updated getIndexingHistory to support both old and new signatures
  async getIndexingHistory(userIdOrPage: string | number = 1, pageOrPageSize: number = 20, pageSizeOrUndefined?: number): Promise<IndexingHistoryResponse> {
    try {
      // Handle both old signature (userId, page, pageSize) and new signature (page, pageSize)
      let page: number;
      let pageSize: number;
      
      if (typeof userIdOrPage === 'string') {
        // Old signature: getIndexingHistory(userId, page, pageSize)
        page = pageOrPageSize;
        pageSize = pageSizeOrUndefined || 20;
        console.log('📋 Loading indexing history (legacy), page:', page, 'pageSize:', pageSize);
      } else {
        // New signature: getIndexingHistory(page, pageSize)
        page = userIdOrPage;
        pageSize = pageOrPageSize;
        console.log('📋 Loading indexing history, page:', page, 'pageSize:', pageSize);
      }
      
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/indexing/history?page=${page}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`History request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Indexing history loaded:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load indexing history:', error);
      throw error;
    }
  }

  // Legacy method for getting indexing stats (for backward compatibility)
  async getIndexingStats(userId: string, days: number = 30): Promise<IndexingStats> {
    try {
      console.log('📊 Loading indexing stats for user:', userId);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/stats?days=${days}`);

      if (!response.ok) {
        throw new Error(`Stats request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Indexing stats loaded:', data);
      
      return data.data || data;
    } catch (error: any) {
      console.error('❌ Failed to load indexing stats:', error);
      // Return default stats if API fails
      return {
        total_submitted: 0,
        pending: 0,
        success: 0,
        failed: 0,
        quota_used: 0,
        quota_remaining: 200,
        success_rate: 0,
        totalUrlsSubmitted: 0,
        totalUrlsIndexed: 0,
        totalUrlsNotIndexed: 0,
        totalUrlsPending: 0,
        totalUrlsError: 0,
        indexingSuccessRate: 0,
        averageIndexingTime: 0,
        quotaUsed: 0,
        quotaLimit: 200,
        remainingQuota: 200,
        lastUpdated: new Date().toISOString(),
        dailySubmissions: 0,
        weeklySubmissions: 0,
        monthlySubmissions: 0,
      };
    }
  }

  async retryFailedSubmissions(): Promise<{ success: boolean; message: string; retriedCount: number }> {
    try {
      console.log('🔄 Retrying failed submissions...');
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/retry-failed`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Retry request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Failed submissions retried:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to retry submissions:', error);
      throw error;
    }
  }

  // Legacy method for deleting entries (for backward compatibility)
  async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting entry:', entryId);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/entry/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Entry deleted successfully:', data);
      
      return data.success || true;
    } catch (error: any) {
      console.error('❌ Failed to delete entry:', error);
      return false;
    }
  }

  // Legacy method for getting Google auth URL (for backward compatibility)
  async getGoogleAuthUrl(userId: string): Promise<string> {
    try {
      console.log('🔗 Getting Google auth URL for user:', userId);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/google/url?user_id=${userId}`);

      if (!response.ok) {
        throw new Error(`Auth URL request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Google auth URL received:', data);
      
      return data.url || data.auth_url || '';
    } catch (error: any) {
      console.error('❌ Failed to get Google auth URL:', error);
      throw error;
    }
  }

  // Legacy method for revoking Google access (for backward compatibility)
  async revokeGoogleAccess(userId: string): Promise<boolean> {
    try {
      console.log('🚫 Revoking Google access for user:', userId);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/gsc/revoke-access`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Revoke request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Google access revoked successfully:', data);
      
      return data.success || true;
    } catch (error: any) {
      console.error('❌ Failed to revoke Google access:', error);
      return false;
    }
  }

  // Quota management
  async getQuotaInfo(): Promise<QuotaInfo> {
    try {
      console.log('📊 Loading quota information...');
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/quota/status`);

      if (!response.ok) {
        throw new Error(`Quota request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Quota information loaded:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load quota information:', error);
      throw error;
    }
  }

  // Google Search Console integration
  async getGSCProperties(): Promise<GSCProperty[]> {
    try {
      console.log('🔍 Loading Google Search Console properties...');
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/gsc/properties`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `GSC properties request failed: ${response.status}`;
        
        if (response.status === 401) {
          console.error('❌ GSC properties request failed with 401 - user needs to authenticate with Google Search Console');
          throw new Error(`GSC properties request failed: 401 - ${errorMessage}`);
        }
        
        console.error('❌ GSC properties request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ GSC properties loaded:', data);
      
      // Handle GSC API response format: data.data.properties
      return data.data?.properties || [];
    } catch (error: any) {
      console.error('❌ Failed to load GSC properties:', error.message);
      throw error;
    }
  }

  async getIndexStatus(siteUrl: string): Promise<IndexStatus> {
    try {
      console.log('📈 Loading index status for:', siteUrl);
      
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/gsc/index-status?siteUrl=${encodeURIComponent(siteUrl)}`
      );

      if (!response.ok) {
        throw new Error(`Index status request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Index status loaded:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load index status:', error);
      throw error;
    }
  }

  // Export functionality
  async exportData(format: 'csv' | 'excel' | 'json', filters?: any): Promise<Blob> {
    try {
      console.log('📁 Exporting data in format:', format);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/export/${format}`, {
        method: 'POST',
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) {
        throw new Error(`Export request failed: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('✅ Data exported successfully');
      
      return blob;
    } catch (error: any) {
      console.error('❌ Failed to export data:', error);
      throw error;
    }
  }

  // Monitoring and uptime
  async getMonitoringData(): Promise<any> {
    try {
      console.log('📊 Loading monitoring data...');
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/monitoring/dashboard`);

      if (!response.ok) {
        throw new Error(`Monitoring request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Monitoring data loaded:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load monitoring data:', error);
      throw error;
    }
  }

  // SEO Crawler functionality
  async crawlUrl(url: string, options?: { depth?: number; waitForJs?: boolean }): Promise<any> {
    try {
      console.log('🕷️ Crawling URL:', url);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/crawl/start`, {
        method: 'POST',
        body: JSON.stringify({ url, ...options }),
      });

      if (!response.ok) {
        throw new Error(`Crawl request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Crawl started successfully:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to start crawl:', error);
      throw error;
    }
  }

  async getCrawlResults(crawlId: string): Promise<any> {
    try {
      console.log('📋 Loading crawl results for:', crawlId);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/crawl/results/${crawlId}`);

      if (!response.ok) {
        throw new Error(`Crawl results request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Crawl results loaded:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load crawl results:', error);
      throw error;
    }
  }

  // Keyword analysis
  async analyzeKeywords(url: string, keywords?: string[]): Promise<any> {
    try {
      console.log('🔍 Analyzing keywords for:', url);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/keywords/analyze`, {
        method: 'POST',
        body: JSON.stringify({ url, keywords }),
      });

      if (!response.ok) {
        throw new Error(`Keyword analysis failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Keyword analysis completed:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to analyze keywords:', error);
      throw error;
    }
  }

  // Analytics methods
  async getIndexingAnalytics(timeRange: string = '7d'): Promise<any> {
    console.log('📊 Loading indexing analytics for timeRange:', timeRange);
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/analytics?timeRange=${timeRange}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Analytics data loaded:', data);
    
    return data;
  }

  async getPerformanceMetrics(): Promise<any> {
    console.log('⚡ Loading performance metrics...');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/performance`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Performance metrics request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Performance metrics loaded:', data);
    
    return data;
  }

  // Sitemap functionality
  async generateSitemap(domain: string, options?: any): Promise<any> {
    try {
      console.log('🗺️ Generating sitemap for:', domain);
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/sitemap/generate`, {
        method: 'POST',
        body: JSON.stringify({ domain, ...options }),
      });

      if (!response.ok) {
        throw new Error(`Sitemap generation failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sitemap generated successfully:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to generate sitemap:', error);
      throw error;
    }
  }

  async checkIndexingStatus(urls: string[]): Promise<any[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/check-status`, {
      method: 'POST',
      body: JSON.stringify({ urls }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Status check failed: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
  }

  // Get comprehensive indexed pages data from Google Search Console
  async getIndexedPages(
    property: string,
    options: {
      days?: number;
      page?: number;
      pageSize?: number;
      includePerformance?: boolean;
    } = {}
  ): Promise<any> {
    try {
      console.log('🔍 Loading indexed pages from Google Search Console...');
      
      const params = new URLSearchParams({
        days: (options.days || 30).toString(),
        page: (options.page || 1).toString(),
        pageSize: (options.pageSize || 100).toString(),
        includePerformance: (options.includePerformance || false).toString()
      });
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/gsc/indexed-pages/${encodeURIComponent(property)}?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Indexed pages request failed: ${response.status}`;
        
        if (response.status === 401) {
          console.error('❌ Indexed pages request failed with 401 - user needs to authenticate with Google Search Console');
          throw new Error(`Indexed pages request failed: 401 - ${errorMessage}`);
        }
        
        console.error('❌ Indexed pages request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Indexed pages loaded:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load indexed pages:', error.message);
      throw error;
    }
  }

  // Get indexing summary statistics from Google Search Console
  async getIndexingSummary(property: string): Promise<any> {
    try {
      console.log('📊 Loading indexing summary from Google Search Console...');
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/gsc/indexing-summary/${encodeURIComponent(property)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Indexing summary request failed: ${response.status}`;
        
        if (response.status === 401) {
          console.error('❌ Indexing summary request failed with 401 - user needs to authenticate with Google Search Console');
          throw new Error(`Indexing summary request failed: 401 - ${errorMessage}`);
        }
        
        console.error('❌ Indexing summary request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Indexing summary loaded:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load indexing summary:', error.message);
      throw error;
    }
  }

  // Get historical performance data from Google Search Console
  async getPerformanceHistory(property: string, days: number = 30): Promise<any> {
    try {
      console.log('📈 Loading performance history from Google Search Console...');
      
      const params = new URLSearchParams({
        days: days.toString()
      });
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/gsc/performance-history/${encodeURIComponent(property)}?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Performance history request failed: ${response.status}`;
        
        if (response.status === 401) {
          console.error('❌ Performance history request failed with 401 - user needs to authenticate with Google Search Console');
          throw new Error(`Performance history request failed: 401 - ${errorMessage}`);
        }
        
        console.error('❌ Performance history request failed:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Performance history loaded:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load performance history:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const indexingApi = new IndexingAPI();
export default indexingApi;
