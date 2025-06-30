'use client';

// Force rebuild - production API configured
import { useState, useEffect, useRef } from 'react';
import { auth, provider } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getAuth,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  idToken?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  uid?: string;
  email?: string;
  display_name?: string;
  photo_url?: string;
  google_auth_enabled?: boolean;
  database_status?: string;
  error?: string;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const initializationRef = useRef(false);

  // Use TypeScript backend URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Store user data in localStorage
  const storeUserData = (userData: User) => {
    try {
      localStorage.setItem('Sitegrip-user', JSON.stringify(userData));
      console.log('✅ User data stored in localStorage');
    } catch (error) {
      console.error('❌ Failed to store user data:', error);
    }
  };

  // Get user data from localStorage
  const getUserData = (): User | null => {
    try {
      const userData = localStorage.getItem('Sitegrip-user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Failed to get user data from localStorage:', error);
      return null;
    }
  };

  // Clear user data
  const clearUserData = () => {
    try {
      localStorage.removeItem('Sitegrip-user');
      console.log('🧹 User data cleared from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear user data:', error);
    }
  };

  // Extract Google tokens from user credential
  const extractGoogleTokens = (result: any) => {
    try {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return {
        accessToken: credential?.accessToken || null,
        refreshToken: result.user?.refreshToken || null
      };
    } catch (error) {
      console.error('Failed to extract Google tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  };

  // Verify token with backend
  const verifyTokenWithBackend = async (firebaseUser: FirebaseUser, isGoogleAuth = false, googleTokens?: { accessToken: string | null; refreshToken: string | null }): Promise<boolean> => {
    try {
      console.log(`🔐 Verifying token with backend (Google: ${isGoogleAuth})...`);
      
      const idToken = await firebaseUser.getIdToken();
      
      // Try Google endpoint first, fallback to regular if it fails
      let endpoint = isGoogleAuth ? '/api/auth/verify-token-with-google' : '/api/auth/verify-token';
      let requestBody: any;
      
      if (isGoogleAuth) {
        requestBody = {
          idToken,
          googleAccessToken: googleTokens?.accessToken || null,
          googleRefreshToken: googleTokens?.refreshToken || null
        };
      } else {
        requestBody = { idToken };
      }

      let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // If Google endpoint fails with 405, fallback to regular endpoint
      if (!response.ok && isGoogleAuth && response.status === 405) {
        console.warn('⚠️ Google endpoint failed with 405, trying regular endpoint as fallback...');
        endpoint = '/api/auth/verify-token';
        requestBody = { idToken };
        
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      }

      // If both endpoints fail with 405, proceed with Firebase-only auth
      if (!response.ok && response.status === 405) {
        console.warn('⚠️ Backend auth endpoints unavailable, proceeding with Firebase-only authentication');
        
        // Just use Firebase user data directly - no need for mock responses
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          idToken
        };

        setUser(userData);
        storeUserData(userData);
        
        toast.success('✅ Signed in successfully (Firebase auth)');
        return true;
      }

      const data: AuthResponse = await response.json();
      console.log('📊 Backend verification response:', data);
      
      if (data.success) {
        console.log('✅ Backend verification successful');
        
        // Check database status
        if (data.database_status === 'mock_client_active') {
          toast.error('⚠️ Database Configuration Issue: User data cannot be stored. Please check Firestore setup.');
          console.warn('⚠️ Using mock Firestore client - database not properly configured');
        } else if (data.database_status === 'write_verification_failed') {
          toast.error('⚠️ Database Write Failed: User data could not be verified after save.');
          console.warn('⚠️ Database write verification failed');
        } else if (data.database_status === 'connected_and_verified') {
          console.log('✅ Database connected and user data verified');
        } else if (data.database_status === 'connection_failed') {
          toast.error('⚠️ Database Connection Failed: Please check your internet connection.');
          console.warn('⚠️ Database connection failed');
        }

        const userData: User = {
          uid: data.uid || firebaseUser.uid,
          email: data.email || firebaseUser.email,
          displayName: data.display_name || firebaseUser.displayName,
          photoURL: data.photo_url || firebaseUser.photoURL,
          idToken
        };

        setUser(userData);
        storeUserData(userData);
        return true;
      } else {
        console.error('❌ Backend verification failed:', data.message);
        
        // Handle specific error cases
        if (data.database_status === 'mock_client_active') {
          toast.error('Database Configuration Issue: Please check Firestore setup in Firebase Console');
        } else if (data.database_status === 'auth_error') {
          toast.error('Authentication Error: Invalid or expired token');
        } else {
          toast.error(`Verification failed: ${data.message}`);
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ Error verifying token with backend:', error);
      toast.error('Failed to verify authentication with server');
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    console.log('🔄 Initializing auth state...');
    
    // Set loading to false immediately to ensure buttons are enabled
    setLoading(false);
    
    // Handle redirect result
    const handleRedirectResult = async () => {
      try {
        console.log('🔄 Checking for redirect result...');
        const auth2 = getAuth();
        const result = await getRedirectResult(auth2);
        
        if (result && result.user) {
          console.log('✅ Got redirect result');
          setLoading(true);
          const googleTokens = extractGoogleTokens(result);
          const success = await verifyTokenWithBackend(result.user, true, googleTokens);
          
          if (success) {
            toast.success('Successfully signed in with Google!');
            router.push('/profile');
          } else {
            // Sign out from Firebase if backend verification failed
            await firebaseSignOut(auth);
            toast.error('Google authentication verification failed');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error handling redirect result:', error);
        setLoading(false);
      }
    };
    
    // Check for redirect result first
    handleRedirectResult();
    
    // Then set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('👤 Firebase user detected:', firebaseUser.uid);
          
          // Check if we already have user data in localStorage
          const storedUser = getUserData();
          if (storedUser && storedUser.uid === firebaseUser.uid) {
            console.log('✅ Using stored user data');
            setUser(storedUser);
          } else {
            console.log('🔄 Verifying user with backend...');
            // Verify with backend (assume it's not Google auth for existing users)
            const success = await verifyTokenWithBackend(firebaseUser, false);
            if (!success) {
              console.warn('⚠️ Backend verification failed for existing user');
              // Don't sign out automatically for existing users, just show warning
              toast.error('Authentication verification failed. Some features may not work correctly.');
            }
          }
        } else {
          console.log('👤 No Firebase user');
          setUser(null);
          clearUserData();
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Signing in user:', email);
      
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Creating user account:', email);
      
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign up successful');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Signing in with Google (with GSC scopes)...');
      
      // Use pre-configured provider with GSC scopes from firebase.js
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign in successful');
      
      // Extract Google tokens
      const googleTokens = extractGoogleTokens(result);
      
      // Verify with backend
      const success = await verifyTokenWithBackend(result.user, true, googleTokens);
      
      if (success) {
        toast.success('Successfully signed in with Google!');
        console.log('🚀 Redirecting to profile page...');
        router.push('/profile');
      } else {
        // Sign out from Firebase if backend verification failed
        await firebaseSignOut(auth);
        toast.error('Google authentication verification failed');
        throw new Error('Backend verification failed');
      }
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('🔐 Signing out user...');
      await firebaseSignOut(auth);
      console.log('✅ Sign out successful');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      setError(getAuthErrorMessage(error.code));
      throw error;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
  };
};

// Helper function to convert Firebase error codes to user-friendly messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser. Please allow pop-ups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Sign in was cancelled.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

export default useAuth; 
