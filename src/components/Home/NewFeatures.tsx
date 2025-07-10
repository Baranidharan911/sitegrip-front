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
              className="bg-white/90 dark:bg-gray-900/60 backdrop-blur-lg rounded-3xl p-10 flex flex-col items-center border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg group"
            >
              <div className="relative mb-8 flex items-center justify-center">
                <div className={`absolute w-24 h-24 rounded-full blur-xl opacity-40 bg-gradient-to-r ${feature.color}`}></div>
                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg z-10 border-4 border-white dark:border-gray-900`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">{feature.title}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewFeatures; 
