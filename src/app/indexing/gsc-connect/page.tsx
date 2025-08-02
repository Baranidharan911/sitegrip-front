'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const GoogleSearchConsoleConnect = dynamic(() => import('@/components/Indexing/GoogleSearchConsoleConnect'), { ssr: false });

export default function GSCConnectPage() {
  const router = useRouter();

  const handleConnect = () => {
    // Redirect to the main indexing page after successful connection
    router.push('/indexing');
  };

  const handleCancel = () => {
    // Go back to the main indexing page
    router.push('/indexing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.push('/indexing')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Indexing
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Google Search Console Connection
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Connect your Google Search Console account to access advanced indexing features
            </p>
          </div>
          
          <GoogleSearchConsoleConnect 
            onConnect={handleConnect}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
} 