'use client';
import React, { memo, useMemo, Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';
import Loader from '@/components/Common/Loader';

// Lazy load components for better performance
const PageTransition = lazy(() => import('@/components/Common/PageTransition'));

interface AppContentProps {
  children: React.ReactNode;
}

const AppContent = memo(({ children }: AppContentProps) => {
  const { isOpen } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the sidebar component to prevent unnecessary re-renders
  const sidebarComponent = useMemo(() => <AppSidebar />, []);
  
  // Memoize the header component
  const headerComponent = useMemo(() => <AppHeader />, []);

  // Memoize the backdrop component
  const backdropComponent = useMemo(() => 
    isOpen ? <Backdrop /> : null, [isOpen]
  );

  // Memoize the sidebar classes
  const sidebarClasses = useMemo(() => 
    `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static lg:inset-0`, [isOpen]
  );

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
    <div className="flex-1 flex flex-col overflow-hidden">
      {headerComponent}
      {mainContent}
    </div>
  ), [headerComponent, mainContent]);

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className={sidebarClasses}>
        {sidebarComponent}
      </div>

      {/* Backdrop for mobile */}
      {backdropComponent}

      {/* Main content area */}
      {contentArea}
    </div>
  );
});

AppContent.displayName = 'AppContent';

export default AppContent;