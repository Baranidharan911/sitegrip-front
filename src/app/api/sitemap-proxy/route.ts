import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes when deployed on Vercel

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing "url" query parameter' }, { status: 400 });
  }

  try {
    // Basic validation to allow only http/https
    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const res = await fetch(url, {
      // Identify ourselves politely
      headers: {
        'User-Agent': 'SiteGrip Sitemap Fetcher (+https://sitegrip.io)'
      },
      // 10-second timeout using AbortController
      cache: 'no-store'
    });

    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'text/xml; charset=utf-8',
        // Allow this response to be used on the client
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upstream fetch failed' }, { status: 502 });
  }
} 