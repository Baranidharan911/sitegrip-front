'use client';
import React, { memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { sidebarItems } from '@/lib/sidebarConfig';
import { X, ChevronDown, ChevronRight, Menu } from 'lucide-react';

const AppSidebar = memo(() => {
  const pathname = usePathname();
  const { isOpen, toggleSidebar, setIsOpen } = useSidebar();

  // Memoize the sidebar items to prevent unnecessary re-renders
  const memoizedSidebarItems = useMemo(() => sidebarItems, []);

  // Memoize the close handler (only close on mobile)
  const handleClose = useCallback(() => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  }, [toggleSidebar]);

  // Memoize the active state checker
  const isActive = useCallback((path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  }, [pathname]);

  // Sidebar expand/collapse toggle (persistent)
  const handleSidebarToggle = useCallback(() => {
    setIsOpen((prev: boolean) => !prev);
  }, [setIsOpen]);

  // Memoize the sidebar content
  const sidebarContent = useMemo(() => (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} overflow-x-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center space-x-2" onClick={handleClose}>
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SG</span>
          </div>
          {isOpen && <span className="text-xl font-bold text-gray-900 dark:text-white">SiteGrip</span>}
        </Link>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Sidebar toggle button (always visible) */}
      <div className="flex items-center justify-end px-4 py-2">
        <button
          onClick={handleSidebarToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-2">
          {memoizedSidebarItems.map((section) => (
            <SidebarSection
              key={section.name}
              section={section}
              isActive={isActive}
              onItemClick={handleClose}
              sidebarOpen={isOpen}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          © 2024 SiteGrip. All rights reserved.
        </div>
      </div>
    </div>
  ), [memoizedSidebarItems, isActive, handleClose, toggleSidebar, isOpen, handleSidebarToggle, setIsOpen]);

  return sidebarContent;
});

// Memoized sidebar section component
const SidebarSection = memo(({ 
  section, 
  isActive, 
  onItemClick,
  sidebarOpen
}: { 
  section: any; 
  isActive: (path: string) => boolean; 
  onItemClick: () => void;
  sidebarOpen: boolean;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(isActive(section.path));

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Only close sidebar on mobile when clicking a subitem
  const handleItemClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      onItemClick();
    }
  }, [onItemClick]);

  const sectionContent = useMemo(() => (
    <div className="space-y-1">
      <button
        onClick={toggleExpanded}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive(section.path)
            ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center space-x-3">
          <section.icon className="w-5 h-5" />
          {sidebarOpen && <span>{section.name}</span>}
          {section.badge && sidebarOpen && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-full">
              {section.badge}
            </span>
          )}
        </div>
        {section.subItems && section.subItems.length > 0 && sidebarOpen && (
          isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )
        )}
      </button>

      {isExpanded && section.subItems && (
        <div className="ml-8 space-y-1">
          {section.subItems.map((item: any) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleItemClick}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-4 h-4" />
                {sidebarOpen && <span>{item.name}</span>}
                {item.pro && sidebarOpen && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 rounded-full">
                    PRO
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  ), [section, isActive, isExpanded, toggleExpanded, handleItemClick, sidebarOpen]);

  return sectionContent;
});

SidebarSection.displayName = 'SidebarSection';
AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
