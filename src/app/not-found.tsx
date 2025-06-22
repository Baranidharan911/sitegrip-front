// src/app/not-found.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-6xl font-extrabold text-purple-500 mb-4">404</h1>
        <p className="text-2xl md:text-3xl font-semibold mb-4">Page Not Found</p>
        <p className="text-gray-400 mb-8">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
