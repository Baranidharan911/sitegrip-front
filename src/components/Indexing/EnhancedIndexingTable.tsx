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
  Zap
} from 'lucide-react';
import { IndexingEntry } from '@/types/indexing';

interface EnhancedIndexingTableProps {
  entries: IndexingEntry[];
  loading: boolean;
  onRetry: (entry: IndexingEntry) => Promise<void>;
  onDelete: (entry: IndexingEntry) => Promise<void>;
  onRefresh: () => void;
}

export default function EnhancedIndexingTable({
  entries,
  loading,
  onRetry,
  onDelete,
  onRefresh,
}: EnhancedIndexingTableProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'success' | 'failed' | 'retrying' | 'quota_exceeded' | 'indexed' | 'error'>('all');
  const [sortBy, setSortBy] = useState<'submittedAt' | 'status' | 'url'>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper function to get the submitted date with proper field mapping
  const getSubmittedDate = (entry: IndexingEntry): string => {
    return entry.created_at || entry.submitted_at || entry.submittedAt || new Date().toISOString();
  };

  // Helper function to get the last checked date with proper field mapping
  const getLastCheckedDate = (entry: IndexingEntry): string | null => {
    return entry.completed_at || entry.lastChecked || null;
  };

  // Helper function to get error message with proper field mapping
  const getErrorMessage = (entry: IndexingEntry): string | null => {
    return entry.error_message || (entry as any).errorMessage || null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'submitted':
        return <Zap className="w-3 h-3" />;
      case 'success':
      case 'indexed':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-3 h-3" />;
      case 'retrying':
        return <RotateCcw className="w-3 h-3" />;
      case 'quota_exceeded':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300`;
      case 'submitted':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300`;
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300`;
      case 'retrying':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300`;
      case 'quota_exceeded':
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300`;
      // Legacy status support
      case 'indexed':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300`;
    }
  };

  const getPriorityBadge = (priority: string | undefined | null) => {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    const safePriority = priority || 'medium';
    switch (safePriority) {
      case 'critical':
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300`;
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300`;
      case 'low':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    } catch {
      return 'Invalid date';
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Indexing Requests
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {entries.length} total entries
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            <div className="flex gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === status
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
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
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

      {/* Table */}
      <div className="overflow-x-auto">
        {sortedEntries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No entries found
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'Submit some URLs to get started with indexing.'
                : `No entries with status "${filter}" found.`
              }
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-gray-500" />
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
                    <div className="flex items-center">
                      <span className={getStatusBadge(entry.status)}>
                        {getStatusIcon(entry.status)}
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </div>
                    {getErrorMessage(entry) && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs truncate">
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
                    {formatDate(getSubmittedDate(entry))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {getLastCheckedDate(entry) ? formatDate(getLastCheckedDate(entry)!) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        title="Open URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      
                      {(entry.status === 'error' || entry.status === 'failed' || entry.status === 'pending') && (
                        <button
                          onClick={() => onRetry(entry)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Retry"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onDelete(entry)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
        )}
      </div>
    </div>
  );
} 