export interface IndexingEntry {
  id: string;
  url: string;
  domain: string;
  user_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: 'URL_UPDATED' | 'URL_DELETED';
  status: 'pending' | 'submitted' | 'success' | 'failed' | 'retrying' | 'quota_exceeded' | 'indexed' | 'error';
  
  // Timestamps (properly aligned with backend)
  created_at: string;
  submitted_at?: string;
  completed_at?: string;
  
  // Google API response data
  google_response?: any;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  
  // Quota tracking
  quota_used: boolean;
  
  // Real indexing status fields from backend
  indexing_status?: 'indexed' | 'not_indexed' | string;
  indexing_state?: string;
  coverage_state?: string;
  last_crawl_time?: string;
  google_canonical?: string;
  status_checked_at?: string;
  indexing_details?: {
    crawled_as?: string;
    page_fetch_state?: string;
    error?: string;
  };
  
  // Legacy fields for backward compatibility
  submittedAt: string;
  lastChecked?: string;
  gscCoverageState?: string;
  gscLastCrawled?: string;
  gscDiscoveredDate?: string;
  gscIndexingState?: string;
  gscCrawlErrors?: string[];
  gscMobileUsabilityIssues?: string[];
  gscPageExperienceSignals?: {
    coreWebVitals?: {
      lcp?: number;
      fid?: number;
      cls?: number;
    };
    httpsUsage?: boolean;
    mobileUsability?: boolean;
  };
  gscReferringUrls?: string[];
  projectId: string;
  userId: string;
  batchId?: string;
  sitemapUrl?: string;
  crawlDepth?: number;
  discoveredLinks?: string[];
  lastModified?: string;
  contentHash?: string;
  contentLength?: number;
  responseTime?: number;
  httpStatusCode?: number;
  indexingState?: string;
}

export interface IndexingResponse {
  success: boolean;
  message: string;
  data?: {
    submittedUrls: number;
    successfulSubmissions: number;
    failedSubmissions: number;
    entries: IndexingEntry[];
    quotaUsed: number;
    quotaRemaining: number;
  };
  errors?: string[];
}

// Updated to match backend IndexingStatsResponse
export interface IndexingStats {
  total_submitted: number;
  pending: number;
  success: number;
  failed: number;
  quota_used: number;
  quota_remaining: number;
  success_rate: number;
  
  // Legacy fields for backward compatibility
  totalUrlsSubmitted: number;
  totalUrlsIndexed: number;
  totalUrlsNotIndexed: number;
  totalUrlsPending: number;
  totalUrlsError: number;
  indexingSuccessRate: number;
  averageIndexingTime: number;
  quotaUsed: number;
  quotaLimit: number;
  remainingQuota: number;
  lastUpdated: string;
  dailySubmissions: number;
  weeklySubmissions: number;
  monthlySubmissions: number;
  totalSuccess?: number;
  totalFailed?: number;
  totalRetrying?: number;
  quotaExceeded?: number;
}

export interface QuotaInfo {
  id?: string;
  domain: string;
  user_id: string;
  date: string;
  daily_limit: number;
  priority_reserve: number;
  total_used: number;
  low_priority_used: number;
  medium_priority_used: number;
  high_priority_used: number;
  critical_priority_used: number;
  created_at: string;
  updated_at: string;
  
  // Computed properties from backend
  remaining_quota: number;
  priority_remaining: number;
  can_submit_priority: boolean;
  can_submit_regular: boolean;
  
  // Legacy fields for backward compatibility
  dailyLimit: number;
  priorityReserve: number;
  totalUsed: number;
  highPriorityUsed: number;
  criticalPriorityUsed: number;
  remainingQuota: number;
  priorityRemaining: number;
  canSubmitPriority: boolean;
  canSubmitRegular: boolean;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit?: number;
  monthlyUsed?: number;
  monthlyRemaining?: number;
  resetTime?: string;
  isPremium?: boolean;
}

export interface IndexingHistoryEntry {
  id: string;
  url: string;
  action: 'submit' | 'resubmit' | 'delete' | 'check_status' | 'retry';
  status: 'success' | 'error' | 'pending';
  timestamp: string;
  details?: string;
  userId: string;
  projectId: string;
}

// Updated to match backend IndexingHistoryResponse
export interface IndexingHistoryResponse {
  entries: IndexingEntry[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface DashboardData {
  statistics: IndexingStats | null;
  quotaInfo: QuotaInfo | null;
  recentEntries: IndexingEntry[];
  recentHistory: IndexingEntry[];
  authState?: AuthState;
}

// Backend request models
export interface BulkIndexingRequest {
  urls: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: 'URL_UPDATED' | 'URL_DELETED';
}

export interface IndexingStatsResponse {
  total_submitted: number;
  pending: number;
  success: number;
  failed: number;
  quota_used: number;
  quota_remaining: number;
  success_rate: number;
}

export interface QuotaUsageStats {
  domain: string;
  date: string;
  daily_limit: number;
  total_used: number;
  remaining: number;
  usage_by_priority: Record<string, number>;
  success_rate: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  auth_url?: string;
  properties?: GSCProperty[];
  index_statuses?: IndexStatus[];
  user_id?: string;
}

export interface GSCProperty {
  site_url: string;
  property_url?: string;
  property_type: 'URL_PREFIX' | 'DOMAIN';
  permission_level: string;
  verified: boolean;
}

export interface IndexStatus {
  site_url: string;
  last_updated: string;
  indexed_pages: number;
  submitted_pages: number;
  errors: number;
  warnings: number;
  coverage_state: string;
  indexing_state: string;
  mobile_usability_issues?: string[];
  page_experience_signals?: {
    core_web_vitals?: {
      lcp?: number;
      fid?: number;
      cls?: number;
    };
    https_usage?: boolean;
    mobile_usability?: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    uid: string;
    email?: string;
    display_name?: string;
    photo_url?: string;
  };
  properties: GSCProperty[];
  indexStatuses: IndexStatus[];
  selectedProperty?: GSCProperty;
} 
