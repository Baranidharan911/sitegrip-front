'use client';

import React, { useState } from 'react';
import AuthGuard from '@/components/Common/AuthGuard';
import { 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Mail, 
  Smartphone, 
  Save,
  User,
  Key,
  CreditCard,
  HelpCircle,
  LogOut,
  Link2,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    weekly: true,
    monthly: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC'
  });

  const [activeTab, setActiveTab] = useState('notifications');

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const connectGoogleAnalytics = async () => {
    try {
      // Get the auth URL from backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/auth/google/url?redirectUri=${encodeURIComponent(window.location.origin + '/auth/callback')}`);
      
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      
      const data = await response.json();
      
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting Google Analytics:', error);
      alert('Failed to connect Google Analytics. Please try again.');
    }
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account preferences and notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    activeTab === 'notifications' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } transition-colors`}
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                </button>
                <button 
                  onClick={() => setActiveTab('accounts')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    activeTab === 'accounts' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } transition-colors`}
                >
                  <Link2 className="w-5 h-5" />
                  Connected Accounts
                </button>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    activeTab === 'profile' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } transition-colors`}
                >
                  <User className="w-5 h-5" />
                  Profile
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    activeTab === 'security' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } transition-colors`}
                >
                  <Shield className="w-5 h-5" />
                  Security
                </button>
                <button 
                  onClick={() => setActiveTab('billing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    activeTab === 'billing' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } transition-colors`}
                >
                  <CreditCard className="w-5 h-5" />
                  Billing
                </button>
                <button 
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    activeTab === 'preferences' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } transition-colors`}
                >
                  <Globe className="w-5 h-5" />
                  Preferences
                </button>
                <button 
                  onClick={() => setActiveTab('help')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    activeTab === 'help' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } transition-colors`}
                >
                  <HelpCircle className="w-5 h-5" />
                  Help & Support
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'notifications' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Notification Preferences
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Notification Channels
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          <div>
                            <h4 className="font-medium text-slate-800 dark:text-white">Email Notifications</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive updates via email</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.email}
                            onChange={() => handleNotificationChange('email')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          <div>
                            <h4 className="font-medium text-slate-800 dark:text-white">Push Notifications</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Get instant browser notifications</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.push}
                            onChange={() => handleNotificationChange('push')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          <div>
                            <h4 className="font-medium text-slate-800 dark:text-white">SMS Notifications</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive critical alerts via SMS</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.sms}
                            onChange={() => handleNotificationChange('sms')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Report Frequency
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-white">Weekly Reports</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Get a summary of your SEO performance</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.weekly}
                            onChange={() => handleNotificationChange('weekly')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-white">Monthly Reports</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Detailed monthly performance analysis</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.monthly}
                            onChange={() => handleNotificationChange('monthly')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Connected Accounts
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white">Google Analytics</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Connect your Google Analytics account to track website traffic.</p>
                      </div>
                    </div>
                    <button 
                      onClick={connectGoogleAnalytics}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                      Connect Account
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white">Google Search Console</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Connect your Google Search Console to monitor search traffic.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('Google Search Console connection not yet implemented.')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Connect Account
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white">Email</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Connected email address: example@example.com</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('Email connection not yet implemented.')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Username
                    </label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <input type="password" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Profile Picture
                    </label>
                    <input type="file" className="block w-full text-sm text-slate-900 border border-slate-300 dark:text-slate-100 dark:border-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Security Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input type="password" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      New Password
                    </label>
                    <input type="password" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input type="password" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex items-center">
                    <input id="remember" type="checkbox" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded dark:bg-slate-700 dark:border-slate-600 dark:checked:bg-blue-600" />
                    <label htmlFor="remember" className="ml-2 text-sm text-slate-700 dark:text-slate-300">Remember me</label>
                  </div>
                  <button className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Billing Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Card Number
                    </label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Expiration Date
                    </label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      CVV
                    </label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Billing Address
                    </label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <button className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                    Update Payment Method
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Display Preferences
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Theme
                    </label>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <Sun className="w-4 h-4" />
                        Light
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                        <Moon className="w-4 h-4" />
                        Dark
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <Globe className="w-4 h-4" />
                        System
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Language
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Help & Support
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Contact Us
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      If you need assistance or have questions, please don't hesitate to contact our support team.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="w-5 h-5" />
                      support@example.com
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Smartphone className="w-5 h-5" />
                      +1 (555) 123-4567
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      FAQ
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-slate-100/50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="font-medium text-slate-800 dark:text-white">How do I change my password?</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          To change your password, go to the Security Settings section and enter your current password, new password, and confirm new password.
                        </p>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="font-medium text-slate-800 dark:text-white">How do I update my payment method?</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          To update your payment method, go to the Billing Information section and enter your card number, expiration date, CVV, and billing address.
                        </p>
                      </div>
                      <div className="bg-slate-100/50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="font-medium text-slate-800 dark:text-white">How do I connect my Google Analytics account?</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          To connect your Google Analytics account, click on "Connected Accounts" and click "Connect Account" next to Google Analytics.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
} 