import React from 'react';

const FinalCTA: React.FC = () => {
  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-12 lg:p-16 border border-gray-200 dark:border-gray-700 text-center shadow-xl">
          {/* Subtle gradient background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Ready to Supercharge Your Website?
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied users who are already boosting their online presence with Site Grip.
            </p>
            
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-12 py-5 rounded-lg font-semibold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Get Started Free Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA; 
