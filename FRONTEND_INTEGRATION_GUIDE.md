# 🚀 SiteGrip Indexing - Frontend Integration Guide

This guide will help you deploy the backend and test the complete frontend-backend integration for the SiteGrip Indexing system.

## 📋 Prerequisites

1. **Google Cloud Account**: Create one at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud Project**: Create a new project in the Google Cloud Console
3. **Google Cloud SDK**: Install from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
4. **Frontend Dependencies**: All React dependencies should be installed

## 🚀 Step-by-Step Deployment & Testing

### Step 1: Deploy the Backend

You have several options to deploy the backend:

#### Option A: Use the Automated Deployment Script (Recommended)

```bash
cd backend
.\deploy_indexing_api.ps1
```

This script will:
- ✅ Test the API locally first
- ✅ Authenticate with Google Cloud
- ✅ Deploy to App Engine
- ✅ Test all endpoints after deployment
- ✅ Provide the deployed URL

#### Option B: Use Batch File (Windows)

```bash
cd backend
deploy_indexing_api.bat
```

#### Option C: Manual Deployment

```bash
cd backend
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud app deploy app.yaml
```

### Step 2: Test Backend Deployment

After deployment, test that all endpoints are working:

```bash
cd backend
.\test_deployment.ps1
```

This will verify:
- ✅ Health endpoint
- ✅ Quota endpoint
- ✅ Stats endpoint
- ✅ Entries endpoint

### Step 3: Update Frontend API URL

Once you have the deployed URL (e.g., `https://your-project.appspot.com`), update your frontend configuration:

1. **Environment Variable**: Set `NEXT_PUBLIC_API_URL` in your frontend environment
2. **Or Update Code**: Modify the API base URL in `src/lib/indexingApi.ts`

### Step 4: Start the Frontend

```bash
cd webwatch
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Step 5: Test the Integration

1. Navigate to `http://localhost:3000/indexing`
2. You should see the enhanced indexing interface
3. Test the following features:

## 🧪 Testing Checklist

### ✅ Basic Functionality
- [ ] Page loads without errors
- [ ] Dashboard shows statistics (initially 0)
- [ ] Form tabs work (Single URL, Bulk URLs, File Upload)
- [ ] Priority selection works
- [ ] URL validation works

### ✅ URL Submission
- [ ] Single URL submission
- [ ] Bulk URL submission (multiple URLs)
- [ ] File upload (.txt files)
- [ ] Priority levels (Low, Medium, High, Critical)
- [ ] Success/error messages

### ✅ Data Display
- [ ] Indexing entries table shows submitted URLs
- [ ] Status updates work (Submitted, Indexed, Error)
- [ ] Priority badges display correctly
- [ ] Domain extraction works
- [ ] Date formatting works

### ✅ Dashboard Features
- [ ] Statistics cards show correct numbers
- [ ] Success rate calculation
- [ ] Quota usage display
- [ ] Progress bars work
- [ ] Refresh button works

### ✅ Actions
- [ ] Retry failed entries
- [ ] Mark entries as indexed
- [ ] Mark entries as error
- [ ] Status updates reflect immediately

## 🔧 Troubleshooting

### Backend Deployment Issues

#### 405 Method Not Allowed Errors
This indicates the indexing endpoints are not deployed correctly.

**Solution:**
1. Redeploy using the deployment script
2. Check that `main.py` includes the indexing router
3. Verify the deployment logs

```bash
cd backend
.\deploy_indexing_api.ps1
```

#### Check Deployment Logs
```bash
gcloud app logs tail -s default
```

#### Verify API Endpoints
```bash
cd backend
.\test_deployment.ps1
```

### Frontend Issues

#### CORS Errors
If you see CORS errors in the browser console:

1. Check that the backend CORS configuration includes your frontend URL
2. Verify the API URL is correct
3. Ensure the backend is accessible

#### Network Errors
If the frontend can't connect to the backend:

1. Verify the API URL is correct
2. Check that the backend is deployed and running
3. Test the API endpoints directly

### Common Errors

- **405 Method Not Allowed**: Backend not deployed correctly or wrong endpoint
- **CORS Error**: Backend CORS configuration issue
- **Network Error**: Backend server not accessible or wrong URL

## 📊 Expected Behavior

### Initial State
- Dashboard shows 0 for all statistics
- Quota shows 0/200 used
- Table shows "No URLs Submitted Yet"

### After URL Submission
- Statistics update immediately
- New entry appears in table
- Quota usage increases
- Success message appears

### After Multiple Submissions
- Statistics accumulate correctly
- Table shows all entries
- Quota tracks usage properly
- Success rate calculates correctly

