'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  MapPin, 
  MessageSquare, 
  Star, 
  FileText, 
  Target, 
  Users, 
  Building2,
  Globe,
  Zap
} from 'lucide-react';

const seoTools = [
  {
    title: 'Local Keyword Finder',
    description: 'Discover high-impact local keywords for your business',
    icon: Search,
    href: '/seo-tools/local-keyword-finder',
    color: 'from-blue-500 to-cyan-500',
    category: 'Local SEO'
  },
  {
    title: 'Competitor Analysis',
    description: 'Analyze your competitors and identify opportunities',
    icon: TrendingUp,
    href: '/seo-tools/competitor-analysis',
    color: 'from-purple-500 to-pink-500',
    category: 'Analysis'
  },
  {
    title: 'Local Rank Tracker',
    description: 'Track your local search rankings in real-time',
    icon: BarChart3,
    href: '/seo-tools/local-rank-tracker',
    color: 'from-green-500 to-emerald-500',
    category: 'Local SEO'
  },
  {
    title: 'GBP Audit',
    description: 'Comprehensive Google Business Profile audit',
    icon: Building2,
    href: '/seo-tools/gbp-audit',
    color: 'from-orange-500 to-red-500',
    category: 'Local SEO'
  },
  {
    title: 'Citation Builder',
    description: 'Build and manage your business citations',
    icon: MapPin,
    href: '/seo-tools/citation-builder',
    color: 'from-indigo-500 to-purple-500',
    category: 'Local SEO'
  },
  {
    title: 'Review Management',
    description: 'Monitor and respond to customer reviews',
    icon: MessageSquare,
    href: '/seo-tools/review-management',
    color: 'from-pink-500 to-rose-500',
    category: 'Reputation'
  },
  {
    title: 'Reputation Monitoring',
    description: 'Monitor your online reputation across platforms',
    icon: Star,
    href: '/seo-tools/reputation-monitoring',
    color: 'from-yellow-500 to-orange-500',
    category: 'Reputation'
  },
  {
    title: 'AI Content Generator',
    description: 'Generate SEO-optimized content with AI',
    icon: FileText,
    href: '/seo-tools/ai-content-generator',
    color: 'from-teal-500 to-cyan-500',
    category: 'Content'
  },
  {
    title: 'SEO Tags Generator',
    description: 'Generate meta tags and structured data',
    icon: Target,
    href: '/seo-tools/seo-tags-generator',
    color: 'from-violet-500 to-purple-500',
    category: 'Technical SEO'
  },
  {
    title: 'Listing Management',
    description: 'Manage your business listings across directories',
    icon: Users,
    href: '/seo-tools/listing-management',
    color: 'from-blue-600 to-indigo-600',
    category: 'Local SEO'
  },
  {
    title: 'Maps Audit',
    description: 'Audit your Google Maps presence and optimization',
    icon: Globe,
    href: '/seo-tools/maps-audit',
    color: 'from-emerald-500 to-green-500',
    category: 'Local SEO'
  }
];

const categories = ['All', 'Local SEO', 'Analysis', 'Reputation', 'Content', 'Technical SEO'];

export default function SEOToolsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredTools = selectedCategory === 'All' 
    ? seoTools 
    : seoTools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            SEO Tools Suite
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Comprehensive SEO tools to boost your local search presence, analyze competitors, 
            and optimize your online visibility.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm border border-slate-200 dark:border-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool, index) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group relative overflow-hidden"
            >
              <div className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} p-3 mb-4 shadow-lg`}>
                  <tool.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  
                  {/* Category Badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {tool.category}
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/20 dark:border-blue-800/20">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
              Ready to Boost Your SEO?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Start using our comprehensive SEO tools to improve your search rankings, 
              analyze competitors, and grow your online presence.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 