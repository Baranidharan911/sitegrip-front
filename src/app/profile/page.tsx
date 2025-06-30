'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

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
  const { theme } = useTheme();
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
  );
}
