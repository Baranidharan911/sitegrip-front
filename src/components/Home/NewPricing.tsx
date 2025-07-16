import React from 'react';
import Link from 'next/link';
import { Check, X, Sparkles, Grid, BarChart2, FileText, Users, Layout, MessageCircle, PlusCircle, MonitorDot, ShieldCheck, Zap, Globe, LineChart, UserCheck, Star, Bot, Link2, PieChart, Activity, Cloud, AlertCircle } from 'lucide-react';

const allFeatures = [
  { label: 'AI SEO Agent', icon: <Bot className="w-5 h-5" /> },
  { label: 'Schema Generator', icon: <Grid className="w-5 h-5" /> },
  { label: 'Full Site SEO Audit', icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Content Publisher', icon: <FileText className="w-5 h-5" /> },
  { label: 'Citations Manager', icon: <Users className="w-5 h-5" /> },
  { label: 'Website Builder', icon: <Layout className="w-5 h-5" /> },
  { label: 'Review Manager', icon: <MessageCircle className="w-5 h-5" /> },
  { label: 'Google Review Poster', icon: <PlusCircle className="w-5 h-5" /> },
  { label: 'Monitoring & Alerts', icon: <MonitorDot className="w-5 h-5" /> },
  { label: 'Uptime Monitoring', icon: <ShieldCheck className="w-5 h-5" /> },
  { label: 'Priority Indexing Support', icon: <Zap className="w-5 h-5" /> },
  { label: 'Integrations (Slack, Zapier, etc.)', icon: <Globe className="w-5 h-5" /> },
  { label: 'Reporting & Analytics', icon: <LineChart className="w-5 h-5" /> },
  { label: 'Team Collaboration', icon: <UserCheck className="w-5 h-5" /> },
  { label: 'Dedicated Support', icon: <Star className="w-5 h-5" /> },
  { label: 'Unlimited Sites & Monitors', icon: <Cloud className="w-5 h-5" /> },
  { label: 'Keyword Tools', icon: <PieChart className="w-5 h-5" /> },
  { label: 'Smart Tasks', icon: <Activity className="w-5 h-5" /> },
  { label: 'Automated Alerts', icon: <AlertCircle className="w-5 h-5" /> },
  { label: 'Internal Link Checker', icon: <Link2 className="w-5 h-5" /> },
];

const planFeatures = [
  // Free
  [
    'AI SEO Agent',
    'Schema Generator',
    'Basic SEO Audit for 1 page',
    '10 URL indexing requests/day',
    '1 Uptime monitor',
    'Internal Link Checker',
  ],
  // Pro
  [
    'AI SEO Agent',
    'Schema Generator',
    'Full Site SEO Audit',
    'Unlimited URL indexing',
    '10 Uptime Monitors',
    'Priority Indexing Support',
    'Monitoring & Alerts',
    'Integrations (Slack, Zapier, etc.)',
    'Reporting & Analytics',
    'Keyword Tools',
    'Smart Tasks',
    'Internal Link Checker',
  ],
  // Agency
  [
    'AI SEO Agent',
    'Schema Generator',
    'Full Site SEO Audit',
    'Unlimited URL indexing',
    'Unlimited Sites & Monitors',
    'Priority Indexing Support',
    'Monitoring & Alerts',
    'Integrations (Slack, Zapier, etc.)',
    'Reporting & Analytics',
    'Keyword Tools',
    'Smart Tasks',
    'Internal Link Checker',
    'Team Collaboration',
    'Dedicated Support',
  ],
];

const planBlurbs = [
  'Start your SEO journey with essential tools and AI guidance. Perfect for individuals and small sites.',
  'Unlock advanced features, automation, and integrations for serious growth. Best for small businesses.',
  'Scale with comprehensive tools, collaboration, and priority support. Built for growing businesses and agencies.',
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for testing and small websites',
    blurb: planBlurbs[0],
    features: planFeatures[0],
    buttonText: 'Start Free',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    popular: false,
  },
  {
    name: 'Basic',
    price: '$20',
    period: '/month',
    description: 'Ideal for small businesses and personal websites',
    blurb: planBlurbs[1],
    features: planFeatures[1],
    buttonText: 'Start Free Trial',
    buttonStyle: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white',
    popular: true,
  },
  {
    name: 'Professional',
    price: '$38',
    period: '/month',
    description: 'Perfect for growing businesses and agencies',
    blurb: planBlurbs[2],
    features: planFeatures[2],
    buttonText: 'Start Free Trial',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    popular: false,
  },
];

const NewPricing: React.FC = () => {
  return (
    <section className="relative z-10 px-6 py-24" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Scale up as your website grows.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative backdrop-blur-xl rounded-2xl p-8 lg:p-10 border transition-all duration-300 hover:scale-105 shadow-xl dark:shadow-[0_4px_32px_0_rgba(80,0,120,0.18)]
                ${plan.popular 
                  ? 'bg-gradient-to-br from-white/95 via-purple-50 to-purple-100 dark:from-gray-900/60 dark:via-purple-900/30 dark:to-purple-900/10 border-purple-500/50 dark:border-purple-400/30 shadow-lg shadow-purple-500/20 scale-105' 
                  : 'bg-white/90 dark:bg-gray-900/30 border-gray-200/50 dark:border-white/10 hover:bg-white/95 dark:hover:bg-gray-900/40'}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-7 py-2 rounded-full text-base font-bold shadow-xl tracking-wide border-4 border-white dark:border-gray-900">
                    RECOMMENDED
                  </div>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">{plan.description}</p>
                <p className="text-sm text-purple-600 dark:text-purple-300 mb-4 font-medium">{plan.blurb}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2 text-lg">{plan.period}</span>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {allFeatures.map((feature, featureIndex) => {
                  const included = plan.features.includes(feature.label);
                  return (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                        ${included ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-800 border border-gray-300 dark:border-gray-700'}`}
                      >
                        {included ? <Check className="h-4 w-4 text-white" /> : <X className="h-4 w-4 text-gray-400" />}
                      </div>
                      <span className={`flex items-center gap-2 text-lg leading-relaxed
                        ${included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 line-through'}`}
                      >
                        {feature.icon}
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {plan.buttonText === 'Contact Sales' ? (
                <Link
                  href="/contact"
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle} block text-center`}
                >
                  {plan.buttonText}
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle} block text-center`}
                >
                  {plan.buttonText}
                </Link>
              )}
            </div>
          ))}
        </div>
        
        {/* See More Plans Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-200/20 dark:border-purple-800/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need More Power?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Explore our complete range of plans including Advanced, Premium, and Custom Enterprise solutions 
              with higher quotas, priority support, and dedicated features.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>View All Plans & Pricing</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewPricing; 