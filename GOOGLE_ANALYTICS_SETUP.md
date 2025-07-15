# Google Analytics API Setup Guide

This guide will help you set up Google Analytics API integration for the SiteGrip application.

## Prerequisites

1. A Google Cloud Project
2. Google Analytics 4 (GA4) property
3. Admin access to the Google Cloud Console

## Step 1: Enable Google Analytics API

### 1.1 Go to Google Cloud Console
- Visit [Google Cloud Console](https://console.cloud.google.com/)
- Select your project

### 1.2 Enable Required APIs
Navigate to **APIs & Services > Library** and enable these APIs:

1. **Google Analytics Data API (GA4)**
   - Search for "Google Analytics Data API"
   - Click "Enable"

2. **Google Analytics Admin API**
   - Search for "Google Analytics Admin API"
   - Click "Enable"

3. **Google OAuth2 API**
   - Search for "Google OAuth2 API"
   - Click "Enable"

### 1.3 Verify API Status
Go to **APIs & Services > Enabled APIs** to confirm all APIs are enabled.

## Step 2: Configure OAuth 2.0 Credentials

### 2.1 Create OAuth 2.0 Client ID
1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"**
4. Configure:
   - **Name**: `SiteGrip Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://www.sitegrip.com` (production)
     - `https://sitegrip.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback` (development)
     - `https://www.sitegrip.com/auth/callback` (production)
     - `https://sitegrip.com/auth/callback` (production)

### 2.2 Save Credentials
- Copy the **Client ID** and **Client Secret**
- Add them to your environment variables

## Step 3: Environment Configuration

### 3.1 Backend Environment (.env)
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GSC_REDIRECT_URI=http://localhost:3000/auth/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3.2 Frontend Environment (.env.local)
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Step 4: Google Analytics Property Setup

### 4.1 Verify GA4 Property
1. Go to [Google Analytics](https://analytics.google.com/)
2. Ensure you have a GA4 property (not Universal Analytics)
3. Note the **Property ID** (format: `123456789`)

### 4.2 Grant Access
1. In Google Analytics, go to **Admin**
2. Under **Property**, click **Property access management**
3. Add your Google account with **Viewer** or higher permissions

## Step 5: Test the Integration

### 5.1 Start the Backend
```bash
cd backend-typescript
npm install
npm run dev
```

### 5.2 Start the Frontend
```bash
cd webwatch
npm install
npm run dev
```

### 5.3 Test Authentication
1. Visit `http://localhost:3000/dashboard/overview`
2. Click "Sign in with Google"
3. Grant permissions for Google Analytics
4. Verify properties are loaded

### 5.4 Test Data Fetching
1. Select a Google Analytics property
2. Choose a date range
3. Verify analytics data is displayed

## Step 6: Troubleshooting

### Common Issues

#### 1. "User not authenticated with Google Analytics"
**Solution**: 
- Ensure user has granted Google Analytics permissions
- Check OAuth scopes include `analytics.readonly`
- Verify Google Analytics API is enabled

#### 2. "No properties found"
**Solution**:
- Verify user has access to GA4 properties
- Check property permissions in Google Analytics
- Ensure using GA4 (not Universal Analytics)

#### 3. "API quota exceeded"
**Solution**:
- Check Google Cloud Console quotas
- Implement rate limiting
- Consider upgrading API quota

#### 4. "Invalid property ID"
**Solution**:
- Verify property ID format (numbers only)
- Ensure property exists and is accessible
- Check user permissions

### Debug Steps

1. **Check Backend Logs**:
   ```bash
   cd backend-typescript
   npm run dev
   # Look for analytics-related logs
   ```

2. **Check Frontend Console**:
   - Open browser developer tools
   - Check for authentication errors
   - Verify API calls are successful

3. **Verify OAuth Flow**:
   - Check if tokens are being saved
   - Verify refresh tokens are working
   - Test token validation

## Step 7: Production Deployment

### 7.1 Update OAuth Credentials
1. Go to Google Cloud Console
2. Update OAuth 2.0 client with production URLs
3. Add production redirect URIs

### 7.2 Environment Variables
Update production environment variables with:
- Production Google Client ID/Secret
- Production Firebase configuration
- Production backend API URL

### 7.3 SSL Certificate
Ensure your production domain has a valid SSL certificate for OAuth to work properly.

## API Endpoints

### Frontend API Routes
- `POST /api/analytics/properties` - Get user's GA properties
- `POST /api/analytics/data` - Get analytics data
- `GET /api/analytics/summary/:propertyId` - Get summary data
- `GET /api/analytics/trends/:propertyId` - Get trends data

### Backend API Routes
- `GET /api/analytics/properties` - Get user's GA properties
- `POST /api/analytics/data` - Get analytics data
- `GET /api/analytics/summary/:propertyId` - Get summary data
- `GET /api/analytics/trends/:propertyId` - Get trends data

## Data Structure

### Analytics Data Response
```typescript
interface AnalyticsData {
  basicMetrics: Array<{
    date: string;
    totalUsers: number;
    sessions: number;
    screenPageViews: number;
    bounceRate: number;
    averageSessionDuration: number;
  }>;
  newUsersData: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
    returningUsers: number;
  }>;
  trafficSourcesData: Array<{
    source: string;
    value: number;
    users: number;
  }>;
  geoData: Array<{
    country: string;
    users: number;
    sessions: number;
  }>;
  topPagesData: Array<{
    page: string;
    users: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
  }>;
  deviceData: Array<{
    name: string;
    value: number;
    sessions: number;
  }>;
  derivedMetrics: {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    avgBounceRate: number;
    totalNewUsers: number;
    totalReturningUsers: number;
    avgSessionDuration: number;
    conversionRate: number;
  };
}
```

## Security Considerations

1. **OAuth Tokens**: Store tokens securely in Firebase
2. **API Keys**: Never expose API keys in client-side code
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Data Privacy**: Ensure compliance with data protection regulations
5. **Access Control**: Verify user permissions before accessing data

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google Analytics API documentation
3. Check Google Cloud Console for API quotas and errors
4. Verify OAuth configuration and permissions 