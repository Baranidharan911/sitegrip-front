export interface IndexingEntry {
  id: string;
  url: string;
  status: 'indexed' | 'pending' | 'error' | 'submitted';
  submittedAt: string;
  indexedAt?: string;
  priority: boolean;
  failureReason?: string;
  timestamp?: {
    toDate: () => Date;
  };
}

export interface SitemapEntry {
  id: string;
  url: string;
  autoSync: boolean;
  lastSubmitted: string;
  status: 'submitted' | 'deleted' | 'pending';
  domain?: string;
}

export interface QuotaInfo {
  dailyLimit: number;
  used: number;
  remaining: number;
  perDomain: DomainQuota[];
}

export interface DomainQuota {
  domain: string;
  allocated: number;
  used: number;
  remaining: number;
}

export interface GSCData {
  url: string;
  coverage: 'Indexed' | 'Discovered' | 'Excluded' | 'Error';
  lastCrawled: string;
  discoveredDate: string;
  indexingState?: string;
  crawlRequest?: string;
}

export interface IndexingStats {
  totalUrls: number;
  indexedCount: number;
  pendingCount: number;
  errorCount: number;
  indexedPercentage: number;
  priorityUrls: number;
}

export interface BulkIndexRequest {
  urls: string[];
  priority?: boolean;
  source: 'manual' | 'file' | 'sitemap' | 'auto';
}

export interface IndexingHistoryEntry {
  id: string;
  action: 'submit' | 'delete' | 'priority' | 'sitemap_add' | 'sitemap_remove';
  url?: string;
  sitemapUrl?: string;
  timestamp: string;
  status: 'success' | 'failed';
  details?: string;
} 