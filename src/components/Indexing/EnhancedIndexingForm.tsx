'use client';

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { validateUrl } from '@/lib/indexingApi';

interface EnhancedIndexingFormProps {
  onSubmit: (urls: string[], priority: string) => Promise<void>;
  onFileSubmit: (file: File, priority: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function EnhancedIndexingForm({
  onSubmit,
  onFileSubmit,
  isSubmitting,
}: EnhancedIndexingFormProps) {
  const [urlInput, setUrlInput] = useState('');
  const [priority, setPriority] = useState('medium');
  const [bulkUrls, setBulkUrls] = useState('');
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'file'>('single');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    
    if (!url) {
      toast.error('Please enter a valid URL.');
      return;
    }

    if (!validateUrl(url)) {
      toast.error('Please enter a valid URL format (e.g., https://example.com)');
      return;
    }

    try {
      await onSubmit([url], priority);
      setUrlInput('');
    } catch (error) {
      // Error handled by onSubmit
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = bulkUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && validateUrl(url));

    if (urls.length === 0) {
      toast.error('Please enter at least one valid URL.');
      return;
    }

    if (urls.length > 100) {
      toast.error('Maximum 100 URLs allowed per submission.');
      return;
    }

    try {
      await onSubmit(urls, priority);
      setBulkUrls('');
    } catch (error) {
      // Error handled by onSubmit
    }
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    
    if (!file) {
      toast.error('Please select a file.');
      return;
    }

    if (!file.name.endsWith('.txt')) {
      toast.error('Please select a .txt file.');
      return;
    }

    try {
      await onFileSubmit(file, priority);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error handled by onFileSubmit
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !file.name.endsWith('.txt')) {
      toast.error('Please select a .txt file.');
      e.target.value = '';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'single'
              ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Single URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'bulk'
              ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Bulk URLs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'file'
              ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          File Upload
        </button>
      </div>

      {/* Priority Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Priority Level
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isSubmitting}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="critical">Critical Priority</option>
        </select>
      </div>

      {/* Single URL Form */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL to Index
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Index URL'}
          </button>
        </form>
      )}

      {/* Bulk URLs Form */}
      {activeTab === 'bulk' && (
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URLs (one per line, max 100)
            </label>
            <textarea
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-vertical"
              required
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {bulkUrls.split('\n').filter(url => url.trim()).length} URLs detected
            </p>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Index All URLs'}
          </button>
        </form>
      )}

      {/* File Upload Form */}
      {activeTab === 'file' && (
        <form onSubmit={handleFileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Text File (.txt)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                disabled={isSubmitting}
              >
                Choose File
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Upload a .txt file with one URL per line (max 500 URLs)
              </p>
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Upload and Index'}
          </button>
        </form>
      )}
    </div>
  );
} 