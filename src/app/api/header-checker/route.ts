import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Make request to get headers and HTML content
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      redirect: 'follow'
    });

    // Get HTML content for structured data analysis
    const htmlContent = await response.text();

    // Canonical Tag Analysis
    const canonicalAnalysis = {
      present: false,
      count: 0,
      urls: [] as string[],
      issues: [] as string[],
      recommendations: [] as string[],
      status: 'pass' as 'pass' | 'warn' | 'fail'
    };

    // Extract canonical tags
    const canonicalRegex = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let canonicalMatch;
    while ((canonicalMatch = canonicalRegex.exec(htmlContent)) !== null) {
      canonicalAnalysis.count++;
      canonicalAnalysis.urls.push(canonicalMatch[1]);
    }

    // Analyze canonical tag usage
    if (canonicalAnalysis.count === 0) {
      canonicalAnalysis.issues.push('No canonical tag found');
      canonicalAnalysis.recommendations.push('Add a canonical tag pointing to the preferred URL');
      canonicalAnalysis.status = 'fail';
    } else if (canonicalAnalysis.count > 1) {
      canonicalAnalysis.issues.push(`Multiple canonical tags found (${canonicalAnalysis.count})`);
      canonicalAnalysis.recommendations.push('Remove duplicate canonical tags - only one should be present');
      canonicalAnalysis.status = 'fail';
    } else {
      canonicalAnalysis.present = true;
      const canonicalUrl = canonicalAnalysis.urls[0];
      
      // Check for self-referencing
      const currentUrl = new URL(response.url);
      const canonicalUrlObj = new URL(canonicalUrl, currentUrl.origin);
      
      if (canonicalUrlObj.href === currentUrl.href) {
        // Self-referencing is good
      } else {
        // Check if it's a cross-domain canonical
        if (canonicalUrlObj.hostname !== currentUrl.hostname) {
          canonicalAnalysis.issues.push('Cross-domain canonical tag detected');
          canonicalAnalysis.recommendations.push('Ensure cross-domain canonical is intentional and properly configured');
          canonicalAnalysis.status = 'warn';
        } else {
          // Same domain but different path
          canonicalAnalysis.issues.push('Canonical points to different URL on same domain');
          canonicalAnalysis.recommendations.push('Verify this is the intended canonical URL');
          canonicalAnalysis.status = 'warn';
        }
      }
      
      // Check for relative URLs
      if (canonicalUrl.startsWith('/')) {
        canonicalAnalysis.recommendations.push('Consider using absolute URLs for canonical tags');
      }
    }

    // Convert headers to object
    const headers: { [key: string]: string } = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Security headers audit
    const securityHeaders = [
      {
        key: 'content-security-policy',
        label: 'Content-Security-Policy',
        required: true,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy',
        check: (v: string | undefined) => v ? 'pass' : 'fail',
        explanation: 'Helps prevent XSS and data injection attacks.'
      },
      {
        key: 'x-frame-options',
        label: 'X-Frame-Options',
        required: true,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options',
        check: (v: string | undefined) => v ? 'pass' : 'fail',
        explanation: 'Prevents clickjacking by controlling if the site can be embedded in iframes.'
      },
      {
        key: 'x-content-type-options',
        label: 'X-Content-Type-Options',
        required: true,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options',
        check: (v: string | undefined) => v && v.toLowerCase() === 'nosniff' ? 'pass' : 'fail',
        explanation: 'Prevents MIME type sniffing.'
      },
      {
        key: 'strict-transport-security',
        label: 'Strict-Transport-Security',
        required: true,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
        check: (v: string | undefined) => v ? 'pass' : 'fail',
        explanation: 'Enforces secure (HTTPS) connections to the server.'
      },
      {
        key: 'referrer-policy',
        label: 'Referrer-Policy',
        required: true,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy',
        check: (v: string | undefined) => v ? 'pass' : 'fail',
        explanation: 'Controls how much referrer information is sent.'
      },
      {
        key: 'permissions-policy',
        label: 'Permissions-Policy',
        required: false,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy',
        check: (v: string | undefined) => v ? 'pass' : 'warn',
        explanation: 'Restricts use of browser features in the document.'
      },
      {
        key: 'cross-origin-opener-policy',
        label: 'Cross-Origin-Opener-Policy',
        required: false,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy',
        check: (v: string | undefined) => v ? 'pass' : 'warn',
        explanation: 'Helps isolate browsing contexts.'
      },
      {
        key: 'cross-origin-resource-policy',
        label: 'Cross-Origin-Resource-Policy',
        required: false,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy',
        check: (v: string | undefined) => v ? 'pass' : 'warn',
        explanation: 'Controls who can load resources.'
      },
    ];

    const audit: Record<string, any> = {};
    for (const h of securityHeaders) {
      const value = headers[h.key];
      const status = h.check(value);
      audit[h.key] = {
        label: h.label,
        present: !!value,
        value: value || null,
        status, // 'pass', 'warn', 'fail'
        explanation: h.explanation,
        docs: h.docs,
        required: h.required,
      };
    }

    // Structured Data Analysis
    const structuredData: {
      jsonLd: Array<{
        type: string;
        context: string;
        content: any;
        validation: {
          valid: boolean;
          errors: string[];
          warnings: string[];
        };
        index: number;
      }>;
      rdfa: Array<{
        content: string;
        index: number;
        validation: {
          valid: boolean;
          errors: string[];
        };
      }>;
      microdata: Array<{
        content: string;
        index: number;
        validation: {
          valid: boolean;
          errors: string[];
        };
      }>;
      summary: {
        total: number;
        jsonLdCount: number;
        rdfaCount: number;
        microdataCount: number;
        hasOrganization: boolean;
        hasWebPage: boolean;
        hasArticle: boolean;
        hasProduct: boolean;
        hasBreadcrumb: boolean;
        hasLocalBusiness: boolean;
        hasEvent: boolean;
        hasReview: boolean;
      };
    } = {
      jsonLd: [],
      rdfa: [],
      microdata: [],
      summary: {
        total: 0,
        jsonLdCount: 0,
        rdfaCount: 0,
        microdataCount: 0,
        hasOrganization: false,
        hasWebPage: false,
        hasArticle: false,
        hasProduct: false,
        hasBreadcrumb: false,
        hasLocalBusiness: false,
        hasEvent: false,
        hasReview: false,
      }
    };

    // Parse JSON-LD
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdRegex.exec(htmlContent)) !== null) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        const items = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        items.forEach((item, index) => {
          if (item && typeof item === 'object' && item['@type']) {
            const structuredItem = {
              type: item['@type'],
              context: item['@context'] || 'https://schema.org',
              content: item,
              validation: validateStructuredData(item),
              index: structuredData.jsonLd.length + index
            };
            structuredData.jsonLd.push(structuredItem);
            
            // Update summary
            structuredData.summary.jsonLdCount++;
            structuredData.summary.total++;
            updateSummaryCounts(structuredData.summary, item['@type']);
          }
        });
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    // Parse RDFa (basic detection)
    const rdfaRegex = /<[^>]*\s+(?:vocab|typeof|property|resource)=["'][^"']*["'][^>]*>/gi;
    const rdfaMatches = htmlContent.match(rdfaRegex);
    if (rdfaMatches) {
      structuredData.rdfa = rdfaMatches.map((match, index) => ({
        content: match,
        index,
        validation: { valid: true, errors: [] }
      }));
      structuredData.summary.rdfaCount = rdfaMatches.length;
      structuredData.summary.total += rdfaMatches.length;
    }

    // Parse Microdata (basic detection)
    const microdataRegex = /<[^>]*\s+(?:itemtype|itemprop|itemscope)=["'][^"']*["'][^>]*>/gi;
    const microdataMatches = htmlContent.match(microdataRegex);
    if (microdataMatches) {
      structuredData.microdata = microdataMatches.map((match, index) => ({
        content: match,
        index,
        validation: { valid: true, errors: [] }
      }));
      structuredData.summary.microdataCount = microdataMatches.length;
      structuredData.summary.total += microdataMatches.length;
    }

    // Helper function to validate structured data
    const validateStructuredData = (item: any) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!item['@type']) {
        errors.push('Missing @type property');
      }

      if (!item['@context']) {
        warnings.push('Missing @context property (defaults to https://schema.org)');
      }

      // Check for common required properties based on type
      switch (item['@type']) {
        case 'Organization':
          if (!item.name) warnings.push('Organization should have a name');
          break;
        case 'WebPage':
          if (!item.name) warnings.push('WebPage should have a name');
          break;
        case 'Article':
          if (!item.headline) warnings.push('Article should have a headline');
          if (!item.author) warnings.push('Article should have an author');
          break;
        case 'Product':
          if (!item.name) warnings.push('Product should have a name');
          if (!item.description) warnings.push('Product should have a description');
          break;
        case 'BreadcrumbList':
          if (!item.itemListElement || !Array.isArray(item.itemListElement)) {
            warnings.push('BreadcrumbList should have itemListElement array');
          }
          break;
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    };

    // Helper function to update summary counts
    const updateSummaryCounts = (summary: any, type: string) => {
      const typeLower = type.toLowerCase();
      if (typeLower.includes('organization')) summary.hasOrganization = true;
      if (typeLower.includes('webpage')) summary.hasWebPage = true;
      if (typeLower.includes('article')) summary.hasArticle = true;
      if (typeLower.includes('product')) summary.hasProduct = true;
      if (typeLower.includes('breadcrumb')) summary.hasBreadcrumb = true;
      if (typeLower.includes('localbusiness')) summary.hasLocalBusiness = true;
      if (typeLower.includes('event')) summary.hasEvent = true;
      if (typeLower.includes('review')) summary.hasReview = true;
    };

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers,
      url: response.url, // Final URL after redirects
      audit,
      structuredData,
      canonicalAnalysis,
    });
  } catch (err: any) {
    console.error('Header Checker API error:', err);
    return NextResponse.json({ error: 'Failed to fetch headers.' }, { status: 500 });
  }
} 