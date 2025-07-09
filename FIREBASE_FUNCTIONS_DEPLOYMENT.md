# 🔥 Firebase Functions Deployment Guide

## Overview

The Firebase Functions are deployed separately from the Next.js frontend. This is because:
- **Frontend**: Deployed to Vercel (Next.js app)
- **Backend**: Deployed to Firebase (Cloud Functions)

## 📁 Project Structure

```
webwatch/
├── src/                    # Next.js frontend (deployed to Vercel)
├── functions/              # Firebase Functions (deployed to Firebase)
│   ├── src/
│   │   ├── admin.ts
│   │   ├── index.ts
│   │   ├── uptimeMonitor.ts
│   │   ├── sslMonitor.ts
│   │   ├── browserCheckMonitor.ts
│   │   └── utils.ts
│   ├── package.json
│   └── tsconfig.json
├── firebase.json           # Firebase configuration
└── .firebaserc            # Firebase project settings
```

## 🚀 Deployment Steps

### 1. Deploy Firebase Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Firebase
firebase deploy --only functions
```

### 2. Deploy Frontend (Next.js)

```bash
# From the root directory
npm run build

# Deploy to Vercel (or your preferred hosting)
vercel --prod
```

## ⚙️ Configuration

### Firebase Configuration

The `firebase.json` file contains the configuration for:
- **Functions**: Scheduled Cloud Functions for monitoring
- **Firestore**: Database rules and indexes
- **Hosting**: (Optional) Static hosting

### Environment Variables

Set these in Firebase Functions:
```bash
firebase functions:config:set \
  firebase.project_id="your-project-id" \
  firebase.private_key_id="your-private-key-id" \
  firebase.private_key="your-private-key" \
  firebase.client_email="your-client-email" \
  firebase.client_id="your-client-id"
```

## 📊 Monitoring Functions

### 1. Uptime Monitor (`scheduledUptimeMonitor`)
- **Schedule**: Every 5 minutes
- **Purpose**: HTTP/HTTPS monitoring
- **Collections**: `monitors`, `checkResults`, `incidents`

### 2. SSL Monitor (`scheduledSSLMonitor`)
- **Schedule**: Every 60 minutes
- **Purpose**: SSL certificate monitoring
- **Collections**: `monitors`, `ssl_alerts`

### 3. Browser Check Monitor (`scheduledBrowserCheckMonitor`)
- **Schedule**: Every 15 minutes
- **Purpose**: Browser-based monitoring
- **Collections**: `monitors`, `browserChecks`, `incidents`

## 🔧 Development

### Local Development

```bash
# Start Firebase emulator
firebase emulators:start

# In another terminal, start Next.js dev server
npm run dev
```

### Testing Functions

```bash
# Test specific function
firebase functions:shell

# View logs
firebase functions:log
```

## 📝 Important Notes

1. **Separate Deployments**: Frontend and backend are deployed separately
2. **Environment Variables**: Set in Firebase Console for production
3. **Billing**: Cloud Functions have usage-based billing
4. **Monitoring**: Check Firebase Console for function execution logs
5. **Scaling**: Functions auto-scale based on demand

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**: Ensure all dependencies are installed in functions/
2. **Permission Errors**: Check Firebase project permissions
3. **Timeout Issues**: Adjust function timeout in firebase.json
4. **Memory Issues**: Increase memory allocation for browser functions

### Useful Commands

```bash
# View function status
firebase functions:list

# View function logs
firebase functions:log --only scheduledUptimeMonitor

# Update function configuration
firebase functions:config:get

# Delete function
firebase functions:delete scheduledUptimeMonitor
```

## 🔗 Related Documentation

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Vercel Deployment Guide](https://vercel.com/docs) 