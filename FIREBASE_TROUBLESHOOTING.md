# 🔧 Firebase Troubleshooting Guide

## **Current Issues Identified**

Based on your test results, here are the issues and solutions:

### **1. ❌ Firestore Not Available**

**Problem:** Firestore is failing to initialize even though Firebase configuration is valid.

**Possible Causes:**
1. **Firebase Project Configuration** - Firestore might not be enabled in your Firebase project
2. **Firestore Rules** - Security rules might be blocking access
3. **Network Issues** - Firestore might be blocked by network/firewall
4. **Browser Issues** - CORS or browser security settings

**Solutions:**

#### **A. Check Firebase Project Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`sitegrip-backend`)
3. Go to **Firestore Database** in the left sidebar
4. If you see "Create database", click it and follow the setup
5. If database exists, check the **Rules** tab

#### **B. Check Firestore Rules**
In Firebase Console → Firestore Database → Rules, make sure you have:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // For testing - allow all access (NOT for production)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Warning:** This allows all access. For production, use proper authentication rules.

#### **C. Test Firestore Connection**
1. Go to `/test-uptime` in your app
2. Check the detailed logs for specific error messages
3. Look for any network errors in browser DevTools → Network tab

### **2. ❌ User Not Authenticated**

**Problem:** You need to log in to use uptime monitoring features.

**Solution:**
1. Go to `/test-uptime`
2. Click the **"Sign In with Google"** button
3. Complete the Google authentication
4. The tests will re-run automatically after login

### **3. 🔍 Debugging Steps**

#### **Step 1: Check Browser Console**
Open browser DevTools (F12) and look for:
- Firebase initialization errors
- Network errors to `firestore.googleapis.com`
- CORS errors

#### **Step 2: Check Environment Variables**
Make sure these are set in your `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB7EV2UXjpmg9C64q2j75-njGd107chf48
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sitegrip-backend.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sitegrip-backend
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sitegrip-backend.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=305806997667
NEXT_PUBLIC_FIREBASE_APP_ID=1:305806997667:web:ca0424d05dbb2396626716
```

#### **Step 3: Test Firebase Connection**
1. Go to `/test-uptime`
2. Click **"Run Tests"**
3. Check the detailed logs for specific error messages

#### **Step 4: Check Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `sitegrip-backend` project
3. Check if Firestore Database is enabled
4. Check if Authentication is enabled
5. Check if your domain is authorized

## **🚀 Quick Fix Steps**

### **Option 1: Enable Firestore (Most Likely Issue)**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **"Firestore Database"** in the left sidebar
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose closest to your users)
7. Click **"Done"**

### **Option 2: Fix Firestore Rules**
1. In Firebase Console → Firestore Database → Rules
2. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **"Publish"**

### **Option 3: Enable Authentication**
1. In Firebase Console → Authentication
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Google"** provider
5. Add your domain to authorized domains

## **🔍 Advanced Debugging**

### **Check Network Requests**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for requests to `firestore.googleapis.com`
5. Check if any are failing with 400/403 errors

### **Check Firebase SDK Version**
Make sure you're using compatible Firebase SDK versions:
```json
{
  "firebase": "^10.x.x",
  "@firebase/firestore": "^4.x.x"
}
```

### **Test with Firebase Emulator**
If you want to test locally without Firebase:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulator
firebase init emulators

# Start emulators
firebase emulators:start
```

## **📞 Common Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| `Firestore not available` | Firestore not enabled | Enable Firestore in Firebase Console |
| `Permission denied` | Firestore rules blocking access | Update rules to allow access |
| `Network error` | CORS or network issues | Check browser console for details |
| `User not authenticated` | Not logged in | Click "Sign In with Google" |
| `Missing API key` | Environment variables not set | Check `.env.local` file |

## **✅ Success Checklist**

After following the steps above, you should see:
- ✅ Firebase configuration is valid
- ✅ Firebase connection successful
- ✅ User authenticated
- ✅ Monitors fetched successfully

If you're still having issues, please share:
1. The exact error messages from `/test-uptime`
2. Screenshots of your Firebase Console setup
3. Browser console errors 