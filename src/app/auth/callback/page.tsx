// src/app/auth/callback/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your authentication...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [processed, setProcessed] = useState(false);
  const router = useRouter();
  const { refreshAuthStatus } = useGoogleAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (processed) return;
    setProcessed(true);

    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const user_id = urlParams.get('user_id');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          setErrorDetails(error);
          return;
        }

        if (success === 'true' && user_id) {
          setStatus('success');
          setMessage('Authentication successful! Fetching real user details...');

          try {
            const response = await fetch(`${API_URL}/api/auth/user/${user_id}`, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) throw new Error(`Failed to fetch user profile: ${response.status}`);

            const userData = await response.json();

            if (userData.success) {
              const userToSave = {
                uid: userData.uid,
                email: userData.email || '',
                displayName: userData.display_name || '',
                photoURL: userData.photo_url || '',
                googleAuthEnabled: userData.google_auth_enabled,
                properties: userData.search_console_properties || []
              };

              localStorage.setItem('Sitegrip-user', JSON.stringify(userToSave));
              localStorage.removeItem('Sitegrip-temp-user-id');

              setMessage('Authentication successful! Redirecting...');
              toast.success('Signed in successfully');
              await refreshAuthStatus();
              window.location.replace('/dashboard/overview');
            } else {
              throw new Error('Invalid user data received');
            }
          } catch (e: any) {
            setStatus('error');
            setMessage(`Failed to load user profile: ${e.message}`);
            toast.error(`Profile fetch failed: ${e.message}`);
          }
        } else {
          const code = urlParams.get('code');
          const state = urlParams.get('state');

          if (code && state) {
            const processedCodes = JSON.parse(localStorage.getItem('processed-oauth-codes') || '[]');
            if (processedCodes.includes(code)) {
              setStatus('error');
              setMessage('OAuth code already used. Please login again.');
              setTimeout(() => router.push('/login'), 3000);
              return;
            }
            processedCodes.push(code);
            if (processedCodes.length > 10) processedCodes.shift();
            localStorage.setItem('processed-oauth-codes', JSON.stringify(processedCodes));

            // Use the state parameter as the user ID (which we set in the OAuth URL)
            const userId = state;

            const response = await fetch(`${API_URL}/api/auth/google/callback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, state: userId })
            });

            const data = await response.json();

            if (data.success) {
              const userData = {
                uid: userId, // Use the userId from state parameter
                email: data.data?.email || '',
                displayName: data.data?.name || '',
                photoURL: '',
                googleAuthEnabled: true,
                properties: []
              };

              localStorage.setItem('Sitegrip-user', JSON.stringify(userData));
              localStorage.removeItem('Sitegrip-temp-user-id');

              setStatus('success');
              setMessage('Signed in successfully. Redirecting...');
              toast.success('Signed in successfully');
              await refreshAuthStatus();
              window.location.replace('/dashboard/overview');
            } else {
              throw new Error(data.message || 'Google auth failed');
            }
          } else {
            setStatus('error');
            setMessage('Missing authentication parameters. Try again.');
          }
        }
      } catch (err: any) {
        setStatus('error');
        setMessage('Authentication callback failed');
        setErrorDetails(err.message || 'Unknown error');
        toast.error('Authentication failed');
      }
    };

    handleAuthCallback();
  }, [API_URL, processed, router, refreshAuthStatus]);

  const processManualData = () => {
    try {
      const userData = JSON.parse(manualInput.trim());
      if (!userData?.uid) throw new Error('Missing UID');

      const userToSave = {
        uid: userData.uid,
        email: userData.email || '',
        displayName: userData.display_name || userData.displayName || '',
        photoURL: userData.photo_url || userData.photoURL || '',
        googleAuthEnabled: userData.google_auth_enabled ?? true,
        properties: userData.search_console_properties || userData.properties || []
      };

      localStorage.setItem('Sitegrip-user', JSON.stringify(userToSave));
      localStorage.removeItem('Sitegrip-temp-user-id');

      setStatus('success');
      setMessage('Manual data processed. Redirecting...');
      toast.success('Signed in manually');
      setTimeout(() => router.push('/dashboard/overview'), 1500);
    } catch (e) {
      toast.error('Failed to process manual data');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {status === 'loading' ? 'Processing...' : status === 'success' ? 'Success' : 'Error'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{message}</p>
          {errorDetails && (
            <p className="mt-2 text-red-500 text-xs">{errorDetails}</p>
          )}
        </div>

        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Return to Login
              </button>
              <button
                onClick={() => router.push('/debug')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Debug Page
              </button>
              <button
                onClick={() => setManualMode(!manualMode)}
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md"
              >
                {manualMode ? 'Hide Manual Input' : 'Manual Input'}
              </button>
            </div>

            {manualMode && (
              <div className="space-y-2">
                <textarea
                  className="w-full h-32 text-sm p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
                  placeholder='{"uid": "abc", "email": "you@example.com", ...}'
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
                <button
                  onClick={processManualData}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md"
                  disabled={!manualInput}
                >
                  Submit Manual Data
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
