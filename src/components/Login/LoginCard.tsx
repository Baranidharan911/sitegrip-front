'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('Sitegrip-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.uid) {
          router.push('/profile');
        }
      } catch (err) {
        // Invalid stored data, clear it
        localStorage.removeItem('Sitegrip-user');
      }
    }
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Email and password are required');
      return;
    }
    
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Email login error:', error);
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple clicks
    if (loading) return;
    
    setErrorMessage('');
    try {
      console.log('🔘 Google login button clicked');
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      // Error is already handled by signInWithGoogle
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEmailLogin(e as any);
    }
  };

  return (
    <div className="p-10 bg-white dark:bg-gray-800 text-center max-w-md w-full mx-auto my-auto min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome Back to Site Grip
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sign in to continue to your account.
        </p>

        {/* Google Sign In Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`flex items-center justify-center w-full ${
              loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 cursor-pointer'
            } border border-green-600 text-white focus:ring-green-500 font-semibold py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50`}
          >
            <img src="/google-logo.png" alt="Google" className="w-5 h-5 mr-3" />
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              'Sign in with Google'
            )}
          </button>
          
          <div className="mt-2 p-2 rounded text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Google Integration:</span>
            </div>
            <ul className="text-xs space-y-1 ml-4">
              <li>• Real Google Search Console integration</li>
              <li>• Actual URL indexing via Google APIs</li>
              <li>• Live domain verification & management</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />

          <div className="flex items-center justify-start">
            <input
              type="checkbox"
              id="rememberMe"
              className="h-4 w-4"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="ml-2 text-gray-700 dark:text-gray-300 text-sm">
              Keep me signed in
            </label>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm text-left">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In with Email'
            )}
          </button>
        </form>

        <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm">
          Not a member yet?{' '}
          <a href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
            Create an account
          </a>
        </p>
        
        <div className="mt-4 text-center">
          <a href="/debug" className="text-xs text-gray-500 hover:text-gray-700">
            Debug Connection Issues
          </a>
        </div>
      </div>
    </div>
  );
}
