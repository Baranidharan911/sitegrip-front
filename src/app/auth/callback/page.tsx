'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setError(`OAuth error: ${error}`);
          setStatus('Authentication failed');
          return;
        }

        if (!code || !state) {
          setError('Missing authorization code or state parameter');
          setStatus('Authentication failed');
          return;
        }

        setStatus('Exchanging authorization code for tokens...');

        // Get user data from localStorage to verify state
        const userStr = localStorage.getItem('Sitegrip-user');
        let userId = '';
        if (userStr) {
          const userData = JSON.parse(userStr);
          userId = userData.user?.uid || userData.uid || '';
        }

        if (state !== userId && !state.startsWith('user_')) {
          setError('Invalid state parameter - security check failed');
          setStatus('Authentication failed');
          return;
        }

        // Exchange code for tokens
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            state: state
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('Authentication successful! Updating profile...');
          
          // Update localStorage with the new user data including Google credentials
          if (data.user) {
            localStorage.setItem('Sitegrip-user', JSON.stringify({
              user: {
                uid: data.user.uid,
                email: data.user.email,
                display_name: data.user.display_name,
                photo_url: data.user.photo_url,
                google_auth_enabled: data.user.google_auth_enabled,
                indexing_api_enabled: data.user.indexing_api_enabled,
                search_console_properties: data.user.search_console_properties
              },
              success: true,
              message: data.message,
              google_integration: true
            }));
          }
          
          // Wait a moment then redirect to indexing page
          setTimeout(() => {
            router.push('/indexing');
          }, 2000);
        } else {
          setError(data.message || 'Failed to complete authentication');
          setStatus('Authentication failed');
        }

      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Google Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {status}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {status === 'Processing...' || status.includes('Exchanging') ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : null}

          {status === 'Authentication successful! Redirecting...' ? (
            <div className="text-center">
              <div className="text-green-600 dark:text-green-400 text-lg font-medium">
                ✅ Success!
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Redirecting to indexing page...
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 text-lg font-medium">
                ❌ Error
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {error}
              </p>
              <button
                onClick={() => router.push('/indexing')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Return to Indexing
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Loading...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Processing authentication
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 