import {
  Globe,
  FileText,
  Server,
  Search,
  Activity,
  Radar,
  Settings,
  KeySquare,
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
    icon: Server,
    subItems: [
      { name: 'Check Uptime', path: '/uptime', icon: Globe, pro: false },
    ],
  },
];
