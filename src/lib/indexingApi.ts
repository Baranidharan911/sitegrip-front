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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

// Helper function to get Firebase ID token
const getAuthToken = (): string | null => {
  try {
    const userData = localStorage.getItem('Sitegrip-user');
    if (userData) {
      const user = JSON.parse(userData);
      // Try different possible token fields
      const token = user.idToken || user.token || null;
      if (token) {
        console.log('🔍 [Auth Token] Found token for API calls');
        return token;
      } else {
        console.warn('⚠️ [Auth Token] No Firebase token found in localStorage');
      }
    } else {
      console.warn('⚠️ [Auth Token] No user data in localStorage');
    }
  } catch (error) {
    console.warn('❌ Failed to get auth token:', error);
  }
  return null;
};

// Helper function for authenticated requests
const fetchWithAuth = async (
  url: string, 
  options: RequestInit = {},
  timeout: number = 60000  // Increased timeout to 60 seconds
): Promise<Response> => {
  const token = getAuthToken();
  const userId = getUserId();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  // Add authorization header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add user ID header if available
  if (userId) {
    headers['X-User-ID'] = userId;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`⏰ Request timeout after ${timeout}ms: ${url}`);
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle specific abort errors more gracefully
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`🚫 Request aborted: ${url}`, error);
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    
    console.error(`❌ Request failed: ${url}`, error);
    throw error;
  }
};

// Helper function to extract error message from response
const extractErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorData = await response.json();
    return errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
};

// Map backend entry to frontend format
const mapBackendEntryToFrontend = (backendEntry: any): IndexingEntry => {
  return {
    id: backendEntry.id,
    url: backendEntry.url,
    domain: backendEntry.domain,
    user_id: backendEntry.user_id,
    priority: backendEntry.priority,
    action: backendEntry.action,
    status: backendEntry.status,
    created_at: backendEntry.created_at,
    submitted_at: backendEntry.submitted_at,
    completed_at: backendEntry.completed_at,
    google_response: backendEntry.google_response,
    error_message: backendEntry.error_message,
    retry_count: backendEntry.retry_count || 0,
    max_retries: backendEntry.max_retries || 3,
    quota_used: backendEntry.quota_used || false,
    
    // Legacy compatibility fields
    submittedAt: backendEntry.submitted_at || backendEntry.created_at,
    lastChecked: backendEntry.completed_at,
    projectId: 'default-project',
    userId: backendEntry.user_id,
    indexingState: backendEntry.status
  };
};

// Map backend quota to frontend format
const mapBackendQuotaToFrontend = (backendQuota: any): QuotaInfo => {
  return {
    id: backendQuota.id,
    domain: backendQuota.domain,
    user_id: backendQuota.user_id,
    date: backendQuota.date,
    daily_limit: backendQuota.daily_limit,
    priority_reserve: backendQuota.priority_reserve,
    total_used: backendQuota.total_used,
    low_priority_used: backendQuota.low_priority_used,
    medium_priority_used: backendQuota.medium_priority_used,
    high_priority_used: backendQuota.high_priority_used,
    critical_priority_used: backendQuota.critical_priority_used,
    created_at: backendQuota.created_at,
    updated_at: backendQuota.updated_at,
    remaining_quota: backendQuota.remaining_quota,
    priority_remaining: backendQuota.priority_remaining,
    can_submit_priority: backendQuota.can_submit_priority,
    can_submit_regular: backendQuota.can_submit_regular,
    
    // Legacy compatibility fields
    dailyLimit: backendQuota.daily_limit,
    priorityReserve: backendQuota.priority_reserve,
    totalUsed: backendQuota.total_used,
    highPriorityUsed: backendQuota.high_priority_used,
    criticalPriorityUsed: backendQuota.critical_priority_used,
    remainingQuota: backendQuota.remaining_quota,
    priorityRemaining: backendQuota.priority_remaining,
    canSubmitPriority: backendQuota.can_submit_priority,
    canSubmitRegular: backendQuota.can_submit_regular,
    dailyUsed: backendQuota.total_used,
    dailyRemaining: backendQuota.remaining_quota
  };
};

