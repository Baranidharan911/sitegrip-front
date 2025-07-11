'use client';
import { useState } from 'react';
import { Search, BarChart3, Star, Image, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const mockAudit = [
  { section: 'Profile Completeness', score: 92, icon: CheckCircle, description: 'Your profile is almost complete. Add more business details for a perfect score.' },
  { section: 'Reviews', score: 88, icon: Star, description: 'Great job! Keep responding to reviews and encourage more customers to leave feedback.' },
  { section: 'Photos', score: 75, icon: Image, description: 'Add more high-quality photos to improve your profile.' },
  { section: 'NAP Consistency', score: 95, icon: MapPin, description: 'Your Name, Address, and Phone are consistent across listings.' },
  { section: 'Alerts', score: 100, icon: AlertCircle, description: 'No critical issues detected.' },
];

export default function GBPAuditPage() {
  const [input, setInput] = useState('');
  const [showAudit, setShowAudit] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <BarChart3 className="w-8 h-8 text-purple-500" /> Google Business Profile Audit
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">Audit your Google Business Profile for completeness, reviews, photos, and more. Get actionable tips to improve your local presence.</p>
        <div className="flex gap-4 mb-8 justify-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
              placeholder="Business Name or GBP URL"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          <button
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all"
            onClick={() => setShowAudit(true)}
          >
            Audit
          </button>
        </div>
        {showAudit && (
          <div className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Audit Report</h2>
            <div className="space-y-6">
              {mockAudit.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50/60 to-blue-50/40 dark:from-purple-900/20 dark:to-blue-900/10 border border-purple-100 dark:border-purple-900/30 shadow-sm">
                  <item.icon className="w-8 h-8 text-purple-500 dark:text-purple-300" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white text-lg">{item.section}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 font-bold ml-2">{item.score}%</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 