'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Pause, 
  Wrench, 
  MoreHorizontal,
  Play,
  Edit3,
  Trash2,
  ExternalLink,
  Clock,
  Gauge,
  Activity,
  AlertCircle,
  Eye,
  Copy,
  RefreshCw,
  Globe,
  Server,
  Search,
  Lock,
  FileText,
  Database,
  Monitor
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Monitor {
  id: string;
  name: string;
  url: string;
  type: 'http' | 'ping' | 'tcp' | 'dns' | 'ssl' | 'keyword' | 'port';
  status: 'up' | 'down' | 'paused' | 'maintenance' | 'unknown';
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  interval: number;
  timeout: number;
  retries: number;
  tags?: string[];
  notifications: boolean;
  description?: string;
  region: string;
  incidents?: number;
  createdAt: Date;
  sslInfo?: {
    valid: boolean;
    daysUntilExpiry: number;
    issuer: string;
  };
}

interface MonitorCardProps {
  monitor: Monitor;
  onEdit: (monitor: Monitor) => void;
  onDelete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCheck: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'up':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'down':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'paused':
      return <Pause className="w-5 h-5 text-yellow-500" />;
    case 'maintenance':
      return <Wrench className="w-5 h-5 text-blue-500" />;
    default:
      return <Activity className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'up':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'down':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'paused':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'maintenance':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'http':
      return <Globe className="w-4 h-4" />;
    case 'ping':
      return <Activity className="w-4 h-4" />;
    case 'tcp':
      return <Server className="w-4 h-4" />;
    case 'dns':
      return <Search className="w-4 h-4" />;
    case 'ssl':
      return <Lock className="w-4 h-4" />;
    case 'keyword':
      return <FileText className="w-4 h-4" />;
    case 'port':
      return <Database className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

export const MonitorCard: React.FC<MonitorCardProps> = ({
  monitor,
  onEdit,
  onDelete,
  onPause,
  onResume,
  onCheck,
  selected = false,
  onSelect
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      await onCheck(monitor.id);
      toast.success('Check triggered successfully');
    } catch (error) {
      toast.error('Failed to trigger check');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(monitor.url);
    toast.success('URL copied to clipboard');
  };

  const formatResponseTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(1)}s`;
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatLastCheck = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
        selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Selection checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(monitor.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getStatusIcon(monitor.status)}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {monitor.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {getTypeIcon(monitor.type)}
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {monitor.type}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {monitor.region}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(monitor);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Monitor
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleCheck();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                    {isChecking ? 'Checking...' : 'Check Now'}
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleCopyUrl();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      window.open(monitor.url, '_blank');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Site
                  </button>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  {monitor.status === 'paused' ? (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onResume(monitor.id);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume Monitor
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onPause(monitor.id);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Monitor
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(monitor.id);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Monitor
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* URL */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
            {monitor.url}
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
            {monitor.status.toUpperCase()}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Response Time</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatResponseTime(monitor.responseTime)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Uptime</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatUptime(monitor.uptime)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Last check: {formatLastCheck(monitor.lastCheck)}</span>
          </div>
          {monitor.incidents && monitor.incidents > 0 && (
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">{monitor.incidents} incidents</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {monitor.tags && monitor.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {monitor.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
}; 