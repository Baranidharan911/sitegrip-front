'use client';

import { Suspense } from 'react';
import SignupCard from '@/components/Login/SignupCard';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <SignupCard />
      </Suspense>
    </main>
  );
}
