'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Globe, FileText, Search } from 'lucide-react';
import { QuotaInfo, AuthState, GSCProperty } from '@/types/indexing';
import { indexingApi } from '@/lib/indexingApi';

interface EnhancedIndexingFormProps {
  onSubmitUrls: (urls: string[], priority: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  onSubmitWebsite: (websiteUrl: string, priority: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  onSubmitFile: (file: File, priority: 'low' | 'medium' | 'high' | 'critical') => Promise<void>;
  onDiscoverFromGSC: (propertyUrl: string, options: { maxPages: number; includeExcluded: boolean; includeErrors: boolean }) => Promise<void>;
  loading: boolean;
  quotaInfo: QuotaInfo | null;
  authState?: AuthState;
}

export default function EnhancedIndexingForm({
  onSubmitUrls,
  onSubmitWebsite,
  onSubmitFile,
  onDiscoverFromGSC,
  loading,
  quotaInfo,
  authState
}: EnhancedIndexingFormProps) {
  const [activeTab, setActiveTab] = useState<'urls' | 'website' | 'file' | 'gsc'>('urls');
  const [urls, setUrls] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [file, setFile] = useState<File | null>(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [maxPages, setMaxPages] = useState(100);
  const [includeExcluded, setIncludeExcluded] = useState(false);
  const [includeErrors, setIncludeErrors] = useState(false);
  const [gscProperties, setGscProperties] = useState<GSCProperty[]>([]);
  const [gscLoading, setGscLoading] = useState(false);
  const [gscError, setGscError] = useState<string | null>(null);

  const isAuthenticated = authState?.isAuthenticated || false;

  useEffect(() => {
    const fetchGSCProperties = async () => {
      if (activeTab === 'gsc' && isAuthenticated) {
        setGscLoading(true);
        setGscError(null);
        try {
          const props = await indexingApi.getGSCProperties();
          setGscProperties(props);
          if (props.length > 0 && !selectedProperty) {
            setSelectedProperty(props[0].site_url);
          }
        } catch (error: any) {
          console.error("Failed to fetch GSC properties:", error);
          setGscError(error.message || 'Failed to load your Google Search Console properties. Please try reconnecting your account.');
          setGscProperties([]);
        } finally {
          setGscLoading(false);
        }
      }
    };

    fetchGSCProperties();
  }, [activeTab, isAuthenticated]);

  const handleSubmitUrls = async () => {
    if (!urls.trim()) return;
    
    const urlList = urls.split('\n')
      .map(url => url.trim())
      .filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));
    
    if (urlList.length === 0) {
      alert('Please enter valid URLs (must start with http:// or https://)');
      return;
    }

    await onSubmitUrls(urlList, priority);
    setUrls('');
  };

  const handleSubmitWebsite = async () => {
    if (!websiteUrl.trim()) return;
    
    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
      alert('Please enter a valid website URL (must start with http:// or https://)');
      return;
    }

      await onSubmitWebsite(websiteUrl, priority);
      setWebsiteUrl('');
  };

  const handleFileUpload = async () => {
    if (!file) return;
    
    await onSubmitFile(file, priority);
    setFile(null);
  };

  const handleGSCDiscovery = async () => {
    if (!selectedProperty) return;
    
    await onDiscoverFromGSC(selectedProperty, {
      maxPages,
      includeExcluded,
      includeErrors
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Upload className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Submit URLs for Indexing</h2>
      </div>

      {/* Priority Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Priority Level
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="critical">Critical Priority</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Higher priority URLs are processed first but may have quota limits
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-600 mb-6">
        {[
          { id: 'urls', label: 'Individual URLs', icon: FileText },
          { id: 'website', label: 'Website Discovery', icon: Globe },
          { id: 'file', label: 'File Upload', icon: Upload },
          { id: 'gsc', label: 'Search Console', icon: Search }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors disabled:opacity-50 ${
              activeTab === id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'urls' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URLs to Index (one per line)
            </label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              rows={6}
              />
              <button
              onClick={handleSubmitUrls}
              disabled={loading || !urls.trim()}
              className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit URLs'}
              </button>
          </div>
        )}

        {activeTab === 'website' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website URL
            </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We'll discover and index pages from this website
            </p>
              <button
                onClick={handleSubmitWebsite}
              disabled={loading || !websiteUrl.trim()}
              className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Discovering...' : 'Discover & Index'}
              </button>
          </div>
        )}

        {activeTab === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload URL File
            </label>
                  <input
              type="file"
              accept=".txt,.csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload a text file with URLs (one per line)
            </p>
                    <button
              onClick={handleFileUpload}
              disabled={loading || !file}
              className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Upload & Index'}
              </button>
          </div>
        )}

        {activeTab === 'gsc' && (
          <div>
            {!isAuthenticated ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Please connect your Google Search Console account to use this feature.
                </p>
              </div>
            ) : gscLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your properties...</p>
              </div>
            ) : gscError ? (
              <div className="text-center py-8 text-red-500">
                <p>{gscError}</p>
              </div>
            ) : gscProperties.length > 0 ? (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Console Property
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">Select a property</option>
                  {gscProperties.map((property) => (
                    <option key={property.site_url} value={property.site_url}>
                      {property.site_url} ({property.property_type})
                    </option>
                  ))}
                </select>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maximum Pages
                    </label>
                    <input
                      type="number"
                      value={maxPages}
                      onChange={(e) => setMaxPages(Number(e.target.value))}
                      min="1"
                      max="1000"
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="include-excluded"
                      type="checkbox"
                      checked={includeExcluded}
                      onChange={(e) => setIncludeExcluded(e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include-excluded" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Include excluded pages
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="include-errors"
                      type="checkbox"
                      checked={includeErrors}
                      onChange={(e) => setIncludeErrors(e.target.checked)}
                      disabled={loading}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include-errors" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Include pages with errors
                    </label>
                  </div>
                </div>
                
                <button
                  onClick={handleGSCDiscovery}
                  disabled={loading || !selectedProperty}
                  className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Discovering...' : 'Discover from Search Console'}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No Search Console properties found.
                </p>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Make sure you have verified properties in your Google Search Console account and have connected it on this page.
                </p>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
