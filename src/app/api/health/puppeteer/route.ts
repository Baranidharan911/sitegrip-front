import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('🔍 Starting Puppeteer health check...');
    
    // Production-specific Puppeteer configuration
    const browserOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    };

    console.log('🚀 Attempting to launch browser...');
    const browser = await puppeteer.launch(browserOptions);
    
    console.log('📄 Creating new page...');
    const page = await browser.newPage();
    
    console.log('🌐 Navigating to test page...');
    await page.goto('https://example.com', { 
      waitUntil: 'networkidle0', 
      timeout: 10000 
    });
    
    console.log('📝 Getting page content...');
    const content = await page.content();
    
    console.log('🔒 Closing browser...');
    await browser.close();
    
    console.log('✅ Puppeteer health check passed');
    
    return NextResponse.json({ 
      status: 'healthy', 
      puppeteer: 'working',
      contentLength: content.length,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      chromePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'default'
    });
    
  } catch (error: any) {
    console.error('❌ Puppeteer health check failed:', error);
    
    return NextResponse.json({ 
      status: 'unhealthy', 
      puppeteer: 'failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      chromePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'default'
    }, { status: 500 });
  }
} 