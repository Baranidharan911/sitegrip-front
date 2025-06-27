'use client';

import React, { useState, useEffect } from 'react';
import { useUptime } from '../../hooks/useUptime';
import { CreateMonitorRequest, UpdateMonitorRequest, Monitor } from '../../types/uptime';
import uptimeApi from '../../lib/uptimeApi';

interface MonitorFormProps {
  monitor?: Monitor;
  onClose: () => void;
  onSuccess: () => void;
}

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MonitorForm: React.FC<MonitorFormProps> = ({ monitor, onClose, onSuccess }) => {
  const { createMonitor, updateMonitor } = useUptime(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlValidation, setUrlValidation] = useState<{ valid: boolean; message?: string } | null>(null);

  const [formData, setFormData] = useState({
    url: monitor?.url || '',
    name: monitor?.name || '',
    frequency: monitor?.frequency || 5,
    is_public: monitor?.is_public || false,
    ssl_monitoring_enabled: monitor?.ssl_monitoring_enabled ?? true, // Default to true
    
    // Alert configuration
    alertsEnabled: !!monitor?.alerts,
    email: monitor?.alerts?.email || '',
    webhook: monitor?.alerts?.webhook || '',
    threshold: monitor?.alerts?.threshold || 2,
    
    // SSL alert configuration
    sslAlertsEnabled: !!monitor?.alerts?.ssl_alerts,
    ssl_days_before_expiry: monitor?.alerts?.ssl_alerts?.days_before_expiry || 30,
    ssl_check_chain: monitor?.alerts?.ssl_alerts?.check_chain ?? true,
    ssl_alert_on_self_signed: monitor?.alerts?.ssl_alerts?.alert_on_self_signed ?? true,
    ssl_alert_on_invalid: monitor?.alerts?.ssl_alerts?.alert_on_invalid ?? true,
  });

  // URL validation
  useEffect(() => {
    if (formData.url && formData.url.length > 3) {
      const timeoutId = setTimeout(async () => {
        try {
          const validation = await uptimeApi.validateUrl(formData.url);
          setUrlValidation(validation);
        } catch (error) {
          setUrlValidation({ valid: false, message: 'Failed to validate URL' });
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setUrlValidation(null);
    }
  }, [formData.url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the request data
      const requestData: CreateMonitorRequest | UpdateMonitorRequest = {
        url: formData.url,
        name: formData.name || undefined,
        frequency: formData.frequency,
        is_public: formData.is_public,
        ssl_monitoring_enabled: formData.ssl_monitoring_enabled,
      };

      // Add alerts if enabled
      if (formData.alertsEnabled) {
        requestData.alerts = {
          threshold: formData.threshold,
          ...(formData.email && { email: formData.email }),
          ...(formData.webhook && { webhook: formData.webhook }),
        };

        // Add SSL alerts if enabled
        if (formData.sslAlertsEnabled && formData.url.startsWith('https://')) {
          requestData.alerts.ssl_alerts = {
            days_before_expiry: formData.ssl_days_before_expiry,
            check_chain: formData.ssl_check_chain,
            alert_on_self_signed: formData.ssl_alert_on_self_signed,
            alert_on_invalid: formData.ssl_alert_on_invalid,
          };
        }
      }

      if (monitor) {
        // Update existing monitor
        await updateMonitor(monitor.id, requestData);
      } else {
        // Create new monitor
        await createMonitor(requestData as CreateMonitorRequest);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save monitor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isHttps = formData.url.startsWith('https://');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {monitor ? 'Edit Monitor' : 'Add New Monitor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Configuration</h3>
            
            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {urlValidation && (
                <p className={`mt-1 text-sm ${
                  urlValidation.valid 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {urlValidation.valid ? '✓ URL appears valid' : `⚠ ${urlValidation.message}`}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="My Website"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Check Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={1}>Every 1 minute</option>
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
              </select>
            </div>

            {/* Public Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Show on public status page
              </label>
            </div>
          </div>

          {/* SSL Configuration */}
          {isHttps && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">SSL Certificate Monitoring</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ssl_monitoring_enabled"
                  checked={formData.ssl_monitoring_enabled}
                  onChange={(e) => handleInputChange('ssl_monitoring_enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ssl_monitoring_enabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable SSL certificate monitoring
                </label>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monitors SSL certificate validity, expiration, and security status.
              </p>
            </div>
          )}

          {/* Alert Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Alert Configuration</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="alertsEnabled"
                checked={formData.alertsEnabled}
                onChange={(e) => handleInputChange('alertsEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="alertsEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable alerts
              </label>
            </div>

            {formData.alertsEnabled && (
              <div className="space-y-4 ml-6">
                {/* Failure Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Failure Threshold
                  </label>
                  <select
                    value={formData.threshold}
                    onChange={(e) => handleInputChange('threshold', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Alert after 1 failure</option>
                    <option value={2}>Alert after 2 failures</option>
                    <option value={3}>Alert after 3 failures</option>
                    <option value={5}>Alert after 5 failures</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Alert
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Webhook */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={formData.webhook}
                    onChange={(e) => handleInputChange('webhook', e.target.value)}
                    placeholder="https://hooks.example.com/alerts"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* SSL Alerts */}
                {isHttps && formData.ssl_monitoring_enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sslAlertsEnabled"
                        checked={formData.sslAlertsEnabled}
                        onChange={(e) => handleInputChange('sslAlertsEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sslAlertsEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Enable SSL-specific alerts
                      </label>
                    </div>

                    {formData.sslAlertsEnabled && (
                      <div className="space-y-4 ml-6">
                        {/* Days before expiry */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Alert days before certificate expires
                          </label>
                          <select
                            value={formData.ssl_days_before_expiry}
                            onChange={(e) => handleInputChange('ssl_days_before_expiry', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value={7}>7 days</option>
                            <option value={14}>14 days</option>
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days</option>
                          </select>
                        </div>

                        {/* SSL Alert Options */}
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="ssl_alert_on_invalid"
                              checked={formData.ssl_alert_on_invalid}
                              onChange={(e) => handleInputChange('ssl_alert_on_invalid', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="ssl_alert_on_invalid" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Alert on invalid certificates
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="ssl_alert_on_self_signed"
                              checked={formData.ssl_alert_on_self_signed}
                              onChange={(e) => handleInputChange('ssl_alert_on_self_signed', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="ssl_alert_on_self_signed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Alert on self-signed certificates
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="ssl_check_chain"
                              checked={formData.ssl_check_chain}
                              onChange={(e) => handleInputChange('ssl_check_chain', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="ssl_check_chain" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Validate certificate chain
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (urlValidation && !urlValidation.valid)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : monitor ? 'Update Monitor' : 'Create Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonitorForm;
