'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AvatarUploaderProps {
  user: { uid: string };
  onAvatarChange: (base64: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ user, onAvatarChange }) => {
  const [savedUrl, setSavedUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);
      const data = snapshot.data();
      if (data?.avatar) {
        setSavedUrl(data.avatar);
        onAvatarChange(data.avatar);
      }
    };
    fetchAvatar();
  }, [user.uid, onAvatarChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSavedUrl(base64);
      onAvatarChange(base64);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
        Upload Profile Picture
      </h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:rounded file:border-gray-300 file:text-sm file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />
      {savedUrl && (
        <div className="pt-4">
          <img
            src={savedUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full border shadow"
          />
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;
