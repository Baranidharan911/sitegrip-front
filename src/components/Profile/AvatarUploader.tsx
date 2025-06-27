'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface AvatarUploaderProps {
  user: { 
    uid: string;
    photoURL?: string | null;
    avatar?: string | null;
  };
  onAvatarChange: (base64: string | null) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ user, onAvatarChange }) => {
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Initialize with the user's existing avatar or photoURL
    const existingAvatar = user.avatar || user.photoURL || null;
    setSavedUrl(existingAvatar);
    onAvatarChange(existingAvatar);
  }, [user, onAvatarChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSavedUrl(base64);
        onAvatarChange(base64);
        toast.success('Avatar updated successfully');
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      setIsUploading(false);
    }
  };

  const removeAvatar = () => {
    setSavedUrl(null);
    onAvatarChange(null);
    toast.success('Avatar removed');
  };

  return (
    <div className="rounded-lg border dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Profile Picture
      </h3>
      
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {savedUrl ? (
            <img
              src={savedUrl}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-md object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 w-full">
          <label className="flex-1 text-center py-2 px-3 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition">
            {savedUrl ? 'Change Image' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          
          {savedUrl && (
            <button
              onClick={removeAvatar}
              disabled={isUploading}
              className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded-lg transition disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Recommended: Square image, max 2MB
        </p>
      </div>
    </div>
  );
};

export default AvatarUploader;
