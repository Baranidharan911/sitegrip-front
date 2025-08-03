import React, { useState } from 'react';
import { TrendingUp, Users, Building, Globe, ArrowRight } from 'lucide-react';

const businessSegments = [
  {
    id: 'midsize',
    label: 'Midsize Business',
    active: true,
  },
  {
    id: 'enterprise',
    label: 'Enterprise Business',
    active: false,
  },
  {
    id: 'global',
    label: 'Global Multi-Market',
    active: false,
  },
  {
    id: 'local',
    label: 'Local Business',
    active: false,
  },
];

const successStories = {
  midsize: {
    logo: 'TECHSTART',
    metric: '73% increase in organic traffic',
    description: 'A growing SaaS company achieved remarkable growth in their organic search visibility.',
    image: '/images/success-midsize.jpg',
    cta: 'Read case study',
  },
  enterprise: {
    logo: 'CORPMAX',
    metric: '156% increase in indexed pages',
    description: 'Enterprise solution provider dramatically improved their search presence.',
    image: '/images/success-enterprise.jpg',
    cta: 'Read case study',
  },
  global: {
    logo: 'GLOBALPRO',
    metric: '89% faster indexing',
    description: 'Multi-market e-commerce platform achieved lightning-fast content discovery.',
    image: '/images/success-global.jpg',
    cta: 'Read case study',
  },
  local: {
    logo: 'LOCALHUB',
    metric: '94% uptime improvement',
    description: 'Local service provider enhanced their reliability and customer trust.',
    image: '/images/success-local.jpg',
    cta: 'Read case study',
  },
};

const CustomerSuccessStories = () => {
  const [activeSegment, setActiveSegment] = useState('midsize');

  const currentStory = successStories[activeSegment as keyof typeof successStories];

  return (
    <section className="relative z-10 px-6 py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Drive Performance Across Traditional and AI Search
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how Site Grip customers increase their digital presence across the customer journey.
          </p>
        </div>

        {/* Business Segment Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {businessSegments.map((segment) => (
            <button
              key={segment.id}
              onClick={() => setActiveSegment(segment.id)}
              className={`px-6 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
                activeSegment === segment.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {segment.label}
            </button>
          ))}
        </div>

        {/* Success Story Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-12 h-12 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Success Story Visualization
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                  Professional collaboration image
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-purple-500 rounded-full opacity-20"></div>
          </div>

          {/* Right Side - Success Metrics */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="mb-8">
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                {currentStory.logo}
              </h3>
            </div>

            {/* Metric */}
            <div className="mb-6">
              <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                {currentStory.metric}
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {currentStory.description}
              </p>
            </div>

            {/* Call to Action */}
            <div>
              <button className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-lg transition-colors duration-300 group">
                {currentStory.cta}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Additional metrics */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  2.4x
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Faster Indexing
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  99.9%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Uptime
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to join our success stories?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Start your journey to better search performance and digital presence today.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerSuccessStories; 