'use client';

import React, { useState } from 'react';
import { Search, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GoogleSearchConsoleConnectProps {
  onConnect: () => void;
  onCancel: () => void;
}

export default function GoogleSearchConsoleConnect({ onConnect, onCancel }: GoogleSearchConsoleConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Get the current user ID
      const userData = localStorage.getItem('Sitegrip-user');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      const userId = user.uid || user.user?.uid;
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Get Google OAuth URL from backend with user ID
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/auth/google/url?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get OAuth URL');
      }

      const data = await response.json();
      
      if (data.success && data.data?.authUrl) {
        // Store user ID for callback
        localStorage.setItem('Sitegrip-temp-user-id', userId);
        
        // Add the user ID as state parameter to the OAuth URL
        const authUrl = new URL(data.data.authUrl);
        authUrl.searchParams.set('state', userId);
        
        // Redirect to Google OAuth
        window.location.href = authUrl.toString();
      } else {
        console.error('Invalid OAuth URL response:', data);
        throw new Error(data.message || 'Invalid OAuth URL response');
      }
    } catch (error) {
      console.error('Failed to connect Google Search Console:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect Google Search Console');
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center">
        <Search className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Connect Google Search Console
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          To use Search Console features, you need to connect your Google account with the necessary permissions.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            What you'll get access to:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              View your Search Console properties
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Discover URLs from your verified sites
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Access search performance data
            </li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Requirements:
          </h4>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>• Verified properties in Google Search Console</li>
            <li>• Owner or Full access to your properties</li>
            <li>• Google account with API access enabled</li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Connect Google Search Console
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isConnecting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          You can still use other indexing features without Search Console access.
        </p>
      </div>
    </div>
  );
} 