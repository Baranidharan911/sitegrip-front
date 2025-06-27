'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import AccountHeader from '@/components/Profile/AccountHeader';
import AvatarUploader from '@/components/Profile/AvatarUploader';
import NotificationSettings from '@/components/Profile/NotificationSettings';
import PersonalizationSettings from '@/components/Profile/PersonalizationSettings';
import ActivityLog from '@/components/Profile/ActivityLog';
import LogoutButton from '@/components/Profile/LogoutButton';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
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

  // API URL from environment or default to the deployed URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem('Sitegrip-user');
        if (!stored) {
          router.replace('/login');
          return;
        }

        const userData = JSON.parse(stored);
        if (!userData || !userData.uid) {
          throw new Error('Invalid user data');
        }

        // Try to fetch user profile from the backend to verify authentication
        try {
          const response = await fetch(`${API_URL}/api/auth/auth/user/${userData.uid}`);
          if (response.ok) {
            const profileData = await response.json();
            if (profileData.success) {
              // Merge backend data with local data
              const updatedUser = {
                ...userData,
                displayName: profileData.display_name || userData.displayName,
                email: profileData.email || userData.email,
                photoURL: profileData.photo_url || userData.photoURL,
                googleAuthEnabled: profileData.google_auth_enabled
              };
              
              setUser(updatedUser);
              localStorage.setItem('Sitegrip-user', JSON.stringify(updatedUser));
            } else {
              setUser(userData);
            }
          } else {
            // If backend verification fails, still use local data
            setUser(userData);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // If API call fails, still use local data
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast.error('Authentication error. Please sign in again.');
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, API_URL]);

  const handleSaveAll = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Prepare update data
      const updateData = {
        display_name: user.displayName,
        avatar: avatarBase64 || user.photoURL,
        preferences: {
          notifications,
          personalization
        }
      };
      
      // Save to backend Firebase
      try {
        const response = await fetch(`${API_URL}/api/auth/auth/user/${user.uid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          const updatedData = await response.json();
          console.log('Profile updated in Firebase:', updatedData);
        } else {
          console.error('Failed to update profile in backend');
        }
      } catch (backendError) {
        console.error('Backend update error:', backendError);
        // Continue with local update even if backend fails
      }
      
      // Save profile data to localStorage as cache
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
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
