import { NextRequest, NextResponse } from 'next/server';
import { PlaywrightBrowserService } from '@/lib/playwrightBrowserService';

export const runtime = 'nodejs';
export const revalidate = 0;

// Initialize browser service
const browserService = new PlaywrightBrowserService();

function extractAllMetrics(data: any) {
  const audits = data.lighthouseResult?.audits || {};
  const categories = data.lighthouseResult?.categories || {};
  const env = data.lighthouseResult?.environment || {};
  const warnings = data.lighthouseResult?.runWarnings || [];
  const fetchTime = data.lighthouseResult?.fetchTime;
  const finalUrl = data.lighthouseResult?.finalUrl;
  const userAgent = data.lighthouseResult?.userAgent;
  const timing = data.lighthouseResult?.timing;

  // Lab metrics
  const metrics = {
    lcp: audits['largest-contentful-paint']?.numericValue,
    fcp: audits['first-contentful-paint']?.numericValue,
    tti: audits['interactive']?.numericValue,
    tbt: audits['total-blocking-time']?.numericValue,
    cls: audits['cumulative-layout-shift']?.numericValue,
    si: audits['speed-index']?.numericValue,
    ttfb: audits['server-response-time']?.numericValue,
    fid: audits['max-potential-fid']?.numericValue,
    fmp: audits['first-meaningful-paint']?.numericValue,
    // Additional metrics
    fci: audits['first-cpu-idle']?.numericValue,
    eil: audits['estimated-input-latency']?.numericValue,
    mpu: audits['max-potential-fid']?.numericValue,
    // Resource metrics
    totalResources: audits['resource-summary']?.details?.items?.reduce((sum: number, item: any) => sum + (item.requestCount || 0), 0),
    totalSize: audits['resource-summary']?.details?.items?.reduce((sum: number, item: any) => sum + (item.transferSize || 0), 0),
    // Performance metrics
    domSize: audits['dom-size']?.numericValue,
    criticalRequestChains: audits['critical-request-chains']?.details?.chains?.length || 0,
    usesOptimizedImages: audits['uses-optimized-images']?.score,
    usesWebpImages: audits['uses-webp-images']?.score,
    usesResponsiveImages: audits['uses-responsive-images']?.score,
    usesTextCompression: audits['uses-text-compression']?.score,
    usesEfficientImageFormats: audits['uses-efficient-image-formats']?.score,
    // Accessibility metrics
    colorContrast: audits['color-contrast']?.score,
    documentTitle: audits['document-title']?.score,
    linkName: audits['link-name']?.score,
    imageAlt: audits['image-alt']?.score,
    // SEO metrics
    metaDescription: audits['meta-description']?.score,
    hreflang: audits['hreflang']?.score,
    canonical: audits['canonical']?.score,
    robotsTxt: audits['robots-txt']?.score,
    structuredData: audits['structured-data']?.score,
  };

  // Category scores
  const scores = {
    performance: categories.performance?.score ? categories.performance.score * 100 : null,
    accessibility: categories.accessibility?.score ? categories.accessibility.score * 100 : null,
    bestPractices: categories['best-practices']?.score ? categories['best-practices'].score * 100 : null,
    seo: categories.seo?.score ? categories.seo.score * 100 : null,
    pwa: categories.pwa?.score ? categories.pwa.score * 100 : null,
  };

  // Opportunities (Insights)
  const opportunities = Object.values(audits)
    .filter((a: any) => a.details?.type === 'opportunity' && a.score !== 1)
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      savingsMs: a.details?.overallSavingsMs || 0,
      savingsBytes: a.details?.overallSavingsBytes || 0,
      score: a.score,
      category: a.details?.type || 'opportunity',
      details: a.details,
    }))
    .sort((a: any, b: any) => (b.savingsMs || 0) - (a.savingsMs || 0));

  // Diagnostics
  const diagnostics = audits['diagnostics']?.details?.items?.[0] || null;

  // Resource summary
  const resourceSummary = audits['resource-summary']?.details?.items || [];

  // Passed/Not applicable/Manual audits
  const passedAudits = Object.values(audits).filter((a: any) => a.score === 1 && a.scoreDisplayMode === 'binary');
  const notApplicableAudits = Object.values(audits).filter((a: any) => a.scoreDisplayMode === 'notApplicable');
  const manualAudits = Object.values(audits).filter((a: any) => a.scoreDisplayMode === 'manual');

  // Field data (CrUX)
  const fieldData = data.loadingExperience?.metrics || null;
  const originFieldData = data.originLoadingExperience?.metrics || null;

  // Additional audit details
  const auditDetails = {
    colorContrast: audits['color-contrast']?.details?.items || [],
    imageAlt: audits['image-alt']?.details?.items || [],
    linkName: audits['link-name']?.details?.items || [],
    documentTitle: audits['document-title']?.details?.items || [],
    metaDescription: audits['meta-description']?.details?.items || [],
    hreflang: audits['hreflang']?.details?.items || [],
    canonical: audits['canonical']?.details?.items || [],
    robotsTxt: audits['robots-txt']?.details?.items || [],
    structuredData: audits['structured-data']?.details?.items || [],
  };

  return {
    metrics,
    scores,
    opportunities,
    diagnostics,
    resourceSummary,
    passedAudits: passedAudits.map((a: any) => ({ id: a.id, title: a.title })),
    notApplicableAudits: notApplicableAudits.map((a: any) => ({ id: a.id, title: a.title })),
    manualAudits: manualAudits.map((a: any) => ({ id: a.id, title: a.title })),
    fieldData,
    originFieldData,
    environment: env,
    warnings,
    fetchTime,
    finalUrl,
    userAgent,
    timing,
    audits,
    auditDetails,
  };
}

