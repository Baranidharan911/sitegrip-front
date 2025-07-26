import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes when deployed on Vercel

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url);
    
    // Fetch the sitemap
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'Accept-Encoding': 'gzip, deflate',
        'User-Agent': 'SiteGrip Sitemap Fetcher (+https://www.sitegrip.com)',
        'Cache-Control': 'no-cache',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    const content = await response.text();

    // Return the sitemap content with appropriate headers
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Sitemap proxy error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch sitemap',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 