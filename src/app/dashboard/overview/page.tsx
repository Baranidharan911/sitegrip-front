"use client";

import React, { useState, useEffect } from "react";
import { 
  Loader2, BarChart3, Globe, Users, Eye, MousePointer, TrendingUp, 
  Sparkles, ArrowRight, Shield, Zap, Clock, Activity, ChevronDown,
  RefreshCw, Download, Share2, Calendar, Target, Star, Settings, StickyNote
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Force dynamic rendering to prevent Firebase initialization issues during build
export const dynamic = 'force-dynamic';

interface AnalyticsProperty {
  name: string;
  displayName: string;
  property: string;
}

interface AnalyticsData {
  date: string;
  totalUsers: number;
  sessions: number;
  screenPageViews: number;
  bounceRate: number;
  averageSessionDuration?: number;
}

interface NewUsersData {
  date: string;
  newUsers: number;
  totalUsers: number;
  returningUsers: number;
}

interface SessionDurationData {
  date: string;
  avgSessionDuration: number;
}

interface TrafficSourceData {
  source: string;
  value: number;
  users: number;
}

interface GeoData {
  country: string;
  users: number;
  sessions: number;
}

interface TopPageData {
  page: string;
  users: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
}

interface SearchConsoleData {
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  searchTrends: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

interface DerivedMetrics {
  totalUsers: number;
  totalSessions: number;
  totalPageViews: number;
  avgBounceRate: number;
  totalNewUsers: number;
  totalReturningUsers: number;
  avgSessionDuration: number;
  conversionRate: number;
}

interface CombinedAnalyticsData {
  basicMetrics: AnalyticsData[];
  newUsersData: NewUsersData[];
  sessionDurationData: SessionDurationData[];
  trafficSourcesData: TrafficSourceData[];
  geoData: GeoData[];
  topPagesData: TopPageData[];
  searchConsoleData: SearchConsoleData;
  deviceData: DeviceData[];
  derivedMetrics: DerivedMetrics;
}

interface DeviceData {
  name: string;
  value: number;
  sessions: number;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  idToken?: string;
  token?: string;
  googleAuthEnabled?: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#f59e42', '#ef4444', '#8b5cf6', '#06b6d4'];

// Utility function to format session duration from seconds to 'Xm Ys'
function formatSessionDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const DashboardOverviewPage = React.memo(function DashboardOverviewPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [analyticsProperties, setAnalyticsProperties] = useState<AnalyticsProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  // Utility function to format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Get today's date
  const getToday = (): string => {
    return formatDate(new Date());
  };

  // Get date N days ago
  const getDaysAgo = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatDate(date);
  };

  // Check if current date range matches a preset
  const isActivePreset = (days: number): boolean => {
    return dateRange.from === getDaysAgo(days) && dateRange.to === getToday();
  };

  const [dateRange, setDateRange] = useState({ 
    from: getDaysAgo(30), // 30 days ago
    to: getToday() // Today
  });

  // Log date range changes
  useEffect(() => {
    console.log('📅 [Dashboard] Date range updated:', {
      from: dateRange.from,
      to: dateRange.to,
      daysDifference: Math.ceil((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24)) + 1
    });
  }, [dateRange]);
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<CombinedAnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Notes/Sticky Notes widget state and logic
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  useEffect(() => {
    const stored = localStorage.getItem("sitegrip_quick_notes");
    if (stored) setNotes(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("sitegrip_quick_notes", JSON.stringify(notes));
  }, [notes]);
  const addNote = () => {
    if (newNote.trim()) {
      setNotes([newNote.trim(), ...notes]);
      setNewNote("");
    }
  };
  const deleteNote = (idx: number) => {
    setNotes(notes.filter((_, i) => i !== idx));
  };

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Firebase auth state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Load user from localStorage and Firebase
  useEffect(() => {
    if (!mounted || !authReady) return;
    
    const loadUserAndAuth = async () => {
      console.log('🔐 Dashboard: Loading user authentication...');
      
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('Sitegrip-user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const user = userData.user || userData;
          setCurrentUser(user);
          console.log('👤 Dashboard: User loaded from localStorage:', user?.email || user?.uid);
          
          // Try to get fresh token from Firebase if available
          try {
            const auth = getAuth();
            if (auth && auth.currentUser) {
              const freshToken = await auth.currentUser.getIdToken();
              setAuthToken(freshToken);
              console.log('🔑 Dashboard: Fresh Firebase token obtained');
              
              // Update localStorage with fresh token
              const updatedUserData = { ...userData, idToken: freshToken, token: freshToken };
              localStorage.setItem('Sitegrip-user', JSON.stringify(updatedUserData));
            } else {
              // Fallback to stored token
              const storedToken = userData.token || userData.idToken || null;
              if (storedToken) {
                setAuthToken(storedToken);
                console.log('🔑 Dashboard: Using stored token');
              }
            }
          } catch (tokenError) {
            console.warn('⚠️ Dashboard: Could not get Firebase token, using stored:', tokenError);
            const storedToken = userData.token || userData.idToken || null;
            setAuthToken(storedToken);
          }
        } catch (error) {
          console.error('❌ Dashboard: Failed to parse stored user data:', error);
        }
      } else {
        // Try to get user from Firebase Auth if no localStorage data
        try {
          const auth = getAuth();
          if (auth && auth.currentUser) {
            const firebaseUser = auth.currentUser;
            const token = await firebaseUser.getIdToken();
            
            const user = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              idToken: token,
              token: token
            };
            
            setCurrentUser(user);
            setAuthToken(token);
            
            // Store in localStorage
            localStorage.setItem('Sitegrip-user', JSON.stringify(user));
            console.log('🔑 Dashboard: User loaded from Firebase and stored');
          }
        } catch (firebaseError) {
          console.log('⚠️ Dashboard: No Firebase user available');
        }
      }
    };
    
    loadUserAndAuth();
  }, [mounted, authReady]);

  // Get Firebase ID token for authentication
  const getAuthToken = async (): Promise<string | null> => {
    if (authToken) return authToken;
    
    try {
      const auth = getAuth();
      if (auth && auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        setAuthToken(token);
        return token;
      }
      return authToken;
    } catch (error) {
      console.error('Failed to get Firebase token:', error);
      return authToken;
    }
  };

  // Fetch Google Analytics properties
  useEffect(() => {
    if (currentUser && authToken) {
      fetchAnalyticsProperties();
    } else {
      setAnalyticsProperties([]);
      setSelectedProperty("");
      setAnalyticsData(null);
    }
  }, [currentUser, authToken]);

  const fetchAnalyticsProperties = async () => {
    setLoadingProperties(true);
    setError("");
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      console.log('🔍 [Analytics] Fetching properties with token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/analytics/properties', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('🔍 [Analytics] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔍 [Analytics] Error response:', errorData);
        
        // Check if it's an authentication issue
        if (response.status === 401 || errorData.message?.includes('not authenticated with Google Analytics')) {
          throw new Error('Please connect your Google Analytics account first. Go to Settings to link your Google account with Analytics permissions.');
        }
        
        throw new Error(errorData.error || errorData.message || `Failed to fetch analytics properties (${response.status})`);
      }

      const data = await response.json();
      console.log('🔍 [Analytics] Success response:', data);
      
      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch analytics properties');
      }

      setAnalyticsProperties(data.properties || []);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch Google Analytics properties';
      setError(errorMessage);
      console.error('Error fetching properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Auto-select first property
  useEffect(() => {
    if (analyticsProperties.length > 0 && !selectedProperty) {
      console.log('🎯 [Analytics] Auto-selecting first property:', analyticsProperties[0]);
      setSelectedProperty(analyticsProperties[0].property);
    } else if (analyticsProperties.length > 0 && selectedProperty) {
      console.log('🎯 [Analytics] Property already selected:', selectedProperty);
    }
  }, [analyticsProperties, selectedProperty]);

  // Fetch analytics data when property or date range changes
  useEffect(() => {
    console.log('🔄 [Analytics] useEffect triggered:', { 
      selectedProperty, 
      dateFrom: dateRange.from, 
      dateTo: dateRange.to, 
      hasAuthToken: !!authToken 
    });
    
    if (selectedProperty && dateRange.from && dateRange.to && authToken) {
      console.log('✅ [Analytics] All conditions met, fetching data...');
      fetchAnalyticsData();
    } else {
      console.log('❌ [Analytics] Missing conditions for data fetch');
    }
  }, [selectedProperty, dateRange, authToken]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      console.log('📊 [Analytics] Fetching data with:', {
        propertyId: selectedProperty,
        startDate: dateRange.from,
        endDate: dateRange.to,
        token: token.substring(0, 20) + '...'
      });

      const analyticsResponse = await fetch('/api/analytics/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: selectedProperty,
          startDate: dateRange.from,
          endDate: dateRange.to,
        }),
      });

      console.log('📊 [Analytics] Response status:', analyticsResponse.status);

      if (!analyticsResponse.ok) {
        const errorData = await analyticsResponse.json();
        console.error('📊 [Analytics] Error response:', errorData);
        
        // Show the actual backend error message
        const errorMessage = errorData.error || errorData.message || 'Failed to fetch analytics data';
        throw new Error(errorMessage);
      }

      const result = await analyticsResponse.json();
      console.log('📊 [Analytics] Success response:', result);
      setAnalyticsData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      console.error('📊 [Analytics] Error fetching data:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (selectedProperty) {
      await fetchAnalyticsData();
    }
    setIsRefreshing(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/analytics.readonly');
      provider.addScope('https://www.googleapis.com/auth/webmasters.readonly');
      
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      const user = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        idToken: token,
        token: token,
        googleAuthEnabled: true
      };
      
      setCurrentUser(user);
      setAuthToken(token);
      localStorage.setItem('Sitegrip-user', JSON.stringify(user));
    } catch (err) {
      setError('Google sign-in failed');
      console.error('Google sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string, trend?: number) => (
    <motion.div
      variants={fadeInUp}
      className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-7 border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 group overflow-hidden"
    >
      {/* Glassmorphism accent */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2 tracking-tight">{title}</p>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 drop-shadow-sm">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'} font-medium mt-1`}>
              <TrendingUp className={`w-5 h-5 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  // Show loading state during initial mount
  if (!mounted || !authReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Initializing Dashboard</h2>
            <p className="text-slate-600 dark:text-slate-400">Checking authentication status...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="flex flex-col gap-2 md:gap-1">
              <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-slate-200/50 dark:border-white/20 rounded-full px-3 py-1 mb-1 w-max">
                <Sparkles className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-white/90">Analytics Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent leading-tight">
                Dashboard Overview
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Monitor your website performance and analytics in real-time
              </p>
              {currentUser && dateRange.from && dateRange.to && (
                <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs mt-1 w-max">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {dateRange.from === dateRange.to 
                      ? `Today (${new Date(dateRange.from).toLocaleDateString()})`
                      : `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`
                    }
                  </span>
                </div>
              )}
            </div>
            {currentUser && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-2 md:mt-0"
              >
                {/* Date Range Picker */}
                <div className="flex items-center gap-2">
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-2 py-1">
                    <button
                      onClick={() => setDateRange({ from: getToday(), to: getToday() })}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        dateRange.from === getToday() && dateRange.to === getToday()
                          ? 'bg-purple-500 text-white' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setDateRange({ from: getDaysAgo(7), to: getToday() })}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        isActivePreset(7) 
                          ? 'bg-purple-500 text-white' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      7D
                    </button>
                    <button
                      onClick={() => setDateRange({ from: getDaysAgo(30), to: getToday() })}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        isActivePreset(30) 
                          ? 'bg-purple-500 text-white' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      30D
                    </button>
                    <button
                      onClick={() => setDateRange({ from: getDaysAgo(90), to: getToday() })}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        isActivePreset(90) 
                          ? 'bg-purple-500 text-white' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      90D
                    </button>
                  </div>
                  {/* Custom Date Range */}
                  <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-1">
                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={e => setDateRange({ from: e.target.value, to: dateRange.to })}
                      className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 w-24"
                    />
                    <span className="text-xs text-slate-400">-</span>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={e => setDateRange({ from: dateRange.from, to: e.target.value })}
                      className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 w-24"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {!currentUser ? (
          /* Authentication Required State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-700/50">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                Connect Your Analytics
              </h2>
              
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Sign in with Google to access your Google Analytics data and get detailed insights about your website performance.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Authenticated Dashboard */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Google Analytics Property
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-900 dark:text-white appearance-none"
                    value={selectedProperty}
                    onChange={e => setSelectedProperty(e.target.value)}
                    disabled={loadingProperties || !analyticsProperties.length}
                  >
                    <option value="">{loadingProperties ? 'Loading properties...' : 'Select a property'}</option>
                    {analyticsProperties.map((prop) => (
                      <option key={prop.property} value={prop.property}>{prop.displayName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Date Range
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-900 dark:text-white"
                      value={dateRange.from}
                      onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 self-center font-medium">to</span>
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-slate-900 dark:text-white"
                      value={dateRange.to}
                      onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content based on state */}
            <AnimatePresence mode="wait">
              {loadingProperties ? (
                <motion.div
                  key="loading-properties"
                  {...fadeInUp}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Loading Analytics Properties
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">Fetching your Google Analytics properties...</p>
                </motion.div>
              ) : !analyticsProperties.length ? (
                <motion.div
                  key="no-properties"
                  {...fadeInUp}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    {error.includes('connect your Google Analytics') ? 'Google Analytics Not Connected' : 'No Analytics Properties Found'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    {error || 'No Google Analytics properties found for your account.'}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={fetchAnalyticsProperties}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry
                    </button>
                    {error.includes('connect your Google Analytics') && (
                      <a
                        href="/settings"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                      >
                        <Settings className="w-4 h-4" />
                        Go to Settings
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : !selectedProperty ? (
                <motion.div
                  key="select-property"
                  {...fadeInUp}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Select Analytics Property
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Please select a Google Analytics property to view your dashboard data.
                  </p>
                </motion.div>
              ) : loading ? (
                <motion.div
                  key="loading-data"
                  {...fadeInUp}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                    <Activity className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Loading Analytics Data
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">Fetching your website analytics...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  {...fadeInUp}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    Failed to Load Data
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                  <button
                    onClick={fetchAnalyticsData}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </motion.div>
              ) : !analyticsData ? (
                <motion.div
                  key="no-data"
                  {...fadeInUp}
                  className="text-center py-16"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-500 to-slate-500 flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    No Data Available
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    No analytics data available for the selected date range.
                  </p>
                </motion.div>
              ) : (
                /* Analytics Dashboard */
                <motion.div
                  key="dashboard"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="space-y-8"
                >
                  {/* Metrics Grid */}
                  <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {renderMetricCard(
                      "Total Users",
                      analyticsData?.derivedMetrics?.totalUsers?.toLocaleString() || '0',
                      <Users className="w-full h-full text-white" />,
                      "bg-gradient-to-r from-blue-500 to-indigo-500"
                    )}
                    {renderMetricCard(
                      "Sessions",
                      analyticsData?.derivedMetrics?.totalSessions?.toLocaleString() || '0',
                      <BarChart3 className="w-full h-full text-white" />,
                      "bg-gradient-to-r from-green-500 to-emerald-500"
                    )}
                    {renderMetricCard(
                      "Page Views",
                      analyticsData?.derivedMetrics?.totalPageViews?.toLocaleString() || '0',
                      <Eye className="w-full h-full text-white" />,
                      "bg-gradient-to-r from-purple-500 to-pink-500"
                    )}
                    {renderMetricCard(
                      "Bounce Rate",
                      analyticsData?.derivedMetrics?.avgBounceRate?.toFixed(1) + '%' || '0%',
                      <TrendingUp className="w-full h-full text-white" />,
                      "bg-gradient-to-r from-orange-500 to-red-500"
                    )}
                  </motion.div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Traffic Trends */}
                    <motion.div variants={fadeInUp} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Traffic Trends</h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData?.basicMetrics || []}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                          <XAxis dataKey="date" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              border: 'none', 
                              borderRadius: '12px',
                              backdropFilter: 'blur(10px)'
                            }} 
                          />
                          <Legend />
                          <Area type="monotone" dataKey="totalUsers" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" name="Users" />
                          <Area type="monotone" dataKey="sessions" stroke="#10b981" fillOpacity={1} fill="url(#colorSessions)" name="Sessions" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Device Breakdown */}
                    <motion.div variants={fadeInUp} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Device Breakdown</h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData?.deviceData || []}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {(analyticsData?.deviceData || []).map((entry, index) => (
                              <Cell key={`cell-device-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                              border: 'none', 
                              borderRadius: '12px',
                              backdropFilter: 'blur(10px)'
                            }} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>

                  {/* Top Pages Table */}
                  <motion.div variants={fadeInUp} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Top Pages</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Page</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Users</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Sessions</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Pageviews</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Bounce Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(analyticsData?.topPagesData || []).map((page, index) => (
                            <tr key={index} className="border-b border-slate-200/30 dark:border-slate-700/30 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors duration-200">
                              <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-medium">{page.page}</td>
                              <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{page.users.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{page.sessions.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{page.pageviews.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">{page.bounceRate.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Quick Notes Widget */}
            <div className="mb-8 max-w-md">
              <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-slate-800 dark:text-white">Quick Notes</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addNote(); }}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button
                    onClick={addNote}
                    className="px-3 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-sm transition"
                    title="Add Note"
                  >Add</button>
                </div>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {notes.length === 0 && (
                    <li className="text-xs text-slate-400 italic">No notes yet.</li>
                  )}
                  {notes.map((note, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 rounded px-3 py-2">
                      <span className="text-sm text-slate-800 dark:text-slate-100 break-words flex-1">{note}</span>
                      <button
                        onClick={() => deleteNote(idx)}
                        className="ml-2 text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded"
                        title="Delete Note"
                      >Delete</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

export default DashboardOverviewPage; 