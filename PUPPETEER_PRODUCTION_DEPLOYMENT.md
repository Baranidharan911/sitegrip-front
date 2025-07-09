# Puppeteer Production Deployment Guide

## Overview
This guide addresses the common 500 Internal Server Error issues when deploying Puppeteer-based features (like the JS Rendering Tester) in production environments.

## Common Issues in Production

### 1. Missing Chrome Dependencies
Puppeteer requires Chrome/Chromium to be installed on the server. Many hosting platforms don't include these by default.

### 2. Sandbox Restrictions
Production environments often have security restrictions that prevent Puppeteer from running with default settings.

### 3. Memory and Resource Limits
Puppeteer can be resource-intensive, and some hosting platforms have strict limits.

## Solutions by Platform

### Vercel Deployment

#### Option 1: Use Vercel's Built-in Chrome
Add the following environment variable to your Vercel project:

```bash
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

#### Option 2: Use @vercel/og (Recommended for Vercel)
For Vercel specifically, consider using `@vercel/og` instead of Puppeteer for simpler use cases.

#### Option 3: Use Chrome AWS Lambda Layer
1. Install the Chrome AWS Lambda layer
2. Configure your function to use the provided Chrome binary

### Netlify Deployment

#### Option 1: Use Netlify Functions with Chrome
```bash
# Install Chrome dependencies
npm install puppeteer-core
```

Update your API route to use `puppeteer-core`:
```typescript
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

#### Option 2: Use Netlify's Chrome Function
Netlify provides a Chrome function that you can use as a service.

### Railway Deployment

Railway supports Puppeteer out of the box. Just ensure you have the correct dependencies:

```json
{
  "dependencies": {
    "puppeteer": "^24.11.1"
  }
}
```

### Docker Deployment

Create a Dockerfile that includes Chrome:

```dockerfile
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Add these environment variables to your production environment:

```bash
# Chrome executable path (platform-specific)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Puppeteer flags
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage

# Timeout settings
PUPPETEER_TIMEOUT=30000

# Memory limits
NODE_OPTIONS=--max-old-space-size=2048
```

## Updated API Route Configuration

The updated API route includes production-specific configurations:

```typescript
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
```

## Alternative Solutions

### 1. Use a Headless Browser Service
Consider using external services like:
- Browserless.io
- Puppeteer-cluster
- Chrome AWS Lambda

### 2. Implement Fallback Logic
Add fallback mechanisms when Puppeteer fails:

```typescript
try {
  // Try Puppeteer first
  const result = await puppeteerService.compareHtml(url);
  return result;
} catch (error) {
  // Fallback to simple fetch
  const response = await fetch(url);
  const html = await response.text();
  return { renderedHtml: html, initialHtml: html, differences: 0 };
}
```

### 3. Use Serverless Chrome
For serverless environments, consider using `chrome-aws-lambda`:

```bash
npm install chrome-aws-lambda puppeteer-core
```

```typescript
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath,
  headless: chromium.headless,
});
```

## Testing in Production

### 1. Health Check Endpoint
Create a health check endpoint to verify Puppeteer is working:

```typescript
// api/health/puppeteer/route.ts
export async function GET() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    await browser.close();
    return NextResponse.json({ status: 'healthy', puppeteer: 'working' });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy', 
      puppeteer: 'failed',
      error: error.message 
    }, { status: 500 });
  }
}
```

### 2. Monitor Function Logs
Check your deployment platform's logs for specific error messages:
- Vercel: Check Function Logs in the dashboard
- Netlify: Check Function Logs in the dashboard
- Railway: Check deployment logs

## Troubleshooting

### Common Error Messages

1. **"Failed to launch browser"**
   - Chrome not installed
   - Missing dependencies
   - Sandbox restrictions

2. **"Protocol error"**
   - Browser crashed
   - Memory issues
   - Timeout problems

3. **"net::ERR" errors**
   - Network connectivity issues
   - DNS resolution problems
   - Firewall restrictions

### Debug Steps

1. Check if Chrome is available:
   ```bash
   which google-chrome-stable
   ```

2. Test Puppeteer installation:
   ```bash
   node -e "const puppeteer = require('puppeteer'); console.log('Puppeteer version:', puppeteer.version);"
   ```

3. Verify environment variables:
   ```bash
   echo $PUPPETEER_EXECUTABLE_PATH
   ```

## Performance Optimization

### 1. Browser Pooling
Implement browser pooling to reuse browser instances:

```typescript
class BrowserPool {
  private browsers: any[] = [];
  private maxBrowsers = 3;

  async getBrowser() {
    if (this.browsers.length > 0) {
      return this.browsers.pop();
    }
    return await puppeteer.launch(browserOptions);
  }

  async releaseBrowser(browser: any) {
    if (this.browsers.length < this.maxBrowsers) {
      this.browsers.push(browser);
    } else {
      await browser.close();
    }
  }
}
```

### 2. Request Caching
Implement caching to avoid repeated requests:

```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Check cache before processing
const cacheKey = `js-rendering:${url}`;
const cached = cache.get(cacheKey);
if (cached) {
  return NextResponse.json(cached);
}
```

## Security Considerations

1. **Input Validation**: Always validate URLs before processing
2. **Resource Limits**: Set appropriate timeouts and memory limits
3. **Sandboxing**: Use appropriate sandbox settings for your environment
4. **Rate Limiting**: Implement rate limiting to prevent abuse

## Conclusion

The key to successful Puppeteer deployment in production is:
1. Using the correct Chrome executable path
2. Implementing proper error handling
3. Adding fallback mechanisms
4. Monitoring and logging
5. Optimizing for your specific hosting platform

For the most reliable solution, consider using platform-specific services or external headless browser services when possible. 