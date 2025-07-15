#!/usr/bin/env node

/**
 * Debug Google Analytics Integration
 * 
 * This script helps debug the Google Analytics integration issues
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  frontendUrl: 'https://www.sitegrip.com',
  backendUrl: 'https://sitegrip-backend-pu22v4ao5a-uc.a.run.app',
  testUserId: 'HgCaCtuZUXabfMtMxARZmlEwN0o2' // The user ID from the error
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SiteGrip-Analytics-Debug/1.0',
        ...options.headers
      }
    };

    logInfo(`Making ${requestOptions.method} request to ${url}`);

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testBackendHealth() {
  logInfo('Testing backend health...');
  
  try {
    const response = await makeRequest(`${CONFIG.backendUrl}/health`);
    
    if (response.status === 200) {
      logSuccess('Backend is healthy');
      return true;
    } else {
      logError(`Backend health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Backend health check error: ${error.message}`);
    return false;
  }
}

async function testAnalyticsPropertiesEndpoint() {
  logInfo('Testing analytics properties endpoint...');
  
  try {
    // This will fail without auth, but we can see the response
    const response = await makeRequest(`${CONFIG.backendUrl}/api/analytics/properties`);
    
    if (response.status === 401) {
      logWarning('Analytics properties endpoint requires authentication (expected)');
      return true;
    } else if (response.status === 200) {
      logSuccess('Analytics properties endpoint is accessible');
      return true;
    } else {
      logError(`Analytics properties endpoint failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Analytics properties endpoint error: ${error.message}`);
    return false;
  }
}

async function testFrontendStatusEndpoint() {
  logInfo('Testing frontend status endpoint...');
  
  try {
    const response = await makeRequest(`${CONFIG.frontendUrl}/api/status/${CONFIG.testUserId}`);
    
    if (response.status === 401) {
      logWarning('Frontend status endpoint requires authentication (expected)');
      return true;
    } else if (response.status === 200) {
      logSuccess('Frontend status endpoint is accessible');
      return true;
    } else {
      logError(`Frontend status endpoint failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Frontend status endpoint error: ${error.message}`);
    return false;
  }
}

async function testBackendAPIEndpoints() {
  logInfo('Testing backend API endpoints...');
  
  const endpoints = [
    '/api',
    '/api/auth',
    '/api/analytics'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${CONFIG.backendUrl}${endpoint}`);
      
      if (response.status === 200 || response.status === 404) {
        logSuccess(`Backend endpoint ${endpoint} is accessible (${response.status})`);
      } else {
        logWarning(`Backend endpoint ${endpoint} returned ${response.status}`);
      }
    } catch (error) {
      logError(`Backend endpoint ${endpoint} error: ${error.message}`);
    }
  }
}

async function testGoogleAnalyticsAPI() {
  logInfo('Testing Google Analytics API access...');
  
  try {
    // Test if Google Analytics API is accessible
    const response = await makeRequest('https://analyticsdata.googleapis.com/v1beta/properties', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    if (response.status === 401) {
      logSuccess('Google Analytics API is accessible (requires valid token)');
      return true;
    } else {
      logWarning(`Google Analytics API returned ${response.status}`);
      return true;
    }
  } catch (error) {
    logError(`Google Analytics API test error: ${error.message}`);
    return false;
  }
}

// Main debug function
async function runDebug() {
  log('🔍 Starting Google Analytics Integration Debug', 'bright');
  log(`Frontend URL: ${CONFIG.frontendUrl}`, 'cyan');
  log(`Backend URL: ${CONFIG.backendUrl}`, 'cyan');
  log(`Test User ID: ${CONFIG.testUserId}`, 'cyan');
  log('', 'reset');

  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Backend API Endpoints', fn: testBackendAPIEndpoints },
    { name: 'Analytics Properties Endpoint', fn: testAnalyticsPropertiesEndpoint },
    { name: 'Frontend Status Endpoint', fn: testFrontendStatusEndpoint },
    { name: 'Google Analytics API Access', fn: testGoogleAnalyticsAPI }
  ];

  const results = [];
  
  for (const test of tests) {
    log(`\n${colors.bright}Running: ${test.name}${colors.reset}`);
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
      
      if (result) {
        logSuccess(`${test.name} passed`);
      } else {
        logError(`${test.name} failed`);
      }
    } catch (error) {
      logError(`${test.name} error: ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'bright');
  log('🔍 DEBUG SUMMARY', 'bright');
  log('='.repeat(60), 'bright');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`Total Tests: ${results.length}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');
  
  if (failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.filter(r => !r.success).forEach(result => {
      log(`  - ${result.name}${result.error ? `: ${result.error}` : ''}`, 'red');
    });
  }
  
  log('\n🔍 ANALYSIS:', 'cyan');
  log('1. The 404 error suggests the frontend is calling the wrong endpoint', 'cyan');
  log('2. The frontend should call /api/analytics/properties instead of /api/status/[userId]', 'cyan');
  log('3. The useGoogleAuth hook needs to be updated to use the correct endpoint', 'cyan');
  log('4. The user may not have Google Analytics credentials stored in the backend', 'cyan');
  
  log('\n📖 RECOMMENDATIONS:', 'cyan');
  log('1. Update the useGoogleAuth hook to call /api/analytics/properties directly', 'cyan');
  log('2. Ensure the user has completed Google OAuth with Analytics scopes', 'cyan');
  log('3. Check if Google Analytics credentials are stored in the backend', 'cyan');
  log('4. Verify the backend is properly configured with Google Analytics API', 'cyan');
}

// Run debug if this file is executed directly
if (require.main === module) {
  runDebug().catch(error => {
    logError(`Debug runner error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runDebug,
  testBackendHealth,
  testAnalyticsPropertiesEndpoint,
  testFrontendStatusEndpoint,
  testBackendAPIEndpoints,
  testGoogleAnalyticsAPI
}; 