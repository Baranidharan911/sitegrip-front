'use client';

import { useState, useMemo } from 'react';
import { 
  RefreshCw, 
  ExternalLink, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Globe,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react';
import { IndexingEntry } from '@/types/indexing';

interface EnhancedIndexingTableProps {
  entries: IndexingEntry[];
  loading: boolean;
  onRetry: (entry: IndexingEntry) => Promise<void>;
  onDelete: (entry: IndexingEntry) => Promise<void>;
  onRefresh: () => void;
  onCheckStatus: (entries: IndexingEntry[]) => Promise<void>;
}

export default function EnhancedIndexingTable({
  entries,
  loading,
  onRetry,
  onDelete,
  onRefresh,
  onCheckStatus,
}: EnhancedIndexingTableProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'success' | 'failed' | 'retrying' | 'quota_exceeded' | 'indexed' | 'error' | 'queued'>('all');
  const [sortBy, setSortBy] = useState<'submittedAt' | 'status' | 'url'>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Helper function to get the submitted date with proper field mapping
  const getSubmittedDate = (entry: IndexingEntry): string => {
    const dateValue = entry.created_at || entry.submitted_at || entry.submittedAt;
    
    // Handle various date formats
    if (!dateValue) return new Date().toISOString();
    
    if (typeof dateValue === 'string') {
      // Check if it's already a valid ISO string
      if (dateValue.includes('T') || dateValue.includes('Z')) {
        return dateValue;
      }
      // Try to parse it as a date
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    }
    
    if (typeof dateValue === 'object' && dateValue !== null) {
      // Handle Firestore timestamp objects with proper type assertion
      const timestampObj = dateValue as any;
      if ('toDate' in timestampObj && typeof timestampObj.toDate === 'function') {
        return timestampObj.toDate().toISOString();
      }
      if ('seconds' in timestampObj) {
        return new Date(timestampObj.seconds * 1000).toISOString();
      }
    }
    
    return new Date().toISOString();
  };

  // Helper function to get the last checked date with proper field mapping
  const getLastCheckedDate = (entry: IndexingEntry): string | null => {
    const dateValue = entry.status_checked_at || entry.completed_at || entry.lastChecked;
    
    if (!dateValue) return null;
    
    if (typeof dateValue === 'string') {
      if (dateValue.includes('T') || dateValue.includes('Z')) {
        return dateValue;
      }
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }
    
    if (typeof dateValue === 'object' && dateValue !== null) {
      // Handle Firestore timestamp objects with proper type assertion
      const timestampObj = dateValue as any;
      if ('toDate' in timestampObj && typeof timestampObj.toDate === 'function') {
        return timestampObj.toDate().toISOString();
      }
      if ('seconds' in timestampObj) {
        return new Date(timestampObj.seconds * 1000).toISOString();
      }
    }
    
    return null;
  };

  // Helper function to get error message with proper field mapping
  const getErrorMessage = (entry: IndexingEntry): string | null => {
    return entry.error_message || (entry as any).errorMessage || null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'submitted':
        return <Zap className="w-4 h-4" />;
      case 'success':
      case 'indexed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'retrying':
        return <RotateCcw className="w-4 h-4" />;
      case 'quota_exceeded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'queued':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800`;
      case 'submitted':
        return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800`;
      case 'success':
        return `${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800`;
      case 'failed':
        return `${baseClasses} bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800`;
      case 'retrying':
        return `${baseClasses} bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800`;
      case 'quota_exceeded':
        return `${baseClasses} bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800`;
      case 'indexed':
        return `${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800`;
      case 'queued':
        return `${baseClasses} bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800`;
      case 'error':
        return `${baseClasses} bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string | undefined | null) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium';
    const safePriority = priority || 'medium';
    switch (safePriority) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300`;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }
      
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter(entry => entry.status === filter);
  }, [entries, filter]);

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'submittedAt':
          aValue = new Date(getSubmittedDate(a)).getTime();
          bValue = new Date(getSubmittedDate(b)).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'url':
          aValue = a.url;
          bValue = b.url;
          break;
        default:
          aValue = getSubmittedDate(a);
          bValue = getSubmittedDate(b);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredEntries, sortBy, sortOrder]);

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: entries.length };
    entries.forEach(entry => {
      counts[entry.status] = (counts[entry.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Handle checking status for a single entry
  const handleCheckSingle = async (entry: IndexingEntry) => {
    setCheckingIds(prev => new Set(prev).add(entry.id));
    try {
      await onCheckStatus([entry]);
    } finally {
      setCheckingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(entry.id);
        return newSet;
      });
    }
  };

  // Handle checking status for all submitted entries
  const handleCheckAll = async () => {
    const submittedEntries = entries.filter(entry => 
      entry.status === 'submitted' && !entry.indexing_status
    );
    
    if (submittedEntries.length === 0) return;

    setCheckingStatus(true);
    try {
      await onCheckStatus(submittedEntries);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Get entries that can be checked (submitted but not yet checked for indexing status)
  const checkableEntries = entries.filter(entry => 
    entry.status === 'submitted' && !entry.indexing_status
  );

  const toggleCardExpansion = (entryId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-600" />
              Recent Indexing Requests
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {entries.length} total entries • {checkableEntries.length} ready to check
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Table
              </button>
            </div>

            {checkableEntries.length > 0 && (
              <button
                onClick={handleCheckAll}
                disabled={checkingStatus || loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <Search className={`w-4 h-4 ${checkingStatus ? 'animate-spin' : ''}`} />
                Check All ({checkableEntries.length})
              </button>
            )}
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            <div className="flex gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    filter === status
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="submittedAt-desc">Newest First</option>
              <option value="submittedAt-asc">Oldest First</option>
              <option value="status-asc">Status A-Z</option>
              <option value="status-desc">Status Z-A</option>
              <option value="url-asc">URL A-Z</option>
              <option value="url-desc">URL Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No entries found
            </h4>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {filter === 'all' 
                ? 'Submit some URLs to get started with indexing and track their status in real-time.'
                : `No entries with status "${filter}" found. Try changing the filter or submitting new URLs.`
              }
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          // Cards View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className={getPriorityBadge(entry.priority || 'medium')}>
                          {entry.priority ? (entry.priority.charAt(0).toUpperCase() + entry.priority.slice(1)) : 'Medium'}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {entry.url}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {entry.domain}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleCardExpansion(entry.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {expandedCards.has(entry.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Status Display */}
                  <div className="space-y-2">
                    {entry.indexing_status === 'indexed' ? (
                      <span className={getStatusBadge('success')}>
                        {getStatusIcon('success')}
                        Successfully Indexed
                      </span>
                    ) : (
                      <>
                        <span className={getStatusBadge(entry.status)}>
                          {getStatusIcon(entry.status)}
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                        {entry.indexing_status === 'not_indexed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            Not Indexed
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {getErrorMessage(entry) && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-700 dark:text-red-300">
                          {getErrorMessage(entry)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Body - Expanded Content */}
                {expandedCards.has(entry.id) && (
                  <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
                            Submitted
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatDate(getSubmittedDate(entry))}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {formatRelativeTime(getSubmittedDate(entry))}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
                            Last Checked
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {getLastCheckedDate(entry) ? formatDate(getLastCheckedDate(entry)!) : 'Never'}
                          </p>
                          {getLastCheckedDate(entry) && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                              {formatRelativeTime(getLastCheckedDate(entry)!)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Google Indexing Details */}
                      {entry.indexing_status && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                            Google Indexing Details
                          </h5>
                          <div className="space-y-2">
                            {entry.coverage_state && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Coverage:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {entry.coverage_state}
                                </span>
                              </div>
                            )}
                            {entry.last_crawl_time && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Last Crawled:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(entry.last_crawl_time)}
                                </span>
                              </div>
                            )}
                            {entry.indexing_state && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Indexing State:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {entry.indexing_state}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Open URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      
                      {(entry.status === 'error' || entry.status === 'failed' || entry.status === 'pending') && (
                        <button
                          onClick={() => onRetry(entry)}
                          className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                          title="Retry"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      
                      {entry.status === 'submitted' && !entry.indexing_status && (
                        <button
                          onClick={() => handleCheckSingle(entry)}
                          disabled={checkingIds.has(entry.id)}
                          className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors"
                          title="Check Indexing Status"
                        >
                          <Eye className={`w-4 h-4 ${checkingIds.has(entry.id) ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onDelete(entry)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {sortedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {entry.url}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {entry.domain}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        {/* Primary Status */}
                          <div className="flex items-center">
                            <span className={getStatusBadge(entry.status)}>
                              {getStatusIcon(entry.status)}
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </span>
                          </div>
                        
                        {/* Real-time Indexing Status */}
                        {entry.indexing_status === 'indexed' && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                              <CheckCircle className="w-3 h-3" />
                              🚀 Successfully Indexed
                            </span>
                            {entry.coverage_state && (
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                {entry.coverage_state}
                              </div>
                            )}
                          </div>
                        )}
                        
                          {entry.indexing_status === 'not_indexed' && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                                <AlertTriangle className="w-3 h-3" />
                                Not Indexed
                              </span>
                            {entry.latest_gsc_status && (
                              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                {entry.latest_gsc_status}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {entry.indexing_status === 'pending' && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                              <Clock className="w-3 h-3" />
                              Pending Indexation
                            </span>
                            {entry.indexing_state && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {entry.indexing_state}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Show human-readable status if available */}
                        {entry.human_status && entry.indexing_status !== 'indexed' && entry.indexing_status !== 'not_indexed' && entry.indexing_status !== 'pending' && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800">
                              {entry.human_status}
                            </span>
                            </div>
                          )}
                        
                        {/* Show detailed Google info if available */}
                        {entry.detailed_info && entry.detailed_info.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {entry.detailed_info.slice(0, 2).map((info: string, index: number) => (
                              <div key={index} className="text-xs text-gray-500 dark:text-gray-400">
                                {info}
                              </div>
                            ))}
                          </div>
                      )}
                      </div>
                      
                      {getErrorMessage(entry) && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-2 max-w-xs truncate">
                          {getErrorMessage(entry)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getPriorityBadge(entry.priority || 'medium')}>
                        {entry.priority ? (entry.priority.charAt(0).toUpperCase() + entry.priority.slice(1)) : 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      <div>
                        <div className="font-medium">{formatDate(getSubmittedDate(entry))}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {formatRelativeTime(getSubmittedDate(entry))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {getLastCheckedDate(entry) ? (
                        <div>
                          <div className="font-medium">{formatDate(getLastCheckedDate(entry)!)}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {formatRelativeTime(getLastCheckedDate(entry)!)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        
                        {(entry.status === 'error' || entry.status === 'failed' || entry.status === 'pending') && (
                          <button
                            onClick={() => onRetry(entry)}
                            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                            title="Retry"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        
                        {entry.status === 'submitted' && !entry.indexing_status && (
                          <button
                            onClick={() => handleCheckSingle(entry)}
                            disabled={checkingIds.has(entry.id)}
                            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors"
                            title="Check Indexing Status"
                          >
                            <Eye className={`w-4 h-4 ${checkingIds.has(entry.id) ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onDelete(entry)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
