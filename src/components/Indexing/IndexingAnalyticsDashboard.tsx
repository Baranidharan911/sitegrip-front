'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  Globe,
  Zap, 
  RefreshCw, 
  Search, 
  Database,
  BarChart3,
  Target,
  Activity,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  ExternalLink,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { indexingApi } from '@/lib/indexingApi';
import { useAuth } from '@/hooks/useAuth';
import { useIndexingBackend } from '@/hooks/useIndexingBackend';
import { getTierInfo, formatQuotaDisplay, getQuotaUsagePercentage, getQuotaStatusColor } from '@/lib/dataUtils';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface UrlSubmission {
  id: string;
  url: string;
  domain: string;
  status: 'indexed' | 'pending' | 'failed' | 'submitted' | 'not_indexed';
  submittedAt: Date;
  lastChecked?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  error?: string;
}

const IndexingAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { loading, statistics, quotaInfo, loadDashboardData, loadQuotaInfo, indexingEntries } = useIndexingBackend();
  const [urlSubmissions, setUrlSubmissions] = useState<UrlSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [expandedCards, setExpandedCards] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [projectId, setProjectId] = useState('default-project');

    const filteredSubmissions = urlSubmissions.filter(submission => {
    const matchesSearch = submission.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Set mounted state after component mounts
  useEffect(() => {
    console.log('🎯 Analytics dashboard mounting...');
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only access localStorage after component is mounted
    if (!mounted) return;
    
    // Load user from localStorage and check authentication
    const loadUserAndCheckAuth = async () => {
      console.log('🔐 Analytics: Loading user authentication...');
      const storedUser = localStorage.getItem('Sitegrip-user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const newUser = userData.user || userData;
          setCurrentUser(newUser);
          console.log('👤 Analytics: User loaded:', newUser?.email || newUser?.uid);
          
          // Check if we have a valid token
          const token = userData.token || userData.idToken || null;
          if (token) {
            // Validate token is not expired (basic check)
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                const isExpired = payload.exp * 1000 < Date.now();
                
                if (!isExpired) {
                  setAuthToken(token);
                  console.log('🔑 Analytics: Valid auth token set');
                } else {
                  console.log('⚠️ Analytics: Token expired, will need to refresh');
                  setAuthToken(null);
                }
              }
            } catch (error) {
              console.warn('⚠️ Analytics: Failed to parse token:', error);
              setAuthToken(token); // Use token anyway
            }
          } else {
            console.log('⚠️ Analytics: No auth token found');
          }
        } catch (error) {
          console.error('❌ Analytics: Failed to parse stored user data:', error);
        }
      } else {
        console.log('⚠️ Analytics: No stored user data found');
      }
    };

    loadUserAndCheckAuth();
  }, [mounted]);

  const loadData = async () => {
    if (!mounted || !currentUser || !authToken) {
      console.log('⚠️ Not ready to load data - missing auth');
      return;
    }

    try {
      setRefreshing(true);
      console.log('🔄 Loading analytics data for authenticated user...');
      
      // Load quota info first
      try {
        await loadQuotaInfo();
        console.log('✅ Quota info refreshed successfully');
      } catch (quotaError) {
        console.warn('⚠️ Failed to refresh quota info:', quotaError);
      }
      
      // Load dashboard data
      await loadDashboardData(projectId);
      console.log('✅ Dashboard data loaded for analytics');
      
              // Use indexingEntries from the hook instead of making separate API call
        if (indexingEntries && indexingEntries.length > 0) {
          console.log('🔍 Raw indexing entries sample:', indexingEntries.slice(0, 2));
          
          const formattedSubmissions: UrlSubmission[] = indexingEntries.map((item: any) => {
            // Get the submitted date - try multiple field names
            const submittedDateStr = item.created_at || item.submitted_at || item.submittedAt;
            console.log(`📅 Processing dates for ${item.url}:`, {
              created_at: item.created_at,
              submitted_at: item.submitted_at,
              submittedAt: item.submittedAt,
              status_checked_at: item.status_checked_at,
              lastChecked: item.lastChecked,
              selectedSubmitted: submittedDateStr
            });
            let submittedDate: Date;
            
            try {
              if (submittedDateStr) {
                // Handle Firestore timestamp objects
                if (submittedDateStr.toDate && typeof submittedDateStr.toDate === 'function') {
                  submittedDate = submittedDateStr.toDate();
                } else {
                  submittedDate = new Date(submittedDateStr);
                }
                
                // Validate the date
                if (isNaN(submittedDate.getTime())) {
                  console.warn('Invalid submitted date for:', item.url, submittedDateStr);
                  submittedDate = new Date();
                }
              } else {
                submittedDate = new Date();
              }
            } catch (error) {
              console.warn('Error parsing submitted date for:', item.url, error);
              submittedDate = new Date();
            }

            // Get the last checked date
            const lastCheckedDateStr = item.status_checked_at || item.lastChecked || item.last_checked;
            let lastCheckedDate: Date | undefined;
            
            try {
              if (lastCheckedDateStr) {
                // Handle Firestore timestamp objects
                if (lastCheckedDateStr.toDate && typeof lastCheckedDateStr.toDate === 'function') {
                  lastCheckedDate = lastCheckedDateStr.toDate();
                } else {
                  lastCheckedDate = new Date(lastCheckedDateStr);
                }
                
                // Validate the date
                if (lastCheckedDate && isNaN(lastCheckedDate.getTime())) {
                  console.warn('Invalid last checked date for:', item.url, lastCheckedDateStr);
                  lastCheckedDate = undefined;
                }
              }
            } catch (error) {
              console.warn('Error parsing last checked date for:', item.url, error);
              lastCheckedDate = undefined;
            }

            return {
              id: item.id || Math.random().toString(36),
              url: item.url || '',
              domain: item.domain || (item.url ? new URL(item.url).hostname : ''),
              status: item.status || 'pending',
              submittedAt: submittedDate,
              lastChecked: lastCheckedDate,
              priority: item.priority || 'medium',
              error: item.error_message || item.error
            };
          });
          setUrlSubmissions(formattedSubmissions);
          console.log('✅ URL submissions loaded:', formattedSubmissions.length);
          console.log('📅 Sample dates:', formattedSubmissions.slice(0, 2).map(s => ({
            url: s.url,
            submitted: s.submittedAt.toISOString(),
            lastChecked: s.lastChecked ? s.lastChecked.toISOString() : 'Never'
          })));
        }

      // Check if user is new
      const totalSubmitted = statistics?.total_submitted ?? statistics?.totalUrlsSubmitted ?? 0;
      const quotaUsed = quotaInfo?.total_used ?? quotaInfo?.totalUsed ?? 0;
      
      if (totalSubmitted === 0 && quotaUsed === 0) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data when user and auth are ready
  useEffect(() => {
    console.log('📊 Analytics: Data loading effect triggered', {
      mounted,
      hasUser: !!currentUser,
      hasToken: !!authToken,
      projectId
    });
    
    if (mounted && currentUser && authToken && projectId) {
      console.log('✅ Analytics: All conditions met, loading data...');
      loadData();
    } else {
      console.log('⏳ Analytics: Waiting for auth conditions to be met');
    }
  }, [mounted, currentUser, authToken, projectId]);

  const safeNumber = (value: number | undefined | null, fallback: number = 0): number => {
    return typeof value === 'number' && !isNaN(value) ? value : fallback;
  };

  const safePercentage = (value: number | undefined | null, decimals: number = 1): string => {
    const num = safeNumber(value, 0);
    return num.toFixed(decimals);
  };

  const totalSubmitted = safeNumber(statistics?.total_submitted);
  const totalIndexed = safeNumber(statistics?.success);
  const totalNotIndexed = safeNumber(statistics?.totalUrlsNotIndexed);
  const totalPending = safeNumber(statistics?.pending);
  const totalFailed = safeNumber(statistics?.failed);
  const quotaUsed = safeNumber(statistics?.quota_used);
  const quotaRemaining = safeNumber(statistics?.quota_remaining);
  const indexingSuccessRate = safeNumber(statistics?.indexingSuccessRate);

  // Get tier information
  const dailyLimit = quotaInfo?.daily_limit || 0;
  const priorityReserve = quotaInfo?.priority_reserve || 0;
  const priorityUsed = safeNumber(quotaInfo?.high_priority_used) + safeNumber(quotaInfo?.critical_priority_used);
  
  // Calculate queued URLs from negative remaining quota
  const remainingQuota = quotaInfo ? (quotaInfo.daily_limit - quotaInfo.total_used) : 0;
  const queuedFromQuota = remainingQuota < 0 ? Math.abs(remainingQuota) : 0;
  const queueInfoQueued = safeNumber(quotaInfo?.queueInfo?.totalQueued);
  const totalQueued = Math.max(queuedFromQuota, queueInfoQueued);
  
  // Debug logging for queue calculation
  console.log('🔢 [Queue Debug]', {
    dailyLimit: quotaInfo?.daily_limit,
    totalUsed: quotaInfo?.total_used,
    remainingQuota,
    queuedFromQuota,
    queueInfoQueued,
    totalQueued
  });
  
  const tierInfo = quotaInfo ? getTierInfo(dailyLimit) : { tierName: 'Unknown', tierLevel: 'unknown', features: [] };
  const quotaUsagePercentage = quotaInfo ? getQuotaUsagePercentage(quotaInfo) : 0;
  const quotaStatusColor = quotaInfo ? getQuotaStatusColor(quotaInfo) : 'text-gray-500';
  const quotaPercentage = (quotaUsed / dailyLimit) * 100;

  // Chart data - only real data, no fallbacks
  const indexingTrendData = {
    labels: [],
    datasets: [
      {
        label: 'URLs Submitted',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'URLs Indexed',
        data: [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const statusDistributionData = {
    labels: ['Indexed', 'Pending', 'Failed', 'Not Indexed'],
    datasets: [
      {
        data: [totalIndexed, totalPending, totalFailed, totalNotIndexed],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2
      }
    ]
  };

  const performanceData = {
    labels: [],
    datasets: [
      {
        label: 'Success Rate (%)',
        data: [],
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      }
    ]
  };

  // Don't render anything until component is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Site Grip</h3>
          <p className="text-gray-600 dark:text-gray-400">Preparing your analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading && !statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400">Preparing your indexing analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
      <div className="flex items-center justify-between">
        <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                Indexing Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Comprehensive indexing performance and quota analytics
              </p>
            </div>
            <button
              onClick={() => {
                if (mounted && currentUser && authToken) {
                  loadData();
                } else {
                  console.log('⚠️ Cannot refresh - user not authenticated');
                }
              }}
              disabled={refreshing || !currentUser || !authToken}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Welcome Message for New Users */}
          {isNewUser && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Welcome to Site Grip Analytics! 🎉</h3>
                  <p className="text-blue-800 dark:text-blue-200 mb-3">
                    Once you start submitting URLs, this dashboard will show comprehensive analytics including indexing trends, 
                    success rates, and detailed URL tracking data.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Real-time tracking
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      Performance insights
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Success analytics
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quota Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Quota Usage</h3>
              <div className="flex items-center gap-2">
                {loading || !quotaInfo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
                      Loading quota info...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {tierInfo.tierName} Plan - {quotaInfo.daily_limit} URLs/day
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {loading || !quotaInfo ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Used Today</span>
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-gray-300 dark:bg-gray-600 h-3 rounded-full animate-pulse w-1/4"></div>
        </div>
      </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Used Today</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {quotaInfo.total_used} / {quotaInfo.daily_limit}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      quotaUsagePercentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      quotaUsagePercentage >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(quotaUsagePercentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className={quotaStatusColor}>
                    {quotaInfo.daily_limit - quotaInfo.total_used} URLs remaining today
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Resets daily at midnight
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quota Alert */}
          {quotaInfo && (quotaInfo.daily_limit - quotaInfo.total_used) < Math.max(5, Math.floor(quotaInfo.daily_limit * 0.1)) && (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Quota Limit Approaching</p>
                <p className="text-sm">
                  You have only {quotaInfo.daily_limit - quotaInfo.total_used} URLs remaining on your {tierInfo.tierName} plan ({quotaInfo.daily_limit}/day). 
                  {tierInfo.tierLevel === 'free' ? (
                    <a href="/pricing" className="ml-1 underline text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100">
                      Upgrade to Basic (50/day)
                    </a>
                  ) : (
                    <a href="/pricing" className="ml-1 underline text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100">
                      Upgrade your plan
                    </a>
                  )} for more capacity.
                </p>
              </div>
            </div>
          )}

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-blue-100" />
                </div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Submitted</p>
                <p className="text-3xl font-bold">{totalSubmitted.toLocaleString()}</p>
                <p className="text-blue-100 text-xs mt-2">URLs sent to Google</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-emerald-100" />
                </div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Successfully Indexed</p>
                <p className="text-3xl font-bold">{totalIndexed.toLocaleString()}</p>
                <p className="text-emerald-100 text-xs mt-2">Pages in Google index</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <ArrowDownRight className="w-5 h-5 text-amber-100" />
                </div>
                <p className="text-amber-100 text-sm font-medium mb-1">Not Indexed</p>
                <p className="text-3xl font-bold">{totalNotIndexed.toLocaleString()}</p>
                <p className="text-amber-100 text-xs mt-2">Need attention</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-purple-100" />
                </div>
                <p className="text-purple-100 text-sm font-medium mb-1">Pending Check</p>
                <p className="text-3xl font-bold">{totalPending.toLocaleString()}</p>
                <p className="text-purple-100 text-xs mt-2">Awaiting status</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white rounded-2xl shadow-lg p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-indigo-100" />
                </div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Queued</p>
                <p className="text-3xl font-bold">{totalQueued.toLocaleString()}</p>
                <p className="text-indigo-100 text-xs mt-2">Waiting for processing</p>
              </div>
            </div>
          </div>

          {/* Performance Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Indexing Success Rate
                </h3>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{safePercentage(indexingSuccessRate)}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Successfully Indexed</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{totalIndexed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Not Indexed</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{totalNotIndexed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{totalFailed.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Daily Quota Usage
                </h3>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{Math.round(quotaPercentage)}%</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Used Today</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {quotaUsed.toLocaleString()} / {dailyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {quotaRemaining.toLocaleString()} submissions
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Indexing Trends (7 Days)
              </h3>
              <div className="h-64">
                {indexingTrendData.labels.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">No trend data available</p>
                      <p className="text-xs">Submit URLs to see trends</p>
                    </div>
        </div>
      ) : (
                  <Line 
                    data={indexingTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Status Distribution
              </h3>
              <div className="h-64">
                {totalSubmitted === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">No status data available</p>
                      <p className="text-xs">Submit URLs to see distribution</p>
                    </div>
                  </div>
                ) : (
                  <Doughnut 
                    data={statusDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
          },
        },
      }}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Hourly Performance Patterns
            </h3>
            <div className="h-64">
              {performanceData.labels.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No performance data available</p>
                    <p className="text-xs">Submit URLs to see patterns</p>
                  </div>
                </div>
              ) : (
                <Bar 
                  data={performanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* URL Submissions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  URL Submissions ({filteredSubmissions.length})
                </h3>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search URLs or domains..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="indexed">Indexed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="not_indexed">Not Indexed</option>
                  </select>
                </div>
              </div>
      </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Checked</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-lg font-medium mb-2">No URL submissions yet</p>
                        <p className="text-sm">Start submitting URLs to see detailed analytics here</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                              {submission.url}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {submission.domain}
                            </div>
      </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.status === 'indexed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            submission.status === 'pending' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            submission.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            submission.status === 'not_indexed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {submission.status === 'indexed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {submission.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {submission.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                            {submission.status === 'not_indexed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {submission.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            submission.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            submission.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            submission.priority === 'medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {submission.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {submission.submittedAt?.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {submission.lastChecked?.toLocaleDateString() || 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.open(submission.url, '_blank')}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View URL"
                            >
                              <ExternalLink className="w-4 h-4" />
          </button>
                            <button
                              onClick={() => {
                                // Implement refresh status logic
                                console.log('Refresh status for:', submission.url);
                              }}
                              className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Refresh Status"
                            >
                              <RefreshCw className="w-4 h-4" />
          </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IndexingAnalyticsDashboard; 