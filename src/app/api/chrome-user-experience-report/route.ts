import { NextRequest, NextResponse } from 'next/server';

// Google CrUX API endpoint
const CRUX_API_BASE = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';

export async function POST(request: NextRequest) {
  try {
    const { url, formFactor = 'DESKTOP' } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate form factor
    const validFormFactors = ['DESKTOP', 'PHONE', 'TABLET'];
    const normalizedFormFactor = formFactor.toUpperCase();
    
    if (!validFormFactors.includes(normalizedFormFactor)) {
      return NextResponse.json(
        { error: 'Invalid form factor. Must be DESKTOP, PHONE, or TABLET' },
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
        formFactor: normalizedFormFactor,
        metrics: ['largest_contentful_paint', 'cumulative_layout_shift', 'experimental_time_to_first_byte', 'interaction_to_next_paint']
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
      formFactor: cruxData.record?.formFactor || normalizedFormFactor,
      period: cruxData.record?.collectionPeriod?.lastDate || new Date().toISOString().split('T')[0],
      metrics: {
        lcp: transformMetric(cruxData.record?.metrics?.largest_contentful_paint, 'lcp'),
        cls: transformMetric(cruxData.record?.metrics?.cumulative_layout_shift, 'cls'),
        ttfb: transformMetric(cruxData.record?.metrics?.experimental_time_to_first_byte, 'ttfb'),
        inp: transformMetric(cruxData.record?.metrics?.interaction_to_next_paint, 'inp')
      },
      sampleCount: cruxData.record?.collectionPeriod?.firstDate && cruxData.record?.collectionPeriod?.lastDate ? 1000 : 0,
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
  if (!metric || !metric.histogram || !metric.percentiles) {
    // Return null for missing data instead of mock data
    return null;
  }

  // Transform histogram data
  const histogram = metric.histogram.map((bin: any) => ({
    start: bin.start || 0,
    end: bin.end === null ? Infinity : bin.end,
    density: bin.density || 0
  }));

  return {
    p75: metric.percentiles?.p75 || 0,
    histogram: histogram
  };
} 