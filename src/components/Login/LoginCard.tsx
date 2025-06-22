'use client';

import { useEffect, useState } from 'react';
import { auth, provider } from '@/lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  type User,
} from 'firebase/auth';

export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('webwatch-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      window.location.href = '/indexing';
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      setUser(loggedInUser);
      localStorage.setItem('webwatch-user', JSON.stringify(loggedInUser));
      window.location.href = '/indexing';
    } catch (error: any) {
      console.error('Google Login failed:', error);
      setErrorMessage(error?.message || 'Google login failed');
    }
  };

  const handleEmailPasswordLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = result.user;
      setUser(loggedInUser);
      if (rememberMe) {
        localStorage.setItem('webwatch-user', JSON.stringify(loggedInUser));
      } else {
        localStorage.removeItem('webwatch-user');
      }
      window.location.href = '/indexing';
    } catch (error: any) {
      let msg = 'Login failed.';
      if (error.code === 'auth/invalid-email') msg = 'Invalid email.';
      else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') msg = 'Invalid credentials.';
      else if (error.code === 'auth/user-disabled') msg = 'Account is disabled.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="p-10 bg-white dark:bg-gray-800 text-center max-w-md w-full mx-auto my-auto min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome Back to WebWatch Pro
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sign in to continue to your account.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full mb-4 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <img src="/google-logo.png" alt="Google" className="w-5 h-5 mr-3" />
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <input
          type="email"
          placeholder="Email address"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center mb-6 justify-start">
          <input
            type="checkbox"
            id="rememberMe"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" className="ml-2 text-gray-700 dark:text-gray-300 text-sm">
            Keep me signed in until I sign out
          </label>
        </div>

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        <button
          onClick={handleEmailPasswordLogin}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Sign In
        </button>

        <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm">
          Not a member yet?{' '}
          <a href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
