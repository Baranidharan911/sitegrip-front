'use client';
import React, { memo, useMemo, Suspense, lazy } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';

// Lazy load components for better performance
const PageTransition = lazy(() => import('@/components/Common/PageTransition'));

interface AppContentProps {
  children: React.ReactNode;
}

const AppContent = memo(({ children }: AppContentProps) => {
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  // Check if current page should not show sidebar and header
  const pagesWithoutSidebar = ['/', '/login', '/signup', '/pricing', '/privacy'];
  const shouldShowSidebar = !pagesWithoutSidebar.includes(pathname);

  // Memoize the sidebar component to prevent unnecessary re-renders
  const sidebarComponent = useMemo(() => <AppSidebar />, []);
  
  // Memoize the header component
  const headerComponent = useMemo(() => <AppHeader />, []);

  // If it's a page without sidebar, render children without sidebar and header
  if (!shouldShowSidebar) {
    return (
      <div className="min-h-screen">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        }>
          <PageTransition>
            {children}
          </PageTransition>
        </Suspense>
      </div>
    );
  }

  // For app pages, render with sidebar and header
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        {sidebarComponent}
      </div>

      {/* Backdrop for mobile */}
      {isOpen && <Backdrop />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {headerComponent}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          }>
            <PageTransition>
              {children}
            </PageTransition>
          </Suspense>
        </main>
      </div>
    </div>
  );
});

AppContent.displayName = 'AppContent';

export default AppContent;
