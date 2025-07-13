// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";


// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App (only once and only in client)
let app = null;
let auth = null;
let provider = null;
let db = null;

function getFirebaseApp() {
  if (typeof window === 'undefined') return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

function getAuthInstance() {
  if (typeof window === 'undefined') return null;
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    auth = getAuth(firebaseApp);
  }
  return auth;
}

function getProvider() {
  if (typeof window === 'undefined') return null;
  if (!provider) {
    provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/webmasters.readonly");
    provider.addScope("https://www.googleapis.com/auth/webmasters");
    provider.addScope("https://www.googleapis.com/auth/indexing");
    provider.setCustomParameters({
      'access_type': 'offline',
      'prompt': 'consent'
    });
  }
  return provider;
}

function getFirestoreInstance() {
  if (typeof window === 'undefined') return null;
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    db = getFirestore(firebaseApp);
  }
  return db;
}

// Save data to a Firestore collection
export async function saveToFirebase(collectionName, data) {
  const dbInstance = getFirestoreInstance();
  if (!dbInstance) throw new Error('Firestore is not available');
  return await addDoc(collection(dbInstance, collectionName), data);
}

export { getFirebaseApp, getAuthInstance, getProvider, getFirestoreInstance };
