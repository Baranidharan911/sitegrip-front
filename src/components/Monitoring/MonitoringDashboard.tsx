'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Globe, 
  MonitorSpeaker, 
  Plus, 
  RefreshCw,
  Settings,
  TrendingUp,
  Zap,
  Shield,
  Users,
  BarChart3,
  Search,
  Filter,
  Bell,
  Calendar,
  ExternalLink,
  Eye,
  Trash2,
  Edit3,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Server,
  Wifi,
  Database,
  Lock,
  Mail,
  MessageSquare,
  Target,
  Timer,
  Gauge,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Download,
  Upload,
  HelpCircle,
  Heart,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Chrome,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  AlertOctagon
} from 'lucide-react';

import { MonitorCard } from './MonitorCard';
import { MonitorForm } from './MonitorForm';
import { IncidentTimeline } from './IncidentTimeline';
import { StatusPage } from './StatusPage';
import { MonitorStats } from './MonitorStats';
import { NotificationCenter } from './NotificationCenter';
import { TeamManagement } from './TeamManagement';
import { PerformanceChart } from './PerformanceChart';
import { UptimeHeatmap } from './UptimeHeatmap';
import { AlertRules } from './AlertRules';
import { MaintenanceWindow } from './MaintenanceWindow';
import { useMonitoring } from '../../hooks/useMonitoring';

interface TabType {
  id: string;
  name: string;
  icon: React.ReactNode;
  count?: number;
  color?: string;
}

interface QuickAction {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  action: () => void;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  trend: number[];
}

