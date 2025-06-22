'use client';
import { ShieldCheck } from 'lucide-react';

const PricingSection = () => (
  <section id="pricing" className="bg-gray-100 dark:bg-gray-950 py-20 md:py-32">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
      <p className="text-lg md:text-xl text-gray-700 dark:text-gray-400 mb-16 max-w-3xl mx-auto">
        Choose the plan that fits your needs. Scale up as your website grows.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
          {
            title: 'Free',
            price: '$0',
            sub: '/month',
            features: [
              '10 URL Indexing requests/day',
              'Basic SEO Audit for 10 pages',
              '1 Uptime Monitor',
              'Email alerts only',
              'No priority indexing',
            ],
            active: false,
          },
          {
            title: 'Pro',
            price: '$29',
            sub: '/month',
            features: [
              'Unlimited URL Indexing',
              'Full Site SEO Audit',
              '10 Uptime Monitors',
              'Email & Webhook alerts',
              'Priority indexing support',
            ],
            active: true,
          },
          {
            title: 'Agency',
            price: '$99',
            sub: '/month',
            features: [
              'All Pro features',
              'Unlimited Sites & Monitors',
              'Team Collaboration',
              'Custom Reporting',
              'Dedicated Support',
            ],
            active: false,
          },
        ].map(({ title, price, sub, features, active }) => (
          <div
            key={title}
            className={`p-8 rounded-3xl shadow-xl flex flex-col items-center border transition-transform duration-300 ${
              active
                ? 'bg-gradient-to-br from-purple-700 to-indigo-700 text-white border-emerald-400 scale-[1.05] z-10'
                : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            } transform hover:scale-[1.07] relative`}
          >
            {active && (
              <span className="absolute top-0 right-0 -mt-4 -mr-4 bg-emerald-400 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                Recommended
              </span>
            )}
            <h3 className="text-3xl font-bold mb-4">{title}</h3>
            <p className="text-5xl font-extrabold mb-6">
              {price}
              <span className="text-lg">{sub}</span>
            </p>
            <p className={`mb-8 text-center ${active ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
              {active
                ? 'Ideal for growing websites and marketers.'
                : title === 'Free'
                ? 'Great for trying out the basics.'
                : 'Perfect for agencies and multiple clients.'}
            </p>
            <ul className="text-left space-y-3 mb-10">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <ShieldCheck
                    className={`${
                      active ? 'text-emerald-300' : i < 3 ? 'text-green-500' : 'text-gray-500 dark:text-gray-600'
                    } mr-3 w-5 h-5`}
                  />
                  <span className={i < 3 || active ? '' : 'opacity-70'}>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 ${
                active
                  ? 'bg-white text-purple-700 hover:bg-gray-200 focus:ring-white'
                  : 'bg-transparent border-2 border-purple-500 text-purple-500 hover:bg-purple-600 hover:text-white focus:ring-purple-500'
              }`}
            >
              {title === 'Agency' ? 'Contact Sales' : title === 'Free' ? 'Start Free' : 'Choose Pro'}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
