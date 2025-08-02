import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const Contact = dynamic(() => import('@/components/Home/Contact'), { ssr: false });

export const metadata: Metadata = {
  title: 'Contact Us - SiteGrip',
  description: 'Get in touch with the SiteGrip team for support and inquiries',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We're here to help with any questions or support you need
          </p>
        </div>
        <Contact />
      </div>
    </div>
  );
} 