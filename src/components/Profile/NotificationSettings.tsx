'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface NotificationSettingsProps {
  onChange: (settings: any) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onChange }) => {
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    sms: false,
    desktop: true,
  });

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem('Sitegrip-user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.preferences?.notifications) {
          setSettings(user.preferences.notifications);
          onChange(user.preferences.notifications);
        }
      }
    } catch (err) {
      console.error('Error loading notification settings:', err);
    }
  }, [onChange]);

  const handleChange = (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(newSettings);
    onChange(newSettings);
    
    // For demonstration purposes, show toast when settings are changed
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${newSettings[key as keyof typeof newSettings] ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="rounded-lg border dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Notification Settings
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
            <p className="text-xs text-gray-500">Get notified about important alerts via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email}
              onChange={() => handleChange('email')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Push Notifications</p>
            <p className="text-xs text-gray-500">Receive push notifications in your browser</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.push}
              onChange={() => handleChange('push')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">SMS Notifications</p>
            <p className="text-xs text-gray-500">Get critical alerts via SMS</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sms}
              onChange={() => handleChange('sms')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">Desktop Notifications</p>
            <p className="text-xs text-gray-500">Show notifications on your desktop</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.desktop}
              onChange={() => handleChange('desktop')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
