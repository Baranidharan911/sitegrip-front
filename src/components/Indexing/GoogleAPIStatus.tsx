'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function GoogleAPIStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';

  useEffect(() => {
    checkGoogleAPIStatus();

    const handleFocus = () => {
      console.log('Window focused – rechecking Google auth status');
      checkGoogleAPIStatus();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'Sitegrip-user') {
        console.log('localStorage changed – rechecking Google auth status');
        checkGoogleAPIStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkGoogleAPIStatus = async () => {
    try {
      const userStr = localStorage.getItem('Sitegrip-user');
      let userId = '';
      let localAuth = false;
      let localProps: any[] = [];

      if (userStr) {
        const userData = JSON.parse(userStr);
        userId = userData.user?.uid || userData.uid || '';
        localAuth = userData.user?.google_auth_enabled || userData.google_auth_enabled || false;
        localProps = userData.user?.search_console_properties || userData.search_console_properties || [];
      }

      if (!userId) {
        console.warn('GoogleAPIStatus: No user ID found – skipping check');
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      if (localAuth) {
        setIsConnected(true);
        setProperties(localProps);
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${apiUrl}/api/auth/google/status?user_id=${userId}`);
      const data = await res.json();
      setIsConnected(data.authenticated);

      if (data.authenticated) {
        const profile = await fetch(`${apiUrl}/api/auth/user/${userId}`);
        const profileData = await profile.json();
        setProperties(profileData.search_console_properties || []);
      }
    } catch (err) {
      console.error('GoogleAPIStatus: Status check failed', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const userStr = localStorage.getItem('Sitegrip-user');
      let userId = '';
      if (userStr) {
        const userData = JSON.parse(userStr);
        userId = userData.user?.uid || userData.uid || '';
      }

      if (!userId) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`${apiUrl}/api/auth/google/url?user_id=${userId}`);
      const data = await res.json();

      if (data.url || data.auth_url) {
        window.location.href = data.url || data.auth_url;
      } else {
        console.error('Google auth URL fetch failed:', data.message);
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('Google auth failed:', err);
      window.location.href = '/login';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            Checking Google API connection...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <div>
            <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Google API Integration
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {isConnected
                ? `Connected • ${properties.length} properties`
                : 'Not connected • Click to enable real-time indexing'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={checkGoogleAPIStatus}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            title="Refresh status"
          >
            ↻
          </button>
          {!isConnected && (
            <button
              onClick={handleGoogleAuth}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {isConnected && properties.length > 0 && (
        <div className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <div className={`text-xs font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Verified Domains:
          </div>
          <div className="space-y-1">
            {properties.slice(0, 3).map((prop, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {prop.property_url}
                </span>
              </div>
            ))}
            {properties.length > 3 && (
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                +{properties.length - 3} more domains
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
