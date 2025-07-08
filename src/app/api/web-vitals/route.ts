import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

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
  };

  // Category scores
  const scores = {
    performance: categories.performance?.score ? categories.performance.score * 100 : null,
    accessibility: categories.accessibility?.score ? categories.accessibility.score * 100 : null,
    bestPractices: categories['best-practices']?.score ? categories['best-practices'].score * 100 : null,
    seo: categories.seo?.score ? categories.seo.score * 100 : null,
    pwa: categories.pwa?.score ? categories.pwa.score * 100 : null,
  };

  // Opportunities
  const opportunities = Object.values(audits)
    .filter((a: any) => a.details?.type === 'opportunity')
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      savingsMs: a.details.overallSavingsMs,
      score: a.score,
    }));

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
  };
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

    // Fetch both mobile and desktop results
    const [mobileResponse, desktopResponse] = await Promise.all([
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa`),
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa`)
    ]);

    if (!mobileResponse.ok || !desktopResponse.ok) {
      throw new Error('Failed to fetch PageSpeed data');
    }

    const mobileData = await mobileResponse.json();
    const desktopData = await desktopResponse.json();

    return NextResponse.json({
      mobile: extractAllMetrics(mobileData),
      desktop: extractAllMetrics(desktopData),
      url: mobileData.id || url
    });
  } catch (err: any) {
    console.error('Web Vitals API error:', err);
    return NextResponse.json({ error: 'Failed to fetch web vitals data.' }, { status: 500 });
  }
} 