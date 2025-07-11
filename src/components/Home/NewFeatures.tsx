import React from 'react';
import { Users, Briefcase, Globe } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-10 h-10 text-white" />, // Bloggers & Publishers
    iconBg: 'from-purple-500 to-pink-500',
    title: 'Bloggers & Publishers',
    description: 'Get your fresh content seen by Google immediately. Stop waiting for traffic and start growing your audience today.',
  },
  {
    icon: <Briefcase className="w-10 h-10 text-white" />, // SaaS & Startups
    iconBg: 'from-blue-500 to-cyan-500',
    title: 'SaaS & Startups',
    description: 'Ensure your new feature pages, marketing sites, and documentation are indexed fast and monitored for critical downtime.',
  },
  {
    icon: <Globe className="w-10 h-10 text-white" />, // Marketing Agencies
    iconBg: 'from-emerald-500 to-green-400',
    title: 'Marketing Agencies',
    description: 'Manage multiple client sites from one dashboard. Deliver faster results and provide bulletproof uptime reports.',
  },
];

const NewFeatures = () => (
  <section className="relative z-10 px-6 py-24 bg-gradient-to-br from-white/80 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
    {/* Animated/gradient background accents */}
    <div className="absolute top-0 left-0 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob" />
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000" />
    <div className="max-w-7xl mx-auto relative">
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          Built For <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Winners</span>
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Whether you're a solo blogger or a major agency, Site Grip has you covered.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-10 justify-center items-stretch">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className="group bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg rounded-3xl p-10 flex-1 flex flex-col items-center border border-gray-200 dark:border-gray-800 shadow-2xl hover:shadow-purple-400/20 transition-all duration-300 hover:scale-105 relative overflow-hidden"
          >
            {/* Glassy gradient icon */}
            <div className={`mb-8 w-20 h-20 rounded-full bg-gradient-to-br ${feature.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-white dark:border-gray-900`}> 
              {feature.icon}
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center drop-shadow-sm">
              {feature.title}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-center">
              {feature.description}
            </p>
            {/* Subtle animated accent */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-cyan-400/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default NewFeatures; 
