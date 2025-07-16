'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart3, FileText, Calculator, PenTool, Grid3X3 } from 'lucide-react';
import AuthGuard from '@/components/Common/AuthGuard';

const tools = [
  {
    id: 'pdf-generator',
    title: 'PDF Report Generator',
    description: 'Create professional white-label PDF reports with custom branding and real-time preview',
    icon: FileText,
    href: '/reporting-analytics/pdf-generator',
    color: 'from-blue-500 to-cyan-500',
    available: true
  },
  {
    id: 'dashboard',
    title: 'Custom Dashboard',
    description: 'Build personalized dashboards with drag-and-drop widgets and real-time analytics',
    icon: Grid3X3,
    href: '/reporting-analytics/dashboard',
    color: 'from-purple-500 to-pink-500',
    available: true
  },
  {
    id: 'seo-roi-calculator',
    title: 'SEO ROI Calculator',
    description: 'Calculate return on investment for your SEO efforts with detailed financial analysis',
    icon: Calculator,
    href: '/reporting-analytics/seo-roi-calculator',
    color: 'from-green-500 to-emerald-500',
    available: true
  },
  {
    id: 'chart-annotations',
    title: 'Chart Annotations',
    description: 'Add interactive annotations, shapes, and highlights to your analytics charts',
    icon: PenTool,
    href: '/reporting-analytics/chart-annotations',
    color: 'from-orange-500 to-red-500',
    available: true
  }
];

export default function ReportingAnalyticsPage() {
  return (
    <AuthGuard>
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <BarChart3 className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
              Reporting & Analytics
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive tools for creating reports, dashboards, and analyzing your SEO performance with real-time insights
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={tool.href}>
                <div className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transform hover:scale-105 hover:bg-white/80 dark:hover:bg-gray-900/80">
                  <div className={`h-2 bg-gradient-to-r ${tool.color}`} />
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${tool.color} shadow-lg`}>
                        <tool.icon className="text-white" size={28} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                          {tool.title}
                        </h3>
                        {tool.available && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                      {tool.description}
                    </p>
                    <div className="mt-6 flex items-center text-base font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      Open Tool →
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
                      className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Powerful Analytics Suite</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Real-time Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Live updates and instant calculations for accurate insights</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Professional Reports</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">White-label PDF reports with custom branding options</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <Calculator className="text-white" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">ROI Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive financial analysis and ROI calculations</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </AuthGuard>
  );
} 