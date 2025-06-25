'use client';

import React, { useState, useEffect } from 'react';

export default function DebugUserData() {
  const [userData, setUserData] = useState<any>(null);
  const [rawData, setRawData] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('Sitegrip-user');
    if (stored) {
      setRawData(stored);
      try {
        const parsed = JSON.parse(stored);
        setUserData(parsed);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const refreshData = () => {
    const stored = localStorage.getItem('Sitegrip-user');
    if (stored) {
      setRawData(stored);
      try {
        const parsed = JSON.parse(stored);
        setUserData(parsed);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      setUserData(null);
      setRawData('');
    }
  };

  const clearData = () => {
    localStorage.removeItem('Sitegrip-user');
    setUserData(null);
    setRawData('');
  };

  const testLogin = () => {
    // Simulate the login response structure based on the Firestore data
    const testUserData = {
      "success": true,
      "user": {
        "uid": "OCYAEEoUBYeouUicGlKxdYKDPaD2",
        "email": "bbharanidharan43@gmail.com",
        "display_name": "Baranidharan B",
        "photo_url": "https://lh3.googleusercontent.com/a/ACg8ocL3UY9lRX_yaFiTvc",
        "google_auth_enabled": true,
        "indexing_api_enabled": true
      },
      "message": "Authentication successful with Google API access",
      "google_integration": true
    };
    
    localStorage.setItem('Sitegrip-user', JSON.stringify(testUserData));
    refreshData();
  };

  const testBackend = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log('Testing backend at:', apiUrl);
      
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      
      alert(`Backend Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Backend Error: ${error}`);
    }
  };

  const testGoogleStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const userId = userData?.user?.uid || userData?.uid || '';
      
      if (!userId) {
        alert('No user ID found. Click "Test Login" first.');
        return;
      }
      
      console.log('Testing Google status for user:', userId);
      
      const response = await fetch(`${apiUrl}/api/auth/google/status?user_id=${userId}`);
      const data = await response.json();
      
      alert(`Google Status API\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Google Status Error: ${error}`);
    }
  };

  const testGoogleOAuth = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const userId = userData?.user?.uid || userData?.uid || '';
      
      if (!userId) {
        alert('No user ID found. Click "Test Login" first.');
        return;
      }
      
      console.log('Testing Google OAuth URL for user:', userId);
      
      const response = await fetch(`${apiUrl}/api/auth/google/url?user_id=${userId}`);
      const data = await response.json();
      
      alert(`Google OAuth URL API\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Google OAuth Error: ${error}`);
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Debug: User Data</h3>
        <div className="space-x-2">
          <button
            onClick={refreshData}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={testLogin}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Login
          </button>
          <button
            onClick={testBackend}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Backend
          </button>
          <button
            onClick={testGoogleStatus}
            className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Test Google Status
          </button>
          <button
            onClick={testGoogleOAuth}
            className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
          >
            Test Google OAuth
          </button>
          <button
            onClick={clearData}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Raw localStorage data:</h4>
          <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
            {rawData || 'No data found'}
          </pre>
        </div>

        <div>
          <h4 className="font-medium mb-2">Parsed data:</h4>
          <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
            {userData ? JSON.stringify(userData, null, 2) : 'No data found'}
          </pre>
        </div>

        <div>
          <h4 className="font-medium mb-2">User ID extraction:</h4>
          <div className="text-sm">
            <p><strong>userData.uid:</strong> {userData?.uid || 'undefined'}</p>
            <p><strong>userData.user?.uid:</strong> {userData?.user?.uid || 'undefined'}</p>
            <p><strong>Final UID:</strong> {userData?.user?.uid || userData?.uid || 'No UID found'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Google Auth Status:</h4>
          <div className="text-sm">
            <p><strong>google_auth_enabled:</strong> {userData?.user?.google_auth_enabled?.toString() || 'undefined'}</p>
            <p><strong>indexing_api_enabled:</strong> {userData?.user?.indexing_api_enabled?.toString() || 'undefined'}</p>
            <p><strong>google_integration:</strong> {userData?.google_integration?.toString() || 'undefined'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 