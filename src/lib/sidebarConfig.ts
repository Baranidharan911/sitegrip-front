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
} from 'lucide-react';

export interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
  pro?: boolean;
}

export interface SidebarSection {
  name: string;
  path: string;
  icon: React.ElementType;
  subItems: SidebarItem[];
}

export const sidebarItems: SidebarSection[] = [
  {
    name: 'Indexing',
    path: '/indexing',
    icon: Search,
    subItems: [
      { name: 'Submit URL', path: '/indexing', icon: FileText, pro: false },
    ],
  },
  
  {
    name: 'SEO Crawler',
    path: '/seo-crawler',
    icon: Activity,
    subItems: [
      { name: 'Dashboard', path: '/seo-crawler/dashboard', icon: Radar, pro: false },
      { name: 'Crawl History', path: '/seo-crawler/history', icon: Server, pro: false },
      { name: 'Site Map', path: '/seo-crawler/sitemap', icon: Server, pro: false },
      { name: 'Keywords Analysis', path: '/seo-crawler/keyword-tools', icon: KeySquare, pro: false }
    ],
  },

  {
    name: 'Uptime Monitor',
    path: '/uptime-section',
    icon: Activity,
    subItems: [
      { name: 'Dashboard', path: '/uptime', icon: BarChart3, pro: false },
      { name: 'Monitors', path: '/uptime/monitors', icon: Eye, pro: false },
      { name: 'Incidents', path: '/uptime/incidents', icon: AlertCircle, pro: false },
      { name: 'SSL Certificates', path: '/uptime/ssl', icon: Shield, pro: false },
      { name: 'Status Page', path: '/uptime/status', icon: Globe, pro: false },
    ],
  },
];