export const MonitoringDashboard: React.FC = () => {
  const {
    monitors,
    incidents,
    stats,
    loading,
    error,
    refreshData,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    triggerCheck,
    resolveIncident,
    pauseMonitor,
    resumeMonitor
  } = useMonitoring();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAddMonitor, setShowAddMonitor] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'up' | 'down' | 'paused' | 'maintenance'>('all');
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh every 30 seconds - only when monitors exist
  useEffect(() => {
    if (monitors.length === 0) {
      return; // Don't start auto-refresh if no monitors
    }

    const interval = setInterval(async () => {
      await refreshData();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData, monitors.length]);

  const tabs: TabType[] = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: <BarChart3 size={16} />,
      color: 'blue'
    },
    { 
      id: 'monitors', 
      name: 'Monitors', 
      icon: <MonitorSpeaker size={16} />, 
      count: monitors?.length || 0,
      color: 'green'
    },
    { 
      id: 'incidents', 
      name: 'Incidents', 
      icon: <AlertCircle size={16} />, 
      count: monitors?.length > 0 ? (incidents?.filter(i => i.status === 'open').length || 0) : 0,
      color: 'red'
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      icon: <TrendingUp size={16} />,
      color: 'purple'
    },
    { 
      id: 'status-page', 
      name: 'Status Page', 
      icon: <Globe size={16} />,
      color: 'indigo'
    },
    { 
      id: 'alerts', 
      name: 'Alert Rules', 
      icon: <Bell size={16} />,
      color: 'orange'
    },
    { 
      id: 'maintenance', 
      name: 'Maintenance', 
      icon: <Calendar size={16} />,
      color: 'cyan'
    },
    { 
      id: 'team', 
      name: 'Team', 
      icon: <Users size={16} />,
      color: 'pink'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'add-monitor',
      name: 'Add Monitor',
      icon: <Plus size={20} />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Create new monitor',
      action: () => setShowAddMonitor(true)
    },
    {
      id: 'run-checks',
      name: 'Run All Checks',
      icon: <RefreshCw size={20} />,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      description: 'Check all monitors',
      action: () => handleRunAllChecks()
    },
    {
      id: 'create-incident',
      name: 'Create Incident',
      icon: <AlertTriangle size={20} />,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      description: 'Report an issue',
      action: () => handleCreateIncident()
    },
    {
      id: 'schedule-maintenance',
      name: 'Schedule Maintenance',
      icon: <Calendar size={20} />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      description: 'Plan downtime',
      action: () => handleScheduleMaintenance()
    }
  ];

  const metricCards: MetricCard[] = [
    {
      title: 'Total Monitors',
      value: monitors?.length || 0,
      change: monitors?.length > 0 ? '+12%' : '0%',
      changeType: monitors?.length > 0 ? 'increase' : 'neutral',
      icon: <MonitorSpeaker size={20} />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      trend: monitors?.length > 0 ? [65, 68, 72, 75, 78, 82, 85] : [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: 'Overall Uptime',
      value: `${stats?.overallUptime || 0}%`,
      change: monitors?.length > 0 ? '+0.2%' : '0%',
      changeType: monitors?.length > 0 ? 'increase' : 'neutral',
      icon: <TrendingUp size={20} />,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      trend: monitors?.length > 0 ? [98.5, 98.7, 98.9, 99.1, 99.0, 99.2, 99.3] : [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: 'Active Incidents',
      value: incidents?.filter(i => i.status === 'open').length || 0,
      change: monitors?.length > 0 ? '-25%' : '0%',
      changeType: monitors?.length > 0 ? 'decrease' : 'neutral',
      icon: <AlertCircle size={20} />,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      trend: monitors?.length > 0 ? [8, 6, 4, 5, 3, 2, 1] : [0, 0, 0, 0, 0, 0, 0]
    },
    {
      title: 'Avg Response Time',
      value: `${stats?.avgResponseTime || 0}ms`,
      change: monitors?.length > 0 ? '-50ms' : '0ms',
      changeType: monitors?.length > 0 ? 'decrease' : 'neutral',
      icon: <Zap size={20} />,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      trend: monitors?.length > 0 ? [450, 420, 380, 360, 340, 320, 300] : [0, 0, 0, 0, 0, 0, 0]
    }
  ];

  const handleRunAllChecks = async () => {
    try {
      toast.loading('Running all checks...', { id: 'bulk-checks' });
      await Promise.all(monitors.map(monitor => triggerCheck(monitor.id)));
      toast.success('All checks completed!', { id: 'bulk-checks' });
    } catch (error) {
      toast.error('Failed to run checks', { id: 'bulk-checks' });
    }
  };

  const handleCreateIncident = () => {
    // TODO: Implement incident creation modal
    toast.success('Incident creation coming soon!');
  };

  const handleScheduleMaintenance = () => {
    // TODO: Implement maintenance scheduling
    toast.success('Maintenance scheduling coming soon!');
  };

  const handleBulkAction = async (action: string) => {
    if (selectedMonitors.length === 0) {
      toast.error('Please select monitors first');
      return;
    }

    try {
      switch (action) {
        case 'pause':
          await Promise.all(selectedMonitors.map(id => pauseMonitor(id)));
          toast.success(`Paused ${selectedMonitors.length} monitors`);
          break;
        case 'resume':
          await Promise.all(selectedMonitors.map(id => resumeMonitor(id)));
          toast.success(`Resumed ${selectedMonitors.length} monitors`);
          break;
        case 'check':
          await Promise.all(selectedMonitors.map(id => triggerCheck(id)));
          toast.success(`Triggered checks for ${selectedMonitors.length} monitors`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedMonitors.length} monitors?`)) {
            await Promise.all(selectedMonitors.map(id => deleteMonitor(id)));
            toast.success(`Deleted ${selectedMonitors.length} monitors`);
            setSelectedMonitors([]);
          }
          break;
      }
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const filteredMonitors = monitors?.filter(monitor => {
    const matchesSearch = monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         monitor.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || monitor.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  }) || [];

  const renderOverview = () => {
    // Show empty state if no monitors exist
    if (monitors.length === 0) {
      return (
        <div className="space-y-6">
          {/* Empty State */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to WebWatch Monitoring
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Get started by creating your first monitor. We'll track your website's uptime, response times, and alert you when issues arise.
            </p>
            <button
              onClick={() => setShowAddMonitor(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create Your First Monitor
            </button>
          </div>

          {/* Quick Start Guide */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Start Guide
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">1. Add Your Website</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter your website URL to start monitoring</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">2. Monitor Status</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track uptime and response times in real-time</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">3. Get Alerts</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications when issues occur</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${metric.color} text-white`}>
                    {metric.icon}
                  </div>
                  <div className={`flex items-center text-sm ${
                    metric.changeType === 'increase' ? 'text-green-600' : 
                    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.changeType === 'increase' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    <span className="ml-1">{metric.change}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{metric.title}</p>
                </div>
                {/* Mini trend chart */}
                <div className="h-8 flex items-end justify-between">
                  {metric.trend.map((value, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-200 dark:bg-gray-700 rounded-sm flex-1 mx-px"
                      style={{
                        height: `${(value / Math.max(...metric.trend)) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <motion.button
                key={action.id}
                onClick={action.action}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${action.color} text-white rounded-lg p-4 text-left hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-2">
                  {action.icon}
                  <ChevronRight size={16} />
                </div>
                <h4 className="font-medium mb-1">{action.name}</h4>
                <p className="text-sm opacity-90">{action.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity & Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Overview
            </h3>
            <PerformanceChart />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Incidents
            </h3>
            <IncidentTimeline incidents={incidents?.slice(0, 5) || []} />
          </div>
        </div>

        {/* Uptime Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Uptime Heatmap (Last 90 Days)
          </h3>
          <UptimeHeatmap />
        </div>
      </div>
    );
  };

  const renderMonitors = () => {
    // Show empty state if no monitors exist
    if (monitors.length === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <MonitorSpeaker className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Monitors Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Create your first monitor to start tracking your website's performance and uptime.
            </p>
            <button
              onClick={() => setShowAddMonitor(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add Your First Monitor
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Monitors Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monitors ({filteredMonitors.length})
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage your website and service monitors
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search monitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="paused">Paused</option>
                <option value="maintenance">Maintenance</option>
              </select>
              
              <button
                onClick={() => setShowAddMonitor(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Monitor
              </button>
            </div>
          </div>
          
          {/* Bulk Actions */}
          <AnimatePresence>
            {selectedMonitors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-900 dark:text-blue-300">
                    {selectedMonitors.length} monitors selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkAction('check')}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      Run Checks
                    </button>
                    <button
                      onClick={() => handleBulkAction('pause')}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => handleBulkAction('resume')}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Monitors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMonitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onEdit={setEditingMonitor}
              onDelete={deleteMonitor}
              onCheck={triggerCheck}
              onPause={pauseMonitor}
              onResume={resumeMonitor}
              selected={selectedMonitors.includes(monitor.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedMonitors(prev => [...prev, monitor.id]);
                } else {
                  setSelectedMonitors(prev => prev.filter(id => id !== monitor.id));
                }
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'monitors':
        return renderMonitors();
      case 'incidents':
        return <IncidentTimeline incidents={incidents || []} />;
      case 'performance':
        return <PerformanceChart />;
      case 'status-page':
        return <StatusPage />;
      case 'alerts':
        return <AlertRules />;
      case 'maintenance':
        return <MaintenanceWindow />;
      case 'team':
        return <TeamManagement />;
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WebWatch
                </h1>
              </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <RefreshCw size={18} />
              </button>
              <NotificationCenter />
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddMonitor && (
          <MonitorForm
            onClose={() => setShowAddMonitor(false)}
            onSave={createMonitor}
          />
        )}
        {editingMonitor && (
          <MonitorForm
            monitor={editingMonitor}
            onClose={() => setEditingMonitor(null)}
            onSave={(monitor) => updateMonitor(monitor.id, monitor)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 