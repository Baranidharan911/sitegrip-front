'use client';
import {
  Award,
  Zap,
  Code,
  BellRing,
  Gauge,
  ShieldCheck,
  Settings,
  Search,
} from 'lucide-react';

const FeatureDetails = () => (
  <section
    id="features"
    className="bg-gray-100 dark:bg-gray-800 py-20 md:py-32 rounded-t-[40px] shadow-2xl"
  >
    <div className="container mx-auto px-6">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-emerald-600 dark:text-emerald-300 leading-tight">
        Comprehensive Tools for Digital Success
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* SEO Audits Block */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="bg-purple-600 p-4 rounded-full inline-flex mb-6 shadow-lg">
            <Search className="text-white w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Deep Dive SEO Audits</h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
            Uncover hidden SEO issues that are holding your site back. Our crawler analyzes your website for broken links, duplicate content, meta tag deficiencies, site speed, and more.
          </p>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-base">
            <li className="flex items-center"><Award className="text-purple-400 mr-3 w-5 h-5" /> On-page SEO analysis</li>
            <li className="flex items-center"><Zap className="text-emerald-400 mr-3 w-5 h-5" /> Core Web Vitals assessment</li>
            <li className="flex items-center"><Code className="text-blue-400 mr-3 w-5 h-5" /> Schema markup validation</li>
          </ul>
        </div>

        {/* Uptime Monitoring Block */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="bg-blue-600 p-4 rounded-full inline-flex mb-6 shadow-lg">
            <BellRing className="text-white w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Reliable Uptime Monitoring</h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
            Never miss a beat with 24/7 uptime monitoring. Receive instant alerts if your website goes down, ensuring minimal downtime and maximum user satisfaction.
          </p>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300 text-base">
            <li className="flex items-center"><Gauge className="text-purple-400 mr-3 w-5 h-5" /> Real-time status updates</li>
            <li className="flex items-center"><ShieldCheck className="text-emerald-400 mr-3 w-5 h-5" /> SSL expiry alerts</li>
            <li className="flex items-center"><Settings className="text-blue-400 mr-3 w-5 h-5" /> Custom incident reports</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default FeatureDetails;
