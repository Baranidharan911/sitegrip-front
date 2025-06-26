'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface GoogleAuthButtonProps {
  onAuthSuccess?: (properties: any[]) => void;
  onAuthError?: (error: string) => void;
}

export default function GoogleAuthButton({ onAuthSuccess, onAuthError }: GoogleAuthButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const { theme } = useTheme();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://webwatch-api-pu22v4ao5a-uc.a.run.app';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userStr = localStorage.getItem('Sitegrip-user');
      let userId = '';
      let localGoogleAuthEnabled = false;
      let localProperties: any[] = [];

      if (userStr) {
        const userData = JSON.parse(userStr);
        userId = userData.user?.uid || userData.uid || '';
        localGoogleAuthEnabled = userData.user?.google_auth_enabled || userData.google_auth_enabled || false;
        localProperties = userData.user?.search_console_properties || userData.search_console_properties || [];
      }

      if (!userId) {
        setIsAuthenticated(false);
        return;
      }

      if (localGoogleAuthEnabled) {
        setIsAuthenticated(true);
        setProperties(localProperties);
        return;
      }

      const response = await fetch(`${apiUrl}/api/auth/google/status?user_id=${userId}`);
      const data = await response.json();
      setIsAuthenticated(data.authenticated);

      if (data.authenticated) {
        const propertiesResponse = await fetch(`${apiUrl}/api/gsc/properties?user_id=${userId}`);
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json();
          setProperties(propertiesData.properties || []);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('Sitegrip-user');
      let userId = '';
      if (userStr) {
        const userData = JSON.parse(userStr);
        userId = userData.user?.uid || userData.uid || '';
      }

      if (!userId) throw new Error('User not logged in. Please login first.');

      const response = await fetch(`${apiUrl}/api/auth/google/url?user_id=${userId}`);
      const data = await response.json();

      if (data.url || data.auth_url) {
        window.location.href = data.url || data.auth_url;
      } else {
        throw new Error(data.message || 'Failed to get auth URL');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      onAuthError?.(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('Sitegrip-user');
      let userId = '';
      if (userStr) {
        const userData = JSON.parse(userStr);
        userId = userData.user?.uid || userData.uid || '';
      }

      if (!userId) throw new Error('User not logged in.');

      const response = await fetch(`${apiUrl}/api/auth/google/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(false);
        setProperties([]);
        onAuthSuccess?.([]);
      } else {
        throw new Error(data.message || 'Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect failed:', error);
      onAuthError?.(error instanceof Error ? error.message : 'Disconnect failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state })
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setProperties(data.properties || []);
        onAuthSuccess?.(data.properties || []);
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('OAuth callback failed:', error);
      onAuthError?.(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Google API Integration
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Connect your Google account to enable real-time indexing
          </p>
        </div>
        <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {!isAuthenticated ? (
        <>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
              Required Permissions:
            </h4>
            <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              <li>• Google Indexing API access</li>
              <li>• Search Console read/write access</li>
              <li>• Domain verification status</li>
            </ul>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className={`w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? 'Connecting...' : 'Connect Google Account'}
          </button>
        </>
      ) : (
        <>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>Connected Successfully</span>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
              Real-time indexing is now enabled for your domains
            </p>
          </div>

          {properties.length > 0 && (
            <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Connected Properties:
              </h4>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {properties.map((prop, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    {prop.property_url}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect Account'}
          </button>
        </>
      )}
    </div>
  );
}
