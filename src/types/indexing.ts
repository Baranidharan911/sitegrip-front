export interface IndexingEntry {
  id: string;
  url: string;
  status: 'pending' | 'submitted' | 'indexed' | 'error';
  priority: 'low' | 'medium' | 'high';
  submittedAt: string;
  lastChecked?: string;
  errorMessage?: string;
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
  retryCount?: number;
  quotaUsed?: number;
  batchId?: string;
  domain?: string;
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

export interface IndexingStats {
  totalUrlsSubmitted: number;
  totalUrlsIndexed: number;
  totalUrlsPending: number;
  totalUrlsError: number;
  indexingSuccessRate: number;
  averageIndexingTime: number;
  quotaUsed: number;
  quotaLimit: number;
  lastUpdated: string;
  dailySubmissions: number;
  weeklySubmissions: number;
  monthlySubmissions: number;
}

export interface QuotaInfo {
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  resetTime: string;
  isPremium: boolean;
}

export interface IndexingHistoryEntry {
  id: string;
  url: string;
  action: 'submit' | 'resubmit' | 'delete' | 'check_status';
  status: 'success' | 'error' | 'pending';
  timestamp: string;
  details?: string;
  userId: string;
  projectId: string;
}

export interface DashboardData {
  statistics: IndexingStats | null;
  quotaInfo: QuotaInfo | null;
  recentEntries: IndexingEntry[];
  recentHistory: IndexingHistoryEntry[];
} 