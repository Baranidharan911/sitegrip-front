'use client';

import { useState, useEffect, useCallback } from 'react';
import { indexingApi, IndexingEntry, IndexingResponse, QuotaInfo, IndexingStats, DashboardData } from '@/lib/indexingApi';
import toast from 'react-hot-toast';

export const useIndexingBackend = () => {
  const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [indexingEntries, setIndexingEntries] = useState<IndexingEntry[]>([]);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [statistics, setStatistics] = useState<IndexingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [projectId, setProjectId] = useState<string>('default_project');

  // Generate a project ID for the current session
  useEffect(() => {
    const sessionProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setProjectId(sessionProjectId);
  }, []);

  // Load initial data
  useEffect(() => {
    if (projectId) {
      loadDashboardData();
    }
  }, [projectId]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const dashboardData = await indexingApi.getDashboardData(projectId);
      setIndexingEntries(dashboardData.recent_entries || []);
      setQuotaInfo(dashboardData.quota);
      setStatistics(dashboardData.statistics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load indexing data');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const submitUrls = useCallback(async (urls: string[], priority: string = 'medium') => {
    if (!urls.length) {
      toast.error('Please provide at least one URL');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Submitting URLs for indexing...', { id: 'submit' });

    try {
      const response: IndexingResponse = await indexingApi.submitUrls(urls, projectId, priority);
      
      toast.success(
        `Successfully submitted ${response.successful_submissions} URLs! ${response.failed_submissions > 0 ? `${response.failed_submissions} failed.` : ''}`,
        { id: 'submit' }
      );

      // Reload data to show new entries
      await loadDashboardData();

      return response;
    } catch (error) {
      console.error('Failed to submit URLs:', error);
      toast.error('Failed to submit URLs for indexing', { id: 'submit' });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, loadDashboardData]);

  const handleSubmit = useCallback(async (e: React.FormEvent, retryUrl?: string) => {
    e.preventDefault();
    const urls = retryUrl ? [retryUrl] : [urlInput.trim()];
    
    if (!urls[0]) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      await submitUrls(urls);
      if (!retryUrl) {
        setUrlInput('');
      }
    } catch (error) {
      // Error already handled in submitUrls
    }
  }, [urlInput, submitUrls]);

  const submitUrlsFromFile = useCallback(async (file: File, priority: string = 'medium') => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!file.name.endsWith('.txt')) {
      toast.error('Please select a .txt file');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Processing file and submitting URLs...', { id: 'file-submit' });

    try {
      const response: IndexingResponse = await indexingApi.submitUrlsFromFile(file, projectId, priority);
      
      toast.success(
        `Successfully submitted ${response.successful_submissions} URLs from file! ${response.failed_submissions > 0 ? `${response.failed_submissions} failed.` : ''}`,
        { id: 'file-submit' }
      );

      // Reload data to show new entries
      await loadDashboardData();

      return response;
    } catch (error) {
      console.error('Failed to submit URLs from file:', error);
      toast.error('Failed to process file and submit URLs', { id: 'file-submit' });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, loadDashboardData]);

  const updateEntryStatus = useCallback(async (entryId: string, status: string, errorMessage?: string) => {
    try {
      await indexingApi.updateStatus(entryId, status, errorMessage);
      toast.success('Status updated successfully');
      
      // Reload data to reflect changes
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  }, [loadDashboardData]);

  const retryEntry = useCallback(async (entry: IndexingEntry) => {
    try {
      await submitUrls([entry.url], entry.priority);
      toast.success('URL resubmitted for indexing');
    } catch (error) {
      // Error already handled in submitUrls
    }
  }, [submitUrls]);

  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    // State
    urlInput,
    setUrlInput,
    isSubmitting,
    isLoading,
    indexingEntries,
    quotaInfo,
    statistics,
    projectId,

    // Actions
    handleSubmit,
    submitUrls,
    submitUrlsFromFile,
    updateEntryStatus,
    retryEntry,
    refreshData,
    loadDashboardData,
  };
}; 