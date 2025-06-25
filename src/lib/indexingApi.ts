// API client for SiteGrip Indexing Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';

export interface IndexingEntry {
  id: string;
  url: string;
  status: string;
  priority: string;
  submitted_at: string;
  domain: string;
  project_id: string;
  user_id: string;
  error_message?: string;
}

export interface IndexingResponse {
  total_submitted: number;
  successful_submissions: number;
  failed_submissions: number;
  failed_urls: string[];
  errors: string[];
}

export interface QuotaInfo {
  total_daily_limit: number;
  total_used: number;
  remaining: number;
  last_updated: string;
}

export interface IndexingStats {
  total_urls_submitted: number;
  total_urls_indexed: number;
  total_urls_pending: number;
  total_urls_error: number;
  indexing_success_rate: number;
  quota_used_percentage: number;
}

export interface DashboardData {
  statistics: IndexingStats | null;
  quota: QuotaInfo | null;
  recent_entries: IndexingEntry[];
}

class IndexingAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getUserId(): string {
    // Get user ID from localStorage
    try {
      const userStr = localStorage.getItem('Sitegrip-user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData.user?.uid || userData.uid || 'anonymous-user';
      }
    } catch (e) {
      console.warn('Failed to get user ID from localStorage');
    }
    return 'anonymous-user';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    return this.request('/health');
  }

  // Submit URLs for indexing
  async submitUrls(
    urls: string[],
    projectId: string,
    priority: string = 'medium'
  ): Promise<IndexingResponse> {
    console.log('Frontend: Submitting URLs:', urls);
    console.log('Frontend: Project ID:', projectId);
    console.log('Frontend: Priority:', priority);
    console.log('Frontend: User ID:', this.getUserId());
    console.log('Frontend: API Base URL:', this.baseUrl);
    
    const requestBody = {
      urls,
      priority,
      project_id: projectId,
    };
    console.log('Frontend: Request body:', requestBody);
    
    // Add user_id as query parameter
    const userId = this.getUserId();
    const url = `/api/index/submit?user_id=${encodeURIComponent(userId)}`;
    
    try {
      const response = await this.request<IndexingResponse>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      console.log('Frontend: API response:', response);
      return response;
    } catch (error) {
      console.error('Frontend: API error:', error);
      throw error;
    }
  }

  // Get indexing entries
  async getEntries(
    projectId?: string,
    status?: string,
    limit: number = 100
  ): Promise<IndexingEntry[]> {
    const params = new URLSearchParams();
    if (projectId) params.append('project_id', projectId);
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('user_id', this.getUserId());

    return this.request(`/api/index/entries?${params.toString()}`);
  }

  // Get quota information
  async getQuotaInfo(projectId: string): Promise<QuotaInfo> {
    const userId = this.getUserId();
    return this.request(`/api/index/quota?project_id=${projectId}&user_id=${userId}`);
  }

  // Get indexing statistics
  async getStatistics(projectId: string): Promise<IndexingStats> {
    const userId = this.getUserId();
    return this.request(`/api/index/stats?project_id=${projectId}&user_id=${userId}`);
  }

  // Update indexing status
  async updateStatus(
    entryId: string,
    status: string,
    errorMessage?: string
  ): Promise<{ success: boolean; message: string }> {
    const body: any = { status };
    if (errorMessage) body.error_message = errorMessage;

    return this.request(`/api/index/entries/${entryId}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // Submit URLs from file
  async submitUrlsFromFile(
    file: File,
    projectId: string,
    priority: string = 'medium'
  ): Promise<IndexingResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('priority', priority);
    formData.append('project_id', projectId);

    const url = `${this.baseUrl}/api/index/submit-file`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // Get dashboard data
  async getDashboardData(projectId: string): Promise<DashboardData> {
    const [statistics, quota, recent_entries] = await Promise.all([
      this.getStatistics(projectId).catch(() => null),
      this.getQuotaInfo(projectId).catch(() => null),
      this.getEntries(projectId, undefined, 50).catch(() => []),
    ]);

    return {
      statistics,
      quota,
      recent_entries,
    };
  }
}

// Create and export a singleton instance
export const indexingApi = new IndexingAPI();

// Utility functions
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return 'unknown';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'indexed':
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'submitted':
    case 'pending':
    case 'processing':
      return 'text-yellow-600 bg-yellow-100';
    case 'error':
    case 'failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
