'use client';

import { useState } from 'react';
import { auth, provider } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

export const useAuth = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyTokenAndRedirect = async (idToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Verification failed.');
      }

      const data = await response.json();
      localStorage.setItem('Sitegrip-user', JSON.stringify(data));
      window.location.href = '/indexing';
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await verifyTokenAndRedirect(idToken);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await verifyTokenAndRedirect(idToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await verifyTokenAndRedirect(idToken);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    errorMessage,
    loading,
    loginWithEmail,
    loginWithGoogle,
    signupWithEmail,
  };
}; 