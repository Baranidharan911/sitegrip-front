const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface SitemapEntry {
  url: string;
  lastMod?: string;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface Sitemap {
  id: string;
  domain: string;
  entries: SitemapEntry[];
  totalUrls: number;
  status: string;
  createdAt: string;
  xmlContent?: string;
}

interface SitemapAnalysis {
  isValid: boolean;
  urlCount: number;
  errors: string[];
  warnings: string[];
  entries?: SitemapEntry[];
}

interface SitemapNode {
  url: string;
  children?: SitemapNode[];
}

// Simple fetch function without authentication
const fetchWithoutAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

class SitemapAPI {
  
  // Generate sitemap using backend
  async generateSitemap(domain: string, options?: {
    includeImages?: boolean;
    includeNews?: boolean;
    includeVideos?: boolean;
    maxUrls?: number;
  }): Promise<Sitemap> {
    try {
      console.log('🗺️ Generating sitemap for:', domain);
      
      const response = await fetchWithoutAuth(`${API_BASE_URL}/api/sitemap/generate`, {
        method: 'POST',
        body: JSON.stringify({ domain, ...options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Sitemap generation failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sitemap generated successfully:', data);
      
      return data.success ? data.data : data;
    } catch (error: any) {
      console.error('❌ Failed to generate sitemap:', error);
      throw error;
    }
  }

  // Analyze existing sitemap URL
  async analyzeSitemap(sitemapUrl: string): Promise<SitemapAnalysis> {
    try {
      console.log('🔍 Analyzing sitemap:', sitemapUrl);
      
      const response = await fetchWithoutAuth(`${API_BASE_URL}/api/sitemap/analyze`, {
        method: 'POST',
        body: JSON.stringify({ url: sitemapUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Sitemap analysis failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sitemap analyzed successfully:', data);
      
      return data.success ? data.data : data;
    } catch (error: any) {
      console.error('❌ Failed to analyze sitemap:', error);
      throw error;
    }
  }

  // Get user's sitemaps
  async getUserSitemaps(page: number = 1, pageSize: number = 20, domain?: string): Promise<{
    sitemaps: Sitemap[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      console.log('📋 Loading user sitemaps...');
      
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(domain && { domain })
      });
      
      const response = await fetchWithoutAuth(`${API_BASE_URL}/api/sitemap/list?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to load sitemaps: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sitemaps loaded successfully:', data);
      
      if (data.success) {
        return {
          sitemaps: data.data,
          totalCount: data.pagination.totalItems,
          totalPages: data.pagination.totalPages
        };
      }
      
      return {
        sitemaps: data.sitemaps || [],
        totalCount: data.totalCount || 0,
        totalPages: Math.ceil((data.totalCount || 0) / pageSize)
      };
    } catch (error: any) {
      console.error('❌ Failed to load sitemaps:', error);
      throw error;
    }
  }

  // Get specific sitemap
  async getSitemap(sitemapId: string): Promise<Sitemap | null> {
    try {
      console.log('🔍 Loading sitemap:', sitemapId);
      
      const response = await fetchWithoutAuth(`${API_BASE_URL}/api/sitemap/${sitemapId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to load sitemap: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sitemap loaded successfully:', data);
      
      return data.success ? data.data : data;
    } catch (error: any) {
      console.error('❌ Failed to load sitemap:', error);
      throw error;
    }
  }

  // Download sitemap in XML or CSV format
  async downloadSitemap(sitemapId: string, format: 'xml' | 'csv' = 'xml'): Promise<Blob> {
    try {
      console.log(`📥 Downloading sitemap ${sitemapId} as ${format}...`);
      
      const response = await fetchWithoutAuth(`${API_BASE_URL}/api/sitemap/${sitemapId}/download?format=${format}`);

      if (!response.ok) {
        throw new Error(`Failed to download sitemap: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('✅ Sitemap downloaded successfully');
      
      return blob;
    } catch (error: any) {
      console.error('❌ Failed to download sitemap:', error);
      throw error;
    }
  }

  // Delete sitemap
  async deleteSitemap(sitemapId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting sitemap:', sitemapId);
      
      const response = await fetchWithoutAuth(`${API_BASE_URL}/api/sitemap/${sitemapId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete sitemap: ${response.status}`);
      }

      console.log('✅ Sitemap deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete sitemap:', error);
      throw error;
    }
  }

  // Submit sitemap to search engines
  async submitToSearchEngines(sitemapId: string, engines: string[] = ['google', 'bing']): Promise<any> {
    try {
      console.log('🚀 Submitting sitemap to search engines:', engines);
      
      const response = await fetchWithoutAuth(`${API_BASE_URL}/api/sitemap/${sitemapId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ engines }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to submit sitemap: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sitemap submitted successfully:', data);
      
      return data.success ? data.data : data;
    } catch (error: any) {
      console.error('❌ Failed to submit sitemap:', error);
      throw error;
    }
  }

  // Discover sitemaps for a domain
  async discoverSitemaps(domain: string): Promise<string[]> {
    try {
      console.log('🔍 Discovering sitemaps for domain:', domain);
      
      const response = await fetchWithoutAuth(`${API_BASE_URL}/api/sitemap/discover`, {
        method: 'POST',
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to discover sitemaps: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Sitemaps discovered successfully:', data);
      
      return data.success ? data.data : data.sitemaps || [];
    } catch (error: any) {
      console.error('❌ Failed to discover sitemaps:', error);
      throw error;
    }
  }

  // Build sitemap tree structure
  buildSitemapTree(entries: SitemapEntry[]): SitemapNode {
    const root: SitemapNode = { url: '', children: [] };
    
    const ensureChild = (parent: SitemapNode, url: string): SitemapNode => {
      const existing = parent.children?.find(child => child.url === url);
      if (existing) return existing;
      
      const newChild: SitemapNode = { url, children: [] };
      if (!parent.children) parent.children = [];
      parent.children.push(newChild);
      return newChild;
    };

    entries.forEach(entry => {
      const urlParts = entry.url.replace(/^https?:\/\//, '').split('/').filter(Boolean);
      let current = root;
      
      urlParts.forEach((part, index) => {
        const fullUrl = index === 0 ? `/${part}` : `${current.url}/${part}`;
        current = ensureChild(current, fullUrl);
      });
    });

    return root;
  }

  // Parse sitemap XML content
  parseSitemapXML(xmlContent: string): SitemapEntry[] {
    const entries: SitemapEntry[] = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    const urlElements = xmlDoc.querySelectorAll('url');
    urlElements.forEach(urlElement => {
      const loc = urlElement.querySelector('loc')?.textContent;
      const lastmod = urlElement.querySelector('lastmod')?.textContent || undefined;
      const changefreq = urlElement.querySelector('changefreq')?.textContent as any;
      const priority = urlElement.querySelector('priority')?.textContent;
      
      if (loc) {
        entries.push({
          url: loc,
          lastMod: lastmod,
          changeFreq: changefreq,
          priority: priority ? parseFloat(priority) : undefined,
        });
      }
    });
    
    return entries;
  }

  // Validate sitemap URL
  validateSitemapUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Get sitemap statistics
  getSitemapStats(entries: SitemapEntry[]): {
    totalUrls: number;
    hasLastMod: number;
    hasChangeFreq: number;
    hasPriority: number;
    avgPriority: number;
    changeFreqDistribution: Record<string, number>;
  } {
    const stats = {
      totalUrls: entries.length,
      hasLastMod: 0,
      hasChangeFreq: 0,
      hasPriority: 0,
      avgPriority: 0,
      changeFreqDistribution: {} as Record<string, number>,
    };

    let totalPriority = 0;
    let priorityCount = 0;

    entries.forEach(entry => {
      if (entry.lastMod) stats.hasLastMod++;
      if (entry.changeFreq) {
        stats.hasChangeFreq++;
        stats.changeFreqDistribution[entry.changeFreq] = (stats.changeFreqDistribution[entry.changeFreq] || 0) + 1;
      }
      if (entry.priority !== undefined) {
        stats.hasPriority++;
        totalPriority += entry.priority;
        priorityCount++;
      }
    });

    stats.avgPriority = priorityCount > 0 ? totalPriority / priorityCount : 0;

    return stats;
  }
}

export const sitemapApi = new SitemapAPI();
export default sitemapApi;

// Export types
export type { Sitemap, SitemapEntry, SitemapAnalysis, SitemapNode }; 