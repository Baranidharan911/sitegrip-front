"use client";

import { useState, useEffect } from 'react';
import { useFrontendUptime } from '@/hooks/useFrontendUptime';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, RefreshCw, Database, Wifi, WifiOff } from 'lucide-react';

export default function TestUptimePage() {
  const { user } = useAuth();
  const {
    monitors,
    loading,
    error,
    refreshMonitors,
    clearError,
  } = useFrontendUptime(false); // Disable auto-refresh for testing

  const [testResults, setTestResults] = useState<{
    firebaseConfig: boolean;
    firebaseConnection: boolean;
    userAuth: boolean;
    monitorsFetch: boolean;
  }>({
    firebaseConfig: false,
    firebaseConnection: false,
    userAuth: false,
    monitorsFetch: false,
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Test Firebase configuration
  const testFirebaseConfig = () => {
    addLog('Testing Firebase configuration...');
    const hasApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const hasProjectId = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const hasAuthDomain = !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    
    const isConfigured = hasApiKey && hasProjectId && hasAuthDomain;
    
    setTestResults(prev => ({ ...prev, firebaseConfig: isConfigured }));
    
    if (isConfigured) {
      addLog('✅ Firebase configuration is valid');
    } else {
      addLog('❌ Firebase configuration is missing required fields');
      addLog(`  - API Key: ${hasApiKey ? '✅' : '❌'}`);
      addLog(`  - Project ID: ${hasProjectId ? '✅' : '❌'}`);
      addLog(`  - Auth Domain: ${hasAuthDomain ? '✅' : '❌'}`);
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    addLog('Testing Firebase connection...');
    try {
      const firebaseModule = await import('@/lib/firebase');
      const isFirestoreAvailable = firebaseModule.isFirestoreAvailable;
      const db = firebaseModule.db;
      
      // First check if Firestore is available
      if (typeof isFirestoreAvailable === 'function' && isFirestoreAvailable() && db) {
        addLog('✅ Firestore appears to be available');
        setTestResults(prev => ({ ...prev, firebaseConnection: true }));
        addLog('✅ Firebase connection successful (basic check)');
      } else {
        setTestResults(prev => ({ ...prev, firebaseConnection: false }));
        addLog('❌ Firebase connection failed - Firestore not available');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, firebaseConnection: false }));
      addLog(`❌ Firebase connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test user authentication
  const testUserAuth = () => {
    addLog('Testing user authentication...');
    if (user?.uid) {
      setTestResults(prev => ({ ...prev, userAuth: true }));
      addLog(`✅ User authenticated: ${user.email} (${user.uid})`);
    } else {
      setTestResults(prev => ({ ...prev, userAuth: false }));
      addLog('❌ User not authenticated');
      addLog('💡 You need to log in to use uptime monitoring features');
    }
  };

  // Handle login
  const handleLogin = async () => {
    addLog('Attempting to log in...');
    try {
      const firebaseModule = await import('@/lib/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, provider } = firebaseModule;
      
      if (auth && provider) {
        await signInWithPopup(auth, provider);
        addLog('✅ Login successful');
      } else {
        addLog('❌ Login failed: Firebase Auth or Provider not available');
      }
      // Re-run tests after login
      setTimeout(() => {
        testUserAuth();
        testMonitorsFetch();
      }, 1000);
    } catch (error) {
      addLog(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test monitors fetch
  const testMonitorsFetch = async () => {
    addLog('Testing monitors fetch...');
    try {
      await refreshMonitors();
      setTestResults(prev => ({ ...prev, monitorsFetch: true }));
      addLog(`✅ Monitors fetched successfully: ${monitors.length} monitors`);
    } catch (error) {
      setTestResults(prev => ({ ...prev, monitorsFetch: false }));
      addLog(`❌ Monitors fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setLogs([]);
    addLog('🚀 Starting uptime monitoring tests...');
    
    testFirebaseConfig();
    await testFirebaseConnection();
    testUserAuth();
    await testMonitorsFetch();
    
    addLog('✅ All tests completed');
  };

  // Run tests on mount
  useEffect(() => {
    runAllTests();
  }, []);

  const allTestsPassed = Object.values(testResults).every(result => result);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Uptime Monitoring Test
              </h1>
              <p className="text-gray-600">
                Test Firebase integration and uptime monitoring functionality
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Run Tests
            </button>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Firebase Config</h3>
              </div>
              <div className="flex items-center gap-2">
                {testResults.firebaseConfig ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={testResults.firebaseConfig ? 'text-green-600' : 'text-red-600'}>
                  {testResults.firebaseConfig ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wifi className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Firebase Connection</h3>
              </div>
              <div className="flex items-center gap-2">
                {testResults.firebaseConnection ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={testResults.firebaseConnection ? 'text-green-600' : 'text-red-600'}>
                  {testResults.firebaseConnection ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Info className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">User Auth</h3>
              </div>
              <div className="flex items-center gap-2">
                {testResults.userAuth ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={testResults.userAuth ? 'text-green-600' : 'text-red-600'}>
                  {testResults.userAuth ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Monitors Fetch</h3>
              </div>
              <div className="flex items-center gap-2">
                {testResults.monitorsFetch ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={testResults.monitorsFetch ? 'text-green-600' : 'text-red-600'}>
                  {testResults.monitorsFetch ? 'Success' : 'Failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className="mb-8">
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              allTestsPassed 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {allTestsPassed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  allTestsPassed ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {allTestsPassed ? 'All Tests Passed' : 'Some Tests Failed'}
                </h3>
                <p className={`text-sm ${
                  allTestsPassed ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {allTestsPassed 
                    ? 'Uptime monitoring is ready to use' 
                    : 'Please check the logs below for issues'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Login Section */}
          {!testResults.userAuth && (
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Authentication Required</h3>
                </div>
                <p className="text-blue-700 mb-3">
                  You need to log in to use uptime monitoring features. Click the button below to sign in with Google.
                </p>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sign In with Google
                </button>
              </div>
            </div>
          )}

          {/* Current State */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Current State</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Firebase Available:</span>
                  <span className={monitors.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    {monitors.length > 0 ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loading:</span>
                  <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                    {loading ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monitors Count:</span>
                  <span className="text-gray-900">{monitors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {user?.uid || 'Not authenticated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Environment</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Firebase API Key:</span>
                  <span className={process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'text-green-600' : 'text-red-600'}>
                    {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Project ID:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auth Domain:</span>
                  <span className="text-gray-900 font-mono text-sm">
                    {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node Environment:</span>
                  <span className="text-gray-900">
                    {process.env.NODE_ENV || 'development'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Firestore Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Firestore Available:</span>
                  <span className={monitors.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    {monitors.length > 0 ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection Status:</span>
                  <span className={testResults.firebaseConnection ? 'text-green-600' : 'text-red-600'}>
                    {testResults.firebaseConnection ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User Authentication:</span>
                  <span className={testResults.userAuth ? 'text-green-600' : 'text-red-600'}>
                    {testResults.userAuth ? 'Authenticated' : 'Not Authenticated'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monitors Fetch:</span>
                  <span className={testResults.monitorsFetch ? 'text-green-600' : 'text-red-600'}>
                    {testResults.monitorsFetch ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Error</h3>
                </div>
                <p className="text-red-700 mb-3">{error}</p>
                <button
                  onClick={clearError}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Clear Error
                </button>
              </div>
            </div>
          )}

          {/* Test Logs */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Test Logs</h3>
              <button
                onClick={() => setLogs([])}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
              >
                Clear Logs
              </button>
            </div>
            <div className="bg-black rounded p-4 h-64 overflow-y-auto">
              <pre className="text-green-400 text-sm font-mono">
                {logs.length > 0 ? logs.join('\n') : 'No logs yet...'}
              </pre>
            </div>
          </div>

          {/* Monitors List */}
          {monitors.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Current Monitors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monitors.map((monitor) => (
                  <div key={monitor.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{monitor.name}</h4>
                      <div className={`w-3 h-3 rounded-full ${
                        monitor.status ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{monitor.url}</p>
                    <div className="text-xs text-gray-500">
                      Type: {monitor.type} | Interval: {monitor.interval}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 