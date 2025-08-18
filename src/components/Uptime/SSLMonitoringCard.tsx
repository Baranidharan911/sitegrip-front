import React, { useState } from 'react';
import { Shield, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Monitor } from '@/types/uptime';

interface SSLMonitoringCardProps {
  monitor: Monitor;
  onRefreshSSL: (monitorId: string) => Promise<void>;
}

export const SSLMonitoringCard: React.FC<SSLMonitoringCardProps> = ({ monitor, onRefreshSSL }) => {
  const [refreshing, setRefreshing] = useState(false);

  const getSSLStatusColor = (status?: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'expiring_soon': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'invalid': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getSSLIcon = (status?: string) => {
    switch (status) {
      case 'valid': return <Shield className="h-4 w-4" />;
      case 'expiring_soon': return <Clock className="h-4 w-4" />;
      case 'expired':
      case 'invalid': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const handleRefreshSSL = async () => {
    setRefreshing(true);
    try {
      await onRefreshSSL(monitor.id);
    } finally {
      setRefreshing(false);
    }
  };

  const formatExpiryDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const getDaysUntilExpiry = (days?: number | null) => {
    if (days === null || days === undefined) return 'Unknown';
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  // Only show for HTTPS monitors
  if (!monitor.url.startsWith('https://')) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">SSL Certificate</h4>
        <button
          onClick={handleRefreshSSL}
          disabled={refreshing}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Refresh SSL status"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {/* SSL Status */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSSLStatusColor(monitor.ssl_status)}`}>
            {getSSLIcon(monitor.ssl_status)}
            <span className="ml-1">{monitor.ssl_status?.toUpperCase() || 'UNKNOWN'}</span>
          </span>
        </div>

        {/* Certificate Details */}
        <div className="text-sm space-y-1">
          {monitor.ssl_cert_issuer && (
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Issuer:</span> {monitor.ssl_cert_issuer}
            </div>
          )}
          
          {monitor.ssl_cert_expires_at && (
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Expires:</span> {formatExpiryDate(monitor.ssl_cert_expires_at)}
            </div>
          )}
          
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Days remaining:</span> {getDaysUntilExpiry(monitor.ssl_cert_days_until_expiry)}
          </div>
          
          {monitor.ssl_last_checked && (
            <div className="text-gray-500 dark:text-gray-500 text-xs">
              Last checked: {new Date(monitor.ssl_last_checked).toLocaleString()}
            </div>
          )}
        </div>

        {/* Warning for expiring certificates */}
        {monitor.ssl_status === 'expiring_soon' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-2">
            <div className="flex">
              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
              <div className="ml-2 text-sm text-yellow-700 dark:text-yellow-300">
                Certificate expires in {getDaysUntilExpiry(monitor.ssl_cert_days_until_expiry)}
              </div>
            </div>
          </div>
        )}

        {/* Error for expired/invalid certificates */}
        {(monitor.ssl_status === 'expired' || monitor.ssl_status === 'invalid') && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-2">
            <div className="flex">
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
              <div className="ml-2 text-sm text-red-700 dark:text-red-300">
                {monitor.ssl_status === 'expired' ? 'Certificate has expired' : 'Certificate is invalid'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};