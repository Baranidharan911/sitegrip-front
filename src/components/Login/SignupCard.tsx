'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function SignupCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { errorMessage, loading, signupWithEmail } = useAuth();
  const [success, setSuccess] = useState(''); // Kept for immediate UI feedback

  const handleSignup = async () => {
    if (!email || !password || !confirm) {
      // Basic validation, useAuth hook handles the rest
      return;
    }

    if (password !== confirm) {
      // This check remains in the component
      return;
    }
    
    await signupWithEmail(email, password);
    // Success message can be set based on absence of error after call
    // but the hook redirects, so this may not be seen.
  };

  return (
    <div className="p-10 bg-white dark:bg-gray-800 text-center max-w-md w-full mx-auto my-auto min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create a Site Grip Account</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Sign up to get started.</p>

        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:text-white" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:text-white" />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full p-3 mb-4 border rounded-lg dark:bg-gray-700 dark:text-white" />

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <button onClick={handleSignup} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline dark:text-blue-400">Sign In</a>
        </p>
      </div>
    </div>
  );
}
