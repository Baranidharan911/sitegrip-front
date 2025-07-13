'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, Plus, Save, RotateCcw, TrendingUp, Users, Globe, BarChart3, Eye, Clock, Settings, PieChart, StickyNote, TrendingDown, FileText } from 'lucide-react';
import { Responsive, WidthProvider, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ThemeToggle from '@/components/Home/ThemeToggle';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Real-time Data Simulation Helpers ---
function useAnimatedNumber(initial: number, min: number, max: number) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue(v => {
        let next = v + (Math.random() - 0.5) * (max - min) * 0.05;
        next = Math.max(min, Math.min(max, Math.round(next)));
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [min, max]);
  return [value, setValue] as const;
}

// --- Real-time Widgets ---
const RankingWidget = ({ id, refreshKey }: { id: string, refreshKey: number }) => {
  const [avgPos, setAvgPos] = useAnimatedNumber(3, 1, 10);
  const [top10, setTop10] = useAnimatedNumber(147, 100, 200);
  const [posChange, setPosChange] = useAnimatedNumber(23, -10, 50);
  useEffect(() => {
    setAvgPos(3 + Math.floor(Math.random() * 5));
    setTop10(120 + Math.floor(Math.random() * 80));
    setPosChange(-10 + Math.floor(Math.random() * 60));
  }, [refreshKey]);
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-green-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Keyword Rankings</h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Average Position</span>
          <motion.span className="font-medium text-green-600" animate={{ scale: [1, 1.2, 1] }}>{avgPos} ↑</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Top 10 Keywords</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{top10}</motion.span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Position Changes</span>
          <motion.span className="font-medium text-green-600" animate={{ scale: [1, 1.2, 1] }}>{posChange > 0 ? '+' : ''}{posChange}</motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const TrafficWidget = ({ id, refreshKey }: { id: string, refreshKey: number }) => {
  const [thisMonth, setThisMonth] = useAnimatedNumber(12847, 10000, 20000);
  const [growth, setGrowth] = useAnimatedNumber(14, -10, 40);
  useEffect(() => {
    setThisMonth(10000 + Math.floor(Math.random() * 10000));
    setGrowth(-10 + Math.floor(Math.random() * 50));
  }, [refreshKey]);
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-blue-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Organic Traffic</h3>
      </div>
      <div className="text-3xl font-bold text-blue-600 mb-2">
        <motion.span animate={{ scale: [1, 1.2, 1] }}>{thisMonth.toLocaleString()}</motion.span>
      </div>
      <div className="text-sm text-green-600">
        <motion.span animate={{ scale: [1, 1.2, 1] }}>{growth > 0 ? '+' : ''}{growth}% from last month</motion.span>
      </div>
      <div className="mt-4 h-20 rounded-xl bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 flex items-end gap-1 p-2 overflow-hidden shadow-inner">
        <motion.div className="flex-1 rounded-lg bg-blue-500" animate={{ height: `${100}%` }} />
        <motion.div className="flex-1 rounded-lg bg-blue-400" animate={{ height: `${75}%` }} />
        <motion.div className="flex-1 rounded-lg bg-blue-300" animate={{ height: `${50}%` }} />
        <motion.div className="flex-1 rounded-lg bg-blue-600" animate={{ height: `${100}%` }} />
      </div>
    </motion.div>
  );
};

const BacklinkWidget = ({ id, refreshKey }: { id: string, refreshKey: number }) => {
  const [total, setTotal] = useAnimatedNumber(2847, 2000, 5000);
  const [newMonth, setNewMonth] = useAnimatedNumber(156, 50, 300);
  const [da, setDA] = useAnimatedNumber(72, 30, 100);
  useEffect(() => {
    setTotal(2000 + Math.floor(Math.random() * 3000));
    setNewMonth(50 + Math.floor(Math.random() * 250));
    setDA(30 + Math.floor(Math.random() * 70));
  }, [refreshKey]);
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <Globe size={16} className="text-purple-500" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Backlinks</h3>
      </div>
      <div className="text-2xl font-bold text-purple-600 mb-1">
        <motion.span animate={{ scale: [1, 1.2, 1] }}>{total}</motion.span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Backlinks</div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">New This Month</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{newMonth}</motion.span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Domain Authority</span>
          <motion.span className="font-medium" animate={{ scale: [1, 1.2, 1] }}>{da}</motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const PerformanceWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl">
    <div className="flex items-center gap-2 mb-3">
      <BarChart3 size={16} className="text-orange-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Page Performance</h3>
    </div>
    <div className="space-y-3">
      {[
        ['Speed Score', '89', 'bg-green-500'],
        ['SEO Score', '94', 'bg-blue-500']
      ].map(([label, value, color]) => (
        <div key={label}>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UptimeWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl">
    <div className="flex items-center gap-2 mb-3">
      <Eye size={16} className="text-green-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Uptime Status</h3>
    </div>
    <div className="text-center">
      <div className="text-3xl font-bold text-green-600 mb-1">99.9%</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">Last 30 days</div>
    </div>
    <div className="mt-3 flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      <span className="text-sm text-gray-600 dark:text-gray-400">All systems operational</span>
    </div>
  </div>
);

const CrawlStatsWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl">
    <div className="flex items-center gap-2 mb-3">
      <Clock size={16} className="text-indigo-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Crawl Statistics</h3>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Pages Crawled</span>
        <span className="font-medium">1,234</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Issues Found</span>
        <span className="font-medium text-red-600">23</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Last Crawl</span>
        <span className="font-medium">2 hours ago</span>
      </div>
    </div>
  </div>
);

const ConversionRateWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-3">
      <TrendingDown size={16} className="text-pink-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Conversion Rate</h3>
    </div>
    <div className="text-3xl font-bold text-pink-600 mb-2">3.7%</div>
    <div className="text-sm text-green-600">+1.2% from last month</div>
    <div className="mt-4 flex-1 flex items-end">
      <div className="w-full h-2 rounded-full bg-gradient-to-r from-pink-200 to-pink-400 dark:from-pink-900 dark:to-pink-700">
        <div className="h-2 rounded-full bg-pink-500" style={{ width: '37%' }}></div>
      </div>
    </div>
  </div>
);

const TopPagesWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl">
    <div className="flex items-center gap-2 mb-3">
      <FileText size={16} className="text-blue-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Top Pages</h3>
    </div>
    <ol className="space-y-2 text-sm">
      <li className="flex justify-between"><span>/home</span><span className="font-bold text-blue-600">4,321</span></li>
      <li className="flex justify-between"><span>/blog/seo-tips</span><span className="font-bold text-blue-600">2,987</span></li>
      <li className="flex justify-between"><span>/pricing</span><span className="font-bold text-blue-600">1,654</span></li>
      <li className="flex justify-between"><span>/contact</span><span className="font-bold text-blue-600">1,201</span></li>
    </ol>
  </div>
);

const DeviceBreakdownWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-3">
      <PieChart size={16} className="text-indigo-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Device Breakdown</h3>
    </div>
    <div className="flex-1 flex items-center justify-center">
      {/* Simulated Pie Chart */}
      <svg width="80" height="80" viewBox="0 0 32 32">
        <circle r="16" cx="16" cy="16" fill="#e0e7ff" />
        <path d="M16 16 L16 0 A16 16 0 0 1 31.5 19.5 Z" fill="#6366f1" />
        <path d="M16 16 L31.5 19.5 A16 16 0 1 1 7.5 28 Z" fill="#818cf8" />
        <path d="M16 16 L7.5 28 A16 16 0 0 1 16 0 Z" fill="#a5b4fc" />
      </svg>
    </div>
    <div className="flex justify-between text-xs mt-4">
      <span className="text-indigo-600 font-bold">Desktop 55%</span>
      <span className="text-indigo-400 font-bold">Mobile 35%</span>
      <span className="text-indigo-300 font-bold">Tablet 10%</span>
    </div>
  </div>
);

