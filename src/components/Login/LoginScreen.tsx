'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import LoginCard from '@/components/Login/LoginCard';
import Image from 'next/image';

export default function LoginScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their intended destination or dashboard
  useEffect(() => {
    if (!loading && user) {
      // Add a small delay to ensure the authentication process is complete
      const redirectTimer = setTimeout(() => {
        // Check if there's a stored redirect path
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath && redirectPath !== '/login' && redirectPath !== '/signup') {
          sessionStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } else {
          router.push('/dashboard/overview');
        }
      }, 1000); // Wait 1 second to ensure authentication is complete

      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, router]);

  // Don't render login form if user is authenticated
  if (!loading && user) {
    return null;
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-purple-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[32rem] h-[32rem] bg-pink-400 opacity-20 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-300 opacity-10 rounded-full blur-3xl animate-pulse z-0" />
      {/* Glassy login card */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/30 bg-white/60 dark:bg-gray-900/70 backdrop-blur-2xl flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <Image src="/google-logo.png" alt="SiteGrip Logo" width={80} height={80} className="rounded-full shadow-lg mb-2" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg mb-1">Welcome to SiteGrip</h1>
          <p className="text-gray-600 dark:text-gray-300 text-base text-center max-w-xs">Sign in to manage your website's SEO, uptime, and analytics in style.</p>
        </div>
        <LoginCard />
      </div>
    </main>
  );
}
