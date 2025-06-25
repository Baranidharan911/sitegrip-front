'use client';

// Force rebuild - production API configured
import { useState } from 'react';
import { auth, provider } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
} from 'firebase/auth';

export const useAuth = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyTokenAndRedirect = async (idToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';
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

  const verifyTokenAndRedirectWithGoogleAuth = async (
    idToken: string, 
    accessToken: string | null, 
    refreshToken: string | null
  ) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';
      console.log('API URL being used:', apiUrl);
      console.log('Full URL:', `${apiUrl}/api/auth/verify-token-with-google`);
      const response = await fetch(`${apiUrl}/api/auth/verify-token-with-google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken
        }),
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
      
      // Get OAuth access token from credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken || null;
      const refreshToken = (result as any)._tokenResponse?.refreshToken || null;
      
      // Send both Firebase ID token and Google OAuth data to backend
      await verifyTokenAndRedirectWithGoogleAuth(idToken, accessToken, refreshToken);
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