export const indexingApi = {
  // Authentication endpoints
  async getAuthStatus(userId: string): Promise<AuthState> {
    try {
      console.log('🔍 [Frontend] Checking auth status for user:', userId);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/auth/google/status?user_id=${userId}`);

      if (!response.ok) {
        console.error('❌ [Frontend] Auth status request failed:', response.status, response.statusText);
        throw new Error(await extractErrorMessage(response));
      }

      const data = await response.json();
      console.log('🔍 [Frontend] Auth status response:', data);
      
      return {
        isAuthenticated: data.isAuthenticated || false,
        user: data.user || null,
        properties: data.properties || [],
        indexStatuses: data.indexStatuses || [],
        selectedProperty: data.selectedProperty || (data.properties && data.properties.length > 0 ? data.properties[0] : undefined)
      };
    } catch (error) {
      console.error('❌ [Frontend] Error getting auth status:', error);
      return {
        isAuthenticated: false,
        properties: [],
        indexStatuses: []
      };
    }
  },

  async getGoogleAuthUrl(userId: string): Promise<string> {
    try {
      console.log('🔗 [Frontend] Getting Google auth URL for user:', userId);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/google/url?user_id=${userId}`);
      
      if (!response.ok) {
        console.error('❌ [Frontend] Auth URL request failed:', response.status, response.statusText);
        throw new Error(await extractErrorMessage(response));
      }
      
      const data = await response.json();
      if (!data.url) {
        throw new Error('No auth URL received from server');
      }
      console.log('✅ [Frontend] Got Google auth URL');
      return data.url;
    } catch (error) {
      console.error('❌ [Frontend] Error getting Google auth URL:', error);
      throw new Error('Failed to get Google authentication URL');
    }
  },

  async revokeGoogleAccess(userId: string): Promise<boolean> {
    try {
          const response = await fetchWithAuth(`${API_BASE_URL}/api/gsc/gsc/revoke-access`, {
          method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error revoking Google access:', error);
      throw new Error('Failed to revoke Google access');
    }
  },

  // GSC properties
  async getGSCProperties(userId: string): Promise<GSCProperty[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/gsc/properties?user_id=${userId}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }
        throw new Error(await extractErrorMessage(response));
      }
      
      const properties = await response.json();
      return Array.isArray(properties) ? properties : [];
    } catch (error) {
      console.error('Error getting GSC properties:', error);
      return [];
    }
  },

  // Indexing endpoints
  async submitSingleUrl(
    userId: string, 
    url: string, 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<IndexingResponse> {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/submit/single?user_id=${userId}`, {
        method: 'POST',
        body: JSON.stringify({
          url,
          priority,
          action: 'URL_UPDATED'
        })
      });

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }

      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message,
        data: {
          submittedUrls: 1,
          successfulSubmissions: data.success ? 1 : 0,
          failedSubmissions: data.success ? 0 : 1,
          entries: data.entry_id ? [mapBackendEntryToFrontend({
            id: data.entry_id,
            url: data.url,
            status: data.status,
            error_message: data.error,
            google_response: data.google_response,
            user_id: userId
          })] : [],
          quotaUsed: data.success ? 1 : 0,
          quotaRemaining: 0 // Will be updated by quota info
        }
      };
    } catch (error) {
      console.error('Error submitting single URL:', error);
      throw error;
    }
  },

  async submitBulkUrls(
    userId: string, 
    urls: string[], 
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<IndexingResponse> {
    try {
      const request: BulkIndexingRequest = {
        urls,
        priority,
        action: 'URL_UPDATED'
      };

      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/submit?user_id=${userId}`, {
        method: 'POST',
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }

      const data = await response.json();
      
      return {
        success: data.success,
        message: data.message,
        data: {
          submittedUrls: data.total_submitted || urls.length,
          successfulSubmissions: data.total_success || 0,
          failedSubmissions: data.total_failed || 0,
          entries: (data.entries || []).map(mapBackendEntryToFrontend),
          quotaUsed: data.total_success || 0,
          quotaRemaining: 0 // Will be updated by quota info
        }
      };
    } catch (error) {
      console.error('Error submitting bulk URLs:', error);
      throw error;
    }
  },

  async getIndexingHistory(
    userId: string, 
    page: number = 1, 
    pageSize: number = 50
  ): Promise<IndexingHistoryResponse> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/indexing/history?user_id=${userId}&page=${page}&page_size=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }

      const data = await response.json();
      
      return {
        entries: (data.entries || []).map(mapBackendEntryToFrontend),
        total_count: data.total_count || 0,
        page: data.page || page,
        page_size: data.page_size || pageSize
      };
    } catch (error) {
      console.error('Error getting indexing history:', error);
      throw error;
    }
  },

  async getIndexingStats(userId: string, days: number = 30): Promise<IndexingStats> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/indexing/stats?user_id=${userId}&days=${days}`
      );

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }

      const data = await response.json();
      
      return {
        total_submitted: data.total_submitted || 0,
        pending: data.pending || 0,
        success: data.success || 0,
        failed: data.failed || 0,
        quota_used: data.quota_used || 0,
        quota_remaining: data.quota_remaining || 0,
        success_rate: data.success_rate || 0,
        
        // Legacy compatibility fields
        totalUrlsSubmitted: data.total_submitted || 0,
        totalUrlsIndexed: data.success || 0,
        totalUrlsPending: data.pending || 0,
        totalUrlsError: data.failed || 0,
        indexingSuccessRate: data.success_rate || 0,
        averageIndexingTime: 0,
        quotaUsed: data.quota_used || 0,
        quotaLimit: 200,
        remainingQuota: data.quota_remaining || 0,
        lastUpdated: new Date().toISOString(),
        dailySubmissions: data.total_submitted || 0,
        weeklySubmissions: data.total_submitted || 0,
        monthlySubmissions: data.total_submitted || 0
      };
    } catch (error) {
      console.error('Error getting indexing stats:', error);
      throw error;
    }
  },

  async getQuotaInfo(userId: string, domain?: string): Promise<QuotaInfo | null> {
    try {
      let url = `${API_BASE_URL}/api/quota/summary`;
      if (domain) {
        url = `${API_BASE_URL}/api/quota/${domain}`;
      }

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(await extractErrorMessage(response));
      }

      const data = await response.json();
      
      if (domain) {
        return mapBackendQuotaToFrontend(data);
      } else {
        // For summary, create a synthetic quota info
        return {
          id: 'summary',
          domain: 'all',
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          daily_limit: data.total_limits || 200,
          priority_reserve: 50,
          total_used: data.total_used || 0,
          low_priority_used: 0,
          medium_priority_used: 0,
          high_priority_used: 0,
          critical_priority_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          remaining_quota: data.total_remaining || 0,
          priority_remaining: 50,
          can_submit_priority: true,
          can_submit_regular: true,
          
          // Legacy fields
          dailyLimit: data.total_limits || 200,
          priorityReserve: 50,
          totalUsed: data.total_used || 0,
          highPriorityUsed: 0,
          criticalPriorityUsed: 0,
          remainingQuota: data.total_remaining || 0,
          priorityRemaining: 50,
          canSubmitPriority: true,
          canSubmitRegular: true,
          dailyUsed: data.total_used || 0,
          dailyRemaining: data.total_remaining || 0
        };
      }
    } catch (error) {
      console.error('Error getting quota info:', error);
      return null;
    }
  },

  async deleteEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/indexing/entry/${entryId}?user_id=${userId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
      }

      const data = await response.json();
      return data.success || false;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  },

  async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      console.log('🔄 Loading dashboard data for user:', userId);
      
      // Fetch critical data first (auth status)
      let authState: AuthState = {
        isAuthenticated: false,
        properties: [],
        indexStatuses: []
      };
      
      try {
        authState = await this.getAuthStatus(userId);
        console.log('✅ Auth status loaded:', authState.isAuthenticated);
      } catch (error) {
        console.warn('⚠️ Auth status failed, using defaults:', error);
      }
      
      // Then fetch other data with better error handling
      const [historyResponse, statsResponse, quotaResponse] = await Promise.allSettled([
        this.getIndexingHistory(userId, 1, 10),
        this.getIndexingStats(userId),
        this.getQuotaInfo(userId)
      ]);

      const history = historyResponse.status === 'fulfilled' ? historyResponse.value : null;
      const stats = statsResponse.status === 'fulfilled' ? statsResponse.value : null;
      const quota = quotaResponse.status === 'fulfilled' ? quotaResponse.value : null;
      
      // Log what failed for debugging
      if (historyResponse.status === 'rejected') {
        console.warn('⚠️ History fetch failed:', historyResponse.reason);
      }
      if (statsResponse.status === 'rejected') {
        console.warn('⚠️ Stats fetch failed:', statsResponse.reason);
      }
      if (quotaResponse.status === 'rejected') {
        console.warn('⚠️ Quota fetch failed:', quotaResponse.reason);
      }

      const result = {
        statistics: stats,
        quotaInfo: quota,
        recentEntries: history?.entries || [],
        recentHistory: history?.entries || [],
        authState: authState
      };
      
      console.log('✅ Dashboard data loaded:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error getting dashboard data:', error);
      
      // Return minimal working state instead of throwing
      return {
        statistics: null,
        quotaInfo: null,
        recentEntries: [],
        recentHistory: [],
        authState: {
          isAuthenticated: false,
          properties: [],
          indexStatuses: []
        }
      };
    }
  }
};