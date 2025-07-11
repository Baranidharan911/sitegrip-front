import React from 'react';

const Integrations: React.FC = () => {
  const integrations = [
    { name: 'WordPress' },
    { name: 'Shopify' },
    { name: 'Slack' },
    { name: 'Zapier' },
    { name: 'Analytics' },
    { name: 'GSC' },
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
                className="relative group bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/60 dark:border-purple-900/40 rounded-2xl p-6 lg:p-8 shadow-xl dark:shadow-[0_4px_32px_0_rgba(80,0,120,0.18)] flex items-center justify-center aspect-square transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-400/60 dark:hover:border-purple-400/60"
              >
                <div className="absolute inset-0 pointer-events-none rounded-2xl group-hover:shadow-[0_0_32px_8px_rgba(168,85,247,0.12)] transition-all duration-300" />
                <div className="bg-gradient-to-br from-purple-100/80 via-white/80 to-cyan-100/60 dark:from-purple-900/40 dark:via-gray-900/60 dark:to-cyan-900/30 rounded-xl w-20 h-20 flex items-center justify-center shadow-md border border-white/40 dark:border-purple-900/40">
                  <span className="text-gray-900 dark:text-white font-extrabold text-lg lg:text-xl text-center leading-tight drop-shadow-sm">
                    {integration.name[0]}
                  </span>
                </div>
                <span className="block text-gray-800 dark:text-gray-100 font-semibold text-base lg:text-lg text-center mt-2 tracking-wide">
                  {integration.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations; 
