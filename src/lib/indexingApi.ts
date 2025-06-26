// Mock API client for Indexing functionality
import { IndexingEntry, IndexingResponse, QuotaInfo, IndexingStats, DashboardData, IndexingHistoryEntry } from '@/types/indexing';

// Mock data generators
const generateMockEntry = (url: string, projectId: string, userId: string): IndexingEntry => {
  const statuses = ['pending', 'submitted', 'indexed', 'error'] as const;
  const priorities = ['low', 'medium', 'high'] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: `idx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    url,
    status,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    submittedAt: new Date().toISOString(),
    lastChecked: status !== 'pending' ? new Date(Date.now() - Math.random() * 86400000).toISOString() : undefined,
    errorMessage: status === 'error' ? 'URL is not accessible or has crawl errors' : undefined,
    gscCoverageState: status === 'indexed' ? 'Submitted and indexed' : 'Discovered - currently not indexed',
    gscLastCrawled: status === 'indexed' ? new Date(Date.now() - Math.random() * 604800000).toISOString() : undefined,
    gscDiscoveredDate: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
    gscIndexingState: status === 'indexed' ? 'URL is on Google' : 'URL is known to Google',
    projectId,
    userId,
    retryCount: status === 'error' ? Math.floor(Math.random() * 3) : 0,
    quotaUsed: 1,
    domain: new URL(url).hostname,
    httpStatusCode: status === 'error' ? 404 : 200,
    responseTime: Math.floor(Math.random() * 2000) + 100,
  };
};

const generateMockStats = (): IndexingStats => ({
  totalUrlsSubmitted: Math.floor(Math.random() * 1000) + 100,
  totalUrlsIndexed: Math.floor(Math.random() * 800) + 80,
  totalUrlsPending: Math.floor(Math.random() * 50) + 10,
  totalUrlsError: Math.floor(Math.random() * 30) + 5,
  indexingSuccessRate: Math.floor(Math.random() * 30) + 70,
  averageIndexingTime: Math.floor(Math.random() * 48) + 12,
  quotaUsed: Math.floor(Math.random() * 150) + 50,
  quotaLimit: 200,
  lastUpdated: new Date().toISOString(),
  dailySubmissions: Math.floor(Math.random() * 20) + 5,
  weeklySubmissions: Math.floor(Math.random() * 100) + 30,
  monthlySubmissions: Math.floor(Math.random() * 400) + 150,
});

const generateMockQuota = (): QuotaInfo => ({
  dailyLimit: 200,
  dailyUsed: Math.floor(Math.random() * 150) + 25,
  dailyRemaining: 200 - (Math.floor(Math.random() * 150) + 25),
  monthlyLimit: 6000,
  monthlyUsed: Math.floor(Math.random() * 4000) + 1000,
  monthlyRemaining: 6000 - (Math.floor(Math.random() * 4000) + 1000),
  resetTime: new Date(Date.now() + 86400000).toISOString(),
  isPremium: Math.random() > 0.5,
});

class MockIndexingAPI {
  private mockEntries: IndexingEntry[] = [];
  private mockHistory: IndexingHistoryEntry[] = [];

  constructor() {
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const sampleUrls = [
      'https://example.com',
      'https://example.com/blog',
      'https://example.com/products',
      'https://example.com/about',
      'https://example.com/contact',
    ];

    sampleUrls.forEach(url => {
      this.mockEntries.push(generateMockEntry(url, 'default-project', 'user-123'));
    });

    // Generate mock history
    for (let i = 0; i < 10; i++) {
      this.mockHistory.push({
        id: `hist_${Date.now()}_${i}`,
        url: sampleUrls[Math.floor(Math.random() * sampleUrls.length)],
        action: ['submit', 'resubmit', 'check_status'][Math.floor(Math.random() * 3)] as any,
        status: ['success', 'error', 'pending'][Math.floor(Math.random() * 3)] as any,
        timestamp: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
        userId: 'user-123',
        projectId: 'default-project',
      });
    }
  }

  async getDashboardData(projectId: string): Promise<DashboardData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      statistics: generateMockStats(),
      quotaInfo: generateMockQuota(),
      recentEntries: this.mockEntries.slice(0, 5),
      recentHistory: this.mockHistory.slice(0, 5),
    };
  }

  async submitUrls(
    urls: string[], 
    projectId: string, 
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<IndexingResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newEntries: IndexingEntry[] = [];
    let successCount = 0;
    let failCount = 0;

    urls.forEach(url => {
      try {
        new URL(url); // Validate URL
        const entry = generateMockEntry(url, projectId, 'user-123');
        entry.priority = priority;
        newEntries.push(entry);
        this.mockEntries.unshift(entry);
        successCount++;

        // Add to history
        this.mockHistory.unshift({
          id: `hist_${Date.now()}_${Math.random()}`,
          url,
          action: 'submit',
          status: 'success',
          timestamp: new Date().toISOString(),
          userId: 'user-123',
          projectId,
        });
      } catch {
        failCount++;
      }
    });

    return {
      success: successCount > 0,
      message: `Successfully submitted ${successCount} URLs${failCount > 0 ? `, ${failCount} failed` : ''}`,
      data: {
        submittedUrls: urls.length,
        successfulSubmissions: successCount,
        failedSubmissions: failCount,
        entries: newEntries,
        quotaUsed: successCount,
        quotaRemaining: 200 - successCount,
      },
    };
  }

  async submitUrlsFromFile(
    file: File, 
    projectId: string, 
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<IndexingResponse> {
    const text = await file.text();
    const urls = text.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    return this.submitUrls(urls, projectId, priority);
  }

  async getEntries(
    projectId: string,
    limit: number = 50,
    offset: number = 0,
    status?: string
  ): Promise<IndexingEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = this.mockEntries.filter(entry => entry.projectId === projectId);
    
    if (status) {
      filtered = filtered.filter(entry => entry.status === status);
    }

    return filtered.slice(offset, offset + limit);
  }

  async updateStatus(
    entryId: string, 
    status: string, 
    errorMessage?: string
  ): Promise<IndexingResponse> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const entry = this.mockEntries.find(e => e.id === entryId);
    if (entry) {
      entry.status = status as any;
      entry.errorMessage = errorMessage;
      entry.lastChecked = new Date().toISOString();
    }

    return {
      success: true,
      message: 'Status updated successfully',
    };
  }

  async getStatistics(projectId: string): Promise<IndexingStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateMockStats();
  }

  async getQuotaInfo(projectId: string): Promise<QuotaInfo> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return generateMockQuota();
  }

  async deleteEntry(entryId: string): Promise<IndexingResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.mockEntries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      this.mockEntries.splice(index, 1);
    }

    return {
      success: true,
      message: 'Entry deleted successfully',
    };
  }
}

export const indexingApi = new MockIndexingAPI(); 