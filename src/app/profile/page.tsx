'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AccountHeader from '@/components/Profile/AccountHeader';
import AvatarUploader from '@/components/Profile/AvatarUploader';
import NotificationSettings from '@/components/Profile/NotificationSettings';
import PersonalizationSettings from '@/components/Profile/PersonalizationSettings';
import ActivityLog from '@/components/Profile/ActivityLog';
import LogoutButton from '@/components/Profile/LogoutButton';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const { theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any>(null);
  const [personalization, setPersonalization] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('webwatch-user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchUserDoc(parsed.uid);
    }
  }, []);

  const fetchUserDoc = async (uid: string) => {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setUserDoc(data);
      if (data.avatar) setAvatarBase64(data.avatar);
      if (data.notifications) setNotifications(data.notifications);
      setPersonalization({
        defaultModule: data.defaultModule || '',
        uiDensity: data.uiDensity || 'comfy',
      });
    }
  };

  const handleSaveAll = async () => {
    if (!user) return;
    setIsSaving(true);

    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        avatar: avatarBase64 || '',
        notifications: notifications || {},
        defaultModule: personalization?.defaultModule || '',
        uiDensity: personalization?.uiDensity || 'comfy',
      },
      { merge: true }
    );

    // ✅ Update localStorage with avatar so AppHeader reflects new image
    const updatedUser = {
      ...user,
      avatar: avatarBase64 || '',
    };
    localStorage.setItem('webwatch-user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    setIsSaving(false);
    alert('Profile updated successfully!');
  };

  if (!user) {
    return <p className="p-6 text-center text-gray-500">Loading profile...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-6 space-y-10">
      <AccountHeader user={user} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AvatarUploader user={user} onAvatarChange={setAvatarBase64} />
        <NotificationSettings uid={user.uid} onChange={setNotifications} />
      </div>

      <PersonalizationSettings uid={user.uid} onChange={setPersonalization} />
      <ActivityLog uid={user.uid} />

      <div className="pt-6 border-t dark:border-gray-700 flex justify-between items-center">
        <LogoutButton />
        <button
          onClick={handleSaveAll}
          className={`px-5 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition ${
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
