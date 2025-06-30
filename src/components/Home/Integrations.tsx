import React from 'react';

const Integrations: React.FC = () => {
  const integrations = [
    { name: 'WordPress', logo: 'WordPress' },
    { name: 'Shopify', logo: 'Shopify' },
    { name: 'Slack', logo: 'Slack' },
    { name: 'Zapier', logo: 'Zapier' },
    { name: 'Analytics', logo: 'Analytics' },
    { name: 'GSC', logo: 'GSC' },
  ];

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8">
              Works With Your{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Existing Tools
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Site Grip integrates with the platforms you already use and love. Get uptime alerts in Slack, 
              trigger indexing from WordPress, and connect to thousands of apps with Zapier.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 lg:gap-8">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="bg-white/90 dark:bg-gray-900/30 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/95 dark:hover:bg-gray-900/50 transition-all duration-300 hover:transform hover:scale-105 aspect-square flex items-center justify-center shadow-lg dark:shadow-2xl"
              >
                <div className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center shadow-sm border border-gray-200/50 dark:border-white/10">
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-xs lg:text-sm text-center leading-tight">{integration.logo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations; 
