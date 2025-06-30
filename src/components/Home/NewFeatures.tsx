import React from 'react';
import { Edit3, Database, Users } from 'lucide-react';

const NewFeatures: React.FC = () => {
  const features = [
    {
      icon: Edit3,
      title: 'Bloggers & Publishers',
      description: 'Get your fresh content seen by Google immediately. Stop waiting for traffic and start growing your audience today.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Database,
      title: 'SaaS & Startups',
      description: 'Ensure your new feature pages, marketing sites, and documentation are indexed fast and monitored for critical downtime.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Marketing Agencies',
      description: 'Manage multiple client sites from one dashboard. Deliver faster results and provide bulletproof uptime reports.',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Built For <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Winners</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Whether you're a solo blogger or a major agency, Site Grip has you covered.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 lg:p-10 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg"
            >
              <div className={`w-18 h-18 mb-8 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                <feature.icon className="h-9 w-9 text-white" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{feature.title}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewFeatures; 
