import {
  Globe,
  FileText,
  Server,
  Search,
  Activity,
  Radar,
  Settings,
  KeySquare,
  Shield,
  AlertCircle,
  BarChart3,
  Clock,
  Eye,
  MonitorSmartphone,
  Braces,
  Gauge,
  Globe2,
  Calculator,
  MessageSquare,
  Grid3X3,
  Link,
  Image,
  Sparkles,
  MapPin,
  Building2,
  Users,
  Target,
  TrendingUp,
  Zap,
  Crown,
  Star,
  CheckCircle,
  ArrowUpRight,
  Database,
  Network,
  Wifi,
  Lock,
  Palette,
  Layers,
  PieChart,
  LineChart,
  BarChart,
  ScatterChart,
  Calendar,
  Bell,
  Mail,
  Phone,
  Video,
  Camera,
  FileCheck,
  FileX,
  FileSearch,
  FileBarChart,
  FileSpreadsheet,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileJson,
  File,
  FileText as FileText2,
} from 'lucide-react';

export interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
  pro?: boolean;
  badge?: string;
  description?: string;
  disabled?: boolean;
}

export interface SidebarSection {
  name: string;
  path: string;
  icon: React.ElementType;
  subItems: SidebarItem[];
  badge?: string;
  description?: string;
  disabled?: boolean;
}

