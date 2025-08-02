'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  Home, 
  Search, 
  Settings, 
  Download, 
  Share2, 
  RefreshCw, 
  Plus,
  Keyboard,
  HelpCircle,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  Copy,
  ExternalLink,
  Star,
  Clock,
  BarChart3,
  FileText,
  MapPin,
  Globe,
  Activity,
  Zap,
  Target,
  Users,
  Shield,
  TrendingUp
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
  description?: string;
}

interface BreadcrumbProps {
  pageName?: string;
  pageDescription?: string;
  showQuickActions?: boolean;
  customBreadcrumbs?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  pageName,
  pageDescription,
  showQuickActions = true,
  customBreadcrumbs
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate breadcrumbs based on pathname
  const generateBreadcrumbs = useCallback((path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Home',
        href: '/',
        icon: Home,
        quickActions: [
          {
            label: 'Dashboard',
            icon: BarChart3,
            action: () => router.push('/dashboard/overview'),
            shortcut: 'Ctrl + D',
            description: 'Go to main dashboard'
          },
          {
            label: 'Quick Search',
            icon: Search,
            action: () => {
              // Focus on search input if available
              const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
              }
            },
            shortcut: 'Ctrl + K',
            description: 'Search across the app'
          }
        ]
      }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Map path segments to readable labels
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Get icon based on path
      const getIcon = (path: string) => {
        if (path.includes('dashboard')) return BarChart3;
        if (path.includes('seo-tools')) return Target;
        if (path.includes('indexing')) return FileText;
        if (path.includes('uptime')) return Activity;
        if (path.includes('analytics')) return TrendingUp;
        if (path.includes('local-seo')) return MapPin;
        if (path.includes('crawler')) return Globe;
        if (path.includes('settings')) return Settings;
        if (path.includes('profile')) return Users;
        return undefined;
      };

      // Get quick actions based on current section
      const getQuickActions = (path: string): QuickAction[] => {
        const actions: QuickAction[] = [];
        
        if (path.includes('dashboard')) {
          actions.push(
            {
              label: 'Refresh Data',
              icon: RefreshCw,
              action: () => window.location.reload(),
              shortcut: 'Ctrl + R',
              description: 'Refresh current data'
            },
            {
              label: 'Export Report',
              icon: Download,
              action: () => {
                // Export functionality
                console.log('Exporting report...');
              },
              shortcut: 'Ctrl + E',
              description: 'Export current data'
            }
          );
        }

        if (path.includes('seo-tools')) {
          actions.push(
            {
              label: 'New Analysis',
              icon: Plus,
              action: () => {
                // Start new analysis
                console.log('Starting new analysis...');
              },
              shortcut: 'Ctrl + N',
              description: 'Start new SEO analysis'
            },
            {
              label: 'Share Results',
              icon: Share2,
              action: () => {
                navigator.share?.({
                  title: 'SiteGrip SEO Analysis',
                  url: window.location.href
                }).catch(() => {
                  // Fallback: copy to clipboard
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              },
              shortcut: 'Ctrl + S',
              description: 'Share current results'
            }
          );
        }

        if (path.includes('indexing')) {
          actions.push(
            {
              label: 'Submit URLs',
              icon: Plus,
              action: () => router.push('/indexing'),
              shortcut: 'Ctrl + U',
              description: 'Submit new URLs for indexing'
            },
            {
              label: 'View Analytics',
              icon: BarChart3,
              action: () => router.push('/indexing/analytics'),
              shortcut: 'Ctrl + A',
              description: 'View indexing analytics'
            }
          );
        }

        // Add common actions
        actions.push(
          {
            label: 'Settings',
            icon: Settings,
            action: () => router.push('/settings'),
            shortcut: 'Ctrl + ,',
            description: 'Open settings'
          },
          {
            label: 'Help',
            icon: HelpCircle,
            action: () => {
              // Open help documentation
              window.open('/help', '_blank');
            },
            shortcut: 'F1',
            description: 'Open help documentation'
          }
        );

        return actions;
      };

      breadcrumbs.push({
        label,
        href: currentPath,
        icon: getIcon(currentPath),
        quickActions: getQuickActions(currentPath)
      });
    });

    return breadcrumbs;
  }, [router]);

  const breadcrumbs = useMemo(() => {
    return customBreadcrumbs || generateBreadcrumbs(pathname);
  }, [pathname, customBreadcrumbs, generateBreadcrumbs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if (modifier) {
        switch (event.key.toLowerCase()) {
          case 'k':
            event.preventDefault();
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"]') as HTMLInputElement;
            if (searchInput) searchInput.focus();
            break;
          case 'd':
            event.preventDefault();
            router.push('/dashboard/overview');
            break;
          case 'r':
            event.preventDefault();
            window.location.reload();
            break;
          case 'e':
            event.preventDefault();
            console.log('Exporting...');
            break;
          case 's':
            event.preventDefault();
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            break;
          case 'n':
            event.preventDefault();
            console.log('New analysis...');
            break;
          case 'u':
            event.preventDefault();
            router.push('/indexing');
            break;
          case 'a':
            event.preventDefault();
            router.push('/indexing/analytics');
            break;
          case ',':
            event.preventDefault();
            router.push('/settings');
            break;
        }
      }

      if (event.key === 'F1') {
        event.preventDefault();
        window.open('/help', '_blank');
      }

      // Navigation shortcuts
      if (event.key === 'ArrowLeft' && modifier) {
        event.preventDefault();
        router.back();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  const currentQuickActions = currentBreadcrumb?.quickActions || [];

  return (
    <div className="breadcrumb-google px-6 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-4">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === breadcrumbs.length - 1;
              
              return (
                <React.Fragment key={item.href}>
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 breadcrumb-separator-google" />
                  )}
                  <div className="flex items-center">
                    {isLast ? (
                      <span className="breadcrumb-item-active-google flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4" />}
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="breadcrumb-item-google breadcrumb-focus-google"
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {item.label}
                      </Link>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Quick Actions */}
          {showQuickActions && currentQuickActions.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Keyboard Shortcuts Toggle */}
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="quick-action-google breadcrumb-focus-google"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="w-4 h-4" />
                <span className="hidden sm:inline">Shortcuts</span>
              </button>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-1">
                {currentQuickActions.slice(0, 3).map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="quick-action-google breadcrumb-focus-google group"
                      title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden md:inline">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Page Title and Description */}
        {(pageName || pageDescription) && (
          <div className="mb-4">
            {pageName && (
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {pageName}
              </h1>
            )}
            {pageDescription && (
              <p className="text-gray-600 dark:text-gray-400">
                {pageDescription}
              </p>
            )}
          </div>
        )}

        {/* Keyboard Shortcuts Panel */}
        {showShortcuts && (
          <div className="shortcut-panel-google">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentQuickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.label}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {action.label}
                      </span>
                    </div>
                    {action.shortcut && (
                      <kbd className="shortcut-key-google">
                        {action.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Copy URL Feedback */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            URL copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default Breadcrumb;
