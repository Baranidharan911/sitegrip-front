'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Plus, Settings, Save, RotateCcw, TrendingUp, Users, Globe, BarChart3, Eye, Clock } from 'lucide-react';
import { Responsive, WidthProvider, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  icon: React.ElementType;
  component: React.ComponentType<{ id: string }>;
  defaultSize: { w: number; h: number };
  color: string;
}

// Widget Components
const RankingWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-2 mb-3">
      <TrendingUp size={16} className="text-green-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Keyword Rankings</h3>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Average Position</span>
        <span className="font-medium text-green-600">3.2 ↑</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Top 10 Keywords</span>
        <span className="font-medium">147</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Position Changes</span>
        <span className="font-medium text-green-600">+23</span>
      </div>
    </div>
  </div>
);

const TrafficWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-2 mb-3">
      <Users size={16} className="text-blue-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Organic Traffic</h3>
    </div>
    <div className="text-3xl font-bold text-blue-600 mb-2">12,847</div>
    <div className="text-sm text-green-600">+14.4% from last month</div>
    <div className="mt-3 h-16 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded flex items-end p-2">
      <div className="flex-1 h-full bg-blue-500 rounded-sm mr-1"></div>
      <div className="flex-1 h-3/4 bg-blue-400 rounded-sm mr-1"></div>
      <div className="flex-1 h-1/2 bg-blue-300 rounded-sm mr-1"></div>
      <div className="flex-1 h-full bg-blue-600 rounded-sm"></div>
    </div>
  </div>
);

const BacklinkWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-2 mb-3">
      <Globe size={16} className="text-purple-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Backlinks</h3>
    </div>
    <div className="text-2xl font-bold text-purple-600 mb-1">2,847</div>
    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Backlinks</div>
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">New This Month</span>
        <span className="font-medium">156</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Domain Authority</span>
        <span className="font-medium">72</span>
      </div>
    </div>
  </div>
);

const PerformanceWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-2 mb-3">
      <BarChart3 size={16} className="text-orange-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Page Performance</h3>
    </div>
    <div className="space-y-3">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Speed Score</span>
          <span className="text-sm font-medium">89</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">SEO Score</span>
          <span className="text-sm font-medium">94</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

const UptimeWidget = ({ id }: { id: string }) => (
  <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
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
  <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-2 mb-3">
      <Clock size={16} className="text-indigo-500" />
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">Crawl Statistics</h3>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Pages Crawled</span>
        <span className="font-medium">1,234</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Issues Found</span>
        <span className="font-medium text-red-600">23</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Last Crawl</span>
        <span className="font-medium">2 hours ago</span>
      </div>
    </div>
  </div>
);

const availableWidgets: DashboardWidget[] = [
  {
    id: 'ranking',
    title: 'Keyword Rankings',
    type: 'ranking',
    icon: TrendingUp,
    component: RankingWidget,
    defaultSize: { w: 2, h: 2 },
    color: 'text-green-500'
  },
  {
    id: 'traffic',
    title: 'Organic Traffic',
    type: 'traffic',
    icon: Users,
    component: TrafficWidget,
    defaultSize: { w: 2, h: 2 },
    color: 'text-blue-500'
  },
  {
    id: 'backlinks',
    title: 'Backlinks',
    type: 'backlinks',
    icon: Globe,
    component: BacklinkWidget,
    defaultSize: { w: 2, h: 2 },
    color: 'text-purple-500'
  },
  {
    id: 'performance',
    title: 'Page Performance',
    type: 'performance',
    icon: BarChart3,
    component: PerformanceWidget,
    defaultSize: { w: 2, h: 2 },
    color: 'text-orange-500'
  },
  {
    id: 'uptime',
    title: 'Uptime Status',
    type: 'uptime',
    icon: Eye,
    component: UptimeWidget,
    defaultSize: { w: 2, h: 2 },
    color: 'text-green-500'
  },
  {
    id: 'crawl-stats',
    title: 'Crawl Statistics',
    type: 'crawl-stats',
    icon: Clock,
    component: CrawlStatsWidget,
    defaultSize: { w: 2, h: 2 },
    color: 'text-indigo-500'
  }
];

export default function CustomDashboardPage() {
  const [dashboardWidgets, setDashboardWidgets] = useState<string[]>(['ranking', 'traffic']);
  const [layouts, setLayouts] = useState<Layouts>({});
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);

  useEffect(() => {
    // Load saved dashboard configuration from localStorage
    const savedWidgets = localStorage.getItem('dashboard-widgets');
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    
    if (savedWidgets) {
      setDashboardWidgets(JSON.parse(savedWidgets));
    }
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    }
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

  const addWidget = (widgetId: string) => {
    if (!dashboardWidgets.includes(widgetId)) {
      setDashboardWidgets([...dashboardWidgets, widgetId]);
    }
    setShowWidgetSelector(false);
  };

  const removeWidget = (widgetId: string) => {
    setDashboardWidgets(dashboardWidgets.filter(id => id !== widgetId));
  };

  const onLayoutChange = (layout: any, layouts: Layouts) => {
    setLayouts(layouts);
  };

  const generateLayout = () => {
    return dashboardWidgets.map((widgetId, index) => {
      const widget = availableWidgets.find(w => w.id === widgetId);
      return {
        i: widgetId,
        x: (index * 2) % 12,
        y: Math.floor(index / 6) * 2,
        w: widget?.defaultSize.w || 2,
        h: widget?.defaultSize.h || 2,
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Grid3X3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Custom Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Build your personalized analytics dashboard
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWidgetSelector(!showWidgetSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus size={16} />
              Add Widget
            </button>
            <button
              onClick={saveDashboard}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={resetDashboard}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </motion.div>

        {/* Widget Selector */}
        {showWidgetSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Available Widgets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget.id)}
                  disabled={dashboardWidgets.includes(widget.id)}
                  className={`p-3 rounded-lg border transition-colors ${
                    dashboardWidgets.includes(widget.id)
                      ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <widget.icon size={20} className={`mx-auto mb-2 ${widget.color}`} />
                  <p className="text-xs text-gray-700 dark:text-gray-300 text-center">{widget.title}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dashboard Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          {dashboardWidgets.length > 0 ? (
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              onLayoutChange={onLayoutChange}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={120}
              isDraggable={true}
              isResizable={true}
              margin={[16, 16]}
              containerPadding={[0, 0]}
            >
              {dashboardWidgets.map((widgetId) => {
                const widget = availableWidgets.find(w => w.id === widgetId);
                if (!widget) return null;
                
                return (
                  <div key={widgetId} className="relative group">
                    <button
                      onClick={() => removeWidget(widgetId)}
                      className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ×
                    </button>
                    <widget.component id={widgetId} />
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Grid3X3 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Your dashboard is empty</p>
              <p className="text-sm mb-4">Add widgets to start building your custom dashboard</p>
              <button
                onClick={() => setShowWidgetSelector(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Plus size={16} />
                Add Your First Widget
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 