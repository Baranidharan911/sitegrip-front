'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, CreateMonitorRequest, UpdateMonitorRequest, AlertConfig } from '../../types/uptime';
import { useUptime } from '../../hooks/useUptime';
import { uptimeApi } from '../../lib/uptimeApi';

interface MonitorFormProps {
  monitor?: Monitor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (monitor: Monitor) => void;
}

const MonitorForm: React.FC<MonitorFormProps> = ({
  monitor,
  isOpen,
  onClose,
  onSave
}) => {
  const { createMonitor, updateMonitor, loading } = useUptime();
  
  const [formData, setFormData] = useState<CreateMonitorRequest>({
    url: '',
    name: '',
    frequency: 5,
    alerts: undefined,
    is_public: false,
    ssl_monitoring_enabled: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validatingUrl, setValidatingUrl] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);

  // Reset form when monitor changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (monitor) {
        // Edit mode - populate form with existing monitor data
        setFormData({
          url: monitor.url,
          name: monitor.name || '',
          frequency: monitor.frequency,
          alerts: monitor.alerts,
          is_public: monitor.is_public,
          ssl_monitoring_enabled: monitor.ssl_monitoring_enabled,
        });
      } else {
        // Create mode - reset form
        setFormData({
          url: '',
          name: '',
          frequency: 5,
          alerts: undefined,
          is_public: false,
          ssl_monitoring_enabled: false,
        });
      }
      setErrors({});
      setUrlValid(null);
    }
  }, [monitor, isOpen]);

  // URL validation
  const validateUrl = async (url: string) => {
    if (!url.trim()) {
      setUrlValid(null);
      return;
    }

    setValidatingUrl(true);
    try {
      const result = await uptimeApi.validateUrl(url);
      setUrlValid(result.valid);
      if (!result.valid && result.message) {
        const errorMessage = String(result.message);
        setErrors(prev => ({ ...prev, url: errorMessage }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.url;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('URL validation error:', error);
      setUrlValid(false);
      setErrors(prev => ({ ...prev, url: 'Failed to validate URL' }));
    } finally {
      setValidatingUrl(false);
    }
  };

  // Handle URL input change with debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.url) {
        validateUrl(formData.url);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.url]);

  const handleInputChange = (field: keyof CreateMonitorRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAlertConfigChange = (field: keyof AlertConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      alerts: prev.alerts ? { ...prev.alerts, [field]: value } : { threshold: 1, [field]: value }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (urlValid === false) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (!formData.name?.trim()) {
      newErrors.name = 'Monitor name is required';
    }

    if (formData.frequency < 1 || formData.frequency > 60) {
      newErrors.frequency = 'Frequency must be between 1 and 60 minutes';
    }

    if (formData.alerts?.email && !/\S+@\S+\.\S+/.test(formData.alerts.email)) {
      newErrors.alertEmail = 'Please enter a valid email address';
    }

    if (formData.alerts?.webhook && !formData.alerts.webhook.startsWith('http')) {
      newErrors.alertWebhook = 'Webhook URL must start with http or https';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (monitor) {
        // Update existing monitor
        const updateData: UpdateMonitorRequest = {
          name: formData.name,
          frequency: formData.frequency,
          alerts: formData.alerts,
          is_public: formData.is_public,
          ssl_monitoring_enabled: formData.ssl_monitoring_enabled,
        };
        
        await updateMonitor(monitor.id, updateData);
        console.log('✅ Monitor updated successfully');
      } else {
        // Create new monitor
        const monitorId = await createMonitor(formData);
        console.log('✅ Monitor created successfully:', monitorId);
      }
      
      onClose();
      if (onSave) {
        // This would typically be called with the updated monitor data
        // For now, we'll let the parent component handle the refresh
      }
    } catch (error) {
      console.error('❌ Failed to save monitor:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to save monitor'
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {monitor ? 'Edit Monitor' : 'Add New Monitor'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* URL Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL to Monitor *
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://example.com"
                disabled={!!monitor} // Disable URL editing for existing monitors
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.url 
                    ? 'border-red-300 dark:border-red-600' 
                    : urlValid === true 
                    ? 'border-green-300 dark:border-green-600'
                    : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
              />
              {validatingUrl && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
              {urlValid === true && !validatingUrl && (
                <div className="absolute right-3 top-3 text-green-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.url && (
              <p className="text-red-500 text-xs mt-1">{errors.url}</p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monitor Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="My Website"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Frequency Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Check Frequency (minutes)
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={1}>Every minute</option>
              <option value={5}>Every 5 minutes</option>
              <option value={10}>Every 10 minutes</option>
              <option value={15}>Every 15 minutes</option>
              <option value={30}>Every 30 minutes</option>
              <option value={60}>Every hour</option>
            </select>
            {errors.frequency && (
              <p className="text-red-500 text-xs mt-1">{errors.frequency}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="ssl-monitoring"
                type="checkbox"
                checked={formData.ssl_monitoring_enabled}
                onChange={(e) => handleInputChange('ssl_monitoring_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ssl-monitoring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable SSL certificate monitoring
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="public-status"
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="public-status" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Show on public status page
              </label>
            </div>
          </div>

          {/* Alert Configuration */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Alert Configuration (Optional)
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Email for alerts
                </label>
                <input
                  type="email"
                  value={formData.alerts?.email || ''}
                  onChange={(e) => handleAlertConfigChange('email', e.target.value || undefined)}
                  placeholder="alerts@example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.alertEmail ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-white`}
                />
                {errors.alertEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.alertEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={formData.alerts?.webhook || ''}
                  onChange={(e) => handleAlertConfigChange('webhook', e.target.value || undefined)}
                  placeholder="https://hooks.slack.com/services/..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    errors.alertWebhook ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-white`}
                />
                {errors.alertWebhook && (
                  <p className="text-red-500 text-xs mt-1">{errors.alertWebhook}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Alert after failures
                </label>
                <select
                  value={formData.alerts?.threshold || 1}
                  onChange={(e) => handleAlertConfigChange('threshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:text-white"
                >
                  <option value={1}>1 failure</option>
                  <option value={2}>2 consecutive failures</option>
                  <option value={3}>3 consecutive failures</option>
                  <option value={5}>5 consecutive failures</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-red-500 text-sm text-center">{errors.submit}</div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || validatingUrl || urlValid === false}
              className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : monitor ? 'Update Monitor' : 'Create Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonitorForm;
