import React from 'react';
import Link from 'next/link';
import { Check, X, Sparkles, Grid, BarChart2, FileText, Users, Layout, MessageCircle, PlusCircle, MonitorDot, ShieldCheck, Zap, Globe, LineChart, UserCheck, Star, Bot, Link2, PieChart, Activity, Cloud, AlertCircle, Database, Crown, TrendingUp, BarChart3, Shield } from 'lucide-react';

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
    '10 URLs/day indexing',
    'Basic crawling',
    'Testing only',
    'Email support',
    'Basic analytics',
  ],
  // Basic
  [
    '50 URLs/day indexing',
    'Basic crawling',
    'Email support',
    'Advanced analytics',
    'Status tracking',
    'Bulk URL submission',
  ],
  // Professional
  [
    '100 URLs/day indexing',
    'Advanced crawling',
    'Priority support',
    'Advanced analytics',
    'Real-time monitoring',
    'GSC integration',
    'Batch processing',
    'API access',
  ],
];

const advancedFeatures = [
  // Advanced
  [
    '150 URLs/day indexing',
    'Unlimited crawling',
    'Priority support',
    'Advanced analytics',
    'Real-time monitoring',
    'GSC integration',
    'Webhook notifications',
    'Priority processing',
    'Custom integrations',
  ],
  // Premium
  [
    '200 URLs/day indexing',
    'Unlimited crawling',
    'Premium support',
    'Advanced analytics',
    'Real-time monitoring',
    'GSC integration',
    'Webhook notifications',
    'Priority processing',
    'Custom integrations',
    'Dedicated support',
  ],
];

