import React from 'react';

const Process: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Connect Your Site',
      description: 'Link your website with a few simple clicks. Securely authorize via Google Search Console.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      number: 2,
      title: 'Run Audits & Index',
      description: 'Initiate a full SEO audit or submit pages for instant indexing. Our dashboard makes it easy.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      number: 3,
      title: 'Get Actionable Insights',
      description: 'Receive alerts, track your performance, and get clear, actionable reports to boost your growth.',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Get Started in <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Minutes</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">A seamless process to put you in control.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-px border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
          
          {steps.map((step, index) => (
            <div key={step.number} className="text-center relative">
              <div className="bg-white/80 dark:bg-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:bg-white/90 dark:hover:bg-gray-900/50 transition-all duration-300 hover:transform hover:scale-105 shadow-lg dark:shadow-2xl mb-8">
                <div className={`w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{step.title}</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process; 
