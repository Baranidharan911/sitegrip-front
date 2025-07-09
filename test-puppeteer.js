#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('🔍 Testing Puppeteer installation...');
  console.log('Puppeteer version:', puppeteer.version);
  
  try {
    console.log('🚀 Attempting to launch browser...');
    
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
    
    console.log('Browser options:', JSON.stringify(browserOptions, null, 2));
    
    const browser = await puppeteer.launch(browserOptions);
    console.log('✅ Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('✅ New page created');
    
    await page.goto('https://example.com', { 
      waitUntil: 'networkidle0', 
      timeout: 10000 
    });
    console.log('✅ Navigated to example.com');
    
    const content = await page.content();
    console.log('✅ Retrieved page content');
    console.log('Content length:', content.length);
    
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    console.log('🎉 All tests passed! Puppeteer is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
    
    // Provide specific troubleshooting advice
    if (error.message.includes('Failed to launch')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if Chrome is installed: which google-chrome-stable');
      console.log('2. Try setting PUPPETEER_EXECUTABLE_PATH environment variable');
      console.log('3. Install Chrome dependencies: sudo apt-get install -y google-chrome-stable');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check network connectivity');
      console.log('2. Increase timeout values');
      console.log('3. Check if the target URL is accessible');
    } else if (error.message.includes('Protocol error')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check available memory');
      console.log('2. Try reducing browser options');
      console.log('3. Restart the application');
    }
    
    process.exit(1);
  }
}

// Run the test
testPuppeteer(); 