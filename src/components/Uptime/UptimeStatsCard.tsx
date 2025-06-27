'use client';

import React from 'react';
import { Monitor } from '../../types/uptime';

interface UptimeStatsCardProps {
  monitor: Monitor;
  onClick: () => void;
}

const StatusIcon = ({ status }: { status?: 'up' | 'down' }) => {
  if (status === 'up') {
    return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>;
  }
  if (status === 'down') {
    return <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>;
  }
  return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
};

const SSLStatusBadge = ({ sslStatus, daysUntilExpiry }: { 
  sslStatus?: string; 
  daysUntilExpiry?: number;
}) => {
  if (!sslStatus) return null;
  
  const getSSLBadgeColor = () => {
    switch (sslStatus) {
      case 'valid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired':
      case 'invalid':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSSLBadgeColor()}`}>
      🔒 {sslStatus === 'expiring_soon' && daysUntilExpiry ? `${daysUntilExpiry}d` : sslStatus}
    </span>
  );
};

const UptimeStatsCard: React.FC<UptimeStatsCardProps> = ({ monitor, onClick }) => {
  const formatLastChecked = (lastChecked?: string) => {
    if (!lastChecked) return 'Never';
    const date = new Date(lastChecked);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-600 dark:text-green-400';
    if (uptime >= 95) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getResponseTimeColor = (responseTime?: number) => {
    if (!responseTime) return 'text-gray-500';
    if (responseTime < 500) return 'text-green-600 dark:text-green-400';
    if (responseTime < 1000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <StatusIcon status={monitor.last_status} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {monitor.name || 'Unnamed Monitor'}
            </h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {monitor.url}
          </p>
        </div>
      </div>

      {/* Status and SSL Badges */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          monitor.last_status === 'up' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : monitor.last_status === 'down'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {monitor.last_status?.toUpperCase() || 'UNKNOWN'}
        </span>
        
        {monitor.url.startsWith('https://') && (
          <SSLStatusBadge 
            sslStatus={monitor.ssl_status}
            daysUntilExpiry={monitor.ssl_cert_days_until_expiry}
          />
        )}
        
        {monitor.failures_in_a_row > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            {monitor.failures_in_a_row} failures
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">24h Uptime</p>
          <p className={`text-lg font-semibold ${getUptimeColor(monitor.uptime_stats['24h'])}`}>
            {monitor.uptime_stats['24h'].toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Response Time</p>
          <p className={`text-lg font-semibold ${getResponseTimeColor(monitor.last_response_time)}`}>
            {monitor.last_response_time ? `${monitor.last_response_time}ms` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">7d Uptime</p>
          <p className={`font-medium ${getUptimeColor(monitor.uptime_stats['7d'])}`}>
            {monitor.uptime_stats['7d'].toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">30d Uptime</p>
          <p className={`font-medium ${getUptimeColor(monitor.uptime_stats['30d'])}`}>
            {monitor.uptime_stats['30d'].toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Check every {monitor.frequency}min
        </span>
        <span>
          {formatLastChecked(monitor.last_checked)}
        </span>
      </div>

      {/* SSL Certificate Info (if HTTPS) */}
      {monitor.url.startsWith('https://') && monitor.ssl_cert_expires_at && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">SSL Certificate</span>
            <span className={`font-medium ${
              monitor.ssl_cert_days_until_expiry && monitor.ssl_cert_days_until_expiry < 30
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {monitor.ssl_cert_days_until_expiry && monitor.ssl_cert_days_until_expiry > 0
                ? `Expires in ${monitor.ssl_cert_days_until_expiry} days`
                : monitor.ssl_status === 'expired'
                ? 'Expired'
                : 'Valid'
              }
            </span>
          </div>
          {monitor.ssl_cert_issuer && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-500 dark:text-gray-400">Issuer</span>
              <span className="text-gray-700 dark:text-gray-300 truncate max-w-32">
                {monitor.ssl_cert_issuer}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UptimeStatsCard;
