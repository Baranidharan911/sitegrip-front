import React, { useEffect, useMemo, useState } from 'react';
import { useFrontendUptime } from '../../hooks/useFrontendUptime';
import {
  AlertTriangle,
  Server,
  Shield,
  Globe,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

export const RealTimeUptimeDashboard: React.FC = () => {
  const {
    monitors,
    loading,
    error,
    criticalMonitors,
    refreshMonitors,
    clearError,
    getMonitorChecks,
    getMonitorIncidents,
    checkSSLStatus,
    getMonitorDiagnostics
  } = useFrontendUptime();

  // SSL summary
  const httpsMonitors = monitors.filter(m => m.url && m.url.startsWith('https://'));
  const sslValid = httpsMonitors.filter(m => m.ssl_status === 'valid').length;
  const sslExpiring = httpsMonitors.filter(m => m.ssl_status === 'expiring_soon').length;
  const sslExpired = httpsMonitors.filter(m => m.ssl_status === 'expired').length;
  const sslInvalid = httpsMonitors.filter(m => m.ssl_status === 'invalid').length;

  // Status Page summary
  const publicMonitors = monitors.filter(m => m.is_public !== false);
  const downMonitors = publicMonitors.filter(m => m.last_status === 'down').length;
  const degradedMonitors = publicMonitors.filter(m => (m.failures_in_a_row ?? 0) > 0 && m.last_status === 'up').length;
  let overallStatus = 'operational';
  if (downMonitors > 0) overallStatus = 'down';
  else if (degradedMonitors > 0) overallStatus = 'degraded';

  // --- Real Uptime Trend Data ---
  const [uptimeTrendData, setUptimeTrendData] = useState<{ date: string; uptime: number }[]>([]);

  useEffect(() => {
    async function aggregateUptime() {
      let checksByMonitor: Record<string, any[]> = {};
      try {
        for (const monitor of monitors) {
          const checks = await getMonitorChecks(monitor.id, 1000);
          checksByMonitor[monitor.id] = checks;
        }
      } catch {
        checksByMonitor = {};
      }
      const now = new Date();
      const days: { [date: string]: { up: number; total: number } } = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString();
        days[key] = { up: 0, total: 0 };
      }
      Object.values(checksByMonitor).forEach(checks => {
        checks.forEach(check => {
          if (!check.createdAt) return;
          const d = new Date(check.createdAt);
          const key = d.toLocaleDateString();
          if (days[key]) {
            days[key].total++;
            if (check.status === true) days[key].up++;
          }
        });
      });
      const trend = Object.entries(days).map(([date, { up, total }]) => ({
        date,
        uptime: total > 0 ? (up / total) * 100 : 0
      }));
      setUptimeTrendData(trend);
    }
    aggregateUptime();
  }, [monitors, getMonitorChecks]);

  // Fix: Calculate degraded monitors based on failures_in_a_row or similar logic
  const degradedCount = monitors.filter(m => (m.failures_in_a_row ?? 0) > 0 && m.status).length;
  const statusDistributionData = [
    { name: 'Up', value: monitors.filter(m => m.status && (m.failures_in_a_row ?? 0) === 0).length },
    { name: 'Down', value: monitors.filter(m => !m.status).length },
    { name: 'Degraded', value: degradedCount },
  ];
  const statusColors = ['#22c55e', '#ef4444', '#facc15'];

  // --- Real Incidents Over Time Data ---
  const [incidentsOverTimeData, setIncidentsOverTimeData] = useState<{ month: string; incidents: number }[]>([]);

  useEffect(() => {
    async function aggregateIncidents() {
      let allIncidents: any[] = [];
      try {
        for (const monitor of monitors) {
          const incidents = await getMonitorIncidents(monitor.id, 1000);
          allIncidents = allIncidents.concat(incidents);
        }
      } catch {
        allIncidents = [];
      }
      // Group by month for last 12 months
      const now = new Date();
      const months: { [month: string]: number } = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const key = d.toLocaleString('default', { month: 'short' });
        months[key] = 0;
      }
      allIncidents.forEach(incident => {
        if (!incident.createdAt) return;
        const d = new Date(incident.createdAt);
        const key = d.toLocaleString('default', { month: 'short' });
        if (months[key] !== undefined) months[key]++;
      });
      const data = Object.entries(months).map(([month, incidents]) => ({ month, incidents }));
      setIncidentsOverTimeData(data);
    }
    aggregateIncidents();
  }, [monitors, getMonitorIncidents]);

  const sslExpiryData = httpsMonitors.map(m => ({
    name: m.name || m.url,
    days: m.ssl_cert_days_until_expiry || 0,
    status: m.ssl_status
  }));
  const sslBarColor = (status: string) =>
    status === 'valid' ? '#22c55e' : status === 'expiring_soon' ? '#facc15' : status === 'expired' ? '#ef4444' : '#a1a1aa';

  // --- End mock data ---

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Real-Time Uptime Monitoring
            </h1>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-lg">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        )}
        {!loading && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Monitors */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Monitors</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{monitors.length}</p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              {/* Incidents */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Incidents</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{criticalMonitors.length}</p>
                  </div>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
              {/* SSL Certificates */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SSL Certificates</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{httpsMonitors.length}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="text-green-600">Valid: {sslValid}</span>
                      <span className="text-yellow-600">Expiring: {sslExpiring}</span>
                      <span className="text-red-600">Expired: {sslExpired}</span>
                      <span className="text-red-400">Invalid: {sslInvalid}</span>
                    </div>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              {/* Status Page */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status Page</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{publicMonitors.length}</p>
                    <div className="mt-2 text-xs">
                      <span className={
                        overallStatus === 'operational' ? 'text-green-600' :
                        overallStatus === 'degraded' ? 'text-yellow-600' :
                        'text-red-600'
                      }>
                        {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Uptime Trend */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Uptime Trend (Last 30 Days)</h3>
                {uptimeTrendData.every(d => d.uptime === 0) ? (
                  <div className="flex items-center justify-center h-40 text-gray-400">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={uptimeTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} hide={true} />
                      <YAxis domain={[98, 100]} tick={{ fontSize: 12 }} tickFormatter={v => v + '%'} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip formatter={v => (typeof v === 'number' ? v.toFixed(2) + '%' : v)} />
                      <Area type="monotone" dataKey="uptime" stroke="#6366f1" fillOpacity={1} fill="url(#colorUptime)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Status Distribution */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Status Distribution</h3>
                {statusDistributionData.every(d => d.value === 0) ? (
                  <div className="flex items-center justify-center h-40 text-gray-400">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" label>
                        {statusDistributionData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={statusColors[idx % statusColors.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Incidents Over Time */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Incidents Over Time</h3>
                {incidentsOverTimeData.every(d => d.incidents === 0) ? (
                  <div className="flex items-center justify-center h-40 text-gray-400">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={incidentsOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="incidents" fill="#f59e42" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* SSL Expiry Timeline */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">SSL Expiry Timeline</h3>
                {sslExpiryData.length === 0 || sslExpiryData.every(d => d.days === 0) ? (
                  <div className="flex items-center justify-center h-40 text-gray-400">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart layout="vertical" data={sslExpiryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 'dataMax + 10']} tickFormatter={v => v + 'd'} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(v, n, p) => `${v} days`} />
                      <Bar dataKey="days" radius={[0, 6, 6, 0]}>
                        {sslExpiryData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={sslBarColor(String(entry.status))} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 