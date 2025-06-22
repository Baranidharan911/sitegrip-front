'use client';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => (
  <section className="relative bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
    {/* Background blobs */}
    <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob"></div>
    <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-4000"></div>

    <div className="container mx-auto px-6 text-center relative z-10">
      <h1 className="text-4xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight animate-fade-in-up">
        Fast Track Your Website's <br />
        <span className="text-purple-500 dark:text-purple-400 block sm:inline">Growth</span> &amp; <span className="text-emerald-500 dark:text-emerald-400 block sm:inline">Performance</span>
      </h1>
      <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-500">
        The ultimate all-in-one platform for rapid indexing, in-depth SEO audits, and reliable website uptime monitoring.
      </p>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16 animate-fade-in-up animation-delay-1000">
        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-lg">
          Get Started For Free
        </button>
        <button className="bg-transparent border-2 border-gray-900 dark:border-white hover:border-emerald-400 text-gray-900 dark:text-white font-bold py-3.5 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 text-lg">
          <span className="flex items-center justify-center">
            Learn More <ArrowRight className="ml-2 w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  </section>
);

export default HeroSection;
