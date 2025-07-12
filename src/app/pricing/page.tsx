'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Check, Star, Zap, Crown, Users, BarChart3, Globe, Shield, MapPin } from 'lucide-react';

const NewHeader = dynamic(() => import('@/components/Home/NewHeader'), { ssr: false });
const NewFooter = dynamic(() => import('@/components/Home/NewFooter'), { ssr: false });
const Contact = dynamic(() => import('@/components/Home/Contact'), { ssr: false });

const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small businesses getting started with SEO',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      '5 Local Keyword Reports',
      'Basic Competitor Analysis',
      'GBP Audit (Monthly)',
      'Email Support',
      'Basic Analytics Dashboard',
      '10 Citation Submissions'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'Ideal for growing businesses serious about local SEO',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Unlimited Local Keyword Reports',
      'Advanced Competitor Analysis',
      'GBP Audit (Weekly)',
      'Priority Support',
      'Advanced Analytics Dashboard',
      'Unlimited Citation Submissions',
      'AI Content Generator',
      'Review Management',
      'Reputation Monitoring',
      'Local Rank Tracking'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For agencies and large businesses with multiple locations',
    icon: Users,
    color: 'from-orange-500 to-red-500',
    features: [
      'Everything in Professional',
      'Multi-location Management',
      'White-label Reports',
      'API Access',
      'Dedicated Account Manager',
      'Custom Integrations',
      'Advanced SEO Tags Generator',
      'Maps Audit & Optimization',
      'Listing Management',
      'Priority Phone Support'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

const features = [
  {
    title: 'Local SEO Focused',
    description: 'Specialized tools for local businesses to dominate local search results',
    icon: MapPin
  },
  {
    title: 'AI-Powered Insights',
    description: 'Advanced AI algorithms provide actionable recommendations',
    icon: BarChart3
  },
  {
    title: 'Multi-Platform Support',
    description: 'Manage your presence across Google, Bing, and other platforms',
    icon: Globe
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-level security to protect your business data',
    icon: Shield
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <NewHeader />
      <main className="container mx-auto px-4 py-8 pt-40">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Choose the perfect plan for your business. All plans include a 14-day free trial 
            with no credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative ${
                plan.popular 
                  ? 'md:scale-105 md:-translate-y-4' 
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} p-4 mx-auto mb-4 shadow-lg`}>
                    <plan.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-800 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                  } hover:scale-105`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-12">
            Why Choose SiteGrip?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 p-3 mx-auto mb-4">
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-700/50">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes, you can cancel your subscription at any time. No long-term contracts or hidden fees.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yes, all plans include a 14-day free trial with full access to all features.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We offer a 30-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/20 dark:border-blue-800/20">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Join thousands of businesses using SiteGrip to improve their local SEO performance.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </main>
      <Contact />
      <NewFooter />
    </div>
  );
} 