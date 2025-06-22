'use client';

import LoginCard from '@/components/Login/LoginCard';
import Image from 'next/image';

export default function LoginScreen() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row w-full h-full md:h-[90vh] max-w-7xl shadow-2xl rounded-xl overflow-hidden bg-white dark:bg-gray-800">
        
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-10">
          <div className="text-center">
            <Image
              src="/google-logo.png"
              alt="Google Logo"
              width={200}
              height={200}
              priority
              className="mx-auto"
            />
            <h2 className="mt-6 text-2xl font-semibold text-gray-800 dark:text-white max-w-xs mx-auto">
              Sign in with Google for a seamless experience
            </h2>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-800">
          <LoginCard />
        </div>

      </div>
    </main>
  );
}
