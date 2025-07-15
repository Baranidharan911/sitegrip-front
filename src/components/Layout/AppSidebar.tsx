'use client';
import React, { memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { sidebarItems } from '@/lib/sidebarConfig';
import { X, ChevronDown, ChevronRight, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AppSidebar = memo(() => {
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebar();
  const { signOut } = useAuth();

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

  // Memoize the sidebar content
  const sidebarContent = useMemo(() => (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} overflow-x-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" prefetch={true} className="flex items-center space-x-2" onClick={handleClose}>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            {isOpen && <span className="text-xl font-bold text-gray-900 dark:text-white">SiteGrip</span>}
          </Link>
          {/* Hamburger menu button attached to sidebar */}
          <button
            onClick={toggleSidebar}
            className="ml-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} />
          </button>
        </div>
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

      {/* Sign Out Button */}
      <div className="px-4 pb-2">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          © 2025 SiteGrip. All rights reserved.
        </div>
      </div>
    </div>
  ), [memoizedSidebarItems, isActive, handleClose, toggleSidebar, isOpen, signOut]);

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
              prefetch={true}
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
