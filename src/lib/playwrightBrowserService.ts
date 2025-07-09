// ============================
// 🖥️ PLAYWRIGHT BROWSER SERVICE
// ============================

import { chromium, Browser, Page } from 'playwright';

export interface BrowserCheckOptions {
  url: string;
  viewport?: { width: number; height: number };
  userAgent?: string;
  timeout?: number;
  waitForSelector?: string;
  screenshot?: boolean;
  performance?: boolean;
  consoleLogs?: boolean;
  networkLogs?: boolean;
  customScript?: string;
}

export interface BrowserCheckResult {
  success: boolean;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  speedIndex: number;
  screenshot?: string;
  consoleErrors: string[];
  networkErrors: string[];
  customMetrics?: any;
  error?: string;
}

export interface JSRenderingResult {
  success: boolean;
  renderedHtml: string;
  initialHtml: string;
  loadTime: number;
  error?: string;
}

export class PlaywrightBrowserService {
  private browser: Browser | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized && this.browser) return;

    try {
      console.log('🖥️ Initializing Playwright browser service...');
      
      // Launch browser with production-optimized settings
      this.browser = await chromium.launch({
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
          '--disable-renderer-backgrounding'
        ]
      });
      
      this.isInitialized = true;
      console.log('✅ Playwright browser service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Playwright:', error);
      throw error;
    }
  }

  async performJSRendering(url: string, timeout: number = 30000): Promise<JSRenderingResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    console.log(`🖥️ Performing JS rendering for: ${url}`);

    let page: Page | null = null;
    const startTime = Date.now();

    try {
      // Create new page
      page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Navigate to URL with proper timeout and wait conditions
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: timeout 
      });

      // Wait for any additional dynamic content
      await page.waitForTimeout(2000);

      // Get rendered HTML after JS execution
      const renderedHtml = await page.content();
      const loadTime = Date.now() - startTime;

      // Fetch raw HTML without JS execution for comparison
      const rawRes = await fetch(url, { 
        method: 'GET', 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        } 
      });
      const initialHtml = await rawRes.text();

      console.log(`✅ JS rendering completed in ${loadTime}ms`);

      return {
        success: true,
        renderedHtml,
        initialHtml,
        loadTime
      };

    } catch (error) {
      console.error('❌ JS rendering failed:', error);
      
      return {
        success: false,
        renderedHtml: '',
        initialHtml: '',
        loadTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async performBrowserCheck(options: BrowserCheckOptions): Promise<BrowserCheckResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    console.log(`🖥️ Performing browser check for: ${options.url}`);

    let page: Page | null = null;
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];

    try {
      // Create new page
      page = await this.browser.newPage();
      
      // Set viewport
      if (options.viewport) {
        await page.setViewportSize(options.viewport);
      }

      // Note: User agent can be set via context options when creating the page
      // For now, we'll use the default user agent

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Listen for network errors
      page.on('response', (response) => {
        if (!response.ok()) {
          networkErrors.push(`${response.status()} ${response.statusText()} - ${response.url()}`);
        }
      });

      // Navigate to URL
      await page.goto(options.url, { 
        waitUntil: 'networkidle',
        timeout: options.timeout || 30000 
      });

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, { timeout: 10000 });
      }

      // Get performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint: 0, // Would need to be calculated differently
          cumulativeLayoutShift: 0, // Would need to be calculated differently
          firstInputDelay: 0, // Would need to be calculated differently
          timeToInteractive: 0, // Would need to be calculated differently
          totalBlockingTime: 0, // Would need to be calculated differently
          speedIndex: 0 // Would need to be calculated differently
        };
      });

      // Take screenshot if requested
      let screenshot: string | undefined;
      if (options.screenshot) {
        screenshot = await page.screenshot({ 
          type: 'png',
          fullPage: true 
        }).then(buffer => buffer.toString('base64'));
      }

      // Execute custom script if provided
      let customMetrics: any = undefined;
      if (options.customScript) {
        try {
          customMetrics = await page.evaluate(options.customScript);
        } catch (error) {
          console.warn('Custom script execution failed:', error);
        }
      }

      const result: BrowserCheckResult = {
        success: true,
        loadTime: performanceMetrics.loadTime || 0,
        domContentLoaded: performanceMetrics.domContentLoaded || 0,
        firstContentfulPaint: performanceMetrics.firstContentfulPaint || 0,
        largestContentfulPaint: performanceMetrics.largestContentfulPaint || 0,
        cumulativeLayoutShift: performanceMetrics.cumulativeLayoutShift || 0,
        firstInputDelay: performanceMetrics.firstInputDelay || 0,
        timeToInteractive: performanceMetrics.timeToInteractive || 0,
        totalBlockingTime: performanceMetrics.totalBlockingTime || 0,
        speedIndex: performanceMetrics.speedIndex || 0,
        screenshot,
        consoleErrors,
        networkErrors,
        customMetrics
      };

      console.log(`✅ Browser check completed in ${Date.now() - startTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ Browser check failed:', error);
      
      return {
        success: false,
        loadTime: 0,
        domContentLoaded: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timeToInteractive: 0,
        totalBlockingTime: 0,
        speedIndex: 0,
        consoleErrors,
        networkErrors,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async performMultiRegionBrowserCheck(
    url: string, 
    regions: string[] = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
  ): Promise<Record<string, BrowserCheckResult>> {
    console.log(`🌍 Performing multi-region browser check for: ${url}`);

    const results: Record<string, BrowserCheckResult> = {};

    // Perform checks in parallel for each region
    const checkPromises = regions.map(async (region) => {
      const regionOptions: BrowserCheckOptions = {
        url,
        viewport: { width: 1920, height: 1080 },
        timeout: 30000,
        screenshot: true,
        performance: true,
        consoleLogs: true,
        networkLogs: true
      };

      try {
        const result = await this.performBrowserCheck(regionOptions);
        results[region] = result;
      } catch (error) {
        results[region] = {
          success: false,
          loadTime: 0,
          domContentLoaded: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0,
          timeToInteractive: 0,
          totalBlockingTime: 0,
          speedIndex: 0,
          consoleErrors: [],
          networkErrors: [],
          error: `Region ${region} check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    });

    await Promise.all(checkPromises);
    return results;
  }

  async performAccessibilityCheck(url: string): Promise<any> {
    console.log(`♿ Performing accessibility check for: ${url}`);

    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    let page: Page | null = null;

    try {
      page = await this.browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Basic accessibility checks
      const accessibilityResults = await page.evaluate(() => {
        const violations: any[] = [];
        
        // Check for alt attributes on images
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
          if (!img.alt && !img.getAttribute('aria-label')) {
            violations.push({
              id: 'missing-alt',
              impact: 'moderate',
              description: 'Images must have alt attributes',
              help: 'Provide alt text for images',
              count: 1,
              nodes: [{
                html: img.outerHTML,
                target: [`img:nth-child(${index + 1})`],
                failureSummary: 'Image missing alt attribute'
              }]
            });
          }
        });

        // Check for proper heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName.charAt(1));
          if (level > previousLevel + 1) {
            violations.push({
              id: 'heading-order',
              impact: 'moderate',
              description: 'Heading levels should not be skipped',
              help: 'Ensure heading levels are not skipped',
              count: 1,
              nodes: [{
                html: heading.outerHTML,
                target: [`${heading.tagName.toLowerCase()}:nth-child(${index + 1})`],
                failureSummary: `Heading level ${level} follows level ${previousLevel}`
              }]
            });
          }
          previousLevel = level;
        });

        return {
          success: violations.length === 0,
          violations
        };
      });

      return accessibilityResults;

    } catch (error) {
      console.error('❌ Accessibility check failed:', error);
      return {
        success: false,
        violations: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async performSEOCheck(url: string): Promise<any> {
    console.log(`🔍 Performing SEO check for: ${url}`);

    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    let page: Page | null = null;

    try {
      page = await this.browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      const seoResults = await page.evaluate(() => {
        const issues: any[] = [];
        const recommendations: string[] = [];

        // Check title
        const title = document.title;
        if (!title || title.length < 10) {
          issues.push({
            type: 'title',
            severity: 'high',
            message: 'Page title is too short or missing',
            value: title
          });
        } else if (title.length > 60) {
          issues.push({
            type: 'title',
            severity: 'medium',
            message: 'Page title is too long',
            value: title
          });
        }

        // Check meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          issues.push({
            type: 'meta-description',
            severity: 'high',
            message: 'Meta description is missing'
          });
        } else {
          const desc = metaDescription.getAttribute('content') || '';
          if (desc.length < 50) {
            issues.push({
              type: 'meta-description',
              severity: 'medium',
              message: 'Meta description is too short',
              value: desc
            });
          } else if (desc.length > 160) {
            issues.push({
              type: 'meta-description',
              severity: 'medium',
              message: 'Meta description is too long',
              value: desc
            });
          }
        }

        // Check headings
        const h1s = document.querySelectorAll('h1');
        if (h1s.length === 0) {
          issues.push({
            type: 'h1',
            severity: 'high',
            message: 'No H1 heading found'
          });
        } else if (h1s.length > 1) {
          issues.push({
            type: 'h1',
            severity: 'medium',
            message: 'Multiple H1 headings found',
            value: h1s.length
          });
        }

        // Check images
        const images = document.querySelectorAll('img');
        const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
        if (imagesWithoutAlt.length > 0) {
          issues.push({
            type: 'images',
            severity: 'medium',
            message: `${imagesWithoutAlt.length} images without alt attributes`,
            value: imagesWithoutAlt.length
          });
        }

        return {
          success: issues.filter(i => i.severity === 'high').length === 0,
          issues,
          recommendations,
          score: Math.max(0, 100 - (issues.length * 10))
        };
      });

      return seoResults;

    } catch (error) {
      console.error('❌ SEO check failed:', error);
      return {
        success: false,
        issues: [],
        recommendations: [],
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async performSecurityCheck(url: string): Promise<any> {
    console.log(`🔒 Performing security check for: ${url}`);

    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    let page: Page | null = null;

    try {
      page = await this.browser.newPage();
      
      // Listen for security-related events
      const securityIssues: any[] = [];
      
      page.on('response', (response) => {
        const headers = response.headers();
        
        // Check for security headers
        if (!headers['x-frame-options']) {
          securityIssues.push({
            type: 'missing-security-header',
            header: 'X-Frame-Options',
            severity: 'medium',
            message: 'Missing X-Frame-Options header'
          });
        }
        
        if (!headers['x-content-type-options']) {
          securityIssues.push({
            type: 'missing-security-header',
            header: 'X-Content-Type-Options',
            severity: 'low',
            message: 'Missing X-Content-Type-Options header'
          });
        }
        
        if (!headers['strict-transport-security']) {
          securityIssues.push({
            type: 'missing-security-header',
            header: 'Strict-Transport-Security',
            severity: 'high',
            message: 'Missing HSTS header'
          });
        }
      });

      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Check for mixed content
      const mixedContentIssues = await page.evaluate(() => {
        const issues: any[] = [];
        
        // Check for HTTP resources on HTTPS page
        const scripts = document.querySelectorAll('script[src^="http://"]');
        const links = document.querySelectorAll('link[href^="http://"]');
        const images = document.querySelectorAll('img[src^="http://"]');
        
        if (scripts.length > 0) {
          issues.push({
            type: 'mixed-content',
            resource: 'scripts',
            count: scripts.length,
            severity: 'high'
          });
        }
        
        if (links.length > 0) {
          issues.push({
            type: 'mixed-content',
            resource: 'stylesheets',
            count: links.length,
            severity: 'medium'
          });
        }
        
        if (images.length > 0) {
          issues.push({
            type: 'mixed-content',
            resource: 'images',
            count: images.length,
            severity: 'low'
          });
        }
        
        return issues;
      });

      securityIssues.push(...mixedContentIssues);

      return {
        success: securityIssues.filter(i => i.severity === 'high').length === 0,
        issues: securityIssues,
        score: Math.max(0, 100 - (securityIssues.length * 15))
      };

    } catch (error) {
      console.error('❌ Security check failed:', error);
      return {
        success: false,
        issues: [],
        score: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.isInitialized = false;
    console.log('🧹 Playwright browser service cleaned up');
  }
}

// Export singleton instance
export const playwrightService = new PlaywrightBrowserService(); 