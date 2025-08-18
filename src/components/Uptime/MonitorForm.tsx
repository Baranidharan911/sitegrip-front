'use client';

import React, { useState, useEffect } from 'react';
import { useFrontendUptime } from '../../hooks/useFrontendUptime';
import { CreateMonitorRequest, MonitorType, NotificationType } from '../../types/uptime';

interface MonitorFormProps {
  isOpen: boolean;
  onClose: () => void;
  monitorTypes: MonitorType[];
  notificationTypes: NotificationType[];
  editMonitor?: any; // For editing existing monitors
  onSave: (data: CreateMonitorRequest, id?: string) => Promise<void>;
}

export default function MonitorForm({ 
  isOpen, 
  onClose, 
  monitorTypes, 
  notificationTypes,
  editMonitor,
  onSave
}: MonitorFormProps) {
  const { createMonitor, updateMonitor, testMonitor, loading, error, clearError } = useFrontendUptime();
  
  const [formData, setFormData] = useState<CreateMonitorRequest>({
    name: '',
    url: '',
    type: 'http',
    interval: 60,
    timeout: 30,
    retries: 3,
    tags: [],
    notifications: [],
    threshold: {
      responseTime: 5000,
      statusCode: 200
    }
  });

  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or when editing
  useEffect(() => {
    console.log('🔄 Form effect triggered - isOpen:', isOpen, 'editMonitor:', editMonitor);
    if (isOpen) {
      if (editMonitor) {
        console.log('✏️ Setting form data for editing:', editMonitor);
        const editFormData: CreateMonitorRequest = {
          name: editMonitor.name,
          url: editMonitor.url,
          type: editMonitor.type as 'http' | 'ping' | 'port' | 'ssl' | 'pagespeed' | 'hardware' | 'docker',
          interval: editMonitor.interval,
          timeout: editMonitor.timeout,
          retries: editMonitor.retries,
          tags: editMonitor.tags || [],
          notifications: editMonitor.notifications || [],
          threshold: editMonitor.threshold || {
            responseTime: 5000,
            statusCode: 200
          }
        };
        console.log('📋 Edit form data:', editFormData);
        setFormData(editFormData);
      } else {
        console.log('🆕 Setting form data for new monitor');
        const newFormData: CreateMonitorRequest = {
          name: '',
          url: '',
          type: 'http' as const,
          interval: 60,
          timeout: 30,
          retries: 3,
          tags: [],
          notifications: [],
          threshold: {
            responseTime: 5000,
            statusCode: 200
          }
        };
        console.log('📋 New form data:', newFormData);
        setFormData(newFormData);
      }
      setTestResult(null);
      setValidationErrors({});
      clearError();
    }
  }, [isOpen, editMonitor, clearError]);

  const validateForm = (): boolean => {
    console.log('🔍 Starting form validation');
    const errors: Record<string, string> = {};

    console.log('📝 Validating name:', formData.name);
    if (!formData.name.trim()) {
      errors.name = 'Monitor name is required';
      console.log('❌ Name validation failed');
    }

    console.log('🔗 Validating URL:', formData.url);
    if (!formData.url.trim()) {
      errors.url = 'URL is required';
      console.log('❌ URL validation failed - empty');
    } else {
      try {
        new URL(formData.url);
        console.log('✅ URL validation passed');
      } catch {
        errors.url = 'Please enter a valid URL';
        console.log('❌ URL validation failed - invalid format');
      }
    }

    console.log('⏱️ Validating interval:', formData.interval);
    if ((formData.interval || 0) < 30) {
      errors.interval = 'Interval must be at least 30 seconds';
      console.log('❌ Interval validation failed');
    }

    console.log('⏰ Validating timeout:', formData.timeout);
    if ((formData.timeout || 0) < 5) {
      errors.timeout = 'Timeout must be at least 5 seconds';
      console.log('❌ Timeout validation failed');
    }

    console.log('🔄 Validating retries:', formData.retries);
    if ((formData.retries || 0) < 1) {
      errors.retries = 'Retries must be at least 1';
      console.log('❌ Retries validation failed');
    }

    console.log('📊 Validation errors:', errors);
    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    console.log('✅ Form validation result:', isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submission started');
    console.log('📋 Form data:', formData);
    console.log('✏️ Edit mode:', !!editMonitor);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed');

    try {
      await onSave(formData, editMonitor?.id);
      console.log('🎉 Form submission completed, closing modal');
      onClose();
    } catch (error) {
      console.error('❌ Failed to save monitor:', error);
      console.error('Error details:', error);
    }
  };

  const handleTestUrl = async () => {
    if (!formData.url.trim()) {
      setValidationErrors({ url: 'Please enter a URL to test' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testMonitor(formData.url, formData.timeout);
      setTestResult(result);
    } catch (error: any) {
      let message = error instanceof Error ? error.message : 'Test failed';
      // Show a user-friendly message for timeouts
      if (message.toLowerCase().includes('timed out') || message.toLowerCase().includes('504')) {
        message = 'Monitor test timed out. The site may be slow or unreachable. Try increasing the timeout or check the site.';
      }
      setTestResult({
        status: false,
        message,
        responseTime: 0
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    console.log('📝 Input change:', field, '=', value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('📊 Updated form data:', newData);
      return newData;
    });
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editMonitor ? 'Edit Monitor' : 'Add New Monitor'}
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monitor Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    validationErrors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="My Website Monitor"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monitor Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {monitorTypes?.map((type) => (
                    <option key={type.type} value={type.type}>
                      {type.label}
                    </option>
                  )) || (
                    <option value="http">HTTP</option>
                  )}
                </select>
              </div>
            </div>

            {/* URL and Test */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL *
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    validationErrors.url ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="https://example.com"
                />
                <button
                  type="button"
                  onClick={handleTestUrl}
                  disabled={isTesting || !formData.url.trim()}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>
              {validationErrors.url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.url}</p>
              )}
              
              {testResult && (
                <div className={`mt-2 p-2 rounded-md text-sm ${
                  testResult.status 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${testResult.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{testResult.message}</span>
                    {testResult.responseTime && (
                      <span className="ml-2">({testResult.responseTime}ms)</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Monitoring Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check Interval (seconds) *
                </label>
                <input
                  type="number"
                  min="30"
                  value={formData.interval}
                  onChange={(e) => handleInputChange('interval', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.interval ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.interval && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.interval}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeout (seconds) *
                </label>
                <input
                  type="number"
                  min="5"
                  value={formData.timeout}
                  onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.timeout ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.timeout && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.timeout}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Retries *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.retries}
                  onChange={(e) => handleInputChange('retries', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.retries ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {validationErrors.retries && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.retries}</p>
                )}
              </div>
            </div>

            {/* Threshold Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Response Time Threshold (ms)
                </label>
                <input
                  type="number"
                  min="100"
                  value={formData.threshold?.responseTime}
                  onChange={(e) => handleInputChange('threshold', {
                    ...formData.threshold,
                    responseTime: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Status Code
                </label>
                <input
                  type="number"
                  min="100"
                  max="599"
                  value={formData.threshold?.statusCode}
                  onChange={(e) => handleInputChange('threshold', {
                    ...formData.threshold,
                    statusCode: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="production, critical, frontend"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (editMonitor ? 'Update Monitor' : 'Create Monitor')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
