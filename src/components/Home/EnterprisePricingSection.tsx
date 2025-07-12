import React, { useState } from 'react';
import { Check, X, Star, Bot, Grid, BarChart2, FileText, Users, Layout, MessageCircle, PlusCircle, MonitorDot, ShieldCheck, Zap, Globe, LineChart, UserCheck, Cloud, PieChart, Activity, AlertCircle, Link2 } from 'lucide-react';

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

const plans = [
  {
    name: 'Free',
    description: 'Start your SEO journey with essential tools and AI guidance. Perfect for individuals and small sites.',
    features: [0,1,2,3,4,5,19],
    cta: 'Start Free',
    price: '$0',
    period: '/mo',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Unlock advanced features, automation, and integrations for serious growth. Best for businesses and pros.',
    features: [0,1,2,3,4,5,6,7,8,9,10,11,12,16,17,18,19,20],
    cta: 'Choose Pro',
    price: '$29',
    period: '/mo',
    popular: true,
  },
  {
    name: 'Agency',
    description: 'Scale with unlimited power, collaboration, and priority support. Built for agencies and large teams.',
    features: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    cta: 'Contact Sales',
    price: '$99',
    period: '/mo',
    popular: false,
  },
];

export default function EnterprisePricingSection() {
  return (
    <section className="w-full py-20 px-4 md:px-8 bg-gradient-to-br from-white/80 to-slate-100/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur rounded-xl shadow-xl max-w-7xl mx-auto mt-12">
      <h2 className="text-4xl font-extrabold text-center mb-4 text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
      <p className="text-center text-lg text-slate-600 dark:text-slate-300 mb-10">Choose the plan that fits your needs. Scale up as your website grows.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <div
            key={plan.name}
            className={`relative group transition-transform duration-300 hover:scale-105 ${
              plan.popular ? 'z-20 md:scale-110 md:-translate-y-6 shadow-2xl border-2 border-purple-500/70' : 'shadow-xl border border-slate-200 dark:border-slate-700'
            } rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-10 flex flex-col items-center`}
          >
            {plan.popular && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-2 rounded-full text-base font-bold shadow-xl tracking-wide border-4 border-white dark:border-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 mr-1" /> Most Popular
                </div>
              </div>
            )}
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2 text-center">{plan.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-center text-lg">{plan.description}</p>
            <div className="mb-8 flex flex-col items-center">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
              <span className="text-lg text-slate-500 dark:text-slate-300">{plan.period}</span>
            </div>
            <ul className="space-y-4 mb-10 w-full">
              {allFeatures.map((feature, fIdx) => (
                <li key={feature.label} className="flex items-center gap-3 text-base text-slate-700 dark:text-slate-200">
                  {plan.features.includes(fIdx) ? (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                  )}
                  <span className="flex items-center gap-2">{feature.icon}{feature.label}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-4 px-6 rounded-xl font-semibold text-center text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
              plan.popular
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
            }`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
} 