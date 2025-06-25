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

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const userStr = localStorage.getItem('Sitegrip-user');
      let userId = '';
      if (userStr) {
        const userData = JSON.parse(userStr);
        // Handle both nested and direct user object structures
        userId = userData.user?.uid || userData.uid || '';
      }

      if (!userId) {
        console.log('No user ID found, user not logged in');
        setIsAuthenticated(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/auth/google/status?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      
      if (data.authenticated) {
        // If authenticated, get user properties
        try {
          const propertiesResponse = await fetch(`${apiUrl}/api/gsc/properties?user_id=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (propertiesResponse.ok) {
            const propertiesData = await propertiesResponse.json();
            setProperties(propertiesData.properties || []);
          }
        } catch (error) {
          console.warn('Failed to fetch properties:', error);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const userStr = localStorage.getItem('Sitegrip-user');
      let userId = '';
      if (userStr) {
        const userData = JSON.parse(userStr);
        // Handle both nested and direct user object structures
        userId = userData.user?.uid || userData.uid || '';
      }

      if (!userId) {
        throw new Error('User not logged in. Please login first.');
      }

      // Get Google OAuth URL
      const response = await fetch(`${apiUrl}/api/auth/google/url?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to Google OAuth
        window.location.href = data.auth_url;
      } else {
        throw new Error(data.message || 'Failed to get auth URL');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      onAuthError?.(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const userStr = localStorage.getItem('Sitegrip-user');
      let userId = '';
      if (userStr) {
        const userData = JSON.parse(userStr);
        // Handle both nested and direct user object structures
        userId = userData.user?.uid || userData.uid || '';
      }

      if (!userId) {
        throw new Error('User not logged in.');
      }

      const response = await fetch(`${apiUrl}/api/auth/google/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
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

  // Handle OAuth callback (call this from your callback page)
  const handleOAuthCallback = async (code: string, state: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
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
    <div className={`p-6 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Google API Integration
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Connect your Google account to enable real-time indexing
          </p>
        </div>
        
        <div className={`w-3 h-3 rounded-full ${
          isAuthenticated ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'
          } border`}>
            <h4 className={`font-medium mb-2 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-800'
            }`}>
              Required Permissions:
            </h4>
            <ul className={`text-sm space-y-1 ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <li>• Google Indexing API access</li>
              <li>• Search Console read/write access</li>
              <li>• Domain verification status</li>
            </ul>
          </div>
          
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isLoading ? 'Connecting...' : 'Connect Google Account'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'
          } border`}>
            <div className="flex items-center gap-2 mb-2">
              <svg className={`w-5 h-5 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className={`font-medium ${
                theme === 'dark' ? 'text-green-400' : 'text-green-800'
              }`}>
                Connected Successfully
              </span>
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-green-300' : 'text-green-700'
            }`}>
              Real-time indexing is now enabled for your domains
            </p>
          </div>
          
          {properties.length > 0 && (
            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            } border`}>
              <h4 className={`font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Connected Properties:
              </h4>
              <ul className={`text-sm space-y-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
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
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {isLoading ? 'Disconnecting...' : 'Disconnect Account'}
          </button>
        </div>
      )}
    </div>
  );
}

// Export the callback handler for use in callback page
export { GoogleAuthButton }; 