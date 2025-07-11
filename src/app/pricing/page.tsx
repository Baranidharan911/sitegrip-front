import React, { useState } from 'react';
import { Check, Rocket, Lightbulb, ShieldCheck, FileText, Gauge, Code, TrendingUp, Grid, Users, Briefcase, Globe } from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  { group: 'SEO Tools', features: [
    { icon: <FileText className="w-5 h-5 text-purple-500" />, label: 'On-Page SEO Analysis', plans: ['Lite', 'Standard', 'Advanced'] },
    { icon: <Gauge className="w-5 h-5 text-blue-500" />, label: 'Site Speed & Vitals', plans: ['Lite', 'Standard', 'Advanced'] },
    { icon: <Code className="w-5 h-5 text-cyan-500" />, label: 'Broken Link Checker', plans: ['Standard', 'Advanced'], badge: 'New' },
    { icon: <TrendingUp className="w-5 h-5 text-orange-500" />, label: 'Keyword Tracking', plans: ['Standard', 'Advanced'] },
    { icon: <Grid className="w-5 h-5 text-red-500" />, label: 'Sitemap Manager', plans: ['Advanced'], badge: 'Beta' },
  ]},
  { group: 'Monitoring', features: [
    { icon: <ShieldCheck className="w-5 h-5 text-green-500" />, label: 'Uptime Monitoring', plans: ['Lite', 'Standard', 'Advanced'] },
    { icon: <Lightbulb className="w-5 h-5 text-blue-500" />, label: 'Reliable Uptime Alerts', plans: ['Standard', 'Advanced'] },
  ]},
  { group: 'Collaboration', features: [
    { icon: <Users className="w-5 h-5 text-purple-500" />, label: 'Team Collaboration', plans: ['Standard', 'Advanced'] },
    { icon: <Briefcase className="w-5 h-5 text-blue-500" />, label: 'Priority Indexing Support', plans: ['Advanced'] },
    { icon: <Globe className="w-5 h-5 text-emerald-500" />, label: 'Multi-site Management', plans: ['Advanced'] },
  ]},
];

const PLANS = [
  {
    name: 'Lite',
    monthly: 19,
    annual: 190,
    description: 'Essential tools for small businesses and personal projects.',
    highlight: false,
    icon: <Rocket className="w-8 h-8 text-purple-500" />,
    button: 'Start Free',
    cta: '/signup',
  },
  {
    name: 'Standard',
    monthly: 49,
    annual: 490,
    description: 'Perfect for growing teams and agencies.',
    highlight: true,
    icon: <Users className="w-8 h-8 text-blue-500" />,
    button: 'Start 14-day Free Trial',
    cta: '/signup',
  },
  {
    name: 'Advanced',
    monthly: 99,
    annual: 990,
    description: 'Advanced features for large teams and enterprises.',
    highlight: false,
    icon: <Briefcase className="w-8 h-8 text-emerald-500" />,
    button: 'Contact Sales',
    cta: '/contact',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  return (
    <main className="min-h-screen bg-gradient-to-br from-white/80 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Choose the plan that fits your needs. Scale up as your website grows.</p>
        </div>
        <div className="flex justify-center items-center mb-10">
          <span className={`mr-3 font-medium ${!annual ? 'text-purple-600' : 'text-gray-400'}`}>Monthly</span>
          <button
            className="relative w-14 h-8 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center transition-colors duration-300 focus:outline-none"
            onClick={() => setAnnual(a => !a)}
            aria-label="Toggle annual pricing"
          >
            <span className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md transition-transform duration-300 ${annual ? 'translate-x-6' : ''}`}/>
            <span className="sr-only">Toggle annual pricing</span>
          </button>
          <span className={`ml-3 font-medium ${annual ? 'text-purple-600' : 'text-gray-400'}`}>Annual <span className="ml-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full align-middle">Save 2 months</span></span>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto mb-16">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative backdrop-blur-md rounded-2xl p-8 lg:p-10 border transition-all duration-300 hover:scale-105 shadow-lg dark:shadow-2xl overflow-hidden
                ${plan.highlight ? 'bg-white/95 dark:bg-gray-900/30 border-purple-500/50 dark:border-purple-400/30 shadow-lg shadow-purple-500/20 scale-105 ring-2 ring-purple-400/30' : 'bg-white/90 dark:bg-gray-900/20 border-gray-200/50 dark:border-white/10 hover:bg-white/95 dark:hover:bg-gray-900/30'}
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">MOST POPULAR</div>
                </div>
              )}
              <div className="flex flex-col items-center mb-8">
                <div className="mb-4">{plan.icon}</div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg text-center">{plan.description}</p>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                    {annual ? `$${plan.annual}` : `$${plan.monthly}`}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2 text-lg">/mo</span>
                </div>
                {annual && <span className="text-xs text-green-600 font-semibold">Billed annually</span>}
              </div>
              <Link href={plan.cta} className={`w-full block py-4 px-6 rounded-lg font-semibold text-lg text-center transition-all duration-200 transform hover:scale-105 focus:outline-none
                ${plan.highlight ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:from-purple-600 hover:to-purple-700' : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white'}
              `}>
                {plan.button}
              </Link>
            </div>
          ))}
        </div>
        <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-800 max-w-6xl mx-auto p-8 overflow-x-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compare Features</h3>
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="w-1/3"></th>
                {PLANS.map(plan => (
                  <th key={plan.name} className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map(group => (
                <React.Fragment key={group.group}>
                  <tr>
                    <td colSpan={4} className="pt-6 pb-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{group.group}</td>
                  </tr>
                  {group.features.map(f => (
                    <tr key={f.label} className="align-top">
                      <td className="flex items-center gap-3 py-2">
                        {f.icon}
                        <span className="font-medium text-gray-900 dark:text-white">{f.label}
                          {f.badge && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold align-middle ${f.badge === 'New' ? 'bg-yellow-200 text-yellow-800' : 'bg-purple-200 text-purple-800'}`}>{f.badge}</span>
                          )}
                        </span>
                      </td>
                      {PLANS.map(plan => (
                        <td key={plan.name} className="text-center">
                          {f.plans.includes(plan.name) ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-300 dark:text-gray-700">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="max-w-3xl mx-auto mt-16 text-center text-gray-600 dark:text-gray-300 text-lg">
          <div className="mb-4 font-semibold">30-Day Money-Back Guarantee. No credit card required to start.</div>
          <div>Need a custom plan or have questions? <Link href="/contact" className="text-purple-600 hover:underline font-semibold">Contact our team</Link>.</div>
        </div>
      </div>
    </main>
  );
} 