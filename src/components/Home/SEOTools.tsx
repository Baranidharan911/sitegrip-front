import React from 'react';
import { FileText, Gauge, Code, CheckCircle, TrendingUp, Grid } from 'lucide-react';
import SEOTagsGenerator from './SEOTagsGenerator';

const SEOTools: React.FC = () => {
  const tools = [
    {
      icon: FileText,
      title: 'On-Page SEO Analysis',
      description: 'Analyze titles, meta descriptions, headers, and content quality for optimal performance.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: Gauge,
      title: 'Site Speed & Vitals',
      description: 'Monitor your Core Web Vitals (LCP, FID, CLS) and get recommendations to speed up your site.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: Code,
      title: 'Broken Link Checker',
      description: 'Automatically scan your site for broken internal and external links that harm user experience.',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/20',
    },
    {
      icon: CheckCircle,
      title: 'Uptime Monitoring',
      description: 'Get instant alerts via email or webhook if your site goes down, so you can act immediately.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/20',
    },
    {
      icon: TrendingUp,
      title: 'Keyword Tracking',
      description: 'Track your Google search rankings for your most important keywords across different locations.',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/20',
    },
    {
      icon: Grid,
      title: 'Sitemap Manager',
      description: 'Generate, validate, and submit your XML sitemap to search engines with a single click.',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/20',
    },
  ];

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Unlock Your Full <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">SEO Potential</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            A complete toolkit to climb the rankings and drive traffic.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="group relative bg-white/10 dark:bg-gray-800/30 backdrop-blur-lg rounded-3xl p-8 lg:p-10 border border-gray-200/20 dark:border-gray-700/30 hover:border-gray-300/40 dark:hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              {/* Glassy effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className={`w-20 h-20 ${tool.bgColor} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{tool.title}</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{tool.description}</p>
              </div>
              
              {/* Subtle gradient border on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
            </div>
          ))}
        </div>
      </div>
      {/* Divider and SEO Tags Generator */}
      <div className="my-24">
        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mb-12 opacity-40"></div>
        <SEOTagsGenerator />
      </div>
    </section>
  );
};

export default SEOTools; 
