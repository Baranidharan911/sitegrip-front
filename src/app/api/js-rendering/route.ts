import { NextRequest, NextResponse } from 'next/server';

const SCRAPINGBEE_API = 'https://app.scrapingbee.com/api/v1/';
const SCRAPINGBEE_KEY = '03AO48GG72NL2CDT3T1SRO2KCYBYAHFNMANYTX4KJXK2IOTEZHY7A0Y2IEPL5KVKCQ5UHG2HAUZP6BSO';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Get rendered HTML from ScrapingBee
    const beeUrl = `${SCRAPINGBEE_API}?api_key=${SCRAPINGBEE_KEY}&url=${encodeURIComponent(url)}&render_js=true`;
    const renderedRes = await fetch(beeUrl, { method: 'GET' });
    if (!renderedRes.ok) {
      const errorText = await renderedRes.text();
      console.error('ScrapingBee error:', renderedRes.status, errorText);
      throw new Error(`Failed to fetch rendered HTML from ScrapingBee: ${errorText}`);
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