// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, collection, addDoc, connectFirestoreEmulator, Firestore } from "firebase/firestore";

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
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;
let db: Firestore | null = null;
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
      db = getFirestore(app);
      console.log('✅ Firestore initialized successfully');
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

// Save data to a Firestore collection
export async function saveToFirebase(collectionName: string, data: any) {
  if (!isClient) {
    console.warn('⚠️ Not in client environment, skipping save operation');
    throw new Error('Not in client environment');
  }
  
  if (!firestoreAvailable || !db) {
    console.warn('⚠️ Firestore not available, skipping save operation');
    throw new Error('Firestore is not available');
  }
  
  try {
    console.log(`💾 Attempting to save to Firestore collection: ${collectionName}`);
    if (!db) return null;
    const result = await addDoc(collection(db, collectionName), data);
    console.log('✅ Data saved to Firestore successfully:', result.id);
    return result;
  } catch (error) {
    console.error('❌ Failed to save to Firestore:', error);
    throw error;
  }
}

// Check if Firestore is available
export function isFirestoreAvailable(): boolean {
  return isClient && firestoreAvailable;
}

// Check if Firebase is available
export function isFirebaseAvailable(): boolean {
  return isClient && !!app;
}

// IMPORTANT: For production, update your Firestore rules to restrict access to authenticated users only.
export { app, auth, provider, db };
