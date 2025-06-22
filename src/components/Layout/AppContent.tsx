// src/layout/AppContent.tsx         ← adjust path/casing to match your choice
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/context/SidebarContext';   // adjust if SidebarContext lives elsewhere
import AppSidebar from '@/components/Layout/AppSidebar';
import AppHeader from '@/components/Layout/AppHeader';
import Backdrop from '@/components/Layout/Backdrop';


export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = pathname === '/' || pathname === '/login';

  if (hideLayout) return <>{children}</>;

  return (
    <SidebarProvider>
      <AppSidebar />
      <Backdrop />
      <div className="flex flex-col min-h-screen md:ml-64">
        <AppHeader />
        <main className="flex-1 p-4">{children}</main>
      </div>
    </SidebarProvider>
  );
}