## 🎯 Test Scenarios

### Scenario 1: Single URL
1. Go to "Single URL" tab
2. Enter: `https://example.com`
3. Select "High" priority
4. Click "Index URL"
5. Verify entry appears in table

### Scenario 2: Bulk URLs
1. Go to "Bulk URLs" tab
2. Enter multiple URLs (one per line)
3. Select "Medium" priority
4. Click "Index All URLs"
5. Verify all entries appear

### Scenario 3: File Upload
1. Create a .txt file with URLs
2. Go to "File Upload" tab
3. Upload the file
4. Select "Low" priority
5. Click "Upload and Index"

### Scenario 4: Status Management
1. Submit a URL
2. Click "Mark Indexed" on the entry
3. Verify status changes
4. Click "Mark Error" on another entry
5. Verify error status and message

## 🔄 Real-time Features

The system includes real-time updates:
- Statistics refresh automatically
- Table updates when new entries are added
- Status changes reflect immediately
- Quota usage updates in real-time

## 📱 Responsive Design

Test on different screen sizes:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

All components should be fully responsive.

## 🎨 Theme Support

Test both light and dark themes:
- Toggle theme in the app
- Verify all components adapt
- Check color contrast
- Ensure readability

## 🚀 Production Readiness

Once testing is complete:
1. ✅ All features work correctly
2. ✅ Error handling is robust
3. ✅ UI is responsive
4. ✅ Performance is good
5. ✅ Ready for deployment

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify backend logs for API issues
3. Test API endpoints directly with curl/Postman
4. Check network connectivity between frontend and backend
5. Use the deployment test script to verify backend status

## Recent Updates

### Real-Time Indexing Integration ✅

The frontend has been updated to connect with the real backend indexing system that supports:

1. **Single URL Indexing** - Submit individual URLs for indexing
2. **Website Discovery & Indexing** - Automatically discover and index all URLs from a website
3. **Bulk URL Indexing** - Submit multiple URLs at once
4. **File Upload Indexing** - Upload .txt or .csv files containing URLs
5. **Real-time Status Updates** - Monitor indexing progress and status
6. **Quota Management** - Track API quota usage and limits

## Backend Requirements

Make sure your backend is running on `http://localhost:8000` with these endpoints:

- `POST /api/indexing/submit` - Submit URLs for indexing
- `POST /api/indexing/submit-website` - Submit website for discovery & indexing  
- `GET /api/indexing/entries` - Get indexing entries
- `POST /api/indexing/dashboard` - Get dashboard data
- `POST /api/indexing/statistics` - Get indexing statistics
- `POST /api/indexing/quota` - Get quota information
- `POST /api/indexing/update-status` - Update entry status
- `DELETE /api/indexing/delete` - Delete an entry
- `GET /api/indexing/history` - Get indexing history

## Testing the Integration

### 1. Start the Backend
```bash
cd backend
python main.py  # or however you start your backend
```

### 2. Start the Frontend
```bash
npm run dev
```

### 3. Test Website Discovery (New Feature!)
1. Go to `/indexing` page
2. Click on "Website Discovery" tab
3. Enter a website URL (e.g., `https://www.elbrit.org/`)
4. Click "Discover & Index"
5. The system will:
   - Discover all URLs from the website
   - Create indexing entries
   - Submit them for Google indexing
   - Show real-time progress

### 4. Configuration

Set the backend URL in your environment:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Data Flow

### Website Indexing Request
```json
{
  "website_url": "https://example.com",
  "project_id": "default-project", 
  "user_id": "user-123",
  "priority": "medium"
}
```

### Expected Response
```json
{
  "message": "Successfully discovered and submitted 18 URLs",
  "discovered_urls": 18,
  "successful_submissions": 15,
  "failed_submissions": 3,
  "entries": [...],
  "quota_used": 15,
  "quota_remaining": 185
}
```

## Features Implemented

✅ Real API integration (replacing mock data)
✅ Website discovery and automatic indexing
✅ Error handling with backend connection status
✅ Real-time quota management
✅ Improved user feedback with detailed toasts
✅ Backend URL configuration
✅ User authentication integration

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check CORS configuration in backend
- Verify API endpoints are accessible

### Authentication Issues  
- Make sure user is logged in via Google Auth
- Check localStorage for 'Sitegrip-user' data

### Quota Issues
- Monitor quota usage in dashboard
- Check backend quota limits and reset times

## Next Steps

The integration is now ready for production use with your real indexing backend!

---

**🎉 Congratulations!** You now have a fully functional URL indexing system with a beautiful, responsive frontend connected to a robust backend API deployed on Google Cloud. 