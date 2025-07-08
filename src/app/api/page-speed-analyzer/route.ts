import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    const start = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      redirect: 'follow'
    });
    const ttfb = Date.now() - start;
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch page: ${response.status} ${response.statusText}` }, { status: 400 });
    }
    const buffer = await response.arrayBuffer();
    const size = buffer.byteLength;
    // Simple recommendations
    const issues = [];
    const recommendations = [];
    if (ttfb > 800) {
      issues.push('High Time To First Byte (TTFB)');
      recommendations.push('Optimize server response time.');
    }
    if (size > 2 * 1024 * 1024) {
      issues.push('Large page size (>2MB)');
      recommendations.push('Reduce page size by optimizing images, scripts, and styles.');
    }
    return NextResponse.json({
      url,
      ttfb,
      size,
      issues,
      recommendations
    });
  } catch (err: any) {
    console.error('Page Speed Analyzer API error:', err);
    return NextResponse.json({ error: 'Failed to analyze page speed.' }, { status: 500 });
  }
} 