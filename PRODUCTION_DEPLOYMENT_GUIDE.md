# 🚀 Production Deployment Guide

## Overview

This guide covers the complete production deployment of the WebWatch real-time monitoring system with Firebase integration, WebSocket connections, Playwright browser automation, and multi-channel notifications.

## 🏗️ Architecture

### Frontend (Next.js)
- Real-time WebSocket connections
- Firebase Firestore integration
- Playwright browser automation
- Multi-channel notifications
- Live incident maps
- Advanced reporting

### Backend Services
- Firebase Firestore (Database)
- WebSocket Server (Real-time communication)
- Playwright Browser Service (Automated testing)
- Notification Services (Email, SMS, Slack, etc.)

## 📋 Prerequisites

### 1. Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init firestore
```

### 2. Environment Variables
Create `.env.local` file:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# WebSocket Server
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# Notification Services
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook

# Playwright
PLAYWRIGHT_BROWSERS_PATH=0
```

### 3. Dependencies Installation
```bash
# Install production dependencies
npm install socket.io-client @types/socket.io-client
npm install playwright
npm install @sendgrid/mail
npm install twilio
npm install axios
```

## 🔧 Configuration

### 1. Firebase Firestore Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Monitors collection
    match /monitors/{monitorId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Check results collection
    match /checkResults/{checkId} {
      allow read, write: if request.auth != null;
    }
    
    // Incidents collection
    match /incidents/{incidentId} {
      allow read, write: if request.auth != null;
    }
    
    // Browser checks collection
    match /browserChecks/{checkId} {
      allow read, write: if request.auth != null;
    }
    
    // Notification configs collection
    match /notificationConfigs/{configId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 2. WebSocket Server Configuration
```javascript
// websocket-server.js
const { Server } = require('socket.io');
const { createServer } = require('http');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.userId = decodedToken.uid;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Event handlers
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  // Monitor events
  socket.on('trigger_check', async (data) => {
    // Implement monitor check logic
  });
  
  socket.on('perform_multi_region_check', async (data) => {
    // Implement multi-region check logic
  });
  
  socket.on('perform_browser_check', async (data) => {
    // Implement browser check logic
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

const PORT = process.env.WEBSOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
```

### 3. Playwright Configuration
```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## 🚀 Deployment Steps

### 1. Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

### 2. WebSocket Server Deployment (Railway/Heroku)
```bash
# Create Procfile for Railway/Heroku
echo "web: node websocket-server.js" > Procfile

# Deploy to Railway
railway up

# Or deploy to Heroku
heroku create your-websocket-app
git push heroku main
```

### 3. Firebase Deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy security rules
firebase deploy --only storage
```

### 4. Environment Setup
```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_WEBSOCKET_URL
vercel env add SENDGRID_API_KEY
# ... add all other environment variables
```

## 🔍 Monitoring & Maintenance

### 1. Health Checks
```javascript
// health-check.js
const axios = require('axios');

async function healthCheck() {
  try {
    // Check WebSocket server
    const wsResponse = await axios.get(`${process.env.WEBSOCKET_URL}/health`);
    console.log('WebSocket server:', wsResponse.status);
    
    // Check Firebase connection
    const firebaseResponse = await axios.get(`${process.env.FIREBASE_URL}/health`);
    console.log('Firebase:', firebaseResponse.status);
    
    // Check notification services
    const notificationResponse = await axios.get(`${process.env.NOTIFICATION_URL}/health`);
    console.log('Notifications:', notificationResponse.status);
    
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

// Run health check every 5 minutes
setInterval(healthCheck, 5 * 60 * 1000);
```

### 2. Logging
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'webwatch-monitoring' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 3. Backup Strategy
```javascript
// backup.js
const admin = require('firebase-admin');

async function backupData() {
  const db = admin.firestore();
  
  // Backup monitors
  const monitorsSnapshot = await db.collection('monitors').get();
  const monitors = monitorsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Backup incidents
  const incidentsSnapshot = await db.collection('incidents').get();
  const incidents = incidentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Save to backup storage
  const backup = {
    timestamp: new Date(),
    monitors,
    incidents
  };
  
  // Upload to cloud storage
  await uploadToCloudStorage(backup);
}
```

## 🔒 Security Considerations

### 1. Authentication
- Use Firebase Authentication
- Implement JWT token validation
- Set up proper CORS policies

### 2. Data Protection
- Encrypt sensitive data
- Implement rate limiting
- Use HTTPS for all communications

### 3. Access Control
- Implement role-based access control
- Audit all user actions
- Monitor for suspicious activities

## 📊 Performance Optimization

### 1. Database Optimization
```javascript
// Create indexes for common queries
// Firestore indexes
{
  "indexes": [
    {
      "collectionGroup": "checkResults",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "monitorId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 2. Caching Strategy
```javascript
// Implement Redis caching
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function getCachedData(key) {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

async function setCachedData(key, data, ttl = 3600) {
  await redis.setex(key, ttl, JSON.stringify(data));
}
```

### 3. Load Balancing
```javascript
// Use multiple WebSocket servers
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start WebSocket server
  require('./websocket-server');
}
```

## 🚨 Incident Response

### 1. Alerting Setup
```javascript
// alerting.js
const notificationService = require('./notificationService');

async function sendAlert(incident) {
  const alert = {
    type: 'incident',
    severity: incident.severity,
    title: incident.title,
    description: incident.description,
    timestamp: new Date()
  };
  
  await notificationService.sendBulkNotification([
    { type: 'email', config: { ... } },
    { type: 'slack', config: { ... } },
    { type: 'sms', config: { ... } }
  ]);
}
```

### 2. Escalation Procedures
```javascript
// escalation.js
const escalationLevels = [
  { level: 1, delay: 5, notifications: ['email'] },
  { level: 2, delay: 15, notifications: ['email', 'slack'] },
  { level: 3, delay: 30, notifications: ['email', 'slack', 'sms'] }
];

async function escalateIncident(incident) {
  const level = escalationLevels[incident.escalationLevel];
  
  setTimeout(async () => {
    await sendEscalationAlert(incident, level);
  }, level.delay * 60 * 1000);
}
```

## 📈 Scaling Considerations

### 1. Horizontal Scaling
- Use multiple WebSocket servers
- Implement database sharding
- Use CDN for static assets

### 2. Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement connection pooling

### 3. Auto-scaling
```javascript
// auto-scaling.js
const { CloudWatch } = require('aws-sdk');

async function checkScalingMetrics() {
  const cloudwatch = new CloudWatch();
  
  const metrics = await cloudwatch.getMetricStatistics({
    Namespace: 'AWS/EC2',
    MetricName: 'CPUUtilization',
    Dimensions: [{ Name: 'AutoScalingGroupName', Value: 'webwatch-asg' }],
    StartTime: new Date(Date.now() - 300000),
    EndTime: new Date(),
    Period: 300,
    Statistics: ['Average']
  }).promise();
  
  // Implement scaling logic based on metrics
}
```

## 🔄 Continuous Integration/Deployment

### 1. GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. Automated Testing
```javascript
// tests/monitoring.test.js
const { test, expect } = require('@playwright/test');

test('monitor creation', async ({ page }) => {
  await page.goto('/uptime');
  await page.click('[data-testid="create-monitor"]');
  await page.fill('[data-testid="monitor-name"]', 'Test Monitor');
  await page.fill('[data-testid="monitor-url"]', 'https://example.com');
  await page.click('[data-testid="save-monitor"]');
  
  await expect(page.locator('[data-testid="monitor-list"]')).toContainText('Test Monitor');
});
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Playwright Documentation](https://playwright.dev/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [WebSocket Best Practices](https://websocket.org/echo.html)

## 🆘 Support

For production support and troubleshooting:
- Check the logs in Firebase Console
- Monitor WebSocket server status
- Review notification delivery reports
- Contact the development team

---

**Note**: This is a production-ready monitoring system with real-time capabilities, Firebase integration, and comprehensive notification support. Make sure to test thoroughly in a staging environment before deploying to production. 