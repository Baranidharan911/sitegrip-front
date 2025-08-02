'use client';
import React, { memo, useMemo, Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';
import Loader from '@/components/Common/Loader';
import useMobileOptimizations from '@/hooks/useMobileOptimizations';

// Lazy load components for better performance
const PageTransition = lazy(() => import('@/components/Common/PageTransition'));
const Breadcrumb = lazy(() => import('@/components/Common/Breadcrumb'));

interface AppContentProps {
  children: React.ReactNode;
}

const AppContent = memo(({ children }: AppContentProps) => {
  const { isOpen } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  // Mobile optimizations
  const { 
    isMobile, 
    shouldUseReducedMotion, 
    shouldLazyLoad 
  } = useMobileOptimizations({
    enableReducedMotion: true,
    enableTouchOptimizations: true,
    enableBatteryOptimizations: true,
    enableNetworkOptimizations: true,
  });

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the sidebar component to prevent unnecessary re-renders
  const sidebarComponent = useMemo(() => <AppSidebar />, []);
  
  // Memoize the header component
  const headerComponent = useMemo(() => <AppHeader />, []);

  // Memoize the breadcrumb component
  const breadcrumbComponent = useMemo(() => <Breadcrumb />, []);

  // Memoize the backdrop component
  const backdropComponent = useMemo(() => 
    isOpen ? <Backdrop /> : null, [isOpen]
  );

  // Memoize the sidebar classes - Fixed positioning with proper z-index
  const sidebarClasses = useMemo(() => {
    const baseClasses = 'fixed inset-y-0 left-0 z-50 transform';
    const transitionClasses = shouldUseReducedMotion() 
      ? 'transition-transform duration-150 ease-out' 
      : 'transition-transform duration-300 ease-in-out';
    const mobileClasses = isOpen ? 'translate-x-0' : '-translate-x-full';
    const desktopClasses = 'lg:translate-x-0';
    const hardwareAccelerated = isMobile ? 'hardware-accelerated' : '';
    return `${baseClasses} ${transitionClasses} ${mobileClasses} ${desktopClasses} ${hardwareAccelerated}`;
  }, [isOpen, shouldUseReducedMotion, isMobile]);

  // Memoize the content area classes - Fixed margin
  const contentAreaClasses = useMemo(() => {
    const baseClasses = 'flex-1 flex flex-col overflow-visible relative z-10';
    const marginClasses = isOpen ? 'lg:ml-64' : 'lg:ml-20';
    const optimizationClasses = isMobile ? 'above-fold isolate-layer' : '';
    return `${baseClasses} ${marginClasses} ${optimizationClasses}`;
  }, [isOpen, isMobile]);

  // Optimized loading fallback
  const loadingFallback = useCallback(() => (
    <div className="flex items-center justify-center h-full">
      <Loader size="lg" color="primary" />
    </div>
  ), []);

  // Memoize the main content wrapper
  const mainContent = useMemo(() => (
    <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
      <Suspense fallback={loadingFallback()}>
        <PageTransition>
          {children}
        </PageTransition>
      </Suspense>
    </main>
  ), [children, loadingFallback]);

  // Memoize the content area
  const contentArea = useMemo(() => (
    <div className={contentAreaClasses}>
      {headerComponent}
      <Suspense fallback={loadingFallback()}>
        {breadcrumbComponent}
      </Suspense>
      {mainContent}
    </div>
  ), [headerComponent, breadcrumbComponent, mainContent, contentAreaClasses, loadingFallback]);

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" color="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-visible">
      {/* Sidebar - Higher z-index to ensure visibility */}
      <div className={sidebarClasses}>
        {sidebarComponent}
      </div>

      {/* Backdrop for mobile - Lower z-index than sidebar */}
      {backdropComponent}

      {/* Main content area */}
      {contentArea}
    </div>
  );
});

AppContent.displayName = 'AppContent';

export default AppContent;