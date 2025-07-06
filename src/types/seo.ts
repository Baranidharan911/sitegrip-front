export interface AISuggestions {
    title: string;
    metaDescription: string;
    content: string;
  }
  
  export interface PageData {
    url: string;
    title?: string;
    statusCode: number;
    wordCount: number;
    issues: string[];
    redirectChain: string[];
    loadTime: number;
    pageSizeBytes: number;
    hasViewport: boolean;
    seoScore: number;
    lcp: number;
    cls: number;
    ttfb: number;
    depth: number;
    suggestions?: AISuggestions;
  }
  