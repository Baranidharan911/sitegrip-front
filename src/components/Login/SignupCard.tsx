'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface PlanInfo {
  plan?: string;
  price?: string;
  tier?: string;
}

export default function SignupCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [planInfo, setPlanInfo] = useState<PlanInfo>({});
  const { loading, signUp, signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();

  // Extract plan information from URL parameters
  useEffect(() => {
    if (searchParams) {
      const plan = searchParams.get('plan');
      const price = searchParams.get('price');
      const tier = searchParams.get('tier');
      
      if (plan || price || tier) {
        setPlanInfo({ plan: plan || '', price: price || '', tier: tier || '' });
        console.log('📋 Plan info extracted from URL:', { plan, price, tier });
      }
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validation
    if (!email || !password || !confirm) {
      setErrorMessage('Please fill in all fields');
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

    if (password !== confirm) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      await signUp(email, password, planInfo);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMessage('');
    try {
      await signInWithGoogle(planInfo);
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error('Failed to sign up with Google. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignup(e as any);
    }
  };

  // Format plan name for display
  const formatPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  return (
    <div className="p-10 bg-white dark:bg-gray-800 text-center max-w-md w-full mx-auto my-auto min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Create a Site Grip Account
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sign up to get started with powerful SEO tools.
        </p>

        {/* Plan Selection Display */}
        {planInfo.plan && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
              Selected Plan
            </div>
            <div className="text-lg font-bold text-purple-800 dark:text-purple-300">
              {formatPlanName(planInfo.plan)}
              {planInfo.price && (
                <span className="text-sm font-normal text-purple-600 dark:text-purple-400 ml-2">
                  ${planInfo.price}/month
                </span>
              )}
            </div>
          </div>
        )}

        {/* Google Sign Up Button */}
        <div className="mb-4">
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className={`flex items-center justify-center w-full ${
              loading ? 'bg-gray-100' : 'bg-green-500 hover:bg-green-600'
            } border border-green-600 text-white focus:ring-green-500 font-semibold py-3 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50`}
          >
            <Image src="/google-logo.png" alt="Google" width={20} height={20} className="w-5 h-5 mr-3" />
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Sign up with Google'
            )}
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />

          {errorMessage && (
            <p className="text-red-500 text-sm text-left">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

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
