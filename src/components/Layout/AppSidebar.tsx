'use client';
import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { sidebarItems } from '@/lib/sidebarConfig';
import { X, ChevronDown, ChevronRight, Menu, LogOut, Sparkles, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AppSidebar = memo(() => {
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebar();
  const { signOut } = useAuth();

  // Memoize the sidebar items to prevent unnecessary re-renders
  const memoizedSidebarItems = useMemo(() => sidebarItems, []);

  // Memoize the close handler
  const handleClose = useCallback(() => {
    // Close sidebar on mobile when clicking links
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  }, [toggleSidebar]);

  // Memoize the active state checker
  const isActive = useCallback((path: string) => {
    return pathname === path || (pathname ? pathname.startsWith(path + '/') : false);
  }, [pathname]);

  // Enhanced toggle handler with smooth animation
  const handleToggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  // Memoize the sidebar content
  const sidebarContent = useMemo(() => (
    <div className={`flex flex-col h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} overflow-hidden shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" prefetch={true} className="flex items-center space-x-2 group" onClick={handleClose}>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            {isOpen && (
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
                SiteGrip
              </span>
            )}
          </Link>
        </div>
        {/* Toggle button for sidebar */}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 flex-shrink-0 group"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:rotate-180 transition-all duration-300" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div className="px-2 space-y-1">
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
      <div className="px-2 pb-2">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-300 rounded-lg font-semibold hover:from-red-100 hover:to-pink-100 dark:hover:from-red-800 dark:hover:to-pink-800 transition-all duration-200 border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700"
          title={!isOpen ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="truncate">Sign Out</span>}
        </button>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
        {isOpen ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2025 SiteGrip. All rights reserved.
          </div>
        ) : (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center" title="© 2025 SiteGrip. All rights reserved.">
            © 2025
          </div>
        )}
      </div>
    </div>
  ), [memoizedSidebarItems, isActive, handleClose, handleToggle, isOpen, signOut]);

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
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSubTooltip, setShowSubTooltip] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Close sidebar on mobile when clicking a subitem
  const handleItemClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      onItemClick();
    }
  }, [onItemClick]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (subTooltipTimeoutRef.current) {
        clearTimeout(subTooltipTimeoutRef.current);
      }
    };
  }, []);

  const sectionContent = useMemo(() => (
    <div className="space-y-1 relative">
      <button
        onClick={section.disabled ? undefined : toggleExpanded}
        disabled={section.disabled}
        onMouseEnter={() => {
          if (!sidebarOpen) {
            tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(true), 300);
          }
        }}
        onMouseLeave={() => {
          if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
          }
          setShowTooltip(false);
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
          section.disabled
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
            : isActive(section.path)
            ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 shadow-md'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md'
        }`}
        title={!sidebarOpen ? section.name : undefined}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`p-1.5 rounded-md transition-all duration-200 ${
            isActive(section.path) 
              ? 'bg-purple-200 dark:bg-purple-800/50' 
              : 'group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
          }`}>
            <section.icon className="w-4 h-4 flex-shrink-0" />
          </div>
          {sidebarOpen && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{section.name}</span>
              {section.badge && (
                <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 text-purple-700 dark:text-purple-300 rounded-full flex-shrink-0 font-medium">
                  {section.badge}
                </span>
              )}
              {section.pro && (
                <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
              )}
            </div>
          )}
        </div>
        {section.subItems && section.subItems.length > 0 && sidebarOpen && (
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          </div>
        )}
      </button>

      {/* Enhanced tooltip for collapsed state */}
      {showTooltip && !sidebarOpen && (
        <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap border border-gray-700/50">
          <div className="flex items-center gap-2">
            <section.icon className="w-4 h-4" />
            <span>{section.name}</span>
            {section.badge && (
              <span className="px-1.5 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                {section.badge}
              </span>
            )}
          </div>
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900/95 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </div>
      )}

      {/* Enhanced sub-items with better centering and visibility */}
      {isExpanded && section.subItems && section.subItems.length > 0 && (
        <div className="ml-4 space-y-1 overflow-hidden">
          {section.subItems.map((subItem: any, index: number) => (
            <div
              key={subItem.path}
              className="animate-slideDown relative"
              style={{ animationDelay: `${index * 50}ms` }}
              onMouseEnter={() => {
                if (!sidebarOpen) {
                  subTooltipTimeoutRef.current = setTimeout(() => setShowSubTooltip(subItem.path), 200);
                }
              }}
              onMouseLeave={() => {
                if (subTooltipTimeoutRef.current) {
                  clearTimeout(subTooltipTimeoutRef.current);
                  subTooltipTimeoutRef.current = null;
                }
                setShowSubTooltip(null);
              }}
            >
              <Link
                href={subItem.disabled ? '#' : subItem.path}
                onClick={subItem.disabled ? (e) => e.preventDefault() : handleItemClick}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative ${
                  subItem.disabled
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                    : isActive(subItem.path)
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-700 dark:text-purple-300 shadow-sm border-l-2 border-purple-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-sm hover:border-l-2 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                title={!sidebarOpen ? subItem.name : undefined}
              >
                <div className="flex items-center justify-center space-x-3 min-w-0">
                  {/* Icon container with better centering */}
                  <div className={`p-1.5 rounded-md transition-all duration-200 flex-shrink-0 ${
                    isActive(subItem.path) 
                      ? 'bg-purple-200 dark:bg-purple-800/50 shadow-sm' 
                      : 'group-hover:bg-gray-200 dark:group-hover:bg-gray-700 shadow-sm'
                  }`}>
                    <subItem.icon className="w-3.5 h-3.5" />
                  </div>
                  
                  {/* Text content with better alignment */}
                  {sidebarOpen && (
                    <div className="flex items-center justify-center gap-2 min-w-0 flex-1">
                      <span className="truncate text-center font-medium">{subItem.name}</span>
                      {subItem.badge && (
                        <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 text-purple-700 dark:text-purple-300 rounded-full flex-shrink-0 font-medium shadow-sm">
                          {subItem.badge}
                        </span>
                      )}
                      {subItem.pro && (
                        <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Active indicator line */}
                {isActive(subItem.path) && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full"></div>
                )}
              </Link>

              {/* Enhanced sub-item tooltip for collapsed state */}
              {showSubTooltip === subItem.path && !sidebarOpen && (
                <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap border border-gray-700/50 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <subItem.icon className="w-4 h-4" />
                    <span className="font-medium">{subItem.name}</span>
                    {subItem.badge && (
                      <span className="px-1.5 py-0.5 text-xs bg-purple-600 text-white rounded-full">
                        {subItem.badge}
                      </span>
                    )}
                    {subItem.pro && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900/95 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  ), [section, isActive, sidebarOpen, isExpanded, showTooltip, showSubTooltip, toggleExpanded, handleItemClick]);

  return sectionContent;
});

SidebarSection.displayName = 'SidebarSection';
AppSidebar.displayName = 'AppSidebar';

export default AppSidebar;
