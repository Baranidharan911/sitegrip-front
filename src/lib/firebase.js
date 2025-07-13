// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, connectFirestoreEmulator } from "firebase/firestore";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we're in a browser environment
const isClient = typeof window !== 'undefined';

// Log Firebase config for debugging (without sensitive data) - only in client
if (isClient) {
  console.log('🔥 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    hasApiKey: !!firebaseConfig.apiKey,
    hasAppId: !!firebaseConfig.appId
  });
}

// Initialize Firebase App (only once and only in client)
let app = null;
let auth = null;
let provider = null;
let db = null;
let firestoreAvailable = false;

if (isClient) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');

// Firebase Auth
    auth = getAuth(app);
    provider = new GoogleAuthProvider();

// Add scopes for Search Console API and Indexing API during login
provider.addScope("https://www.googleapis.com/auth/webmasters.readonly");
provider.addScope("https://www.googleapis.com/auth/webmasters");
provider.addScope("https://www.googleapis.com/auth/indexing");

// Request offline access to get refresh tokens
provider.setCustomParameters({
  'access_type': 'offline',
  'prompt': 'consent'
});

    // Firestore (for saving user data) - with error handling
    try {
      db = getFirestore(app, "indexing-sitegrip");
      console.log('✅ Firestore (indexing-sitegrip) initialized successfully');
      firestoreAvailable = true;
    } catch (error) {
      console.error('❌ Firestore initialization failed:', error);
      console.warn('⚠️ Firestore will not be available - some features may not work');
      firestoreAvailable = false;
    }
  } catch (error) {
    console.error('❌ Firebase app initialization failed:', error);
    // Don't throw error during prerendering
    if (isClient) {
      console.warn('⚠️ Firebase will not be available - some features may not work');
    }
  }
}

// Save data to a Firestore collection with proper error handling
export async function saveToFirebase(collectionName, data) {
  if (!isClient) {
    console.warn('⚠️ Not in client environment, skipping save operation');
    return null;
  }
  
  if (!firestoreAvailable || !db) {
    console.warn('⚠️ Firestore not available, skipping save operation');
    return null;
  }
  
  try {
    console.log(`💾 Attempting to save to Firestore collection: ${collectionName}`);
    const result = await addDoc(collection(db, collectionName), data);
    console.log('✅ Data saved to Firestore successfully:', result.id);
    return result;
  } catch (error) {
    console.error('❌ Failed to save to Firestore:', error);
    
    // Handle specific error types
    if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
      console.warn('⚠️ Firestore is offline or connection timeout - data not saved');
      return null;
    }
    
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Permission denied - check Firestore rules');
      return null;
    }
    
    // For other errors, return null but don't crash the app
    console.warn('⚠️ Firestore error - continuing without saving data');
    return null;
  }
}

// Check if Firestore is available
export function isFirestoreAvailable() {
  return isClient && firestoreAvailable;
}

// Check if Firebase is available
export function isFirebaseAvailable() {
  return isClient && !!app;
}

// Add getFirestoreInstance implementation (ported from firebase.ts)
function getFirestoreInstance() {
  if (typeof window === 'undefined') return null;
  if (!db) {
    if (!app) {
      // Try to initialize app if not already done
      try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      } catch (error) {
        console.error('❌ Firebase app initialization failed:', error);
        return null;
      }
    }
    try {
      db = getFirestore(app, "indexing-sitegrip");
      firestoreAvailable = true;
    } catch (error) {
      console.error('❌ Firestore initialization failed:', error);
      firestoreAvailable = false;
      return null;
    }
  }
  return db;
}

export { getFirebaseApp, getAuthInstance, getProvider, getFirestoreInstance };
