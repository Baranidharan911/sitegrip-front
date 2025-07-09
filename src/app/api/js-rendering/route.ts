import { NextRequest, NextResponse } from 'next/server';
import { browserService } from '@/lib/playwrightBrowserService';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Validate URL format
    let targetUrl: string;
    try {
      const urlObj = new URL(url);
      targetUrl = urlObj.toString();
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Use the browser service to compare HTML
    const result = await browserService.compareHtml(targetUrl, {
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });

    return NextResponse.json(result);
    
  } catch (err: any) {
    console.error('JS Rendering Tester API error:', err);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process URL.';
    if (err.message?.includes('timeout')) {
      errorMessage = 'Request timed out. The website may be slow or unresponsive.';
    } else if (err.message?.includes('net::ERR')) {
      errorMessage = 'Network error. The website may be unreachable or blocking requests.';
    } else if (err.message?.includes('Protocol error')) {
      errorMessage = 'Browser protocol error. Please try again.';
    } else if (err.message?.includes('Browser initialization failed')) {
      errorMessage = 'Browser service is not available in this environment. Please try again later.';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
} 