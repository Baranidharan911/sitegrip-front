import React, { useState } from 'react';
import { Check, Rocket, Lightbulb, ShieldCheck, FileText, Gauge, Code, TrendingUp, Grid, Users, Briefcase, Globe } from 'lucide-react';

const FEATURES = {
  core: [
    { icon: <Rocket className="w-5 h-5 text-purple-500" />, text: 'Rapid Indexing' },
    { icon: <Lightbulb className="w-5 h-5 text-emerald-500" />, text: 'Smart SEO Audits' },
    { icon: <ShieldCheck className="w-5 h-5 text-blue-500" />, text: 'Reliable Uptime Monitoring' },
    { icon: <FileText className="w-5 h-5 text-purple-500" />, text: 'On-Page SEO Analysis' },
    { icon: <Gauge className="w-5 h-5 text-blue-500" />, text: 'Site Speed & Vitals' },
    { icon: <Code className="w-5 h-5 text-cyan-500" />, text: 'Broken Link Checker' },
    { icon: <TrendingUp className="w-5 h-5 text-orange-500" />, text: 'Keyword Tracking' },
    { icon: <Grid className="w-5 h-5 text-red-500" />, text: 'Sitemap Manager' },
  ],
  standard: [
    { icon: <Users className="w-5 h-5 text-purple-500" />, text: 'Team Collaboration' },
    { icon: <Briefcase className="w-5 h-5 text-blue-500" />, text: 'Priority Indexing Support' },
    { icon: <Globe className="w-5 h-5 text-emerald-500" />, text: 'Multi-site Management' },
  ],
  advanced: [
    { icon: <ShieldCheck className="w-5 h-5 text-yellow-500" />, text: 'Dedicated Account Manager' },
    { icon: <Gauge className="w-5 h-5 text-pink-500" />, text: 'Custom Integrations' },
    { icon: <Rocket className="w-5 h-5 text-cyan-500" />, text: 'Enterprise SLAs' },
  ],
};

const PLAN_CONFIG = [
  {
    name: 'Lite',
    monthly: 19,
    annual: 190, // 2 months free
    description: 'Essential tools for small businesses and personal projects.',
    features: FEATURES.core,
    button: 'Get Started',
    highlight: false,
    icon: <Rocket className="w-8 h-8 text-purple-500" />,
  },
  {
    name: 'Standard',
    monthly: 49,
    annual: 490, // 2 months free
    description: 'Perfect for growing teams and agencies.',
    features: [...FEATURES.core, ...FEATURES.standard],
    button: 'Most Popular',
    highlight: true,
    icon: <Users className="w-8 h-8 text-blue-500" />,
  },
  {
    name: 'Advanced',
    monthly: 99,
    annual: 990, // 2 months free
    description: 'Advanced features for large teams and enterprises.',
    features: [...FEATURES.core, ...FEATURES.standard, ...FEATURES.advanced],
    button: 'Contact Sales',
    highlight: false,
    icon: <Briefcase className="w-8 h-8 text-emerald-500" />,
  },
];

const NewPricing: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="relative z-10 px-6 py-24 bg-gradient-to-br from-white/80 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Scale up as your website grows.
          </p>
        </div>
        <div className="flex justify-center items-center mb-10">
          <span className={`mr-3 font-medium ${!annual ? 'text-purple-600' : 'text-gray-400'}`}>Monthly</span>
          <button
            className={`relative w-14 h-8 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center transition-colors duration-300 focus:outline-none`}
            onClick={() => setAnnual(a => !a)}
            aria-label="Toggle annual pricing"
          >
            <span
              className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md transition-transform duration-300 ${annual ? 'translate-x-6' : ''}`}
            />
            <span className="sr-only">Toggle annual pricing</span>
          </button>
          <span className={`ml-3 font-medium ${annual ? 'text-purple-600' : 'text-gray-400'}`}>Annual <span className="ml-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full align-middle">Save 2 months</span></span>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {PLAN_CONFIG.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative backdrop-blur-md rounded-2xl p-8 lg:p-10 border transition-all duration-300 hover:scale-105 shadow-lg dark:shadow-2xl overflow-hidden
                ${plan.highlight ? 'bg-white/95 dark:bg-gray-900/30 border-purple-500/50 dark:border-purple-400/30 shadow-lg shadow-purple-500/20 scale-105 ring-2 ring-purple-400/30' : 'bg-white/90 dark:bg-gray-900/20 border-gray-200/50 dark:border-white/10 hover:bg-white/95 dark:hover:bg-gray-900/30'}
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                    MOST POPULAR
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center mb-8">
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg text-center">{plan.description}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                    {annual ? `$${plan.annual}` : `$${plan.monthly}`}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2 text-lg">/mo</span>
                </div>
                {annual && <span className="text-xs text-green-600 font-semibold">Billed annually</span>}
              </div>
              <div className="mb-8">
                <div className="font-semibold text-gray-900 dark:text-white mb-2 text-center">What's included:</div>
                <ul className="space-y-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-200 text-base">
                      <span className="mr-3">{f.icon}</span>
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none
                  ${plan.highlight ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:from-purple-600 hover:to-purple-700' : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white'}
                `}
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewPricing; 