const CustomNoteWidget = ({ id, note, setNote }: { id: string, note: string, setNote: (v: string) => void }) => (
  <div className="h-full bg-yellow-50 dark:bg-yellow-900/40 rounded-3xl border border-yellow-200 dark:border-yellow-700 p-6 shadow-xl backdrop-blur-xl flex flex-col">
    <div className="flex items-center gap-2 mb-3">
      <StickyNote size={16} className="text-yellow-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Custom Note</h3>
    </div>
    <textarea
      className="flex-1 bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200 text-base rounded-xl p-2 mt-2"
      value={note}
      onChange={e => setNote(e.target.value)}
      placeholder="Write your note here..."
      rows={4}
    />
  </div>
);

const availableWidgets = [
  { id: 'ranking', title: 'Keyword Rankings', icon: TrendingUp, component: (props: { id: string, refreshKey: number }) => <RankingWidget {...props} /> },
  { id: 'traffic', title: 'Organic Traffic', icon: Users, component: (props: { id: string, refreshKey: number }) => <TrafficWidget {...props} /> },
  { id: 'backlinks', title: 'Backlinks', icon: Globe, component: (props: { id: string, refreshKey: number }) => <BacklinkWidget {...props} /> },
  { id: 'performance', title: 'Page Performance', icon: BarChart3, component: (props: { id: string, refreshKey: number }) => <PerformanceWidget id={props.id} /> },
  { id: 'uptime', title: 'Uptime Status', icon: Eye, component: (props: { id: string, refreshKey: number }) => <UptimeWidget id={props.id} /> },
  { id: 'crawl-stats', title: 'Crawl Statistics', icon: Clock, component: (props: { id: string, refreshKey: number }) => <CrawlStatsWidget id={props.id} /> },
  { id: 'conversion-rate', title: 'Conversion Rate', icon: TrendingDown, component: (props: { id: string, refreshKey: number }) => <ConversionRateWidget id={props.id} /> },
  { id: 'top-pages', title: 'Top Pages', icon: FileText, component: (props: { id: string, refreshKey: number }) => <TopPagesWidget id={props.id} /> },
  { id: 'device-breakdown', title: 'Device Breakdown', icon: PieChart, component: (props: { id: string, refreshKey: number }) => <DeviceBreakdownWidget id={props.id} /> },
  { id: 'custom-note', title: 'Custom Note', icon: StickyNote, component: (props: any) => <CustomNoteWidget {...props} /> },
];

