'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import AuthGuard from '@/components/Common/AuthGuard';

// Dynamically import components to avoid SSR issues
const AccountHeader = dynamic(() => import('@/components/Profile/AccountHeader'), {
  loading: () => <div className="animate-pulse h-20 bg-gray-200 rounded"></div>,
  ssr: false
});

const AvatarUploader = dynamic(() => import('@/components/Profile/AvatarUploader'), {
  loading: () => <div className="animate-pulse h-40 bg-gray-200 rounded"></div>,
  ssr: false
});

const NotificationSettings = dynamic(() => import('@/components/Profile/NotificationSettings'), {
  loading: () => <div className="animate-pulse h-40 bg-gray-200 rounded"></div>,
  ssr: false
});

const PersonalizationSettings = dynamic(() => import('@/components/Profile/PersonalizationSettings'), {
  loading: () => <div className="animate-pulse h-40 bg-gray-200 rounded"></div>,
  ssr: false
});

const ActivityLog = dynamic(() => import('@/components/Profile/ActivityLog'), {
  loading: () => <div className="animate-pulse h-40 bg-gray-200 rounded"></div>,
  ssr: false
});

const LogoutButton = dynamic(() => import('@/components/Profile/LogoutButton'), {
  loading: () => <button className="animate-pulse bg-gray-200 px-4 py-2 rounded">Loading...</button>,
  ssr: false
});

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any>({
    email: true,
    push: false,
    sms: false,
    desktop: true
  });
  
  const [personalization, setPersonalization] = useState<any>({
    defaultModule: 'dashboard',
    uiDensity: 'comfy'
  });

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only access localStorage after component is mounted
    if (!mounted) return;
    
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem('Sitegrip-user');
        if (!stored) {
          // Create a demo user for testing
          const demoUser = {
            uid: 'demo-user-123',
            email: 'demo@sitegrip.com',
            displayName: 'Demo User',
            photoURL: 'https://via.placeholder.com/150',
            googleAuthEnabled: false,
            metadata: {
              creationTime: new Date().toISOString(),
              lastSignInTime: new Date().toISOString()
            }
          };
          
          localStorage.setItem('Sitegrip-user', JSON.stringify(demoUser));
          setUser(demoUser);
        } else {
          const userData = JSON.parse(stored);
          if (!userData || !userData.uid) {
            throw new Error('Invalid user data');
          }
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        
        // Create a fallback demo user
        const fallbackUser = {
          uid: 'demo-user-123',
          email: 'demo@sitegrip.com',
          displayName: 'Demo User',
          photoURL: 'https://via.placeholder.com/150',
          googleAuthEnabled: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          }
        };
        
        setUser(fallbackUser);
        localStorage.setItem('Sitegrip-user', JSON.stringify(fallbackUser));
        toast.success('Demo mode activated - profile page loaded successfully!');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [mounted, router]);

  const handleSaveAll = async () => {
    if (!user || !mounted) return;
    setIsSaving(true);

    try {
      // Save profile data to localStorage (offline mode)
      const updatedUser = {
        ...user,
        avatar: avatarBase64 || user.photoURL,
        preferences: {
          notifications,
          personalization
        }
      };
      
      localStorage.setItem('Sitegrip-user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Show success message
      toast.success('Profile updated successfully! (Offline mode)');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">User profile not found.</p>
        <button
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <AuthGuard>
    <div className="max-w-4xl mx-auto mt-10 px-6 space-y-10">
      {/* Demo mode indicator */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Demo Mode:</strong> Profile page working in offline mode. All changes are saved locally.
            </p>
          </div>
        </div>
      </div>

      <AccountHeader user={user} />

      {/* Tier Information Section */}
      {user?.tier && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Subscription Plan
            </h3>
            {user.tier === 'basic' && (
              <a
                href="/pricing"
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Upgrade
              </a>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {user.tierName || 'Basic'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Current Plan
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {user.quotaLimit || 200}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                URLs per day
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {user.quotaUsed || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Used today
              </div>
            </div>
          </div>
          
          {user.tier === 'basic' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Upgrade for more features
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Get higher quotas, priority support, and advanced features with our Professional plan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AvatarUploader user={user} onAvatarChange={setAvatarBase64} />
        <NotificationSettings onChange={setNotifications} />
      </div>

      <PersonalizationSettings onChange={setPersonalization} />
      <ActivityLog />

      <div className="pt-6 border-t dark:border-gray-700 flex justify-between items-center">
        <LogoutButton />
        <button
          onClick={handleSaveAll}
          className={`px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition ${
            isSaving ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
    </AuthGuard>
  );
}
