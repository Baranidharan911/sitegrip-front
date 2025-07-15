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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
    const { getAuthInstance } = await import('../lib/firebase');
    const auth = getAuthInstance();
    
    // Wait for auth state to be ready
    await new Promise((resolve) => {
      if (!auth) {
        resolve(null);
        return;
      }
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
    
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      return token;
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ [Auth Token] Failed to get Firebase token:', error);
    return null;
  }
};

// Enhanced fetch function with authentication
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

class IndexingAPI {
  // Authentication endpoints
  async getAuthStatus(userId: string): Promise<AuthState> {
    try {
      console.log('🔍 [Frontend] Checking auth status for user:', userId);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/status`);

      if (!response.ok) {
        console.error('❌ [Frontend] Auth status request failed:', response.status, response.statusText);
        throw new Error(`Auth status check failed: ${response.status}`);
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
      throw new Error(`Auth status check failed: ${error.message}`);
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
        throw new Error(`Dashboard request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dashboard data loaded:', data);

      return {
        statistics: data.statistics || {
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
        },
        quotaInfo: data.quotaInfo || null,
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

  // Add the missing checkStatus function
  async checkStatus(entries: any[]): Promise<any> {
    try {
      console.log('🔍 Checking status for entries:', entries.length);
      
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
      console.log('✅ Status check completed:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Status check failed:', error);
      throw error;
    }
  }

  // Legacy method for single URL submission (for backward compatibility)
  async submitSingleUrl(userId: string, url: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium', projectId?: string, tier?: string): Promise<IndexingResponse> {
    try {
      console.log('📤 Submitting single URL for indexing:', url, 'projectId:', projectId, 'tier:', tier);
      
      // Convert critical to high for API compatibility
      const apiPriority = priority === 'critical' ? 'high' : priority;
      
      const response = await fetchWithAuth(`${API_BASE_URL}/api/indexing/submit`, {
        method: 'POST',
        body: JSON.stringify({ urls: [url], priority: apiPriority, projectId, tier }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Submission failed: ${response.status}`);
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
        throw new Error(`GSC properties request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ GSC properties loaded:', data);
      
      // Handle both response formats: data.properties and data.data.properties
      return data.data?.properties || data.properties || [];
    } catch (error: any) {
      console.error('❌ Failed to load GSC properties:', error);
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
}

// Export singleton instance
export const indexingApi = new IndexingAPI();
export default indexingApi;
