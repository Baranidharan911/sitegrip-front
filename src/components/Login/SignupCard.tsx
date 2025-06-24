'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !confirm) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password !== confirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      localStorage.setItem('Sitegrip-user', JSON.stringify(newUser));
      setSuccess('Account created! Redirecting...');
      setTimeout(() => {
        window.location.href = '/indexing';
      }, 1500);
    } catch (error: any) {
      let msg = 'Signup failed.';
      if (error.code === 'auth/email-already-in-use') msg = 'Email is already in use.';
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (error.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="p-10 bg-white dark:bg-gray-800 text-center max-w-md w-full mx-auto my-auto min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Create a Site Grip Account
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sign up to get started.
        </p>

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
        <input
          type="password"
          placeholder="Confirm password"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <button
          onClick={handleSignup}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Account
        </button>

        <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
