'use client';

import { useState } from 'react';
import { auth, provider } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { toast } from 'react-hot-toast';

export default function TestAuthPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testPopupMethod = async () => {
    setLoading(true);
    addLog('Testing popup method...');
    
    try {
      addLog('Opening Google sign-in popup...');
      const result = await signInWithPopup(auth, provider);
      addLog(`✅ Popup success! User: ${result.user.email}`);
      toast.success('Popup method worked!');
    } catch (error: any) {
      addLog(`❌ Popup error: ${error.code} - ${error.message}`);
      toast.error(`Popup failed: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const testRedirectMethod = async () => {
    setLoading(true);
    addLog('Testing redirect method...');
    
    try {
      addLog('Redirecting to Google sign-in...');
      await signInWithRedirect(auth, provider);
      // User will be redirected
    } catch (error: any) {
      addLog(`❌ Redirect error: ${error.code} - ${error.message}`);
      toast.error(`Redirect failed: ${error.code}`);
      setLoading(false);
    }
  };

  const checkRedirectResult = async () => {
    setLoading(true);
    addLog('Checking for redirect result...');
    
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        addLog(`✅ Redirect result found! User: ${result.user?.email}`);
        toast.success('Redirect result retrieved!');
      } else {
        addLog('No redirect result found');
      }
    } catch (error: any) {
      addLog(`❌ Redirect result error: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDelayedPopup = async () => {
    setLoading(true);
    addLog('Testing delayed popup method...');
    
    try {
      addLog('Waiting 1 second before opening popup...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('Opening Google sign-in popup...');
      const result = await signInWithPopup(auth, provider);
      addLog(`✅ Delayed popup success! User: ${result.user.email}`);
      toast.success('Delayed popup method worked!');
    } catch (error: any) {
      addLog(`❌ Delayed popup error: ${error.code} - ${error.message}`);
      toast.error(`Delayed popup failed: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Google Authentication Test Page
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Different Sign-In Methods
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={testPopupMethod}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
            >
              Test Popup Method
            </button>

            <button
              onClick={testDelayedPopup}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
            >
              Test Delayed Popup (1s delay)
            </button>

            <button
              onClick={testRedirectMethod}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
            >
              Test Redirect Method
            </button>

            <button
              onClick={checkRedirectResult}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
            >
              Check Redirect Result
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Console Logs
            </h2>
            <button
              onClick={clearLogs}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-900 rounded p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No logs yet. Click a test button above.</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Troubleshooting Tips:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Make sure popups are allowed for this domain</li>
            <li>• Check if you're logged into Google in this browser</li>
            <li>• Try different browsers (Chrome usually works best)</li>
            <li>• Check browser console for additional errors</li>
            <li>• Ensure Firebase is configured with correct domain</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 