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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const initializationRef = useRef(false);

  // Use localhost for development, production URL for production
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app');

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
      const endpoint = isGoogleAuth ? '/api/auth/auth/verify-token-with-google' : '/api/auth/auth/verify-token';
      
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

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

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

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔐 Signing in with email...');
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const success = await verifyTokenWithBackend(result.user, false);
      
      if (success) {
        toast.success('Successfully signed in!');
        router.push('/profile');
      } else {
        // Sign out from Firebase if backend verification failed
        await firebaseSignOut(auth);
        toast.error('Authentication verification failed');
      }
    } catch (error: any) {
      console.error('❌ Email sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('📝 Creating account with email...');
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const success = await verifyTokenWithBackend(result.user, false);
      
      if (success) {
        toast.success('Account created successfully!');
        router.push('/profile');
      } else {
        // Delete the Firebase user if backend verification failed
        await result.user.delete();
        toast.error('Account creation verification failed');
      }
    } catch (error: any) {
      console.error('❌ Email sign up error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('🔐 Signing in with Google...');
      
      // Use popup method with better error handling
      try {
        // Small delay to ensure popup isn't blocked
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Google sign-in successful, extracting tokens...');
        
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
      } catch (popupError: any) {
        console.error('❌ Google popup error:', popupError);
        
        // Check for specific error types
        if (popupError.code === 'auth/popup-closed-by-user') {
          toast.error('Sign-in cancelled. Please try again.');
        } else if (popupError.code === 'auth/popup-blocked') {
          toast.error('Popup was blocked. Please allow popups for this site.');
        } else if (popupError.code === 'auth/cancelled-popup-request') {
          toast.error('Another sign-in popup is already open.');
        } else if (popupError.code === 'auth/unauthorized-domain') {
          toast.error('This domain is not authorized for Google sign-in. Please contact support.');
        } else {
          // For other errors, try redirect method as fallback
          console.log('🔄 Trying redirect method as fallback...');
          try {
            const auth2 = getAuth();
            await signInWithRedirect(auth2, provider);
            // The rest will be handled in the redirect callback
            return;
          } catch (redirectError) {
            console.error('❌ Redirect also failed:', redirectError);
            toast.error('Google sign-in failed. Please check your browser settings and try again.');
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      await firebaseSignOut(auth);
      setUser(null);
      clearUserData();
      toast.success('Signed out successfully');
      router.push('/login');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      toast.error('Failed to sign out');
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

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}; 