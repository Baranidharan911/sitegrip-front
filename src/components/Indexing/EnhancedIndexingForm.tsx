'use client';

import { useState, useRef } from 'react';
import { Upload, Globe, Zap, Settings, FileText, Plus, Trash2, AlertCircle } from 'lucide-react';
import { QuotaInfo } from '@/types/indexing';

interface EnhancedIndexingFormProps {
  onSubmitUrls: (urls: string[], priority: 'low' | 'medium' | 'high') => Promise<void>;
  onSubmitFile: (file: File, priority: 'low' | 'medium' | 'high') => Promise<void>;
  loading: boolean;
  quotaInfo: QuotaInfo | null;
}

export default function EnhancedIndexingForm({
  onSubmitUrls,
  onSubmitFile,
  loading,
  quotaInfo,
}: EnhancedIndexingFormProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'file'>('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState(['']);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmitSingle = async () => {
    setErrors([]);
    
    if (!singleUrl.trim()) {
      setErrors(['Please enter a URL']);
      return;
    }

    if (!validateUrl(singleUrl)) {
      setErrors(['Please enter a valid URL']);
      return;
    }

    if (quotaInfo && quotaInfo.dailyUsed >= quotaInfo.dailyLimit) {
      setErrors(['Daily quota limit reached']);
      return;
    }

    try {
      await onSubmitUrls([singleUrl], priority);
      setSingleUrl('');
    } catch (error) {
      setErrors(['Failed to submit URL']);
    }
  };

  const handleSubmitBulk = async () => {
    setErrors([]);
    
    const validUrls = bulkUrls.filter(url => url.trim() && validateUrl(url.trim()));
    const invalidUrls = bulkUrls.filter(url => url.trim() && !validateUrl(url.trim()));

    if (validUrls.length === 0) {
      setErrors(['Please enter at least one valid URL']);
      return;
    }

    if (invalidUrls.length > 0) {
      setErrors([`${invalidUrls.length} invalid URLs found`]);
      return;
    }

    if (quotaInfo && (quotaInfo.dailyUsed + validUrls.length) > quotaInfo.dailyLimit) {
      setErrors([`Not enough quota remaining. Need ${validUrls.length} but only ${quotaInfo.dailyRemaining} available`]);
      return;
    }

    try {
      await onSubmitUrls(validUrls, priority);
      setBulkUrls(['']);
    } catch (error) {
      setErrors(['Failed to submit URLs']);
    }
  };

  const handleFileSubmit = async () => {
    setErrors([]);
    
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrors(['Please select a file']);
      return;
    }

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      setErrors(['Please select a .txt or .csv file']);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(['File size must be less than 5MB']);
      return;
    }

    try {
      await onSubmitFile(file, priority);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setErrors(['Failed to process file']);
    }
  };

  const addBulkUrl = () => {
    setBulkUrls([...bulkUrls, '']);
  };

  const removeBulkUrl = (index: number) => {
    if (bulkUrls.length > 1) {
      setBulkUrls(bulkUrls.filter((_, i) => i !== index));
    }
  };

  const updateBulkUrl = (index: number, value: string) => {
    const newUrls = [...bulkUrls];
    newUrls[index] = value;
    setBulkUrls(newUrls);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getQuotaWarning = () => {
    if (!quotaInfo) return null;
    
    const dailyPercentage = (quotaInfo.dailyUsed / quotaInfo.dailyLimit) * 100;
    
    if (dailyPercentage >= 90) {
      return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Daily quota almost exhausted ({quotaInfo.dailyRemaining} remaining)</span>
        </div>
      );
    }
    
    if (dailyPercentage >= 75) {
      return (
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Daily quota running low ({quotaInfo.dailyRemaining} remaining)</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Submit URLs for Indexing
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Submit individual URLs, bulk URLs, or upload a file containing URLs to be indexed by search engines.
        </p>
      </div>

      {/* Quota Warning */}
      {getQuotaWarning() && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
          {getQuotaWarning()}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        {[
          { id: 'single', label: 'Single URL', icon: Globe },
          { id: 'bulk', label: 'Bulk URLs', icon: Zap },
          { id: 'file', label: 'File Upload', icon: Upload },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Priority Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Settings className="w-4 h-4 inline mr-2" />
          Priority Level
        </label>
        <div className="flex space-x-3">
          {['low', 'medium', 'high'].map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                priority === p
                  ? getPriorityColor(p)
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Error</span>
          </div>
          <ul className="mt-1 text-sm text-red-700 dark:text-red-300">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'single' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL to Index
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                disabled={loading}
              />
              <button
                onClick={handleSubmitSingle}
                disabled={loading || !singleUrl.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URLs to Index
            </label>
            <div className="space-y-2 mb-4">
              {bulkUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateBulkUrl(index, e.target.value)}
                    placeholder={`https://example.com/page-${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={loading}
                  />
                  {bulkUrls.length > 1 && (
                    <button
                      onClick={() => removeBulkUrl(index)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={addBulkUrl}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 border border-purple-300 dark:border-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                Add URL
              </button>
              <button
                onClick={handleSubmitBulk}
                disabled={loading || bulkUrls.every(url => !url.trim())}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Submitting...' : `Submit ${bulkUrls.filter(url => url.trim()).length} URLs`}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload File (.txt or .csv)
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      TXT or CSV files (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.csv"
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <strong>File Format:</strong> One URL per line. Lines starting with # are ignored.
                <br />
                <strong>Example:</strong>
                <br />
                # My website pages
                <br />
                https://example.com/page1
                <br />
                https://example.com/page2
              </div>
              <button
                onClick={handleFileSubmit}
                disabled={loading}
                className="w-full px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Processing...' : 'Process File'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 