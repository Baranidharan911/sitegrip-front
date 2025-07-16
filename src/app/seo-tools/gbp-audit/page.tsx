'use client';
import { useState } from 'react';
import { Search, BarChart3, Star, Image, MapPin, CheckCircle, AlertCircle, TrendingUp, Download, Share2, Settings, Eye, Clock, Users, Zap, Target, ArrowUpRight, Info, HelpCircle } from 'lucide-react';
import HowToUseSection from '@/components/Common/HowToUseSection';

const mockAudit = [
  { section: 'Profile Completeness', score: 92, icon: CheckCircle, description: 'Your profile is almost complete. Add more business details for a perfect score.', status: 'Good', action: 'Add business hours and services' },
  { section: 'Reviews', score: 88, icon: Star, description: 'Great job! Keep responding to reviews and encourage more customers to leave feedback.', status: 'Good', action: 'Respond to 3 recent reviews' },
  { section: 'Photos', score: 75, icon: Image, description: 'Add more high-quality photos to improve your profile.', status: 'Needs Improvement', action: 'Upload 5+ high-quality photos' },
  { section: 'NAP Consistency', score: 95, icon: MapPin, description: 'Your Name, Address, and Phone are consistent across listings.', status: 'Excellent', action: 'Monitor for changes' },
  { section: 'Alerts', score: 100, icon: AlertCircle, description: 'No critical issues detected.', status: 'Perfect', action: 'Continue monitoring' },
];

const mockStats = [
  { title: 'Overall Score', value: '89%', change: '+5%', icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { title: 'Issues Found', value: '2', change: '-3', icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  { title: 'Profile Views', value: '1,247', change: '+12%', icon: Eye, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { title: 'Response Rate', value: '94%', change: '+2%', icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
];

const mockOpportunities = [
  { title: 'Add Business Hours', impact: 'High', effort: 'Low', description: 'Missing business hours could affect local search visibility' },
  { title: 'Upload More Photos', impact: 'Medium', effort: 'Medium', description: 'Visual content increases engagement and trust' },
  { title: 'Respond to Recent Reviews', impact: 'High', effort: 'Low', description: 'Quick responses show customer care and improve ratings' },
];

export default function GBPAuditPage() {
  const [input, setInput] = useState('');
  const [showAudit, setShowAudit] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              Google Business Profile Audit
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Comprehensive audit of your Google Business Profile for maximum local visibility
            </p>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            {showHelp ? 'Hide Help' : 'How to Use'}
          </button>
        </div>

        {/* Help Section */}
        {showHelp && (
          <HowToUseSection
            title="How to Use Google Business Profile Audit"
            description="Audit your Google Business Profile to identify optimization opportunities and ensure maximum local search visibility. This tool analyzes your profile completeness, reviews, photos, and more."
            steps={[
              {
                title: "Enter your business information",
                description: "Type your business name or paste your Google Business Profile URL"
              },
              {
                title: "Click 'Run Audit'",
                description: "Our system will analyze your GBP listing and identify areas for improvement"
              },
              {
                title: "Review the results",
                description: "Check your scores across different categories and see specific recommendations"
              },
              {
                title: "Take action",
                description: "Follow the suggested improvements to optimize your profile"
              }
            ]}
            examples={[
              {
                type: "Business Name",
                example: "Joe's Plumbing Service",
                description: "Enter your exact business name as it appears on Google"
              },
              {
                type: "GBP URL",
                example: "https://business.google.com/dashboard/l/...",
                description: "Paste your Google Business Profile dashboard URL"
              },
              {
                type: "Business Website",
                example: "https://joesplumbing.com",
                description: "Enter your business website URL (we'll find your GBP listing)"
              }
            ]}
            tips={[
              {
                title: "Profile Completeness",
                content: "Get a detailed breakdown of how complete your business profile is",
                icon: CheckCircle
              },
              {
                title: "Review Analysis",
                content: "See your review performance and response rate metrics",
                icon: Star
              },
              {
                title: "Photo Optimization",
                content: "Learn how to improve your visual presence with better photos",
                icon: Image
              },
              {
                title: "NAP Consistency",
                content: "Check if your business information is consistent across the web",
                icon: MapPin
              }
            ]}
            proTip="Regular audits help you maintain a strong Google Business Profile. Focus on responding to reviews quickly and keeping your business information up-to-date for the best local SEO results."
          />
        )}

        {/* Search Input */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-900 dark:text-gray-100 placeholder-gray-700 dark:placeholder-gray-400"
                placeholder="Enter business name or GBP URL"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
            </div>
            <button
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
              onClick={() => setShowAudit(true)}
            >
              <Zap className="w-5 h-5" />
              Run Audit
            </button>
          </div>
        </div>

        {showAudit && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {mockStats.map((stat, index) => (
                <div key={index} className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                      {stat.change}
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex gap-6 mb-6">
                {['overview', 'insights', 'opportunities'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedTab === tab
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Audit Results */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        Audit Results
                      </h3>
                      <div className="space-y-4">
                        {mockAudit.map((item, i) => (
                          <div key={i} className="bg-gradient-to-r from-purple-50/60 to-blue-50/40 dark:from-purple-900/20 dark:to-blue-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 p-4">
                            <div className="flex items-center gap-4 mb-3">
                              <item.icon className="w-8 h-8 text-purple-500 dark:text-purple-300" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-white">{item.section}</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-200 font-bold">
                                    {item.score}%
                                  </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                item.status === 'Excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' :
                                item.status === 'Good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200' :
                                item.status === 'Needs Improvement' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200' :
                                'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200'
                              }`}>
                                {item.status}
                              </span>
                              <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300">
                                {item.action}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        Score Breakdown
                      </h3>
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 p-6 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl font-bold">89%</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">Overall Profile Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'insights' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-xl border border-green-200 dark:border-green-900/30 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Strong NAP Consistency</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Your business information is consistent across 95% of listings, which is excellent for local SEO.
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10 rounded-xl border border-blue-200 dark:border-blue-900/30 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Star className="w-6 h-6 text-blue-500" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">Good Review Management</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        You're responding to reviews promptly, which helps maintain a positive online reputation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'opportunities' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Improvement Opportunities</h3>
                  <div className="space-y-4">
                    {mockOpportunities.map((opp, index) => (
                      <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/10 rounded-xl border border-orange-200 dark:border-orange-900/30 p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{opp.title}</h4>
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              opp.impact === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200'
                            }`}>
                              {opp.impact} Impact
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              opp.effort === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
                            }`}>
                              {opp.effort} Effort
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{opp.description}</p>
                        <button className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300">
                          Take Action →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 transition-all">
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  Last updated: 2 hours ago
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 