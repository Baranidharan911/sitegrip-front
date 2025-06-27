import React from 'react';
import { BarChart3, Eye, FileText } from 'lucide-react';

const Roadmap: React.FC = () => {
  const roadmapItems = [
    {
      icon: BarChart3,
      title: 'Advanced Keyword Analytics',
      description: 'Deeper insights into keyword difficulty, search intent, and competitive analysis.',
      quarter: 'Q3 2025',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Eye,
      title: 'Automated Backlink Monitoring',
      description: 'Get alerts when you gain or lose valuable backlinks from other websites.',
      quarter: 'Q4 2025',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FileText,
      title: 'White-Label PDF Reports',
      description: 'Generate professional, branded SEO reports for your clients (Agency Plan).',
      quarter: 'Q1 2026',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <section className="relative z-10 px-6 py-24 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-start">
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Always <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Evolving</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              We're constantly improving Site Grip. Here's a peek at what's coming next to make our platform even more powerful for you.
            </p>
          </div>
          
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500"></div>
            
            <div className="space-y-12">
              {roadmapItems.map((item, index) => (
                <div key={index} className="relative flex items-start space-x-8">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg relative z-10`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{item.description}</p>
                    <div className="text-purple-500 dark:text-purple-400 font-semibold text-lg">{item.quarter}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap; 