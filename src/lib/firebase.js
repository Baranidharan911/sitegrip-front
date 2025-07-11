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

// Initialize Firebase App (only once)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Add scopes for Search Console API and Indexing API during login
provider.addScope("https://www.googleapis.com/auth/webmasters.readonly");
provider.addScope("https://www.googleapis.com/auth/webmasters");
provider.addScope("https://www.googleapis.com/auth/indexing");

// Request offline access to get refresh tokens
provider.setCustomParameters({
  'access_type': 'offline',
  'prompt': 'consent'
});

// Firestore (for saving user data)
const db = getFirestore(app);

// Save data to a Firestore collection
export async function saveToFirebase(collectionName, data) {
  return await addDoc(collection(db, collectionName), data);
}

export { app, auth, provider, db };
