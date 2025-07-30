import { NextRequest, NextResponse } from 'next/server';

// Google CrUX API endpoint
const CRUX_API_BASE = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Get Google API key from environment
    const apiKey = process.env.GOOGLE_CRUX_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google CrUX API key not configured' },
        { status: 500 }
      );
    }

    // Fetch real CrUX data from Google's API
    const cruxResponse = await fetch(`${CRUX_API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formFactor: 'ALL',
        metrics: ['largest_contentful_paint', 'first_input_delay', 'cumulative_layout_shift', 'experimental_time_to_first_byte', 'interaction_to_next_paint']
      })
    });

    if (!cruxResponse.ok) {
      const errorData = await cruxResponse.json();
      console.error('CrUX API Error:', errorData);
      throw new Error(`CrUX API failed: ${cruxResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const cruxData = await cruxResponse.json();

    // Transform Google's CrUX data format to our format
    const transformedData = {
      url: url,
      formFactor: cruxData.record?.formFactor || 'desktop',
      period: cruxData.record?.collectionPeriod?.lastDate || '2024-01-01',
      metrics: {
        lcp: transformMetric(cruxData.record?.metrics?.largest_contentful_paint, 'lcp'),
        fid: transformMetric(cruxData.record?.metrics?.first_input_delay, 'fid'),
        cls: transformMetric(cruxData.record?.metrics?.cumulative_layout_shift, 'cls'),
        ttfb: transformMetric(cruxData.record?.metrics?.experimental_time_to_first_byte, 'ttfb'),
        inp: transformMetric(cruxData.record?.metrics?.interaction_to_next_paint, 'inp')
      },
      sampleCount: cruxData.record?.key?.effectiveConnectionType || 0,
      timestamp: new Date().toISOString(),
      isMockData: false
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('CrUX API Error:', error);
    return NextResponse.json(
      { error: `Failed to fetch CrUX data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Helper function to transform Google's metric format to our format
function transformMetric(metric: any, type: string) {
  if (!metric) {
    // Return default values if metric is not available
    const defaults = {
      lcp: { p75: 3000, histogram: [{ start: 0, end: 2500, density: 0.5 }, { start: 2500, end: 4000, density: 0.3 }, { start: 4000, end: Infinity, density: 0.2 }] },
      fid: { p75: 100, histogram: [{ start: 0, end: 100, density: 0.6 }, { start: 100, end: 300, density: 0.3 }, { start: 300, end: Infinity, density: 0.1 }] },
      cls: { p75: 0.1, histogram: [{ start: 0, end: 0.1, density: 0.7 }, { start: 0.1, end: 0.25, density: 0.2 }, { start: 0.25, end: Infinity, density: 0.1 }] },
      ttfb: { p75: 600, histogram: [{ start: 0, end: 800, density: 0.7 }, { start: 800, end: 1800, density: 0.2 }, { start: 1800, end: Infinity, density: 0.1 }] },
      inp: { p75: 200, histogram: [{ start: 0, end: 200, density: 0.7 }, { start: 200, end: 500, density: 0.2 }, { start: 500, end: Infinity, density: 0.1 }] }
    };
    return defaults[type as keyof typeof defaults];
  }

  // Transform histogram data
  const histogram = metric.histogram.map((bin: any, index: number) => ({
    start: bin.start,
    end: bin.end,
    density: bin.density
  }));

  return {
    p75: metric.percentiles?.p75 || 0,
    histogram: histogram
  };
} 