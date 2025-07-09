import puppeteer from 'puppeteer';

export interface BrowserServiceOptions {
  timeout?: number;
  userAgent?: string;
  viewport?: { width: number; height: number };
}

export class BrowserService {
  private static instance: BrowserService;
  private browser: any = null;

  private constructor() {}

  static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  async getRenderedHtml(url: string, options: BrowserServiceOptions = {}): Promise<string> {
    const {
      timeout = 30000,
      userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport = { width: 1280, height: 720 }
    } = options;

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
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    };

    try {
      // Try to launch browser
      this.browser = await puppeteer.launch(browserOptions);
      const page = await this.browser.newPage();
      
      // Set user agent
      await page.setUserAgent(userAgent);
      
      // Set viewport
      await page.setViewport(viewport);
      
      // Navigate to URL
      await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout 
      });

      // Wait for additional JavaScript execution
      await page.waitForTimeout(2000);

      // Get rendered HTML
      const html = await page.content();
      
      await this.browser.close();
      this.browser = null;
      
      return html;
    } catch (error) {
      console.error('Browser service error:', error);
      
      // Clean up browser if it exists
      if (this.browser) {
        try {
          await this.browser.close();
        } catch (closeError) {
          console.error('Error closing browser:', closeError);
        }
        this.browser = null;
      }
      
      throw error;
    }
  }

  async getRawHtml(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Raw HTML fetch error:', error);
      throw error;
    }
  }

  async compareHtml(url: string, options: BrowserServiceOptions = {}): Promise<{
    renderedHtml: string;
    initialHtml: string;
    differences: number;
    url: string;
    timestamp: string;
  }> {
    try {
      // Get both rendered and raw HTML
      const [renderedHtml, initialHtml] = await Promise.all([
        this.getRenderedHtml(url, options),
        this.getRawHtml(url)
      ]);

      // Calculate differences
      const differences = Math.abs(renderedHtml.length - initialHtml.length);

      return {
        renderedHtml,
        initialHtml,
        differences,
        url,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('HTML comparison error:', error);
      throw error;
    }
  }
}

export const browserService = BrowserService.getInstance(); 