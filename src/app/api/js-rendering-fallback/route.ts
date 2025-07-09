import { NextRequest, NextResponse } from 'next/server';

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

    // Fetch HTML with enhanced headers to mimic a real browser
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // For the fallback version, we can't get the rendered HTML,
    // so we'll return the same HTML for both and indicate this is a fallback
    const result = {
      renderedHtml: html,
      initialHtml: html,
      differences: 0,
      url: targetUrl,
      timestamp: new Date().toISOString(),
      fallback: true,
      note: 'This is a fallback response. JavaScript rendering analysis is not available without Puppeteer.'
    };

    return NextResponse.json(result);
    
  } catch (err: any) {
    console.error('JS Rendering Fallback API error:', err);
    
    // Provide specific error messages
    let errorMessage = 'Failed to fetch URL.';
    if (err.message?.includes('fetch')) {
      errorMessage = 'Network error. The website may be unreachable or blocking requests.';
    } else if (err.message?.includes('HTTP')) {
      errorMessage = `Server error: ${err.message}`;
    } else if (err.message?.includes('timeout')) {
      errorMessage = 'Request timed out. The website may be slow or unresponsive.';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      fallback: true,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
} 