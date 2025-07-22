'use client';

// Force rebuild - production API configured
import { useState, useEffect, useRef } from 'react';
import { getAuthInstance, getProvider } from '@/lib/firebase.js';
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
import { clearAllAuthData } from '@/utils/auth';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  idToken?: string;
  // New fields for tier and project management
  tier?: string;
  projectId?: string;
  quotaLimit?: number;
  quotaUsed?: number;
  tierName?: string;
}

interface PlanInfo {
  plan?: string;
  price?: string;
  tier?: string;
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
  isNewUser?: boolean;
  error?: string;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, planInfo?: PlanInfo) => Promise<void>;
  signInWithGoogle: (planInfo?: PlanInfo) => Promise<void>;
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('Sitegrip-user', JSON.stringify(userData));
        console.log('✅ User data stored in localStorage');
      }
    } catch (error) {
      console.error('❌ Failed to store user data:', error);
    }
  };

  // Get user data from localStorage
  const getUserData = (): User | null => {
    try {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('Sitegrip-user');
        return userData ? JSON.parse(userData) : null;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get user data from localStorage:', error);
      return null;
    }
  };

  // Clear user data
  const clearUserData = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('Sitegrip-user');
        console.log('🧹 User data cleared from localStorage');
      }
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
  const verifyTokenWithBackend = async (firebaseUser: FirebaseUser, isGoogleAuth = false, googleTokens?: { accessToken: string | null; refreshToken: string | null }, planInfo?: PlanInfo): Promise<{ success: boolean; data?: AuthResponse }> => {
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
          googleRefreshToken: googleTokens?.refreshToken || null,
          selectedPlan: planInfo?.plan || 'free',
          planPrice: planInfo?.price || '0',
          tier: planInfo?.tier || 'free'
        };
      } else {
        requestBody = { 
          idToken,
          selectedPlan: planInfo?.plan || 'free',
          planPrice: planInfo?.price || '0',
          tier: planInfo?.tier || 'free'
        };
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
        requestBody = { 
          idToken,
          selectedPlan: planInfo?.plan || 'free',
          planPrice: planInfo?.price || '0',
          tier: planInfo?.tier || 'free'
        };
        
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
        return { success: true };
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

        // Initialize user with tier and project assignment
        try {
          const userInitializationResponse = await fetch(`${API_BASE_URL}/api/auth/initialize-user`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ 
              userId: data.uid || firebaseUser.uid,
              email: data.email || firebaseUser.email,
              displayName: data.display_name || firebaseUser.displayName,
              plan: planInfo?.plan || 'basic',
              price: planInfo?.price || '0',
              tier: planInfo?.tier || 'basic'
            })
          });

          if (userInitializationResponse.ok) {
            const initData = await userInitializationResponse.json();
            console.log('✅ User initialized with tier and project:', initData);
            
            // Update user data with tier and project info
            userData.tier = initData.data.tier || 'basic';
            userData.projectId = initData.data.projectId || 'sitegrip-basic-1';
            userData.quotaLimit = initData.data.quotaInfo.dailyLimit || 200;
            userData.quotaUsed = initData.data.quotaInfo.dailyUsed || 0;
            userData.tierName = initData.data.tierConfig.name || 'Basic';
          }
        } catch (error) {
          console.warn('⚠️ Failed to initialize user tier/project:', error);
          // Set default values if initialization fails
          userData.tier = 'basic';
          userData.projectId = 'sitegrip-basic-1';
          userData.quotaLimit = 200;
          userData.quotaUsed = 0;
          userData.tierName = 'Basic';
        }

        setUser(userData);
        storeUserData(userData);
        return { success: true, data };
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
        
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error verifying token with backend:', error);
      toast.error('Failed to verify authentication with server');
      return { success: false };
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    console.log('🔄 Initializing auth state...');
    
    // Check if Firebase is available - with proper function availability check
    const authCheck = getAuthInstance && getAuthInstance();
    if (!authCheck) {
      console.warn('⚠️ Firebase auth not available, skipping auth initialization');
      setLoading(false);
      return;
    }
    
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
            router.push('/dashboard/overview');
          } else {
            // Sign out from Firebase if backend verification failed
            await firebaseSignOut(auth2);
            toast.error('Failed to verify authentication with server');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error handling redirect result:', error);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const authInstance = getAuthInstance && getAuthInstance();
    if (!authInstance) {
      console.warn('⚠️ Authentication not available, skipping auth state listener');
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('✅ User authenticated:', firebaseUser.email);
          setLoading(true);
          
          // Check if we already have user data in localStorage
          const existingUser = getUserData();
          if (existingUser && existingUser.uid === firebaseUser.uid) {
            console.log('✅ Using existing user data from localStorage');
            setUser(existingUser);
            setLoading(false);
            return;
          }
          
          // Verify with backend
          const success = await verifyTokenWithBackend(firebaseUser, false);
          if (!success) {
            // Sign out if verification failed
            await firebaseSignOut(authInstance);
            setUser(null);
            clearUserData();
          }
        } else {
          console.log('👤 User signed out');
          setUser(null);
          clearUserData();
          
          // Clear all authentication data from storage
          clearAllAuthData();
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
        setUser(null);
        clearUserData();
        
        // Clear all authentication data from storage
        clearAllAuthData();
      } finally {
        setLoading(false);
      }
    });

    // Handle redirect result
    handleRedirectResult();

    return () => {
      unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const authInstance = getAuthInstance && getAuthInstance();
      if (!authInstance) throw new Error('Authentication not available');
      setLoading(true);
      setError(null);
      console.log('🔐 Signing in user:', email);
      
      await signInWithEmailAndPassword(authInstance, email, password);
      console.log('✅ Sign in successful');
      
      // Redirect to overview page after successful login
      toast.success('Successfully signed in!');
      router.push('/dashboard/overview');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      setError(getAuthErrorMessage(error.code));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, planInfo?: PlanInfo): Promise<void> => {
    try {
      const authInstance = getAuthInstance && getAuthInstance();
      if (!authInstance) throw new Error('Authentication not available');
      setLoading(true);
      setError(null);
      console.log('🔐 Creating user account:', email);
      
      await createUserWithEmailAndPassword(authInstance, email, password);
      console.log('✅ Sign up successful');
      
      // For new users, redirect to login page to sign in
      toast.success('Account created successfully! Please sign in to continue.');
      router.push('/login');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      
      // Check if user already exists
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
        toast.error('Account already exists. Please sign in.');
      } else {
        setError(getAuthErrorMessage(error.code));
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (planInfo?: PlanInfo, isSignup: boolean = false): Promise<void> => {
    try {
      const authInstance = getAuthInstance && getAuthInstance();
      const providerInstance = getProvider && getProvider();
      if (!authInstance || !providerInstance) throw new Error('Authentication not available');
      setLoading(true);
      setError(null);
      console.log('🔐 Signing in with Google (with GSC scopes)...');
      
      // Use pre-configured provider with GSC scopes from firebase.js
      const result = await signInWithPopup(authInstance, providerInstance);
      console.log('✅ Google sign in successful');
      
      // Extract Google tokens
      const googleTokens = extractGoogleTokens(result);
      
      // Verify with backend
      const verificationResult = await verifyTokenWithBackend(result.user, true, googleTokens, planInfo);
      
      if (verificationResult.success) {
        // Check if this is a new user from the backend response
        const isNewUser = verificationResult.data?.isNewUser;
        console.log('🔍 Google auth result - isNewUser:', isNewUser);
        console.log('🔍 Backend response data:', verificationResult.data);
        console.log('🔍 Is signup flow:', isSignup);
        
        if (isSignup && (isNewUser || !verificationResult.data)) {
          console.log('🆕 New user signup detected, redirecting to login page');
          toast.success('Account created successfully! Please sign in to continue.');
          router.push('/login');
        } else {
          console.log('👤 Existing user or login detected, redirecting to dashboard');
          toast.success('Successfully signed in with Google!');
          console.log('🚀 Redirecting to intended destination...');
          
          // Check if there's a stored redirect path
          const redirectPath = sessionStorage.getItem('redirectAfterLogin');
          if (redirectPath && redirectPath !== '/login' && redirectPath !== '/signup') {
            sessionStorage.removeItem('redirectAfterLogin');
            router.push(redirectPath);
          } else {
            // Redirect to overview page after successful login
            router.push('/dashboard/overview');
          }
        }
      } else {
        // Sign out from Firebase if backend verification failed
        await firebaseSignOut(authInstance);
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
      const authInstance = getAuthInstance && getAuthInstance();
      if (!authInstance) throw new Error('Authentication not available');
      console.log('🔐 Signing out user...');
      
      // Clear all authentication data from storage
      clearAllAuthData();
      
      // Sign out from Firebase
      await firebaseSignOut(authInstance);
      console.log('✅ Sign out successful');
      
      // Clear user state
      setUser(null);
      
      // Force clear any remaining localStorage items that might have been missed
      if (typeof window !== 'undefined') {
        // Double-check and clear any remaining Sitegrip items
        const remainingKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('Sitegrip-')) {
            remainingKeys.push(key);
            localStorage.removeItem(key);
          }
        }
        if (remainingKeys.length > 0) {
          console.log('🧹 Cleared additional items:', remainingKeys);
        }
        
        // Clear sessionStorage completely
        sessionStorage.clear();
        
        // Force page reload to clear any cached state
        console.log('🔄 Reloading page to ensure clean logout...');
        window.location.href = '/login';
      }
      
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
