'use client'; // This directive marks the component as a Client Component

import React from 'react';
import {
  Lightbulb, Rocket, ShieldCheck, Link, Settings, TrendingUp,
  Award, Zap, Search, BellRing, Gauge, Code,
  ArrowRight
} from 'lucide-react'; // Added more icons for new sections

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-inter antialiased">
      {/* Global font import (ensure 'Inter' is available via Google Fonts or similar) */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      {/* Header (Navigation Bar) - Enhanced Design */}
      <header className="fixed w-full z-50 bg-gray-900 bg-opacity-85 backdrop-blur-md py-4 shadow-lg rounded-b-xl animate-fade-in-down">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#" className="text-3xl font-extrabold text-emerald-400 flex items-center group">
            <Rocket className="w-8 h-8 mr-2 text-purple-400 group-hover:rotate-6 transition-transform duration-300" />
            WebWatch Pro
          </a>
          <nav className="hidden md:flex space-x-8 text-lg font-medium">
            <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 relative group">
              Features
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 relative group">
              Pricing
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
            <a href="#about" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 relative group">
              About Us
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
            <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 relative group">
              Contact
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
          </nav>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-7 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 hidden md:block">
            Sign up for free →
          </button>
          {/* Mobile menu button - Placeholder */}
          <button className="md:hidden text-white focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </header>

      {/* Hero Section - Keeping strong design */}
      <section className="relative bg-gradient-to-br from-gray-900 to-black text-white pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden rounded-b-[40px] shadow-2xl">
        {/* Background blobs for visual interest */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight animate-fade-in-up">
            Fast Track Your Website's <br />
            <span className="text-purple-400 block sm:inline">Growth</span> &amp; <span className="text-emerald-400 block sm:inline">Performance</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-500">
            The ultimate all-in-one platform for rapid indexing, in-depth SEO audits, and reliable website uptime monitoring.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16 animate-fade-in-up animation-delay-1000">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-lg">
              Get Started For Free
            </button>
            <button className="bg-transparent border-2 border-white hover:border-emerald-400 text-white font-bold py-3.5 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 text-lg">
              <span className="flex items-center justify-center">
                Learn More <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            </button>
          </div>

          {/* Core Feature Cards - Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
            <div className="bg-gray-800 bg-opacity-70 p-8 rounded-2xl shadow-xl flex flex-col items-center border border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 animate-fade-in-up animation-delay-1500">
              <div className="bg-purple-600 p-4 rounded-full mb-6 shadow-lg">
                <Rocket className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-emerald-300">Rapid Indexing</h3>
              <p className="text-gray-300 text-center leading-relaxed">
                Ensure your new pages are discovered and ranked by search engines instantly.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-70 p-8 rounded-2xl shadow-xl flex flex-col items-center border border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 animate-fade-in-up animation-delay-2000">
              <div className="bg-emerald-600 p-4 rounded-full mb-6 shadow-lg">
                <Lightbulb className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-purple-300">Smart SEO Audits</h3>
              <p className="text-gray-300 text-center leading-relaxed">
                Identify and resolve critical SEO issues with actionable, expert-driven insights.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-70 p-8 rounded-2xl shadow-xl flex flex-col items-center border border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 animate-fade-in-up animation-delay-2500">
              <div className="bg-blue-600 p-4 rounded-full mb-6 shadow-lg">
                <ShieldCheck className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-orange-300">Reliable Uptime</h3>
              <p className="text-gray-300 text-center leading-relaxed">
                Monitor your site's availability 24/7, with instant alerts for any downtime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section - Simple and clean */}
      <section className="bg-gray-950 py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-12 text-gray-200">Trusted by startups and enterprises worldwide</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75">
            {/* Replace with actual SVG/Image logos or a marquee effect */}
            {['Stripe', 'Figma', 'Shopify', 'Netflix', 'Notion', 'Coinbase'].map((company, index) => (
              <div key={company} className="relative group grayscale hover:grayscale-0 transition-all duration-500 transform hover:scale-105">
                <img src={`https://placehold.co/150x70/222831/9DB2BF?text=${company.split(' ').join('+')}`} alt={company} className="h-10 md:h-12" />
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Feature Details Section - New Section */}
      <section id="features" className="bg-gray-800 py-20 md:py-32 rounded-t-[40px] shadow-2xl">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-emerald-300 leading-tight">
            Comprehensive Tools for Digital Success
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Feature Block 1: SEO Audits */}
            <div className="bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-purple-600 p-4 rounded-full inline-flex mb-6 shadow-lg">
                <Search className="text-white w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Deep Dive SEO Audits</h3>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Uncover hidden SEO issues that are holding your site back. Our crawler meticulously analyzes your website for broken links, duplicate content, meta tag deficiencies, site speed, and more. Get actionable recommendations to climb the search rankings.
              </p>
              <ul className="space-y-3 text-gray-300 text-base">
                <li className="flex items-center"><Award className="text-purple-400 mr-3 w-5 h-5 flex-shrink-0" /> On-page SEO analysis</li>
                <li className="flex items-center"><Zap className="text-emerald-400 mr-3 w-5 h-5 flex-shrink-0" /> Core Web Vitals assessment</li>
                <li className="flex items-center"><Code className="text-blue-400 mr-3 w-5 h-5 flex-shrink-0" /> Schema markup validation</li>
              </ul>
            </div>

            {/* Feature Block 2: Uptime Monitoring */}
            <div className="bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-700 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-blue-600 p-4 rounded-full inline-flex mb-6 shadow-lg">
                <BellRing className="text-white w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">Reliable Uptime Monitoring</h3>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Never miss a beat with our 24/7 uptime monitoring. Receive instant alerts via email or webhook if your website goes down, ensuring minimal downtime and maximum user satisfaction. We track HTTP(s), Ping, Port, and even custom cron jobs.
              </p>
              <ul className="space-y-3 text-gray-300 text-base">
                <li className="flex items-center"><Gauge className="text-purple-400 mr-3 w-5 h-5 flex-shrink-0" /> Real-time status updates</li>
                <li className="flex items-center"><ShieldCheck className="text-emerald-400 mr-3 w-5 h-5 flex-shrink-0" /> SSL certificate expiry alerts</li>
                <li className="flex items-center"><Settings className="text-blue-400 mr-3 w-5 h-5 flex-shrink-0" /> Custom incident reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - New Dedicated Section */}
      <section id="pricing" className="bg-gray-950 py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-white">Simple, Transparent Pricing</h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Scale up as your website grows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-700 flex flex-col items-center transform hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-3xl font-bold text-white mb-4">Free</h3>
              <p className="text-5xl font-extrabold text-emerald-400 mb-6">$0<span className="text-lg text-gray-400">/month</span></p>
              <p className="text-gray-300 mb-8 text-center">Great for trying out the basics.</p>
              <ul className="text-gray-300 text-left space-y-3 mb-10">
                <li className="flex items-center"><ShieldCheck className="text-green-500 mr-3 w-5 h-5" /> 10 URL Indexing requests/day</li>
                <li className="flex items-center"><ShieldCheck className="text-green-500 mr-3 w-5 h-5" /> Basic SEO Audit for 10 pages</li>
                <li className="flex items-center"><ShieldCheck className="text-green-500 mr-3 w-5 h-5" /> 1 Uptime Monitor</li>
                <li className="flex items-center opacity-70"><ShieldCheck className="text-gray-500 mr-3 w-5 h-5" /> Email alerts only</li>
                <li className="flex items-center opacity-70"><ShieldCheck className="text-gray-500 mr-3 w-5 h-5" /> No priority indexing</li>
              </ul>
              <button className="w-full bg-transparent border-2 border-purple-500 text-purple-400 font-semibold py-3 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
                Start Free
              </button>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="bg-gradient-to-br from-purple-700 to-indigo-700 p-8 rounded-3xl shadow-2xl flex flex-col items-center border-4 border-emerald-400 transform scale-[1.05] hover:scale-[1.07] transition-transform duration-300 relative z-10">
              <span className="absolute top-0 right-0 -mt-4 -mr-4 bg-emerald-400 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">Recommended</span>
              <h3 className="text-3xl font-bold text-white mb-4">Pro</h3>
              <p className="text-6xl font-extrabold text-white mb-6">$29<span className="text-lg text-gray-200">/month</span></p>
              <p className="text-purple-100 mb-8 text-center">Ideal for growing websites and marketers.</p>
              <ul className="text-white text-left space-y-3 mb-10">
                <li className="flex items-center"><ShieldCheck className="text-emerald-300 mr-3 w-5 h-5" /> Unlimited URL Indexing</li>
                <li className="flex items-center"><ShieldCheck className="text-emerald-300 mr-3 w-5 h-5" /> Full Site SEO Audit</li>
                <li className="flex items-center"><ShieldCheck className="text-emerald-300 mr-3 w-5 h-5" /> 10 Uptime Monitors</li>
                <li className="flex items-center"><ShieldCheck className="text-emerald-300 mr-3 w-5 h-5" /> Email & Webhook alerts</li>
                <li className="flex items-center"><ShieldCheck className="text-emerald-300 mr-3 w-5 h-5" /> Priority indexing support</li>
              </ul>
              <button className="w-full bg-white text-purple-700 font-bold py-3 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-white">
                Choose Pro
              </button>
            </div>

            {/* Agency Plan */}
            <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-700 flex flex-col items-center transform hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-3xl font-bold text-white mb-4">Agency</h3>
              <p className="text-5xl font-extrabold text-emerald-400 mb-6">$99<span className="text-lg text-gray-400">/month</span></p>
              <p className="text-gray-300 mb-8 text-center">Perfect for agencies and multiple clients.</p>
              <ul className="text-gray-300 text-left space-y-3 mb-10">
                <li className="flex items-center"><ShieldCheck className="text-green-500 mr-3 w-5 h-5" /> All Pro features</li>
                <li className="flex items-center"><ShieldCheck className="text-green-500 mr-3 w-5 h-5" /> Unlimited Sites & Monitors</li>
                <li className="flex items-center"><ShieldCheck className="text-green-500 mr-3 w-5 h-5" /> Team Collaboration</li>
                <li className="flex items-center"><ShieldCheck className="text-green-500 mr-3 w-5 h-5" /> Custom Reporting</li>
                <li className="flex items-center"><ShieldCheck className="text-green-500 mr-3 w-5 h-5" /> Dedicated Support</li>
              </ul>
              <button className="w-full bg-transparent border-2 border-purple-500 text-purple-400 font-semibold py-3 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-purple-700 to-indigo-700 py-20 md:py-24 text-center rounded-t-[40px] shadow-2xl">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
            Ready to Supercharge Your Website?
          </h2>
          <p className="text-lg md:text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
            Join thousands of satisfied users who are already boosting their online presence with WebWatch Pro.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-white text-purple-700 font-bold py-3.5 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 text-lg">
              Get Started Free Today
            </button>
            <button className="bg-transparent border-2 border-white hover:border-white text-white font-bold py-3.5 px-10 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 text-lg">
              <span className="flex items-center justify-center">
                View Demo <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced Design */}
      <footer className="bg-gray-900 py-10 md:py-16">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-2xl font-bold text-emerald-400 mb-4 md:mb-0">WebWatch Pro</div>
            <div className="flex space-x-6 md:space-x-10 text-lg">
              <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors duration-300">Support</a>
              <a href="#" className="hover:text-white transition-colors duration-300">Careers</a>
            </div>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} WebWatch Pro. All rights reserved.</p>
          <p className="text-xs mt-2 text-gray-500">Built with passion for a better web.</p>
        </div>
      </footer>

      {/* Tailwind CSS animations */}
      <style jsx>{`
        @keyframes fadeInMoveUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInMoveDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInMoveUp 0.8s ease-out forwards;
          opacity: 0; /* Hidden by default */
        }
        .animate-fade-in-down {
          animation: fadeInMoveDown 0.8s ease-out forwards;
          opacity: 0; /* Hidden by default */
        }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1500 { animation-delay: 1.5s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-2500 { animation-delay: 2.5s; }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default HomePage;
