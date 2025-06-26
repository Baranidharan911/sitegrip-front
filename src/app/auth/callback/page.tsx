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

        // Load current user from localStorage to validate state
        const userStr = localStorage.getItem('Sitegrip-user');
        let userId = '';
        if (userStr) {
          const userData = JSON.parse(userStr);
          userId = userData.user?.uid || userData.uid || '';
        }

        if (!userId || (state !== userId && !state.startsWith('user_'))) {
          setError('Invalid state parameter – security check failed');
          setStatus('Authentication failed');
          return;
        }

        // Call backend to complete OAuth
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (data.success && data.user) {
          setStatus('Authentication successful! Redirecting...');

          // Update localStorage with Google-integrated user
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
            google_integration: true,
            message: data.message
          }));

          setTimeout(() => router.push('/indexing'), 1500);
        } else {
          setError(data.message || 'Authentication failed');
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
      <div className="max-w-md w-full p-8 space-y-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Google Authentication
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>

        {status.includes('Exchanging') && (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {status === 'Authentication successful! Redirecting...' && (
          <div className="text-green-600 dark:text-green-400 text-lg font-semibold">
            ✅ Success
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 space-y-2">
            <div className="font-semibold">❌ Error</div>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => router.push('/indexing')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Indexing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loading...
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Processing authentication
          </p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
