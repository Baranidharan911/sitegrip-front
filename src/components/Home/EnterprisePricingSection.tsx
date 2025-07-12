import React, { useState } from 'react';
import { Check, X, Info, Zap, Star, Users, Link2, BarChart2, FileText, Activity, LineChart } from 'lucide-react';

const allFeatures = [
  { label: 'SEO Audits', icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Uptime Monitoring', icon: <Check className="w-5 h-5" /> },
  { label: 'Keyword Tracking', icon: <Check className="w-5 h-5" /> },
  { label: 'Google Indexing', icon: <Zap className="w-5 h-5" /> },
  { label: 'Internal Link Checker', icon: <Link2 className="w-5 h-5" /> },
  { label: 'Meta Tag Analyzer', icon: <FileText className="w-5 h-5" /> },
  { label: 'Performance Monitoring', icon: <Activity className="w-5 h-5" /> },
  { label: 'Reporting & Analytics', icon: <LineChart className="w-5 h-5" /> },
  { label: 'Team Collaboration', icon: <Users className="w-5 h-5" /> },
];

const URLS_INCLUDED_PER_WEBSITE = 2500;
const WEBSITE_PRICE = 20;
const EXTRA_URL_PRICE = 0.05;

const plans = [
  {
    name: 'Small',
    description: 'For individuals or small sites',
    minWebsites: 1,
    maxWebsites: 1,
    features: [0,1,2,3,4,5],
    cta: 'Get Started',
  },
  {
    name: 'Medium',
    description: 'Growing businesses',
    minWebsites: 2,
    maxWebsites: 5,
    features: [0,1,2,3,4,5,6],
    cta: 'Choose Medium',
  },
  {
    name: 'Pro',
    description: 'For agencies and pros',
    minWebsites: 6,
    maxWebsites: 20,
    features: [0,1,2,3,4,5,6,7,8],
    cta: 'Go Pro',
  },
  {
    name: 'Custom',
    description: 'Custom needs? Let’s talk!',
    minWebsites: 21,
    maxWebsites: Infinity,
    features: [0,1,2,3,4,5,6,7,8],
    cta: 'Contact Sales',
  },
];

function getBestPlan(websites: number) {
  if (websites > 20) return plans[3]; // Custom
  if (websites >= 6) return plans[2]; // Pro
  if (websites >= 2) return plans[1]; // Medium
  return plans[0]; // Small
}

function calculatePrice(websites: number, urls: number) {
  if (websites < 1) return '$0/mo';
  if (websites > 20) return 'Contact Us';
  const includedUrls = websites * URLS_INCLUDED_PER_WEBSITE;
  const extraUrls = Math.max(0, urls - includedUrls);
  const base = websites * WEBSITE_PRICE;
  const extra = extraUrls * EXTRA_URL_PRICE;
  return `$${(base + extra).toFixed(2)}/mo`;
}

function priceBreakdown(websites: number, urls: number) {
  const includedUrls = websites * URLS_INCLUDED_PER_WEBSITE;
  const extraUrls = Math.max(0, urls - includedUrls);
  const base = websites * WEBSITE_PRICE;
  const extra = extraUrls * EXTRA_URL_PRICE;
  if (extraUrls > 0) {
    return `Includes ${includedUrls} URLs (${URLS_INCLUDED_PER_WEBSITE} per website). $${WEBSITE_PRICE}/website + $${EXTRA_URL_PRICE}/extra URL (${extraUrls} extra URLs)`;
  }
  return `Includes ${includedUrls} URLs (${URLS_INCLUDED_PER_WEBSITE} per website). $${WEBSITE_PRICE}/website`;
}

export default function EnterprisePricingSection() {
  const [websites, setWebsites] = useState(1);
  const [urls, setUrls] = useState(2500);
  const bestPlan = getBestPlan(websites);
  return (
    <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-br from-white/80 to-slate-100/80 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur rounded-xl shadow-xl max-w-7xl mx-auto mt-12">
      <h2 className="text-4xl font-extrabold text-center mb-4 text-slate-900 dark:text-white">Flexible Pricing for Every Team</h2>
      <p className="text-center text-lg text-slate-600 dark:text-slate-300 mb-10">Choose a plan that fits your needs. Scale as you grow.</p>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
        {[bestPlan].map((plan) => (
          <div
            key={plan.name}
            className={`flex-1 bg-white/70 dark:bg-slate-900/70 rounded-2xl shadow-lg p-8 flex flex-col border-2 border-purple-500 scale-105 z-10 transition-transform`}
          >
            <div className="flex items-center gap-2 mb-2">
              {plan.name === 'Pro' && <Star className="w-5 h-5 text-purple-500" />}
              <span className="text-2xl font-bold">{plan.name}</span>
            </div>
            <div className="text-slate-500 dark:text-slate-300 mb-4">{plan.description}</div>
            <div className="mb-6 text-3xl font-extrabold text-slate-900 dark:text-white h-12 flex items-end">
              {plan.name !== 'Custom' ? calculatePrice(websites, urls) : <span>Contact Us</span>}
            </div>
            <ul className="mb-8 space-y-2">
              {allFeatures.map((feature, fIdx) => (
                <li key={feature.label} className="flex items-center gap-2 text-sm">
                  {plan.features.includes(fIdx) ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                  )}
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-2 rounded-lg font-semibold bg-purple-600 text-white hover:opacity-90 transition`}>{plan.cta}</button>
            {plan.name !== 'Custom' && (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {priceBreakdown(websites, urls)}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-12 max-w-2xl mx-auto bg-white/60 dark:bg-slate-900/60 rounded-xl p-6 shadow flex flex-col gap-6">
        <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          Number of Websites
          <Info className="w-4 h-4 text-blue-400" />
          <span className="sr-only">Each website is a unique domain you want to manage.</span>
          <span className="text-purple-600 font-bold ml-auto">{websites}</span>
        </label>
        <input
          type="range"
          min={1}
          max={100}
          value={websites}
          onChange={e => setWebsites(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          URLs to Index per Month
          <Info className="w-4 h-4 text-blue-400" />
          <span className="sr-only">Number of URLs you want to index monthly.</span>
          <span className="text-purple-600 font-bold ml-auto">{urls}</span>
        </label>
        <input
          type="range"
          min={500}
          max={20000}
          step={100}
          value={urls}
          onChange={e => setUrls(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
      </div>
    </section>
  );
} 