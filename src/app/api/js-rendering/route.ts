import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Launch headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Get HTML after JS execution
    const renderedHtml = await page.content();

    await browser.close();

    // Fetch raw HTML without JS execution
    const rawRes = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
    const initialHtml = await rawRes.text();

    return NextResponse.json({ renderedHtml, initialHtml });
  } catch (err: any) {
    console.error('JS Rendering Tester API error:', err);
    return NextResponse.json({ error: 'Failed to process URL.' }, { status: 500 });
  }
} 