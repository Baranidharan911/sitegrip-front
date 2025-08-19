'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/Common/AuthGuard';
import { 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  Zap, 
  Shield,
  ArrowUp,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { getAuthInstance } from '@/lib/firebase.js';

interface CostOptimizationData {
  totalCostOptimization: {
    monthlyMonthlySavings: string;
    annualSavings: string;
    optimizationActive: boolean;
    lastUpdated: string;
  };
  services: {
    serpApi: any;
    pageSpeedApi: any;
    crawling: any;
    aiSuggestions: any;
  };
  userImpact: any;
  systemHealth: any;
}

export default function CostOptimizationPage() {
  const router = useRouter();
  const [data, setData] = useState<CostOptimizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userQuota, setUserQuota] = useState<any>(null);

  useEffect(() => {
    loadCostOptimizationData();
    loadUserQuota();
  }, []);

  const loadCostOptimizationData = async () => {
    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) {
        setError('Authentication required');
        return;
      }

      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const res = await fetch(`${apiUrl}/api/cost-optimization/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      } else {
        setError('Failed to load cost optimization data');
      }
    } catch (err) {
      setError('Failed to connect to service');
    } finally {
      setLoading(false);
    }
  };

  const loadUserQuota = async () => {
    try {
      const auth = getAuthInstance();
      if (!auth?.currentUser) return;

      const token = await auth.currentUser.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const res = await fetch(`${apiUrl}/api/cost-optimization/user-impact`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const result = await res.json();
        setUserQuota(result.data);
      }
    } catch (err) {
      console.warn('Failed to load user quota:', err);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] p-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Failed to Load Data
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!data) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Data Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Cost optimization data is not available yet.
              </p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</div>
      )}
    </motion.div>
  );

  const ServiceCard = ({ title, service, color = 'blue' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
          <span className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`}>
            {service.status || 'Optimized'}
          </span>
        </div>
        
        {service.quotaBlockRate && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Quota Block Rate</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {service.quotaBlockRate}
            </span>
          </div>
        )}
        
        {service.cacheHitRate && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {service.cacheHitRate}
            </span>
          </div>
        )}
        
        {service.monthlySavings && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              ${service.monthlySavings}
            </span>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {service.optimization}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b1e] p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Cost Optimization Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor platform cost savings and optimization performance
            </p>
          </motion.div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Monthly Savings"
              value={`$${data.totalCostOptimization.monthlyMonthlySavings}`}
              subtitle="79% platform cost reduction"
              icon={TrendingDown}
              color="green"
              trend={79}
            />
            <StatCard
              title="Annual Savings"
              value={`$${data.totalCostOptimization.annualSavings}`}
              subtitle="Projected yearly savings"
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              title="System Health"
              value="Excellent"
              subtitle={data.systemHealth?.overallHealth}
              icon={Shield}
              color="green"
            />
          </div>

          {/* User Plan Information */}
          {userQuota && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Plan: {userQuota.currentPlan?.charAt(0).toUpperCase() + userQuota.currentPlan?.slice(1)}
                  {userQuota.accountType === 'premium' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Premium
                    </span>
                  )}
                </h2>
                {userQuota.upgradeOpportunities && (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <ArrowUp className="w-4 h-4" />
                    Upgrade
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SERP API Access */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">SERP Rankings</h4>
                  {userQuota.accessLevels.serpApi.hasAccess ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Daily Keywords</span>
                        <span>{userQuota.accessLevels.serpApi.limits.dailyKeywords.used} / {userQuota.accessLevels.serpApi.limits.dailyKeywords.limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (userQuota.accessLevels.serpApi.limits.dailyKeywords.used / Math.max(1, userQuota.accessLevels.serpApi.limits.dailyKeywords.limit)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {userQuota.accessLevels.serpApi.restrictions}
                    </div>
                  )}
                </div>

                {/* PageSpeed Access */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">PageSpeed Analysis</h4>
                  {userQuota.accessLevels.pageSpeed.hasAccess ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Daily Checks</span>
                        <span>{userQuota.accessLevels.pageSpeed.limits.dailyChecks.used} / {userQuota.accessLevels.pageSpeed.limits.dailyChecks.limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (userQuota.accessLevels.pageSpeed.limits.dailyChecks.used / Math.max(1, userQuota.accessLevels.pageSpeed.limits.dailyChecks.limit)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Strategies: {userQuota.accessLevels.pageSpeed.strategies.join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {userQuota.accessLevels.pageSpeed.restrictions}
                    </div>
                  )}
                </div>

                {/* Crawling Access */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Website Crawling</h4>
                  {userQuota.accessLevels.crawling.hasAccess ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Daily Crawls</span>
                        <span>{userQuota.accessLevels.crawling.limits.dailyCrawls.used} / {userQuota.accessLevels.crawling.limits.dailyCrawls.limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (userQuota.accessLevels.crawling.limits.dailyCrawls.used / Math.max(1, userQuota.accessLevels.crawling.limits.dailyCrawls.limit)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Max Depth: {userQuota.accessLevels.crawling.maxDepth}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {userQuota.accessLevels.crawling.restrictions}
                    </div>
                  )}
                </div>
              </div>

              {userQuota.upgradeOpportunities && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Upgrade Benefits</h4>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    {userQuota.upgradeOpportunities.currentLimitations.map((limitation: string, index: number) => (
                      <div key={index}>• {limitation}</div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Service Optimization Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ServiceCard
              title="SERP API Optimization"
              service={data.services.serpApi}
              color="blue"
            />
            <ServiceCard
              title="PageSpeed API Optimization"
              service={data.services.pageSpeedApi}
              color="green"
            />
            <ServiceCard
              title="Crawling Optimization"
              service={data.services.crawling}
              color="purple"
            />
            <ServiceCard
              title="AI Suggestions Optimization"
              service={data.services.aiSuggestions}
              color="orange"
            />
          </div>

          {/* Cost Optimization Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Optimization Benefits
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Cost Reduction</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>79% total platform savings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Plan-based resource allocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Intelligent caching systems</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Performance</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>99% faster cached responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Reduced server load</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Optimized resource usage</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">User Experience</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>Clear plan benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>Transparent quota tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>Guided upgrade prompts</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}