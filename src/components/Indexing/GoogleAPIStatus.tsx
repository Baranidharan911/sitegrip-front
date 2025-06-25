'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function GoogleAPIStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    checkGoogleAPIStatus();
  }, []);

  const handleGoogleAuth = async () => {
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
        // If no user is logged in, redirect to login page
        window.location.href = '/login';
        return;
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
        console.error('Failed to get auth URL:', data.message);
        // Fallback to login page
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      // Fallback to login page
      window.location.href = '/login';
    }
  };

  const checkGoogleAPIStatus = async () => {
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
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/api/auth/google/status?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setIsConnected(data.authenticated);
      
      // If connected, get user profile to show properties
      if (data.authenticated && userId) {
        const profileResponse = await fetch(`${apiUrl}/api/auth/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProperties(profileData.user.search_console_properties || []);
        }
      }
    } catch (error) {
      console.error('Error checking Google API status:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
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
    <div className={`p-4 rounded-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <div>
            <h3 className={`font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Google API Integration
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {isConnected 
                ? `Connected • ${properties.length} properties available`
                : 'Not connected • Sign in with Google to enable real-time indexing'
              }
            </p>
          </div>
        </div>

        {!isConnected && (
          <button
            onClick={handleGoogleAuth}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>

      {isConnected && properties.length > 0 && (
        <div className={`mt-3 p-3 rounded ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className={`text-xs font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Verified Domains:
          </div>
          <div className="space-y-1">
            {properties.slice(0, 3).map((prop, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {prop.property_url}
                </span>
              </div>
            ))}
            {properties.length > 3 && (
              <div className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                +{properties.length - 3} more domains
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 