export default function CustomDashboardPage() {
  const [dashboardWidgets, setDashboardWidgets] = useState<string[]>(['ranking', 'traffic']);
  const [layouts, setLayouts] = useState<Layouts>({});
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [note, setNote] = useState('');
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [undoWidget, setUndoWidget] = useState<string | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (saved) setDashboardWidgets(JSON.parse(saved));
    if (savedLayouts) setLayouts(JSON.parse(savedLayouts));
  }, []);

  const saveDashboard = () => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(dashboardWidgets));
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
  };

  const resetDashboard = () => {
    setDashboardWidgets(['ranking', 'traffic']);
    setLayouts({});
    localStorage.removeItem('dashboard-widgets');
    localStorage.removeItem('dashboard-layouts');
  };

  const generateLayout = () =>
    dashboardWidgets.map((id, index) => ({
      i: id,
      x: (index % 4) * 3,
      y: Math.floor(index / 4) * 2,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2
    }));

  const handleRemoveWidget = (widgetId: string) => {
    setDashboardWidgets(prev => prev.filter(id => id !== widgetId));
    setUndoWidget(widgetId);
    if (undoTimer) clearTimeout(undoTimer);
    setUndoTimer(setTimeout(() => setUndoWidget(null), 5000));
  };

  const handleUndo = () => {
    if (undoWidget) {
      setDashboardWidgets(prev => [...prev, undoWidget]);
      setUndoWidget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f0f4ff] to-[#f8fafc] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-gray-700/40 px-8 py-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Grid3X3 className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg mb-1">Custom Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Build your personalized analytics dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setRefreshKey(k => k + 1)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-2xl text-base focus:ring-2 focus:ring-blue-300 active:scale-95">
              <RotateCcw size={20} /> Refresh Data
            </button>
            <button onClick={() => setShowWidgetSelector(!showWidgetSelector)} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-2xl text-base focus:ring-2 focus:ring-purple-300 active:scale-95">
              <Plus size={20} /> Add Widget
            </button>
            <button onClick={saveDashboard} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-2xl text-base focus:ring-2 focus:ring-green-300 active:scale-95">
              <Save size={20} /> Save
            </button>
            <button onClick={resetDashboard} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-2xl text-base focus:ring-2 focus:ring-red-300 active:scale-95">
              <RotateCcw size={20} /> Reset
            </button>
          </div>
        </motion.div>

        {/* Widget Selector */}
        {showWidgetSelector && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Available Widgets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {availableWidgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => setDashboardWidgets(prev => [...prev, widget.id])}
                  disabled={dashboardWidgets.includes(widget.id)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border shadow text-base font-semibold transition-all ${
                    dashboardWidgets.includes(widget.id)
                      ? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900'
                  }`}
                >
                  <widget.icon size={28} className="text-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300 text-center">{widget.title}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dashboard Widgets */}
        {dashboardWidgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="text-6xl mb-4">🧩</span>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">No widgets yet!</p>
            <button onClick={() => setShowWidgetSelector(true)} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl text-base mt-4">Add Widget</button>
          </div>
        )}
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: generateLayout() }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 8, xs: 4, xxs: 2 }}
          rowHeight={140}
          isDraggable
          isResizable
          margin={[24, 24]}
          onLayoutChange={(layout, layouts) => setLayouts(layouts)}
        >
          {dashboardWidgets.map(widgetId => {
            const widget = availableWidgets.find(w => w.id === widgetId);
            if (!widget) return null;
            const Component = widget.component;
            return (
              <div key={widgetId} className="relative group z-10" style={{ marginTop: '-40px', paddingTop: '40px' }}>
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(widgetId)}
                  className="absolute -top-4 left-1 z-20 w-8 h-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-purple-600 hover:border-purple-400 shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                  title="Widget Settings"
                >
                  <Settings size={18} />
                </button>
                {/* Close Button */}
                <button
                  onClick={() => handleRemoveWidget(widgetId)}
                  className="absolute -top-4 -right-4 z-20 w-8 h-8 bg-red-500 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-2xl duration-200"
                  title="Remove Widget"
                >
                  ✕
                </button>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full w-full">
                  {widgetId === 'custom-note' ? (
                    <Component id={widgetId} refreshKey={refreshKey} />
                  ) : (
                    <Component id={widgetId} refreshKey={refreshKey} />
                  )}
                </motion.div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
        {/* Undo Snackbar */}
        {undoWidget && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-fade-in">
            <span className="text-gray-700 dark:text-gray-200">Widget removed.</span>
            <button onClick={handleUndo} className="text-purple-600 font-bold hover:underline">Undo</button>
          </div>
        )}
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-xs border border-gray-200 dark:border-gray-700 flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Widget Settings</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Settings for <span className="font-semibold">{availableWidgets.find(w => w.id === showSettings)?.title}</span> coming soon!</p>
              <button onClick={() => setShowSettings(null)} className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl text-base">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
