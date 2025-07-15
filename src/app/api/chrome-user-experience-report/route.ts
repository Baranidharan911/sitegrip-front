import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Mock CrUX data - in production, this would fetch from Google's CrUX API
    const mockCruxData = {
      url: url || 'https://www.sitegrip.com',
      formFactor: 'desktop',
      period: '2024-01-01',
      metrics: {
        lcp: {
          p75: 2400,
          histogram: [
            { start: 0, end: 2500, density: 0.65 },
            { start: 2500, end: 4000, density: 0.25 },
            { start: 4000, end: Infinity, density: 0.10 }
          ]
        },
        fid: {
          p75: 85,
          histogram: [
            { start: 0, end: 100, density: 0.70 },
            { start: 100, end: 300, density: 0.25 },
            { start: 300, end: Infinity, density: 0.05 }
          ]
        },
        cls: {
          p75: 0.08,
          histogram: [
            { start: 0, end: 0.1, density: 0.75 },
            { start: 0.1, end: 0.25, density: 0.20 },
            { start: 0.25, end: Infinity, density: 0.05 }
          ]
        },
        ttfb: {
          p75: 450,
          histogram: [
            { start: 0, end: 800, density: 0.80 },
            { start: 800, end: 1800, density: 0.15 },
            { start: 1800, end: Infinity, density: 0.05 }
          ]
        },
        inp: {
          p75: 180,
          histogram: [
            { start: 0, end: 200, density: 0.75 },
            { start: 200, end: 500, density: 0.20 },
            { start: 500, end: Infinity, density: 0.05 }
          ]
        }
      },
      sampleCount: 15420,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(mockCruxData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch CrUX data' },
      { status: 500 }
    );
  }
} 