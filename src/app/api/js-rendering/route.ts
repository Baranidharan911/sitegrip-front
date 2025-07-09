import { NextRequest, NextResponse } from 'next/server';

const BROWSERLESS_API = 'https://chrome.browserless.io/content?token=2SeQ6J4Git1ydT83aa61960c18f74b5efd258f6845ca848b3';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Get rendered HTML from browserless.io
    const renderedRes = await fetch(`${BROWSERLESS_API}&url=${encodeURIComponent(url)}`);
    if (!renderedRes.ok) {
      throw new Error('Failed to fetch rendered HTML from browserless.io');
    }
    const renderedHtml = await renderedRes.text();

    // Get raw HTML
    const rawRes = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!rawRes.ok) {
      throw new Error('Failed to fetch raw HTML');
    }
    const initialHtml = await rawRes.text();

    return NextResponse.json({ renderedHtml, initialHtml });
  } catch (err: any) {
    console.error('JS Rendering API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process URL.' }, { status: 500 });
  }
} 