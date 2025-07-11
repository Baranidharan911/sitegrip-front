import React from 'react';
import { Search, ShieldCheck, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart, Area } from 'recharts';

const Analytics: React.FC = () => {
  const kpis = [
    {
      icon: <Clock className="h-7 w-7 text-blue-500" />, label: 'Avg. Indexing Time', value: '2.1h',
      desc: 'Faster than industry average',
      bg: 'from-blue-100 to-blue-50',
    },
    {
      icon: <TrendingUp className="h-7 w-7 text-purple-500" />, label: 'SEO Health Score', value: '92/100',
      desc: 'Site-wide SEO audit',
      bg: 'from-purple-100 to-purple-50',
    },
    {
      icon: <ShieldCheck className="h-7 w-7 text-green-500" />, label: 'Uptime', value: '99.99%',
      desc: 'Last 30 days',
      bg: 'from-green-100 to-green-50',
    },
    {
      icon: <AlertCircle className="h-7 w-7 text-orange-500" />, label: 'Incidents Prevented', value: '37',
      desc: 'Automated alerts',
      bg: 'from-orange-100 to-orange-50',
    },
  ];
  const seoData = [
    { name: 'Indexed Pages', before: 120, after: 320 },
    { name: 'Organic Traffic', before: 300, after: 900 },
    { name: 'Keyword Rankings', before: 40, after: 120 },
  ];
  const seoHealthData = [
    { date: 'Apr', before: 62, after: 62 },
    { date: 'May', before: 65, after: 70 },
    { date: 'Jun', before: 68, after: 80 },
    { date: 'Jul', before: 70, after: 85 },
    { date: 'Aug', before: 72, after: 88 },
    { date: 'Sep', before: 74, after: 90 },
    { date: 'Oct', before: 75, after: 92 },
  ];
  const uptimeData = [
    { date: 'Apr', uptime: 98.7, incidents: 5 },
    { date: 'May', uptime: 99.1, incidents: 3 },
    { date: 'Jun', uptime: 99.5, incidents: 2 },
    { date: 'Jul', uptime: 99.7, incidents: 1 },
    { date: 'Aug', uptime: 99.9, incidents: 0 },
    { date: 'Sep', uptime: 99.99, incidents: 0 },
    { date: 'Oct', uptime: 99.99, incidents: 0 },
  ];

  return (
    <section className="relative z-10 px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            From <span className="text-red-500">Invisible</span> to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Unmissable</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Enterprise-grade insights that power the web’s fastest-growing sites.
          </p>
        </div>
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${kpi.bg} backdrop-blur-md border border-white/30 dark:border-purple-900/70 flex flex-col items-center relative overflow-hidden
                dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:shadow-[0_4px_32px_0_rgba(80,0,120,0.25)] dark:backdrop-blur-xl`}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl opacity-40 dark:from-purple-800/40 dark:to-transparent"></div>
              <div className="mb-4">{kpi.icon}</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{kpi.value}</div>
              <div className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-1">{kpi.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{kpi.desc}</div>
            </div>
          ))}
        </div>
        {/* CHARTS ROW */}
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Removed all chart cards as requested */}
        </div>
      </div>
    </section>
  );
};

export default Analytics; 