const enterpriseFeatures = [
  // Custom 500
  [
    '500 URLs/day indexing',
    'Unlimited crawling',
    'Dedicated support',
    'Advanced analytics',
    'Real-time monitoring',
    '+6 more features',
  ],
  // Custom 1000
  [
    '1000 URLs/day indexing',
    'Unlimited crawling',
    'Dedicated support',
    'Advanced analytics',
    'Real-time monitoring',
    '+7 more features',
  ],
  // Custom 2000
  [
    '2000 URLs/day indexing',
    'Unlimited crawling',
    'Dedicated support',
    'Advanced analytics',
    'Real-time monitoring',
    '+8 more features',
  ],
  // Enterprise Custom
  [
    '10000+ URLs/day indexing',
    'Unlimited everything',
    'Dedicated support team',
    'Custom solutions',
    'Advanced analytics',
    '+10 more features',
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
    buttonText: 'Current Plan',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    popular: false,
    icon: Zap,
    iconColor: 'text-gray-500',
    quota: '10 URLs/day',
    quotaColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  {
    name: 'Basic',
    price: '$20',
    period: '/month',
    description: 'Ideal for small businesses and personal websites',
    blurb: planBlurbs[1],
    features: planFeatures[1],
    buttonText: 'Select Plan',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    popular: false,
    icon: Database,
    iconColor: 'text-blue-500',
    quota: '50 URLs/day',
    quotaColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  {
    name: 'Professional',
    price: '$38',
    period: '/month',
    description: 'Perfect for growing businesses and agencies',
    blurb: planBlurbs[2],
    features: planFeatures[2],
    buttonText: 'Select Plan',
    buttonStyle: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white',
    popular: true,
    icon: Crown,
    iconColor: 'text-purple-500',
    quota: '100 URLs/day',
    quotaColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
];

const advancedPlans = [
  {
    name: 'Advanced',
    price: '$56',
    period: '/month',
    description: 'For established businesses with high indexing needs',
    features: advancedFeatures[0],
    buttonText: 'Select Plan',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    icon: TrendingUp,
    iconColor: 'text-green-500',
    quota: '150 URLs/day',
    quotaColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  {
    name: 'Premium',
    price: '$72',
    period: '/month',
    description: 'Maximum performance for high-traffic websites',
    features: advancedFeatures[1],
    buttonText: 'Select Plan',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    icon: Globe,
    iconColor: 'text-orange-500',
    quota: '200 URLs/day',
    quotaColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  },
];

const enterprisePlans = [
  {
    name: 'Custom 500',
    price: '$120',
    period: '/month',
    description: 'High-volume indexing for growing enterprises',
    features: enterpriseFeatures[0],
    buttonText: 'Contact Sales',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    icon: BarChart3,
    iconColor: 'text-purple-500',
    quota: '500 URLs/day',
    quotaColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  {
    name: 'Custom 1000',
    price: '$150',
    period: '/month',
    description: 'Enterprise-grade indexing solutions',
    features: enterpriseFeatures[1],
    buttonText: 'Contact Sales',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    icon: Shield,
    iconColor: 'text-blue-500',
    quota: '1000 URLs/day',
    quotaColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  {
    name: 'Custom 2000',
    price: '$200',
    period: '/month',
    description: 'Ultra-high volume indexing platform',
    features: enterpriseFeatures[2],
    buttonText: 'Contact Sales',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    icon: Users,
    iconColor: 'text-pink-500',
    quota: '2000 URLs/day',
    quotaColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  {
    name: 'Enterprise',
    subname: 'Custom',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for enterprise needs',
    features: enterpriseFeatures[3],
    buttonText: 'Contact Sales',
    buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    icon: Crown,
    iconColor: 'text-purple-500',
    quota: '10000+ URLs/day',
    quotaColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
];

const NewPricing: React.FC = () => {
  return (
    <section className="relative z-10 px-6 py-24" id="pricing">
      <div className="max-w-7xl mx-auto">
        {/* Recommended Plans Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Recommended Plans
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Perfect for most websites and businesses.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto mb-24">
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
                    ★ Most Popular
                  </div>
                </div>
              )}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 ${plan.iconColor} bg-gray-100 dark:bg-gray-800`}>
                  <plan.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">{plan.description}</p>
                <p className="text-sm text-purple-600 dark:text-purple-300 mb-4 font-medium">{plan.blurb}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2 text-lg">{plan.period}</span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${plan.quotaColor}`}>
                  • {plan.quota}
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-500">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle} block text-center`}
              >
                {plan.buttonText} →
              </Link>
            </div>
          ))}
        </div>

        {/* Advanced & Premium Plans Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Advanced & Premium
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            For established businesses with high indexing needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto mb-24">
          {advancedPlans.map((plan, index) => (
            <div
              key={index}
              className="relative backdrop-blur-xl rounded-2xl p-8 lg:p-10 border bg-white/90 dark:bg-gray-900/30 border-gray-200/50 dark:border-white/10 hover:bg-white/95 dark:hover:bg-gray-900/40 transition-all duration-300 hover:scale-105 shadow-xl dark:shadow-[0_4px_32px_0_rgba(80,0,120,0.18)]"
            >
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 ${plan.iconColor} bg-gray-100 dark:bg-gray-800`}>
                  <plan.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">{plan.description}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2 text-lg">{plan.period}</span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${plan.quotaColor}`}>
                  • {plan.quota}
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-500">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/signup"
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle} block text-center`}
              >
                {plan.buttonText} →
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise & High-Volume Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Enterprise & High-Volume
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Scalable solutions for enterprise needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {enterprisePlans.map((plan, index) => (
            <div
              key={index}
              className="relative backdrop-blur-xl rounded-2xl p-8 lg:p-10 border bg-white/90 dark:bg-gray-900/30 border-gray-200/50 dark:border-white/10 hover:bg-white/95 dark:hover:bg-gray-900/40 transition-all duration-300 hover:scale-105 shadow-xl dark:shadow-[0_4px_32px_0_rgba(80,0,120,0.18)]"
            >
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 ${plan.iconColor} bg-gray-100 dark:bg-gray-800`}>
                  <plan.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                {plan.subname && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{plan.subname}</p>
                )}
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">{plan.description}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2 text-lg">{plan.period}</span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${plan.quotaColor}`}>
                  • {plan.quota}
                </div>
              </div>
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-500">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/contact"
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle} block text-center`}
              >
                {plan.buttonText} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewPricing; 