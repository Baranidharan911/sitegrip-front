'use client';

import React, { useState } from 'react';
import { CreateMonitorRequest, AlertConfig } from '../../types/uptime';
import { uptimeApi } from '../../lib/uptimeApi';

interface MonitorFormProps {
  onClose: () => void;
  onSuccess: () => void;
  monitor?: any; // For editing existing monitors
}

const MonitorForm: React.FC<MonitorFormProps> = ({ onClose, onSuccess, monitor }) => {
  const [formData, setFormData] = useState<CreateMonitorRequest>({
    url: monitor?.url || '',
    name: monitor?.name || '',
    frequency: monitor?.frequency || 5,
    alerts: monitor?.alerts || undefined,
    is_public: monitor?.is_public || false,
    ssl_monitoring_enabled: monitor?.ssl_monitoring_enabled || false,
  });

  const [alertsEnabled, setAlertsEnabled] = useState(!!monitor?.alerts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlValidation, setUrlValidation] = useState<{ valid: boolean; message?: string } | null>(null);

  const isEditing = !!monitor;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear URL validation when URL changes
    if (name === 'url') {
      setUrlValidation(null);
      setError(null);
    }
  };

     const handleAlertChange = (field: keyof AlertConfig, value: string | number) => {
     setFormData(prev => ({
       ...prev,
       alerts: {
         ...prev.alerts,
         [field]: value || undefined,
       } as AlertConfig,
     }));
   };

  const validateUrl = async () => {
    if (!formData.url) return;
    
    try {
      const validation = await uptimeApi.validateUrl(formData.url);
      setUrlValidation(validation);
      return validation.valid;
    } catch (error) {
      setUrlValidation({ valid: false, message: 'Failed to validate URL' });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate URL first
      const isValidUrl = await validateUrl();
      if (!isValidUrl) {
        setError('Please enter a valid URL');
        setLoading(false);
        return;
      }

             // Prepare form data
       const submitData: CreateMonitorRequest = {
         ...formData,
         frequency: parseInt(formData.frequency.toString()),
         alerts: alertsEnabled && formData.alerts ? formData.alerts : undefined,
       };

      // Submit the form
      if (isEditing) {
        await uptimeApi.updateMonitor(monitor.id, submitData);
      } else {
        await uptimeApi.createMonitor(submitData);
      }

      onSuccess();
    } catch (error: any) {
      console.error('Form submission error:', error);
      setError(error.message || 'Failed to save monitor');
    } finally {
      setLoading(false);
    }
  };

  const handleTestCheck = async () => {
    if (!formData.url) return;
    
    setLoading(true);
    try {
      // For existing monitors, trigger an immediate check
      if (isEditing && monitor?.id) {
        const result = await uptimeApi.triggerCheck(monitor.id);
        alert(`Test completed: ${result.status.toUpperCase()}\nResponse time: ${result.response_time}ms\nHTTP Status: ${result.http_status}`);
      } else {
        // For new monitors, just validate the URL
        const isValid = await validateUrl();
        if (isValid) {
          alert('URL is reachable and valid!');
        } else {
          alert('URL validation failed. Please check the URL and try again.');
        }
      }
    } catch (error: any) {
      alert(`Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Monitor' : 'Add New Monitor'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* URL Field */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL to Monitor *
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                onClick={handleTestCheck}
                disabled={loading || !formData.url}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test
              </button>
            </div>
            {urlValidation && (
              <p className={`mt-1 text-sm ${urlValidation.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {urlValidation.message || (urlValidation.valid ? 'URL is valid' : 'URL is invalid')}
              </p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="My Website"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              If left empty, the URL will be used as the display name
            </p>
          </div>

          {/* Check Frequency */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Check Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={1}>Every minute</option>
              <option value={5}>Every 5 minutes</option>
              <option value={10}>Every 10 minutes</option>
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              How often to check if your site is up
            </p>
          </div>

          {/* SSL Monitoring */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ssl_monitoring_enabled"
              name="ssl_monitoring_enabled"
              checked={formData.ssl_monitoring_enabled}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="ssl_monitoring_enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Enable SSL Certificate Monitoring
            </label>
          </div>
          {formData.ssl_monitoring_enabled && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We'll monitor your SSL certificate and alert you when it's about to expire
            </p>
          )}

          {/* Public Status Page */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Show on public status page
            </label>
          </div>

          {/* Alerts Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="alerts_enabled"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="alerts_enabled" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Alerts
              </label>
            </div>

            {alertsEnabled && (
              <div className="space-y-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Notifications
                  </label>
                  <input
                    type="email"
                    value={formData.alerts?.email || ''}
                    onChange={(e) => handleAlertChange('email', e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={formData.alerts?.webhook || ''}
                    onChange={(e) => handleAlertChange('webhook', e.target.value)}
                    placeholder="https://your-webhook-url.com/webhook"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alert Threshold
                  </label>
                  <select
                    value={formData.alerts?.threshold || 3}
                    onChange={(e) => handleAlertChange('threshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Alert after 1 failure</option>
                    <option value={2}>Alert after 2 consecutive failures</option>
                    <option value={3}>Alert after 3 consecutive failures</option>
                    <option value={5}>Alert after 5 consecutive failures</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Number of consecutive failures before sending an alert
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Monitor' : 'Create Monitor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonitorForm;
