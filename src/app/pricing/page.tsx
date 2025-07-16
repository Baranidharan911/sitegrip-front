'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Check, Star, Zap, Crown, Users, BarChart3, Globe, Shield, Database, Search, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { isAuthenticated } from '@/utils/auth';
import { toast } from 'react-hot-toast';

const NewHeader = dynamic(() => import('@/components/Home/NewHeader'), { ssr: false });
const NewFooter = dynamic(() => import('@/components/Home/NewFooter'), { ssr: false });
const Contact = dynamic(() => import('@/components/Home/Contact'), { ssr: false });

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for testing and small websites',
    icon: Zap,
    color: 'from-slate-400 to-slate-600',
    features: [
      '10 URLs/day indexing',
      'Basic crawling',
      'Testing only',
      'Email support',
      'Basic analytics'
    ],
    cta: 'Start Free',
    popular: false,
    quota: '10 URLs/day'
  },
  {
    name: 'Basic',
    price: '$20',
    period: '/month',
    description: 'Ideal for small businesses and personal websites',
    icon: Database,
    color: 'from-blue-500 to-blue-600',
    features: [
      '50 URLs/day indexing',
      'Basic crawling',
      'Email support',
      'Advanced analytics',
      'Status tracking',
      'Bulk URL submission'
    ],
    cta: 'Start Free Trial',
    popular: false,
    quota: '50 URLs/day'
  },
  {
    name: 'Professional',
    price: '$38',
    period: '/month',
    description: 'Perfect for growing businesses and agencies',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    features: [
      '100 URLs/day indexing',
      'Advanced crawling',
      'Priority support',
      'Advanced analytics',
      'Real-time monitoring',
      'GSC integration',
      'Batch processing',
      'API access'
    ],
    cta: 'Start Free Trial',
    popular: true,
    quota: '100 URLs/day'
  },
  {
    name: 'Advanced',
    price: '$56',
    period: '/month',
    description: 'For established businesses with high indexing needs',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500',
    features: [
      '150 URLs/day indexing',
      'Unlimited crawling',
      'Priority support',
      'Advanced analytics',
      'Real-time monitoring',
      'GSC integration',
      'Webhook notifications',
      'Priority processing',
      'Custom integrations'
    ],
    cta: 'Start Free Trial',
    popular: false,
    quota: '150 URLs/day'
  },
  {
    name: 'Premium',
    price: '$72',
    period: '/month',
    description: 'Maximum performance for high-traffic websites',
    icon: Globe,
    color: 'from-orange-500 to-amber-500',
    features: [
      '200 URLs/day indexing',
      'Unlimited crawling',
      'Premium support',
      'Advanced analytics',
      'Real-time monitoring',
      'GSC integration',
      'Webhook notifications',
      'Priority processing',
      'Custom integrations',
      'Dedicated support'
    ],
    cta: 'Start Free Trial',
    popular: false,
    quota: '200 URLs/day'
  },
  {
    name: 'Custom 500',
    price: '$120',
    period: '/month',
    description: 'High-volume indexing for large websites',
    icon: BarChart3,
    color: 'from-indigo-500 to-purple-600',
    features: [
      '500 URLs/day indexing',
      'Unlimited crawling',
      'Dedicated support',
      'Advanced analytics',
      'Real-time monitoring',
      'GSC integration',
      'Webhook notifications',
      'Priority processing',
      'Custom integrations',
      'SLA guarantee',
      'Custom reporting'
    ],
    cta: 'Contact Sales',
    popular: false,
    quota: '500 URLs/day'
  },
  {
    name: 'Custom 1000',
    price: '$150',
    period: '/month',
    description: 'Enterprise-level indexing for massive websites',
    icon: Shield,
    color: 'from-cyan-500 to-blue-600',
    features: [
      '1000 URLs/day indexing',
      'Unlimited crawling',
      'Dedicated support',
      'Advanced analytics',
      'Real-time monitoring',
      'GSC integration',
      'Webhook notifications',
      'Priority processing',
      'Custom integrations',
      'SLA guarantee',
      'Custom reporting',
      'Account manager'
    ],
    cta: 'Contact Sales',
    popular: false,
    quota: '1000 URLs/day'
  },
  {
    name: 'Custom 2000',
    price: '$200',
    period: '/month',
    description: 'Maximum scale for enterprise applications',
    icon: Users,
    color: 'from-pink-500 to-rose-600',
    features: [
      '2000 URLs/day indexing',
      'Unlimited crawling',
      'Dedicated support',
      'Advanced analytics',
      'Real-time monitoring',
      'GSC integration',
      'Webhook notifications',
      'Priority processing',
      'Custom integrations',
      'SLA guarantee',
      'Custom reporting',
      'Dedicated account manager',
      'White-label options'
    ],
    cta: 'Contact Sales',
    popular: false,
    quota: '2000 URLs/day'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Unlimited scale with custom solutions',
    icon: Crown,
    color: 'from-violet-500 to-purple-600',
    features: [
      '10000+ URLs/day indexing',
      'Unlimited everything',
      'Dedicated support team',
      'Custom solutions',
      'Advanced analytics',
      'Real-time monitoring',
      'GSC integration',
      'Webhook notifications',
      'Priority processing',
      'Custom integrations',
      'SLA guarantee',
      'Custom reporting',
      'Dedicated account manager',
      'White-label solutions',
      'Custom development'
    ],
    cta: 'Contact Sales',
    popular: false,
    quota: '10000+ URLs/day'
  }
];

