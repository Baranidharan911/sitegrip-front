'use client';

import React from 'react';
import { Shield, Cookie, Eye, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white/90 dark:bg-gray-900/30 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-2xl p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Cookie className="h-6 w-6 text-purple-500" />
                Cookie Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                Site Grip uses cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                This policy explains what cookies are, how we use them, and your choices regarding cookies.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-6 border border-gray-200/50 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Necessary Cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Essential for website functionality. These cannot be disabled as they are required for basic site operations 
                    like security, network management, and accessibility features.
                  </p>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-6 border border-gray-200/50 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Analytics Cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help us understand visitor behavior through Google Analytics. We collect anonymous data about 
                    page visits, time spent, and user interactions to improve our service.
                  </p>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-6 border border-gray-200/50 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Marketing Cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Used by advertising partners to show relevant ads. These cookies track your browsing habits 
                    across websites to build an advertising profile.
                  </p>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-6 border border-gray-200/50 dark:border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Cookie className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Preference Cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Remember your settings and preferences, such as language choice, theme selection, 
                    and other customization options to enhance your experience.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Data Collection & Use</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>We collect information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and improve our indexing and monitoring services</li>
                  <li>Analyze website performance and user behavior</li>
                  <li>Send service-related notifications and updates</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Your Rights</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>Under GDPR, you have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Transfer your data to another service</li>
                  <li><strong>Withdraw consent:</strong> Opt out of non-essential cookies anytime</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Managing Cookies</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>You can manage your cookie preferences by:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Using our cookie banner when you first visit the site</li>
                  <li>Adjusting your browser settings to block cookies</li>
                  <li>Clearing existing cookies from your browser</li>
                  <li>Contacting us directly for assistance</li>
                </ul>
                <p className="mt-4">
                  <strong>Note:</strong> Disabling necessary cookies may affect website functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Contact Us</h2>
              <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-6 border border-gray-200/50 dark:border-white/10">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you have questions about this Privacy Policy or our cookie practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p><strong>Email:</strong> privacy@sitegrip.com</p>
                  <p><strong>Address:</strong> 123 Privacy Street, Data City, DC 12345</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 