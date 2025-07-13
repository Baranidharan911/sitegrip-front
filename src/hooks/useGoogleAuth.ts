'use client';

import { useState, useEffect } from 'react';
import { AuthResponse, AuthState, GSCProperty } from '@/types/indexing';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    properties: [],
    indexStatuses: []
  });
  const [debug, setDebug] = useState<any>(null);

  function getApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }

  const getUserId = (): string | null => {
    try {
      const userData = localStorage.getItem('Sitegrip-user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.user?.uid || user.uid || null;
      }
    } catch (err) {
      console.warn('Failed to parse user data from localStorage');
    }
    return null;
  };

  const checkAuthStatus = async (userId: string): Promise<AuthState> => {
    try {
      const apiUrl = getApiBaseUrl();
      console.log('[useGoogleAuth] Checking auth status for userId:', userId);
      const response = await fetch(`${apiUrl}/api/status/${userId}`);
      const data = await response.json();
      setDebug({ userId, statusResponse: data });
      if (!response.ok) {
        throw new Error('Failed to check auth status');
      }
      return {
        isAuthenticated: data.is_authenticated,
        properties: data.properties || [],
        indexStatuses: data.index_statuses || [],
        selectedProperty: data.properties?.[0]
      };
    } catch (err) {
      console.error('Failed to check auth status:', err);
      setDebug({ userId, error: err });
      throw err;
    }
  };

  const getGoogleAuthUrl = async (userId: string): Promise<string> => {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/api/google/url?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      
      const data = await response.json();
      return data.auth_url;
    } catch (err) {
      console.error('Failed to get auth URL:', err);
      throw err;
    }
  };

  const initiateGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      const authUrl = await getGoogleAuthUrl(userId);
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/api/google/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to revoke access');
      }
      
      const data = await response.json();
      if (data.success) {
        setAuthState({
          isAuthenticated: false,
          properties: [],
          indexStatuses: []
        });
      } else {
        throw new Error(data.message || 'Failed to revoke access');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke access');
    } finally {
      setLoading(false);
    }
  };

  const refreshAuthStatus = async () => {
    const userId = getUserId();
    if (userId) {
      try {
        const newState = await checkAuthStatus(userId);
        setAuthState(newState);
      } catch (err) {
        console.error('Failed to refresh auth status:', err);
      }
    }
  };

  // Auto-check auth status on mount
  useEffect(() => {
    refreshAuthStatus();
  }, []);

  return {
    loading,
    error,
    authState,
    initiateGoogleAuth,
    revokeAccess,
    refreshAuthStatus,
    setError,
    debug
  };
};
