import React from 'react';
import { ArrowRight, FileText, BarChart3, Shield, Zap, Globe, Users, Database, Brain, Target, TrendingUp, Layers } from 'lucide-react';

const searchEngines = [
  { name: 'OpenAI', position: 'top' },
  { name: 'Yandex', position: 'top-right' },
  { name: 'Yahoo! Japan', position: 'mid-right' },
  { name: 'Perplexity', position: 'bottom-right' },
  { name: 'Naver', position: 'bottom' },
  { name: 'Baidu', position: 'bottom-left' },
  { name: 'Bing', position: 'mid-left' },
  { name: 'Google', position: 'top-left' },
];

const platformLayers = [
  { label: 'CORE TECHNOLOGY', icon: <Database className="w-4 h-4" /> },
  { label: 'SCALED REPORTING & INSIGHTS', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'CONTENT STRATEGY', icon: <FileText className="w-4 h-4" /> },
  { label: 'AI & MACHINE LEARNING', icon: <Brain className="w-4 h-4" /> },
  { label: 'SEO PERFORMANCE', icon: <Target className="w-4 h-4" /> },
  { label: 'SECURITY & GOVERNANCE', icon: <Shield className="w-4 h-4" /> },
];

const IndustryInnovations = () => {
  return (
    <section className="relative z-10 px-6 py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-24">
        
        {/* Industry Leading Innovations Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              Industry Leading Innovations
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              With our leading-edge platform, not only will you outpace competitors, you will also be uniquely prepared for major industry shifts like Google's AI Overviews, powered by insights from our proprietary generative parser.
            </p>
            <div>
              <button className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-lg transition-colors duration-300 group">
                Learn about Site Grip Generative Parser™
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Right Side - Radial Diagram */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-96 h-96">
              {/* Central Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>

              {/* Search Engine Circles */}
              {searchEngines.map((engine, index) => {
                const angle = (index * 45) * (Math.PI / 180);
                const radius = 140;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <div
                    key={engine.name}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-200 dark:border-gray-700"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
                      {engine.name}
                    </span>
                  </div>
                );
              })}

              {/* Connection Lines */}
              {searchEngines.map((engine, index) => {
                const angle = (index * 45) * (Math.PI / 180);
                const radius = 140;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <svg
                    key={`line-${index}`}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    width="300"
                    height="300"
                    style={{ transform: 'translate(-150px, -150px)' }}
                  >
                    <line
                      x1="150"
                      y1="150"
                      x2={150 + x}
                      y2={150 + y}
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.6"
                    />
                  </svg>
                );
              })}

              {/* Additional connection lines */}
              <svg
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                width="300"
                height="300"
                style={{ transform: 'translate(-150px, -150px)' }}
              >
                <line
                  x1="150"
                  y1="150"
                  x2="150"
                  y2="280"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.3"
                />
                <line
                  x1="150"
                  y1="150"
                  x2="150"
                  y2="300"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* All-in-One Platform Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Layered Icon */}
          <div className="relative flex justify-center items-center">
            <div className="relative">
              {/* Layered B Icon */}
              <div className="relative w-48 h-48">
                {/* Layer 1 - Background */}
                <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-3"></div>
                {/* Layer 2 - Middle */}
                <div className="absolute inset-2 bg-blue-500 rounded-lg transform -rotate-1"></div>
                {/* Layer 3 - Front */}
                <div className="absolute inset-4 bg-blue-400 rounded-lg transform rotate-2 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white">S</span>
                </div>
              </div>

              {/* Connection Lines to Labels */}
              {platformLayers.map((layer, index) => {
                const positions = [
                  { x: 'right-0', y: 'top-4', line: 'right-4 top-4 w-32 h-0.5' },
                  { x: 'right-0', y: 'top-12', line: 'right-4 top-12 w-32 h-0.5' },
                  { x: 'right-0', y: 'top-20', line: 'right-4 top-20 w-32 h-0.5' },
                  { x: 'left-0', y: 'top-4', line: 'left-4 top-4 w-32 h-0.5' },
                  { x: 'left-0', y: 'top-12', line: 'left-4 top-12 w-32 h-0.5' },
                  { x: 'left-0', y: 'top-20', line: 'left-4 top-20 w-32 h-0.5' },
                ];
                
                const pos = positions[index];
                
                return (
                  <div key={layer.label} className={`absolute ${pos.x} ${pos.y} transform translate-x-${index < 3 ? '4' : '-4'}`}>
                    <div className={`absolute ${pos.line} bg-gray-300 dark:bg-gray-600`}></div>
                    <div className={`absolute ${index < 3 ? 'left-36' : 'right-36'} top-0 transform -translate-y-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded shadow-sm`}>
                      <div className="flex items-center space-x-2">
                        {layer.icon}
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {layer.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              All-in-One Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              The most comprehensive platform for all your search and web optimization needs, from detailed research to scaled reporting, seamlessly integrating with your enterprise tools and offering the security and governance you need.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real-time Monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Global Coverage</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Collaboration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to experience industry-leading innovations?
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of businesses already using Site Grip to stay ahead of the competition and prepare for the future of search.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Free Trial
              </button>
              <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustryInnovations; 