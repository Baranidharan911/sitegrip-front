import React from 'react';
import dynamic from 'next/dynamic';
// Dynamically import LanguageSelector to avoid SSR issues
const LanguageSelector = dynamic(() => import('./LanguageSelector'), { ssr: false });
import Link from 'next/link';
import { Rocket, Twitter, Github, Linkedin, Mail, MessageSquare, Globe, Shield, FileText, Users, Zap, Target } from 'lucide-react';

const NewFooter: React.FC = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Local SEO Tools', href: '/seo-tools' },
        { name: 'Competitor Analysis', href: '/seo-tools/competitor-analysis' },
        { name: 'Uptime Monitoring', href: '/uptime' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'API Documentation', href: '/api' },
        { name: 'Integrations', href: '/integrations' }
      ]
    },
    {
      title: 'Features',
      links: [
        { name: 'Local Keyword Finder', href: '/seo-tools/local-keyword-finder' },
        { name: 'Google Business Profile', href: '/seo-tools/gbp-audit' },
        { name: 'AI Content Generator', href: '/seo-tools/ai-content-generator' },
        { name: 'Review Management', href: '/seo-tools/review-management' },
        { name: 'Technical SEO', href: '/seo-tools' },
        { name: 'Reporting & Analytics', href: '/reporting-analytics' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Contact Support', href: '/contact' },
        { name: 'Status Page', href: '/uptime/status' },
        { name: 'Community', href: '/community' },
        { name: 'Blog', href: '/blog' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press Kit', href: '/press' },
        { name: 'Partners', href: '/partners' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Email', href: 'mailto:hello@sitegrip.com', icon: Mail }
  ];

  const features = [
    { icon: Target, text: 'Local SEO Focused' },
    { icon: Zap, text: 'AI-Powered Insights' },
    { icon: Globe, text: 'Multi-Platform Support' },
    { icon: Shield, text: 'Enterprise Security' }
  ];

  return (
    <footer className="relative z-10 px-6 py-20 border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Main footer content */}
        <div className="grid lg:grid-cols-6 gap-12 mb-16">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                SiteGrip
              </span>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mb-8">
              The complete SEO platform for local businesses. Get found, get leads, and get ahead with our comprehensive suite of local SEO tools.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <feature.icon className="w-4 h-4 text-blue-500" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Links sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Newsletter signup */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Stay Updated
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Get the latest SEO tips, product updates, and industry insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="pt-8 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-center relative">
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <p className="text-slate-600 dark:text-slate-400">
              © 2025 SiteGrip. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-500">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>by SiteGrip</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 hover:underline"
            >
              Cookie Policy
            </Link>
          </div>
          {/* Language Selector - only on homepage, styled bottom right */}
          <div className="hidden md:block absolute right-0 bottom-16">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter; 
