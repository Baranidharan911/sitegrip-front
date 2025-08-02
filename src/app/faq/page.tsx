import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const FAQ = dynamic(() => import('@/components/Home/FAQ'), { ssr: false });

export const metadata: Metadata = {
  title: 'FAQ - SiteGrip',
  description: 'Frequently asked questions about SiteGrip SEO tools and services',
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find answers to common questions about SiteGrip
          </p>
        </div>
        <FAQ />
      </div>
    </div>
  );
} 