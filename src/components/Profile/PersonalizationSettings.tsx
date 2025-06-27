'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface PersonalizationSettingsProps {
  onChange: (settings: any) => void;
}

const PersonalizationSettings: React.FC<PersonalizationSettingsProps> = ({ onChange }) => {
  const [settings, setSettings] = useState({
    defaultModule: 'dashboard',
    uiDensity: 'comfy',
    theme: 'system'
  });

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem('Sitegrip-user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.preferences?.personalization) {
          setSettings(user.preferences.personalization);
          onChange(user.preferences.personalization);
        }
      }
    } catch (err) {
      console.error('Error loading personalization settings:', err);
    }
  }, [onChange]);

  const handleChange = (key: string, value: string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onChange(newSettings);
    
    // For demonstration purposes, show toast when settings are changed
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated to ${value}`);
  };

  return (
    <div className="rounded-lg border dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Personalization Settings
      </h2>

      <div className="space-y-6">
        {/* Default Module */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Default Module
          </label>
          <select
            value={settings.defaultModule}
            onChange={(e) => handleChange('defaultModule', e.target.value)}
            className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="dashboard">Dashboard</option>
            <option value="indexing">Indexing</option>
            <option value="uptime">Uptime Monitoring</option>
            <option value="seo">SEO Crawler</option>
            <option value="analytics">Analytics</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Choose which module loads by default when you log in</p>
        </div>

        {/* UI Density */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            UI Density
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="uiDensity"
                value="compact"
                checked={settings.uiDensity === 'compact'}
                onChange={(e) => handleChange('uiDensity', e.target.value)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Compact</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="uiDensity"
                value="comfy"
                checked={settings.uiDensity === 'comfy'}
                onChange={(e) => handleChange('uiDensity', e.target.value)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Comfy</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="uiDensity"
                value="spacious"
                checked={settings.uiDensity === 'spacious'}
                onChange={(e) => handleChange('uiDensity', e.target.value)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Spacious</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">Adjust the spacing of UI elements</p>
        </div>

        {/* Theme Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme Preference
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={settings.theme === 'light'}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Light</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={settings.theme === 'dark'}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Dark</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="theme"
                value="system"
                checked={settings.theme === 'system'}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">System</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">Choose your preferred color theme</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationSettings;
