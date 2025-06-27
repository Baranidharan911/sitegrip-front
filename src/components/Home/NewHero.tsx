import React from 'react';

const NewHero: React.FC = () => {
  return (
    <section className="relative z-10 px-6 py-24 md:py-32 text-center">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
          Fast Track Your Website's{' '}
          <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Growth & Performance
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          The ultimate all-in-one platform for rapid indexing, in-depth SEO audits, and reliable website uptime monitoring.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
          <button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
            Get Started For Free
          </button>
          <button className="w-full sm:w-auto border border-gray-300 dark:border-white/20 hover:border-gray-500 dark:hover:border-white/30 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 bg-white/80 dark:bg-white/5 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-white/10">
            View Demo →
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewHero; 