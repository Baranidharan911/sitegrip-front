import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

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
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=mobile&category=performance`),
      fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=desktop&category=performance`)
    ]);

    if (!mobileResponse.ok || !desktopResponse.ok) {
      throw new Error('Failed to fetch PageSpeed data');
    }

    const mobileData = await mobileResponse.json();
    const desktopData = await desktopResponse.json();

    // Extract Core Web Vitals
    const extractVitals = (data: any) => {
      const metrics = data.lighthouseResult?.audits;
      return {
        lcp: metrics?.['largest-contentful-paint']?.numericValue || 0,
        fid: metrics?.['max-potential-fid']?.numericValue || 0,
        cls: metrics?.['cumulative-layout-shift']?.numericValue || 0,
        performanceScore: data.lighthouseResult?.categories?.performance?.score * 100 || 0
      };
    };

    return NextResponse.json({
      mobile: extractVitals(mobileData),
      desktop: extractVitals(desktopData),
      url: mobileData.id || url
    });
  } catch (err: any) {
    console.error('Web Vitals API error:', err);
    return NextResponse.json({ error: 'Failed to fetch web vitals data.' }, { status: 500 });
  }
} 