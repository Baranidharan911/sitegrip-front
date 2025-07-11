'use client';
import React, { useState } from 'react';
import { CheckCircle, Zap, ShieldCheck, Users, Globe, BarChart3, UserPlus, Star } from 'lucide-react';

const planFeatures = {
  Free: [
    { icon: <CheckCircle className="text-green-500 w-5 h-5" />, text: '10 URL indexing requests/day' },
    { icon: <Zap className="text-purple-500 w-5 h-5" />, text: 'Basic SEO Audit for 1 page' },
    { icon: <ShieldCheck className="text-blue-500 w-5 h-5" />, text: '1 Uptime monitor' },
  ],
  Pro: [
    { icon: <CheckCircle className="text-green-500 w-5 h-5" />, text: 'Unlimited URL indexing' },
    { icon: <Zap className="text-purple-500 w-5 h-5" />, text: 'Full Site SEO Audit' },
    { icon: <ShieldCheck className="text-blue-500 w-5 h-5" />, text: '10 Uptime Monitors per site' },
    { icon: <BarChart3 className="text-cyan-500 w-5 h-5" />, text: 'Priority indexing support' },
  ],
  Agency: [
    { icon: <Star className="text-yellow-500 w-5 h-5" />, text: 'All Pro features' },
    { icon: <Globe className="text-emerald-500 w-5 h-5" />, text: 'Unlimited Sites & Monitors' },
    { icon: <UserPlus className="text-pink-500 w-5 h-5" />, text: 'Team Collaboration' },
    { icon: <Users className="text-blue-500 w-5 h-5" />, text: 'Dedicated Support' },
  ],
};

function getProPrice(sites: number) {
  return 29 * sites;
}
function getAgencyPrice(sites: number) {
  if (sites <= 5) return 99;
  return 99 + (sites - 5) * 20;
}

const PricingSection = () => {
  const [sites, setSites] = useState(1);
  const proPrice = getProPrice(sites);
  const agencyPrice = getAgencyPrice(sites);

  return (
    <section id="pricing" className="bg-gray-100 dark:bg-gray-950 py-20 md:py-32 relative overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-400 mb-16 max-w-3xl mx-auto">
          Choose the plan that fits your needs. Scale up as your website grows.
        </p>
        {/* Slider */}
        <div className="flex flex-col items-center mb-12">
          <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">Number of Websites: <span className="text-purple-600 font-bold">{sites}</span></label>
          <div className="relative w-full max-w-md flex items-center">
            <input
              type="range"
              min={1}
              max={20}
              value={sites}
              onChange={e => setSites(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-lg appearance-none focus:outline-none slider-thumb-glow"
            />
            <div
              className="absolute left-0 top-6 text-xs text-gray-500"
              style={{ left: `calc(${((sites - 1) / 19) * 100}% - 12px)` }}
            >
              <span className="bg-white dark:bg-gray-900 px-2 py-1 rounded shadow border border-gray-200 dark:border-gray-700 font-bold text-purple-600">{sites}</span>
            </div>
          </div>
        </div>
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 flex flex-col items-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Free</div>
            <div className="mb-2 text-gray-500">Great for trying out the basics.</div>
            <div className="text-4xl font-extrabold text-purple-500 mb-1">$0</div>
            <div className="text-gray-500 mb-6">/month</div>
            <ul className="mb-8 space-y-3 w-full">
              {planFeatures.Free.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-base">{f.icon}{f.text}</li>
              ))}
            </ul>
            <button className="w-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition">Start Free</button>
          </div>
          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 flex flex-col items-center border-2 border-purple-400 dark:border-purple-600 relative scale-105 z-10">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">RECOMMENDED</div>
            <div className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Pro</div>
            <div className="mb-2 text-gray-500">Ideal for growing websites.</div>
            <div className="text-4xl font-extrabold text-purple-600 mb-1">${proPrice}</div>
            <div className="text-gray-500 mb-6">/month</div>
            <ul className="mb-8 space-y-3 w-full">
              {planFeatures.Pro.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-base">{f.icon}{f.text.replace('10 Uptime Monitors per site', `${10 * sites} Uptime Monitors`)}</li>
              ))}
            </ul>
            <button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg hover:from-purple-600 hover:to-cyan-600 transition">Choose Pro</button>
          </div>
          {/* Agency Plan */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 flex flex-col items-center border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Agency</div>
            <div className="mb-2 text-gray-500">Perfect for agencies & clients.</div>
            <div className="text-4xl font-extrabold text-purple-500 mb-1">${agencyPrice}</div>
            <div className="text-gray-500 mb-6">/month</div>
            <ul className="mb-8 space-y-3 w-full">
              {planFeatures.Agency.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-base">{f.icon}{f.text}</li>
              ))}
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-200 text-base font-semibold">{sites > 5 ? `+ $20/month per site over 5` : 'Up to 5 sites included'}</li>
            </ul>
            <button className="w-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition">Contact Sales</button>
          </div>
        </div>
      </div>
      {/* Slider thumb glow style */}
      <style jsx>{`
        .slider-thumb-glow::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(90deg, #a78bfa 0%, #06b6d4 100%);
          box-shadow: 0 0 0 6px #a78bfa44, 0 0 0 12px #06b6d444;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .slider-thumb-glow::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 10px #a78bfa66, 0 0 0 18px #06b6d466;
        }
        .slider-thumb-glow::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(90deg, #a78bfa 0%, #06b6d4 100%);
          box-shadow: 0 0 0 6px #a78bfa44, 0 0 0 12px #06b6d444;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .slider-thumb-glow::-moz-range-thumb:hover {
          box-shadow: 0 0 0 10px #a78bfa66, 0 0 0 18px #06b6d466;
        }
        .slider-thumb-glow::-ms-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(90deg, #a78bfa 0%, #06b6d4 100%);
          box-shadow: 0 0 0 6px #a78bfa44, 0 0 0 12px #06b6d444;
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .slider-thumb-glow::-ms-thumb:hover {
          box-shadow: 0 0 0 10px #a78bfa66, 0 0 0 18px #06b6d466;
        }
        input[type='range'].slider-thumb-glow {
          outline: none;
        }
      `}</style>
    </section>
  );
};

export default PricingSection;
