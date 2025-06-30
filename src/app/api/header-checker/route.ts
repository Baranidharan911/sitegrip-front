import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Make request to get headers
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      redirect: 'follow'
    });

    // Convert headers to object
    const headers: { [key: string]: string } = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers,
      url: response.url, // Final URL after redirects
    });
  } catch (err: any) {
    console.error('Header Checker API error:', err);
    return NextResponse.json({ error: 'Failed to fetch headers.' }, { status: 500 });
  }
} 