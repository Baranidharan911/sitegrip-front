'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  doc,
  query,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

// ✅ Firestore data structure
interface IndexingRequest {
  id: string;
  url: string;
  status: string;
  timestamp?: Timestamp;
  indexedAt?: Timestamp;
  failureReason?: string;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const appId = process.env.NEXT_PUBLIC_WEBWATCH_APP_ID || 'webwatch-dev';
const initialAuthToken = null;

export const useIndexing = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indexingRequests, setIndexingRequests] = useState<IndexingRequest[]>([]);
  const [db, setDb] = useState<Firestore | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // ✅ Initialize Firebase + Auth
  useEffect(() => {
    const initFirebase = async () => {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setDb(firestore);

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(auth, initialAuthToken);
            } else {
              await signInAnonymously(auth);
            }
          } catch (err) {
            console.error('Auth failed', err);
            toast.error('Firebase authentication failed.');
          }
        }
        setAuthReady(true);
      });
    };

    initFirebase();
  }, []);

  // 🔁 Real-time Firestore listener
  useEffect(() => {
    if (!authReady || !db || !userId) return;

    const q = query(collection(db, `artifacts/${appId}/users/${userId}/indexingRequests`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IndexingRequest[];

      setIndexingRequests(
        docs.sort((a, b) => {
          const timeA = a.timestamp?.toDate().getTime() || 0;
          const timeB = b.timestamp?.toDate().getTime() || 0;
          return timeB - timeA;
        })
      );
    });

    return () => unsubscribe();
  }, [authReady, db, userId]);

  // 📤 Submit new URL
  const handleSubmit = async (e: React.FormEvent, retryUrl?: string) => {
    e.preventDefault();
    const url = retryUrl || urlInput.trim();
    if (!url || !db || !userId || isSubmitting) return;

    setIsSubmitting(true);
    toast.loading('Checking URL...', { id: 'submit' });

    try {
      // Attempt to validate reachability (basic GET)
      const response = await fetch(url, { method: 'GET', mode: 'no-cors' });
      
      // Proceed to submit to Firestore
      const ref = await addDoc(collection(db, `artifacts/${appId}/users/${userId}/indexingRequests`), {
        url,
        status: 'Submitted ⏳',
        timestamp: serverTimestamp(),
      });

      if (!retryUrl) setUrlInput('');
      toast.success('Submitted! Processing...', { id: 'submit' });

      setTimeout(async () => {
        const isFailed = Math.random() > 0.7;
        if (isFailed) {
          const reasons = [
            'Invalid domain name',
            'Could not reach server',
            'Timed out while connecting',
            'Received non-200 response',
            'Malformed URL format',
          ];
          const failureReason = reasons[Math.floor(Math.random() * reasons.length)];

          await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/indexingRequests`, ref.id), {
            status: 'Failed ❌',
            failureReason,
            indexedAt: serverTimestamp(),
          });

          toast.error(`Indexing failed: ${failureReason}`);
        } else {
          await updateDoc(doc(db, `artifacts/${appId}/users/${userId}/indexingRequests`, ref.id), {
            status: 'Indexed ✅',
            indexedAt: serverTimestamp(),
          });

          toast.success(`Indexing successful!`);
        }
      }, Math.random() * 3000 + 1000);
    } catch (error) {
      toast.error('URL appears unreachable or malformed.', { id: 'submit' });

      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/indexingRequests`), {
        url,
        status: 'Failed ❌',
        failureReason: 'URL is unreachable or malformed',
        timestamp: serverTimestamp(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return {
    urlInput,
    setUrlInput,
    handleSubmit,
    indexingRequests,
    isSubmitting,
    userId,
  };
};
