import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { indexingApi } from '@/lib/indexingApi';
import { IndexingEntry, IndexingStats, QuotaInfo, DashboardData } from '@/types/indexing';

export const useIndexingBackend = () => {
  const [loading, setLoading] = useState(false);
  const [indexingEntries, setIndexingEntries] = useState<IndexingEntry[]>([]);
  const [statistics, setStatistics] = useState<IndexingStats | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);

  const loadDashboardData = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      console.log('Loading dashboard data for project:', projectId);
      
      const dashboardData = await indexingApi.getDashboardData(projectId);
      setIndexingEntries(dashboardData.recentEntries || []);
      setStatistics(dashboardData.statistics);
      setQuotaInfo(dashboardData.quotaInfo);
      
      console.log('Dashboard data loaded successfully:', dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load indexing data');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitUrls = useCallback(async (
    urls: string[], 
    projectId: string, 
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    setLoading(true);
    try {
      toast.loading('Submitting URLs for indexing...', { id: 'submit' });
      
      const response = await indexingApi.submitUrls(urls, projectId, priority);
      
      if (response.success) {
        toast.success(
          `Successfully submitted ${response.data?.successfulSubmissions || 0} URLs for indexing!`,
          { id: 'submit' }
        );
        
        // Update local state with new entries
        if (response.data?.entries) {
          setIndexingEntries(prev => [...response.data!.entries, ...prev]);
        }
        
        // Reload dashboard data to get updated stats
        await loadDashboardData(projectId);
        
        return response;
      } else {
        toast.error(response.message || 'Failed to submit URLs', { id: 'submit' });
        return response;
      }
    } catch (error) {
      console.error('Error submitting URLs:', error);
      toast.error('Failed to submit URLs for indexing', { id: 'submit' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  const submitUrlsFromFile = useCallback(async (
    file: File, 
    projectId: string, 
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    setLoading(true);
    try {
      toast.loading('Processing file and submitting URLs...', { id: 'file-submit' });
      
      const response = await indexingApi.submitUrlsFromFile(file, projectId, priority);
      
      if (response.success) {
        toast.success(
          `Successfully processed file and submitted ${response.data?.successfulSubmissions || 0} URLs!`,
          { id: 'file-submit' }
        );
        
        // Update local state with new entries
        if (response.data?.entries) {
          setIndexingEntries(prev => [...response.data!.entries, ...prev]);
        }
        
        // Reload dashboard data to get updated stats
        await loadDashboardData(projectId);
        
        return response;
      } else {
        toast.error(response.message || 'Failed to process file', { id: 'file-submit' });
        return response;
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file', { id: 'file-submit' });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  const updateStatus = useCallback(async (entryId: string, status: string, errorMessage?: string) => {
    try {
      await indexingApi.updateStatus(entryId, status, errorMessage);
      
      // Update local state
      setIndexingEntries(prev => 
        prev.map(entry => 
          entry.id === entryId 
            ? { ...entry, status: status as any, errorMessage, lastChecked: new Date().toISOString() }
            : entry
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }, []);

  const retryEntry = useCallback(async (entry: IndexingEntry) => {
    try {
      await submitUrls([entry.url], entry.projectId, entry.priority);
      toast.success('URL resubmitted for indexing');
    } catch (error) {
      toast.error('Failed to resubmit URL');
    }
  }, [submitUrls]);

  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      await indexingApi.deleteEntry(entryId);
      setIndexingEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  }, []);

  const refreshData = useCallback(async (projectId: string) => {
    await loadDashboardData(projectId);
  }, [loadDashboardData]);

  return {
    loading,
    indexingEntries,
    statistics,
    quotaInfo,
    submitUrls,
    submitUrlsFromFile,
    updateStatus,
    retryEntry,
    deleteEntry,
    loadDashboardData,
    refreshData,
  };
}; 