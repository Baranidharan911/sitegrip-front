export interface BreadcrumbProps {
  pageName?: string;
  pageDescription?: string;
  showQuickActions?: boolean;
  customBreadcrumbs?: BreadcrumbItem[];
}

export interface BreadcrumbLink {
  href: string;
  text: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  description?: string;
}
