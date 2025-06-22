'use client';
import { Rocket, Lightbulb, ShieldCheck } from 'lucide-react';

const FeatureCards = () => (
  <section className="mt-[-4rem] relative z-10">
    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
      {[
        {
          icon: <Rocket className="text-white w-10 h-10" />,
          color: 'bg-purple-600',
          title: 'Rapid Indexing',
          text: 'Ensure your new pages are discovered and ranked by search engines instantly.',
          textColor: 'text-emerald-300',
        },
        {
          icon: <Lightbulb className="text-white w-10 h-10" />,
          color: 'bg-emerald-600',
          title: 'Smart SEO Audits',
          text: 'Identify and resolve critical SEO issues with actionable, expert-driven insights.',
          textColor: 'text-purple-300',
        },
        {
          icon: <ShieldCheck className="text-white w-10 h-10" />,
          color: 'bg-blue-600',
          title: 'Reliable Uptime',
          text: 'Monitor your site’s availability 24/7, with instant alerts for any downtime.',
          textColor: 'text-orange-300',
        },
      ].map((feature, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col items-center border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 transition-transform duration-300"
        >
          <div className={`${feature.color} p-4 rounded-full mb-6 shadow-lg`}>
            {feature.icon}
          </div>
          <h3 className={`text-2xl font-bold mb-3 ${feature.textColor}`}>{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">{feature.text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeatureCards;