async function captureScreenshots(url: string) {
  try {
    await browserService.initialize();
    // Mobile screenshots (iPhone X/11/12/13)
    const mobileScreenshots = await browserService.captureFullPageScreenshotsInSections({
      url,
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      sectionHeight: 600,
      timeout: 30000,
    });
    // Desktop screenshots (Full HD)
    const desktopScreenshots = await browserService.captureFullPageScreenshotsInSections({
      url,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      sectionHeight: 800,
      timeout: 30000,
    });
    return {
      mobileScreenshots,
      desktopScreenshots,
    };
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return {
      mobileScreenshots: [],
      desktopScreenshots: [],
    };
  }
}

async function performAdditionalChecks(url: string) {
  try {
    await browserService.initialize();
    
    // Perform accessibility check
    const accessibilityResult = await browserService.performAccessibilityCheck(url);
    
    // Perform SEO check
    const seoResult = await browserService.performSEOCheck(url);
    
    // Perform security check
    const securityResult = await browserService.performSecurityCheck(url);
    
    return {
      accessibility: accessibilityResult,
      seo: seoResult,
      security: securityResult,
    };
  } catch (error) {
    console.error('Additional checks failed:', error);
    return {
      accessibility: { success: false, issues: [], score: 0 },
      seo: { success: false, issues: [], score: 0 },
      security: { success: false, issues: [], score: 0 },
    };
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Web Vitals API - Use POST method with URL parameter',
    method: 'GET',
    status: 'info'
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'Google PageSpeed API key not configured' }, { status: 500 });
    }

    console.log(`🚀 Starting comprehensive web vitals analysis for: ${url}`);

    // Fetch both mobile and desktop results from PageSpeed Insights with all categories
    const [mobileResponse, desktopResponse] = await Promise.all([
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa&prettyPrint=false`),
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa&prettyPrint=false`)
    ]);

    if (!mobileResponse.ok || !desktopResponse.ok) {
      const mobileError = await mobileResponse.text();
      const desktopError = await desktopResponse.text();
      console.error('PageSpeed API errors:', { mobile: mobileError, desktop: desktopError });
      throw new Error('Failed to fetch PageSpeed data');
    }

    const mobileData = await mobileResponse.json();
    const desktopData = await desktopResponse.json();

    console.log('📊 PageSpeed Insights data fetched successfully');

    // Capture screenshots and perform additional checks in parallel
    const [screenshots, additionalChecks] = await Promise.all([
      captureScreenshots(url),
      performAdditionalChecks(url)
    ]);

    console.log('📸 Screenshots and additional checks completed');

    // Extract metrics from PageSpeed data
    const mobileMetrics = extractAllMetrics(mobileData);
    const desktopMetrics = extractAllMetrics(desktopData);

    // Combine all results
    const result = {
      mobile: {
        ...mobileMetrics,
        screenshots: screenshots.mobileScreenshots,
        consoleErrors: [],
        loadTime: 0,
      },
      desktop: {
        ...desktopMetrics,
        screenshots: screenshots.desktopScreenshots,
        consoleErrors: [],
        loadTime: 0,
      },
      url: mobileData.id || url,
      additionalChecks,
      analysisTimestamp: new Date().toISOString(),
    };

    console.log('✅ Comprehensive web vitals analysis completed');

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Web vitals analysis failed:', error);
    return NextResponse.json({ 
      error: 'Analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 