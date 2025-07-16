'use client';

import AuthGuard from '@/components/Common/AuthGuard';
import { ReactNode } from 'react';

interface ProtectedLayoutProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export default function ProtectedLayout({ 
  children, 
  fallback, 
  redirectTo = '/login' 
}: ProtectedLayoutProps) {
  return (
    <AuthGuard fallback={fallback} redirectTo={redirectTo}>
      {children}
    </AuthGuard>
  );
}

// Convenience components for specific sections
export function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout redirectTo="/login">
      {children}
    </ProtectedLayout>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout redirectTo="/login">
      {children}
    </ProtectedLayout>
  );
} 