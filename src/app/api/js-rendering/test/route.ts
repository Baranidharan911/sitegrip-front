import { NextRequest, NextResponse } from 'next/server';
import { playwrightService } from '@/lib/playwrightBrowserService';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const testUrl = 'https://example.com';
    console.log(`🧪 Testing Playwright JS rendering with: ${testUrl}`);

    // Test the Playwright service
    const result = await playwrightService.performJSRendering(testUrl, 30000);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Playwright test failed',
        details: result.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Playwright JS rendering test passed',
      loadTime: result.loadTime,
      renderedHtmlLength: result.renderedHtml.length,
      initialHtmlLength: result.initialHtml.length,
      renderedScreenshot: result.renderedScreenshot,
      initialScreenshot: result.initialScreenshot
    });

  } catch (err: any) {
    console.error('Playwright test error:', err);
    return NextResponse.json({ 
      error: 'Playwright test failed',
      details: err.message 
    }, { status: 500 });
  }
} 