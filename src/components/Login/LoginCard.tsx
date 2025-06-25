'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { errorMessage, loading, loginWithEmail, loginWithGoogle } = useAuth();

  useEffect(() => {
    const storedUser = localStorage.getItem('Sitegrip-user');
    if (storedUser) window.location.href = '/indexing';
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      // Basic validation, useAuth hook handles the rest
      return;
    }
    await loginWithEmail(email, password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="p-10 bg-white dark:bg-gray-800 text-center max-w-md w-full mx-auto my-auto min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back to Site Grip</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Sign in to continue to your account.</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center w-full mb-4 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
        >
          <img src="/google-logo.png" alt="Google" className="w-5 h-5 mr-3" />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:text-white" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:text-white" />

        <div className="flex items-center mb-6 justify-start">
          <input type="checkbox" id="rememberMe" className="h-4 w-4" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          <label htmlFor="rememberMe" className="ml-2 text-gray-700 dark:text-gray-300 text-sm">Keep me signed in</label>
        </div>

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        <button onClick={handleLogin} disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In with Email'}
        </button>

        <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm">
          Not a member yet?{' '}
          <a href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">Create an account</a>
        </p>
      </div>
    </div>
  );
}
