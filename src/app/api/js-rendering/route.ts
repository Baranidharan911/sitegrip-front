import { NextRequest, NextResponse } from 'next/server';
import { playwrightService } from '@/lib/playwrightBrowserService';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    console.log(`🖥️ Processing JS rendering request for: ${url}`);

    // Use Playwright service for JS rendering
    const result = await playwrightService.performJSRendering(url, 60000);

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to render page with JavaScript' 
      }, { status: 500 });
    }

    return NextResponse.json({
      renderedHtml: result.renderedHtml,
      initialHtml: result.initialHtml,
      loadTime: result.loadTime
    });

  } catch (err: any) {
    console.error('JS Rendering Tester API error:', err);
    return NextResponse.json({ 
      error: 'Failed to process URL.',
      details: err.message 
    }, { status: 500 });
  }
} 