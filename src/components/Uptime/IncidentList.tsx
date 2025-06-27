'use client';

import React, { useState } from 'react';
import { Monitor } from '../../types/uptime';

interface IncidentListProps {
  monitors: Monitor[];
}

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const IncidentList: React.FC<IncidentListProps> = ({ monitors }) => {
  const [sortBy, setSortBy] = useState<'severity' | 'duration' | 'name'>('severity');
  const [filterType, setFilterType] = useState<'all' | 'down' | 'ssl' | 'degraded'>('all');

  // Create incidents from monitor data
  const incidents = monitors.map(monitor => {
    const getSeverity = () => {
      if (monitor.last_status === 'down') return 'critical';
      if (monitor.ssl_status === 'expired') return 'critical';
      if (monitor.failures_in_a_row >= 3) return 'high';
      if (monitor.ssl_status === 'expiring_soon') return 'medium';
      if (monitor.failures_in_a_row > 0) return 'low';
      return 'info';
    };

    const getIncidentType = () => {
      if (monitor.last_status === 'down') return 'down';
      if (monitor.ssl_status === 'expired' || monitor.ssl_status === 'invalid') return 'ssl';
      if (monitor.ssl_status === 'expiring_soon') return 'ssl';
      if (monitor.failures_in_a_row > 0) return 'degraded';
      return 'info';
    };

    const getDescription = () => {
      if (monitor.last_status === 'down') {
        return `Service is currently offline. Failed ${monitor.failures_in_a_row} consecutive checks.`;
      }
      if (monitor.ssl_status === 'expired') {
        return 'SSL certificate has expired and needs immediate renewal.';
      }
      if (monitor.ssl_status === 'expiring_soon') {
        return `SSL certificate expires in ${monitor.ssl_cert_days_until_expiry} days.`;
      }
      if (monitor.ssl_status === 'invalid') {
        return 'SSL certificate is invalid or has hostname mismatch.';
      }
      if (monitor.failures_in_a_row > 0) {
        return `Service experiencing intermittent issues. ${monitor.failures_in_a_row} recent failures.`;
      }
      return 'No current issues detected.';
    };

    const getDuration = () => {
      if (!monitor.last_checked) return 'Unknown';
      const lastCheck = new Date(monitor.last_checked);
      const now = new Date();
      const diffMs = now.getTime() - lastCheck.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) return `${diffMins}m`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
      return `${Math.floor(diffMins / 1440)}d`;
    };

    return {
      id: monitor.id,
      monitor,
      severity: getSeverity(),
      type: getIncidentType(),
      description: getDescription(),
      duration: getDuration(),
      isActive: monitor.last_status === 'down' || monitor.failures_in_a_row > 0 || 
                monitor.ssl_status === 'expired' || monitor.ssl_status === 'expiring_soon'
    };
  }).filter(incident => incident.isActive);

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    if (filterType === 'all') return true;
    return incident.type === filterType;
  });

  // Sort incidents
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'info': 4 };
        return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
      case 'duration':
        return a.duration.localeCompare(b.duration);
      case 'name':
        return (a.monitor.name || a.monitor.url).localeCompare(b.monitor.name || b.monitor.url);
      default:
        return 0;
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'down': return <AlertIcon />;
      case 'ssl': return <div className="w-5 h-5 flex items-center justify-center">🔒</div>;
      case 'degraded': return <ClockIcon />;
      default: return <CheckIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'down': return 'text-red-600 dark:text-red-400';
      case 'ssl': return 'text-yellow-600 dark:text-yellow-400';
      case 'degraded': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Active Incidents
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {sortedIncidents.length} active incident{sortedIncidents.length !== 1 ? 's' : ''} requiring attention
          </p>
        </div>
        
        <div className="flex gap-4">
          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="down">Service Down</option>
              <option value="ssl">SSL Issues</option>
              <option value="degraded">Degraded Performance</option>
            </select>
          </div>
          
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="severity">Severity</option>
              <option value="duration">Duration</option>
              <option value="name">Monitor Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      {sortedIncidents.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckIcon />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No Active Incidents
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All services are operating normally.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${getTypeColor(incident.type)}`}>
                    {getTypeIcon(incident.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {incident.monitor.name || 'Unnamed Monitor'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon />
                        <span className="ml-1">{incident.duration}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {incident.monitor.url}
                      </span>
                      <a
                        href={incident.monitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <ExternalLinkIcon />
                      </a>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {incident.description}
                    </p>
                    
                    {/* Additional Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <span className={`ml-2 ${
                          incident.monitor.last_status === 'up' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {incident.monitor.last_status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Check Frequency:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                          {incident.monitor.frequency}min
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Failures:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-300">
                          {incident.monitor.failures_in_a_row}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">24h Uptime:</span>
                        <span className={`ml-2 ${
                          incident.monitor.uptime_stats['24h'] >= 99 
                            ? 'text-green-600 dark:text-green-400' 
                            : incident.monitor.uptime_stats['24h'] >= 95
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {incident.monitor.uptime_stats['24h'].toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* SSL Specific Details */}
                    {incident.type === 'ssl' && incident.monitor.ssl_cert_days_until_expiry && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                        <div className="flex items-center">
                          <div className="w-4 h-4 mr-2">🔒</div>
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            SSL Certificate Information
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <span className="font-medium">Expires:</span>{' '}
                              {incident.monitor.ssl_cert_expires_at 
                                ? new Date(incident.monitor.ssl_cert_expires_at).toLocaleDateString()
                                : 'Unknown'
                              }
                            </div>
                            <div>
                              <span className="font-medium">Days remaining:</span>{' '}
                              {incident.monitor.ssl_cert_days_until_expiry}
                            </div>
                            <div>
                              <span className="font-medium">Issuer:</span>{' '}
                              {incident.monitor.ssl_cert_issuer || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex-shrink-0 ml-4">
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                    onClick={() => {
                      // This would typically open the monitor details modal
                      console.log('View details for monitor:', incident.monitor.id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {sortedIncidents.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {sortedIncidents.filter(i => i.severity === 'critical').length}
            </div>
            <div className="text-sm text-red-800 dark:text-red-300">Critical</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {sortedIncidents.filter(i => i.severity === 'high').length}
            </div>
            <div className="text-sm text-orange-800 dark:text-orange-300">High</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {sortedIncidents.filter(i => i.severity === 'medium').length}
            </div>
            <div className="text-sm text-yellow-800 dark:text-yellow-300">Medium</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {sortedIncidents.filter(i => i.severity === 'low').length}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Low</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentList;