export const sidebarItems: SidebarSection[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: BarChart3,
    description: 'Overview and analytics',
    subItems: [
      { name: 'Overview', path: '/dashboard/overview', icon: PieChart, description: 'Main dashboard view' },
      { name: 'Analytics', path: '/reporting-analytics/dashboard', icon: LineChart, description: 'Detailed analytics', disabled: true },
      { name: 'Performance', path: '/web-vitals-checker', icon: Gauge, description: 'Performance metrics', disabled: true },
      { name: 'Performance Monitoring', path: '/performance-monitoring', icon: Activity, description: 'Real-time performance monitoring', badge: 'New', disabled: true },
    ],
  },

  {
    name: 'Local SEO',
    path: '/seo-tools',
    icon: MapPin,
    description: 'Local search optimization',
    badge: 'Popular',
    disabled: true,
    subItems: [
      { name: 'Local SEO Dashboard', path: '/seo-tools/local-seo-dashboard', icon: Grid3X3, description: 'Comprehensive local SEO dashboard with maps', pro: false, badge: 'New', disabled: true },
      { name: 'Local Keyword Finder', path: '/seo-tools/local-keyword-finder', icon: KeySquare, description: 'Discover local keywords', pro: false, disabled: true },
      { name: 'Local Rank Tracker', path: '/seo-tools/local-rank-tracker', icon: TrendingUp, description: 'Track local rankings', pro: false, disabled: true },
      { name: 'Google Business Profile', path: '/seo-tools/gbp-audit', icon: Building2, description: 'GBP audit & optimization', pro: false, disabled: true },
      { name: 'Citation Builder', path: '/seo-tools/citation-builder', icon: Link, description: 'Build business citations', pro: false, disabled: true },
      { name: 'Maps Audit', path: '/seo-tools/maps-audit', icon: Globe2, description: 'Google Maps optimization', pro: false, disabled: true },
      { name: 'Listing Management', path: '/seo-tools/listing-management', icon: FileText, description: 'Manage business listings', pro: false, disabled: true },
    ],
  },

  {
    name: 'Competitive Intelligence',
    path: '/seo-tools/competitor-analysis',
    icon: Target,
    description: 'Analyze and outperform competitors',
    disabled: true,
    subItems: [
      { name: 'Competitor Analysis', path: '/seo-tools/competitor-analysis', icon: Radar, description: 'Analyze competitors', pro: false, disabled: true },
      { name: 'Keyword Gaps', path: '/seo-crawler/keyword-tools', icon: Search, description: 'Find keyword opportunities', pro: false, disabled: true },
      { name: 'Market Research', path: '/seo-tools/competitor-analysis', icon: BarChart3, description: 'Market insights', pro: false, disabled: true },
    ],
  },

  {
    name: 'Content & Reputation',
    path: '/seo-tools',
    icon: FileText,
    description: 'Content optimization and reputation management',
    disabled: true,
    subItems: [
      { name: 'AI Content Generator', path: '/seo-tools/ai-content-generator', icon: Sparkles, description: 'Generate SEO content', pro: false, disabled: true },
      { name: 'Review Management', path: '/seo-tools/review-management', icon: MessageSquare, description: 'Manage customer reviews', pro: false, disabled: true },
      { name: 'Reputation Monitoring', path: '/seo-tools/reputation-monitoring', icon: AlertCircle, description: 'Monitor online reputation', pro: false, disabled: true },
      { name: 'SEO Tags Generator', path: '/seo-tools/seo-tags-generator', icon: Braces, description: 'Generate meta tags', pro: false, disabled: true },
    ],
  },

  {
    name: 'Technical SEO',
    path: '/seo-tools',
    icon: Settings,
    description: 'Technical optimization tools',
    disabled: true,
    subItems: [
      { name: 'Meta Tag Analyzer', path: '/meta-tag-analyzer', icon: Search, description: 'Analyze meta tags', pro: false, disabled: true },
      { name: 'Schema Markup Generator', path: '/schema-markup-generator', icon: Braces, description: 'Generate structured data', pro: false, disabled: true },
      { name: 'Internal Link Checker', path: '/internal-link-checker', icon: Link, description: 'Check internal links', pro: false, disabled: true },
      { name: 'Page Speed Analyzer', path: '/page-speed-analyzer', icon: Zap, description: 'Analyze page speed', pro: false, disabled: true },
      { name: 'Core Web Vitals', path: '/web-vitals-checker', icon: Gauge, description: 'Web vitals checker', pro: false, disabled: true },
      { name: 'Chrome UX Report', path: '/chrome-user-experience-report', icon: BarChart3, description: 'Real user performance data', pro: false, disabled: true },
      { name: 'Hreflang Generator', path: '/hreflang-generator', icon: Globe2, description: 'Generate hreflang tags', pro: false, disabled: true },
    ],
  },

  {
    name: 'SEO Crawler',
    path: '/seo-crawler',
    icon: Activity,
    description: 'Website crawling and analysis',
    disabled: true,
    subItems: [
      { name: 'Crawl Dashboard', path: '/seo-crawler/dashboard', icon: Radar, description: 'Crawl overview', pro: false, disabled: true },
      { name: 'Crawl History', path: '/seo-crawler/history', icon: Clock, description: 'Previous crawls', pro: false, disabled: true },
      { name: 'Site Map', path: '/seo-crawler/sitemap', icon: FileText, description: 'Sitemap analysis', pro: false, disabled: true },
      { name: 'Keyword Analysis', path: '/seo-crawler/keyword-tools', icon: KeySquare, description: 'Keyword insights', pro: false, disabled: true },
    ],
  },

  {
    name: 'Indexing',
    path: '/indexing',
    icon: Database,
    description: 'Search engine indexing',
    subItems: [
      { name: 'Google Indexing', path: '/indexing', icon: Search, description: 'Submit URLs to search engines', pro: false },
      { name: 'Index Analytics', path: '/indexing/analytics', icon: BarChart3, description: 'Check indexing status', pro: false },
      { name: 'GSC Dashboard', path: '/seo-crawler/gsc-dashboard', icon: BarChart3, description: 'Google Search Console data & reports', pro: false, badge: 'New' },
    ],
  },

  {
    name: 'Uptime Monitoring',
    path: '/uptime',
    icon: Wifi,
    description: 'Website monitoring and alerts',
    badge: 'New',
    disabled: true,
    subItems: [
      { name: 'Dashboard', path: '/uptime', icon: BarChart3, description: 'Uptime overview', pro: false, disabled: true },
      { name: 'Monitors', path: '/uptime/monitors', icon: Eye, description: 'Manage monitors', pro: false, disabled: true },
      { name: 'Incidents', path: '/uptime/incidents', icon: AlertCircle, description: 'View incidents', pro: false, disabled: true },
      { name: 'SSL Certificates', path: '/uptime/ssl', icon: Shield, description: 'SSL monitoring', pro: false, disabled: true },
      { name: 'Status Page', path: '/uptime/status', icon: Globe, description: 'Public status page', pro: false, disabled: true },
    ],
  },

  {
    name: 'Testing Tools',
    path: '/screen-responsiveness',
    icon: MonitorSmartphone,
    description: 'Website testing and validation',
    disabled: true,
    subItems: [
      { name: 'Responsive Preview', path: '/screen-responsiveness', icon: MonitorSmartphone, description: 'Test responsiveness', pro: false, disabled: true },
      { name: 'Header Checker', path: '/header-checker', icon: Shield, description: 'Check HTTP headers', pro: false, disabled: true },
      { name: 'OpenGraph Checker', path: '/opengraph-checker', icon: Link, description: 'Check social media tags', pro: false, disabled: true },
      { name: 'Broken Image Checker', path: '/broken-image-checker', icon: Image, description: 'Find broken images', pro: false, disabled: true },
    ],
  },

  {
    name: 'Reporting & Analytics',
    path: '/reporting-analytics',
    icon: BarChart,
    description: 'Reports and analytics',
    disabled: true,
    subItems: [
      { name: 'PDF Reports', path: '/reporting-analytics/pdf-generator', icon: FileText, description: 'Generate PDF reports', pro: false, disabled: true },
      { name: 'Custom Dashboard', path: '/reporting-analytics/dashboard', icon: Grid3X3, description: 'Custom analytics', pro: false, disabled: true },
      { name: 'SEO ROI Calculator', path: '/reporting-analytics/seo-roi-calculator', icon: Calculator, description: 'Calculate SEO ROI', pro: false, disabled: true },
      { name: 'Chart Annotations', path: '/reporting-analytics/chart-annotations', icon: MessageSquare, description: 'Annotate charts', pro: false, disabled: true },
    ],
  },
];

// Quick actions for the dashboard
export const quickActions = [
  {
    name: 'New Crawl',
    path: '/seo-crawler/dashboard',
    icon: Activity,
    description: 'Start a new website crawl',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Local Keywords',
    path: '/seo-tools/local-keyword-finder',
    icon: KeySquare,
    description: 'Find local keywords',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Competitor Analysis',
    path: '/seo-tools/competitor-analysis',
    icon: Target,
    description: 'Analyze competitors',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Uptime Monitor',
    path: '/uptime/monitors',
    icon: Wifi,
    description: 'Add new monitor',
    color: 'from-orange-500 to-red-500'
  }
];

// Recent activity types
export const activityTypes = {
  crawl: { icon: Activity, color: 'text-blue-500' },
  keyword: { icon: KeySquare, color: 'text-purple-500' },
  competitor: { icon: Target, color: 'text-green-500' },
  uptime: { icon: Wifi, color: 'text-orange-500' },
  report: { icon: BarChart3, color: 'text-indigo-500' },
  alert: { icon: AlertCircle, color: 'text-red-500' }
};