const features = [
  {
    title: 'Google Indexing API',
    description: 'Direct integration with Google\'s official indexing API for fastest results',
    icon: Search
  },
  {
    title: 'Real-time Analytics',
    description: 'Monitor your indexing progress with live status updates and detailed reports',
    icon: BarChart3
  },
  {
    title: 'Bulk Processing',
    description: 'Submit thousands of URLs efficiently with our optimized batch processing',
    icon: Database
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-level security to protect your URLs and indexing data',
    icon: Shield
  }
];

export default function PricingPage() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [selectedPlanLoading, setSelectedPlanLoading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsUserAuthenticated(isAuthenticated());
  }, []);

  // Function to handle plan selection for authenticated users
  const handlePlanSelection = async (planName: string, planPrice: string) => {
    if (!isUserAuthenticated) {
      // For non-authenticated users, redirect to signup
      window.location.href = `/signup?plan=${planName.toLowerCase()}&price=${planPrice.replace('$', '')}&tier=${planName.toLowerCase()}`;
      return;
    }

    setIsUpdatingPlan(true);
    setSelectedPlanLoading(planName);

    try {
      // Get user token from localStorage
      const userData = localStorage.getItem('Sitegrip-user');
      if (!userData) {
        toast.error('Please log in to select a plan');
        return;
      }

      const user = JSON.parse(userData);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${API_BASE_URL}/api/auth/update-tier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken || ''}`,
        },
        body: JSON.stringify({
          planName: planName.toLowerCase(),
          planPrice: planPrice.replace('$', ''),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully upgraded to ${planName} plan!`);
        // Signal the header to refresh tier information
        localStorage.setItem('Sitegrip-user-tier-updated', 'true');
        // Optionally refresh user data or redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard/overview';
        }, 1500);
      } else {
        toast.error(result.message || 'Failed to update plan');
      }
    } catch (error) {
      console.error('Plan selection error:', error);
      toast.error('Failed to update plan. Please try again.');
    } finally {
      setIsUpdatingPlan(false);
      setSelectedPlanLoading(null);
    }
  };

  // Update CTA text based on authentication status
  const getCtaText = (originalCta: string) => {
    if (!mounted) return originalCta; // Prevent hydration mismatch
    if (!isUserAuthenticated) return originalCta;
    
    // If user is authenticated, change trial/free text to plan selection
    if (originalCta === 'Start Free Trial' || originalCta === 'Start Your Free Trial') {
      return 'Select Plan';
    }
    if (originalCta === 'Start Free') {
      return 'Current Plan';
    }
    return originalCta;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-black dark:via-purple-950 dark:to-black relative overflow-hidden">
              {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

      <NewHeader />
      
      <main className="relative z-10 container mx-auto px-4 py-8 pt-40">
        {/* Hero Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-slate-200/50 dark:border-white/20 rounded-full px-6 py-3 mb-8">
            <Sparkles className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
            <span className="text-slate-700 dark:text-white/90 font-medium">Comprehensive SEO & Performance Tools</span>
          </div>
          
                     <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent mb-6 leading-tight">
             SEO & Performance Suite
             <br />
             <span className="text-4xl md:text-6xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
               Plans & Pricing
             </span>
           </h1>
          
                     <p className="text-xl md:text-2xl text-slate-600 dark:text-white/70 max-w-4xl mx-auto leading-relaxed">
             Choose the perfect plan for your comprehensive SEO needs. Get Google indexing, performance monitoring, 
             analytics, crawler tools, and advanced reporting all in one powerful platform.
           </p>
        </div>

        {/* Recommended Plans */}
        <div className="mb-20">
                     <div className="text-center mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
               Recommended Plans
             </h2>
             <p className="text-slate-600 dark:text-white/60 text-lg">
               Perfect for most websites and businesses
             </p>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.slice(0, 5).map((plan, index) => (
              <div
                key={plan.name}
                className={`relative group ${
                  plan.popular 
                    ? 'lg:scale-110 lg:-translate-y-4' 
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full text-sm font-bold flex items-center shadow-xl">
                      <Star className="w-4 h-4 mr-2 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                                 <div className={`h-full bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-700 hover:scale-105 hover:bg-white/90 dark:hover:bg-white/10 ${
                   plan.popular 
                     ? 'border-purple-500/50 shadow-2xl shadow-purple-500/25' 
                     : 'border-slate-200/50 dark:border-white/10 hover:border-slate-300/70 dark:hover:border-white/20'
                 }`}>
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${plan.color} p-5 mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                      <plan.icon className="w-full h-full text-white" />
                    </div>
                    
                                         <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                       {plan.name}
                     </h3>
                     
                     <p className="text-slate-600 dark:text-white/60 mb-6 leading-relaxed">
                       {plan.description}
                     </p>
                    
                                         <div className="mb-4">
                       <span className="text-5xl font-bold text-slate-800 dark:text-white">
                         {plan.price}
                       </span>
                       <span className="text-slate-500 dark:text-white/50 text-lg">
                         {plan.period}
                       </span>
                     </div>
                    
                                         <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/20 dark:border-purple-500/30 rounded-full px-4 py-2">
                       <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                       <span className="text-slate-700 dark:text-white/90 font-semibold text-sm">
                         {plan.quota}
                       </span>
                     </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start group/item">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                                                 <span className="text-slate-700 dark:text-white/80 leading-relaxed">
                           {feature}
                         </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {plan.cta === 'Contact Sales' ? (
                    <Link
                      href="/contact"
                      className={`group/btn block w-full py-4 px-6 rounded-2xl font-bold text-center transition-all duration-500 relative overflow-hidden ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/20 hover:bg-slate-200 dark:hover:bg-white/20 hover:border-slate-300 dark:hover:border-white/30'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {getCtaText(plan.cta)}
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                      {plan.popular && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handlePlanSelection(plan.name, plan.price)}
                      disabled={selectedPlanLoading === plan.name}
                      className={`group/btn block w-full py-4 px-6 rounded-2xl font-bold text-center transition-all duration-500 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/20 hover:bg-slate-200 dark:hover:bg-white/20 hover:border-slate-300 dark:hover:border-white/30'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {selectedPlanLoading === plan.name ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            {getCtaText(plan.cta)}
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </span>
                      {plan.popular && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Volume Plans */}
        <div className="mb-20">
                     <div className="text-center mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
               Enterprise & High-Volume
             </h2>
             <p className="text-slate-600 dark:text-white/60 text-lg">
               Scalable solutions for enterprise needs
             </p>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.slice(5).map((plan, index) => (
              <div
                key={plan.name}
                                 className="group bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-white/10 hover:border-slate-300/70 dark:hover:border-white/20 transition-all duration-500 hover:scale-105 hover:bg-white/90 dark:hover:bg-white/10"
              >
                <div className="text-center mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} p-3 mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                    <plan.icon className="w-full h-full text-white" />
                  </div>
                  
                                     <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                     {plan.name}
                   </h3>
                   
                   <div className="mb-3">
                     <span className="text-2xl font-bold text-slate-800 dark:text-white">
                       {plan.price}
                     </span>
                     <span className="text-slate-500 dark:text-white/50">
                       {plan.period}
                     </span>
                   </div>
                  
                                     <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-500/20 dark:border-blue-500/30 rounded-full px-3 py-1">
                     <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
                     <span className="text-slate-700 dark:text-white/90 font-medium text-xs">
                       {plan.quota}
                     </span>
                   </div>
                </div>

                <ul className="space-y-2 mb-6 text-sm">
                  {plan.features.slice(0, 5).map((feature, featureIndex) => (
                                         <li key={featureIndex} className="flex items-start">
                       <Check className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                       <span className="text-slate-700 dark:text-white/70">
                         {feature}
                       </span>
                     </li>
                  ))}
                  {plan.features.length > 5 && (
                                         <li className="text-slate-500 dark:text-white/40 text-xs font-medium">
                       +{plan.features.length - 5} more features
                     </li>
                  )}
                </ul>

                <Link
                  href="/contact"
                                     className="group/btn block w-full py-3 px-4 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white font-semibold rounded-xl text-center border border-slate-200 dark:border-white/20 hover:bg-slate-200 dark:hover:bg-white/20 hover:border-slate-300 dark:hover:border-white/30 transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
                     <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
               Why Choose SiteGrip?
             </h2>
             <p className="text-slate-600 dark:text-white/60 text-lg">
               Built for performance, designed for results
             </p>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                                 className="group text-center bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-white/10 hover:border-slate-300/70 dark:hover:border-white/20 hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-500 hover:scale-105"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-4 mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-full h-full text-white" />
                </div>
                
                                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                   {feature.title}
                 </h3>
                 
                 <p className="text-slate-600 dark:text-white/60 leading-relaxed">
                   {feature.description}
                 </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
                 <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-white/10 mb-20">
                     <div className="text-center mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
               Frequently Asked Questions
             </h2>
             <p className="text-slate-600 dark:text-white/60 text-lg">
               Everything you need to know about our comprehensive SEO platform
             </p>
           </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-8">
                             <div className="group">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                   What features are included in SiteGrip?
                 </h3>
                 <p className="text-slate-700 dark:text-white/70 leading-relaxed">
                   SiteGrip includes Google Indexing API, performance monitoring, SEO crawling, analytics, broken link detection, and comprehensive reporting tools.
                 </p>
               </div>
              
                             <div className="group">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                   How fast is the indexing?
                 </h3>
                 <p className="text-slate-700 dark:text-white/70 leading-relaxed">
                   Using Google's official API, most URLs are indexed within 24-48 hours compared to weeks with traditional methods.
                 </p>
               </div>
               
               <div className="group">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                   Can I upgrade or downgrade anytime?
                 </h3>
                 <p className="text-slate-700 dark:text-white/70 leading-relaxed">
                   Yes, you can change your plan at any time. Changes take effect immediately with prorated billing.
                 </p>
               </div>
            </div>
            
                         <div className="space-y-8">
               <div className="group">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                   What happens if I exceed my daily quota?
                 </h3>
                 <p className="text-slate-700 dark:text-white/70 leading-relaxed">
                   URLs submitted beyond your daily quota will be queued for the next day. We recommend upgrading for consistent high-volume needs.
                 </p>
               </div>
               
               <div className="group">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                   Do you offer a free trial?
                 </h3>
                 <p className="text-slate-700 dark:text-white/70 leading-relaxed">
                   Yes, all paid plans include a 14-day free trial. The Free plan is available permanently for testing.
                 </p>
               </div>
               
               <div className="group">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                   Is there API access available?
                 </h3>
                 <p className="text-slate-700 dark:text-white/70 leading-relaxed">
                   API access is available starting with the Professional plan, allowing you to integrate SEO tools into your workflows.
                 </p>
               </div>
             </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
                     <div className="bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-blue-500/10 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 dark:border-white/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"></div>
             
             <div className="relative z-10">
               <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                 Ready to Boost Your SEO Performance?
               </h2>
               
               <p className="text-slate-700 dark:text-white/70 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                 Join thousands of websites using SiteGrip's comprehensive SEO suite to improve their search visibility and performance.
               </p>
               
               <button
                 onClick={() => handlePlanSelection('Basic', '$20')}
                 disabled={selectedPlanLoading === 'Basic'}
                 className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {selectedPlanLoading === 'Basic' ? (
                   <>
                     <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Updating...
                   </>
                 ) : (
                   <>
                     {getCtaText('Start Your Free Trial')}
                     <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                   </>
                 )}
               </button>
               
               <p className="text-slate-500 dark:text-white/50 text-sm mt-4">
                 No credit card required • 14-day free trial
               </p>
             </div>
          </div>
        </div>
      </main>
      
      <Contact />
      <NewFooter />
    </div>
  );
} 