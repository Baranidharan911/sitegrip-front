'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart3, FileText, Calculator, MessageSquare, Grid3X3 } from 'lucide-react';

const tools = [
  {
    id: 'pdf-generator',
    title: 'PDF Report Generator',
    description: 'Create professional white-label PDF reports with custom branding',
    icon: FileText,
    href: '/reporting-analytics/pdf-generator',
    color: 'from-blue-500 to-cyan-500',
    available: true
  },
  {
    id: 'dashboard',
    title: 'Custom Dashboard',
    description: 'Build personalized dashboards with drag-and-drop widgets',
    icon: Grid3X3,
    href: '/reporting-analytics/dashboard',
    color: 'from-purple-500 to-pink-500',
    available: true
  },
  {
    id: 'roi-calculator',
    title: 'SEO ROI Calculator',
    description: 'Calculate return on investment for your SEO efforts',
    icon: Calculator,
    href: '/reporting-analytics/roi-calculator',
    color: 'from-green-500 to-emerald-500',
    available: true
  },
  {
    id: 'annotations',
    title: 'Chart Annotations',
    description: 'Add contextual notes to your analytics charts and graphs',
    icon: MessageSquare,
    href: '/reporting-analytics/annotations',
    color: 'from-orange-500 to-red-500',
    available: true
  }
];

export default function ReportingAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <BarChart3 className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Reporting & Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive tools for creating reports, dashboards, and analyzing your SEO performance
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={tool.href}>
                <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transform hover:scale-105">
                  <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color}`}>
                        <tool.icon className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                          {tool.title}
                        </h3>
                        {tool.available && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                      Open Tool →
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Coming Soon</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              Google Analytics & Search Console Integration
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              Automated Email Reports
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            These features require backend integration and will be available in a future update.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 