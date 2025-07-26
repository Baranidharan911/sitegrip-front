import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { isAuthenticated } from '@/utils/auth';

const NewHero: React.FC = () => {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsUserAuthenticated(isAuthenticated());
  }, []);

  // Get appropriate button text based on authentication status
  const getCtaText = () => {
    if (!mounted) return 'Start Free Trial'; // Prevent hydration mismatch
    return isUserAuthenticated ? 'Go to Dashboard' : 'Start Free Trial';
  };

  // Get appropriate href based on authentication status
  const getCtaHref = () => {
    return isUserAuthenticated ? '/dashboard/overview' : '/signup';
  };

  return (
    <section className="relative z-10 px-6 py-24 md:py-36 text-center overflow-hidden min-h-[90vh] flex flex-col justify-center">
      {/* Animated/gradient background accents */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-purple-400/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-[480px] h-[480px] bg-gradient-to-tr from-purple-400/20 via-pink-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse-slower" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-radial from-blue-200/10 via-white/0 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm mb-8 shadow-md">
          <Sparkles className="w-4 h-4 text-blue-500 animate-bounce" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Trusted by 10,000+ businesses worldwide
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-8 leading-tight drop-shadow-xl">
          <span className="block">Supercharge Your</span>
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">Local SEO Growth</span>
        </h1>
        <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
          The all-in-one platform to <span className="font-bold text-blue-600 dark:text-blue-400">get found</span>, <span className="font-bold text-purple-600 dark:text-purple-400">get leads</span>, and <span className="font-bold text-pink-600 dark:text-pink-400">grow your business</span> with ease.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-green-100/80 to-green-200/60 dark:from-green-900/40 dark:to-green-800/30 text-green-800 dark:text-green-200 text-base font-semibold shadow-sm hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
            <span>Increase Local Rankings</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-100/80 to-blue-200/60 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-800 dark:text-blue-200 text-base font-semibold shadow-sm hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
            <span>Beat Competitors</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-100/80 to-pink-100/60 dark:from-purple-900/40 dark:to-pink-800/30 text-purple-800 dark:text-purple-200 text-base font-semibold shadow-sm hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
            <span>Get More Leads</span>
          </div>
        </div>

        {/* Product mockup/dashboard preview */}
        <div className="relative w-full flex justify-center mb-14">
          <div className="relative bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 md:p-4 max-w-3xl w-full mx-auto overflow-hidden backdrop-blur-lg hover:shadow-blue-400/20 transition-all duration-300">
            {/* Replace with real dashboard screenshot or animated preview if available */}
            <img
              src="/images/hero-dashboard-mockup.png"
              alt="SiteGrip Dashboard Preview"
              className="rounded-2xl w-full h-auto object-cover shadow-lg border border-slate-100 dark:border-slate-800"
              style={{ minHeight: 220, background: 'linear-gradient(90deg, #e0e7ff 0%, #f3e8ff 100%)' }}
            />
            {/* Optional: Add animated sparkles or floating icons here for extra flair */}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto mb-12">
          <Link
            href={getCtaHref()}
            className="group w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            <span>{getCtaText()}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="group w-full sm:w-auto border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800">
            <Play className="w-5 h-5" />
            <span>Watch Demo</span>
          </button>
        </div>

        {/* Scroll cue */}
        <div className="flex flex-col items-center mt-2 animate-bounce-slow">
          <span className="text-slate-400 dark:text-slate-500 text-sm mb-1">How it works</span>
          <svg className="w-6 h-6 text-blue-400 dark:text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col items-center gap-8 mt-8">
          <div className="flex items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Social proof */}
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Join thousands of businesses already using SiteGrip
            </p>
            <div className="flex items-center justify-center gap-6 opacity-60">
              <img src="/images/companies/logo1.png" alt="Company 1" className="w-16 h-8 object-contain" />
              <img src="/images/companies/logo2.png" alt="Company 2" className="w-16 h-8 object-contain" />
              <img src="/images/companies/logo3.png" alt="Company 3" className="w-16 h-8 object-contain" />
              <img src="/images/companies/logo4.png" alt="Company 4" className="w-16 h-8 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero; 
