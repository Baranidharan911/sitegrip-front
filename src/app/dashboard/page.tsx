'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Search, 
  Target, 
  MapPin, 
  BarChart3, 
  Activity,
  ArrowUpRight,
  Calendar,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Globe,
  Shield
} from 'lucide-react';
import { quickActions, activityTypes } from '@/lib/sidebarConfig';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Local Rankings',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Organic Traffic',
      value: '2.4K',
      change: '+8%',
      trend: 'up',
      icon: Eye,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Keywords Ranked',
      value: '156',
      change: '+23',
      trend: 'up',
      icon: Search,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Competitor Score',
      value: '87',
      change: '+5',
      trend: 'up',
      icon: Target,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const recentActivity = [
    {
      type: 'crawl',
      title: 'Website crawl completed',
      description: 'Found 12 new opportunities',
      time: '2 hours ago',
      status: 'success'
    },
    {
      type: 'keyword',
      title: 'Keyword ranking improved',
      description: '"local plumber" moved from #8 to #3',
      time: '4 hours ago',
      status: 'success'
    },
    {
      type: 'competitor',
      title: 'Competitor analysis updated',
      description: 'New competitor identified',
      time: '6 hours ago',
      status: 'info'
    },
    {
      type: 'uptime',
      title: 'Website downtime detected',
      description: 'Site was down for 3 minutes',
      time: '1 day ago',
      status: 'warning'
    }
  ];

  const upcomingTasks = [
    {
      title: 'Update Google Business Profile',
      due: 'Today',
      priority: 'high',
      category: 'Local SEO'
    },
    {
      title: 'Review competitor analysis',
      due: 'Tomorrow',
      priority: 'medium',
      category: 'Competitive Intelligence'
    },
    {
      title: 'Generate monthly report',
      due: 'In 3 days',
      priority: 'medium',
      category: 'Reporting'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Welcome back, John! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's what's happening with your SEO performance today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
                  <stat.icon className="w-full h-full text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {stat.title}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.path}
                    className="group flex items-center gap-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-200"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} p-2.5`}>
                      <action.icon className="w-full h-full text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 dark:text-white">
                        {action.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {action.description}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const ActivityIcon = activityTypes[activity.type as keyof typeof activityTypes]?.icon || Activity;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                      <div className={`w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 p-1.5 flex-shrink-0`}>
                        <ActivityIcon className={`w-full h-full ${getStatusColor(activity.status)}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-800 dark:text-white">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="mt-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              Upcoming Tasks
            </h2>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-white">
                        {task.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {task.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {task.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 