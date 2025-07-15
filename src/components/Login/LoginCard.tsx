'use client';

import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          router.push('/dashboard/overview');
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
    <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center">
      <div className="w-full bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/40 p-6 sm:p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white text-center">Sign in to your account</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Access your dashboard and analytics.</p>

        {/* Google Sign In Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`flex items-center justify-center w-full gap-2 py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-200 border-2 border-green-500 bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 focus:ring-2 focus:ring-green-400 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed animate-in fade-in ${loading ? 'cursor-not-allowed' : ''}`}
          >
            <Image src="/google-logo.png" alt="Google" width={20} height={20} className="w-5 h-5 mr-2" />
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
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          <span className="mx-4 text-gray-500 dark:text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-green-400 focus:border-transparent peer bg-white/80 dark:bg-gray-800/80 transition-all"
              required
            />
            <label className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-green-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-1 rounded">
              Email address
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-green-400 focus:border-transparent peer bg-white/80 dark:bg-gray-800/80 transition-all"
              required
            />
            <label className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-green-600 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-1 rounded">
              Password
            </label>
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 focus:ring-green-400"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" className="ml-2 text-gray-700 dark:text-gray-300 text-sm">
                Keep me signed in
              </label>
            </div>
            <a href="#" className="text-sm text-green-600 hover:underline dark:text-green-400">Forgot password?</a>
          </div>
          {errorMessage && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm text-left">
              {errorMessage}
            </motion.p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 transition-all duration-200"
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
        <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm text-center">
          Not a member yet?{' '}
          <a href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
