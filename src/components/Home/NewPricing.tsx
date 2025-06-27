import React from 'react';
import { Check } from 'lucide-react';

const NewPricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Great for trying out the basics.',
      features: [
        '10 URL indexing requests/day',
        'Basic SEO Audit for 1 page',
        '1 Uptime monitor',
      ],
      buttonText: 'Start Free',
      buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'Ideal for growing websites.',
      features: [
        'Unlimited URL indexing',
        'Full Site SEO Audit',
        '10 Uptime Monitors',
        'Priority indexing support',
      ],
      buttonText: 'Choose Pro',
      buttonStyle: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white',
      popular: true,
    },
    {
      name: 'Agency',
      price: '$99',
      period: '/month',
      description: 'Perfect for agencies & clients.',
      features: [
        'All Pro features',
        'Unlimited Sites & Monitors',
        'Team Collaboration',
        'Dedicated Support',
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
      popular: false,
    },
  ];

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
              className={`relative backdrop-blur-md rounded-2xl p-8 lg:p-10 border transition-all duration-300 hover:transform hover:scale-105 shadow-lg dark:shadow-2xl ${
                plan.popular 
                  ? 'bg-white/95 dark:bg-gray-900/30 border-purple-500/50 dark:border-purple-400/30 shadow-lg shadow-purple-500/20 scale-105' 
                  : 'bg-white/90 dark:bg-gray-900/20 border-gray-200/50 dark:border-white/10 hover:bg-white/95 dark:hover:bg-gray-900/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    RECOMMENDED
                  </div>
                </div>
              )}
              
              <div className="text-center mb-10">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">{plan.description}</p>
                
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2 text-lg">{plan.period}</span>
                </div>
              </div>
              
              <div className="space-y-6 mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
              
              <button className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${plan.buttonStyle}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewPricing; 