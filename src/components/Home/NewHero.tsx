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
    <section className="relative z-10 px-6 py-24 md:py-32 text-center overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm mb-8">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Trusted by 10,000+ businesses worldwide
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
          Dominate <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Local Search</span> & 
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Grow Your Business</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-4xl mx-auto leading-relaxed">
          The complete SEO platform for local businesses. Get found, get leads, and get ahead with our comprehensive suite of local SEO tools.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>Increase Local Rankings</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
            <Target className="w-4 h-4" />
            <span>Beat Competitors</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>Get More Leads</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto mb-16">
          <Link
            href={getCtaHref()}
            className="group w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>{getCtaText()}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="group w-full sm:w-auto border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90 flex items-center justify-center gap-2">
            <Play className="w-5 h-5" />
            <span>Watch Demo</span>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col items-center gap-8">
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
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero; 
