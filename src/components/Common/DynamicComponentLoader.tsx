'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import Loader from '@/components/Common/Loader';

interface DynamicComponentLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

// Mobile-optimized loading component
const MobileOptimizedLoader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div className="flex items-center justify-center p-8 min-h-[200px]">
    <div className="flex flex-col items-center space-y-3">
      <Loader size={size} color="primary" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Dynamic component loader with mobile optimizations
export const DynamicComponentLoader: React.FC<DynamicComponentLoaderProps> = ({
  children,
  fallback = <MobileOptimizedLoader />,
  className = '',
}) => {
  return (
    <div className={`lazy-load ${className}`}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};

// Higher-order component for creating lazy-loaded components
export function createLazyComponent<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunction);
  
  return (props: React.ComponentProps<T>) => (
    <DynamicComponentLoader fallback={fallback}>
      <LazyComponent {...props} />
    </DynamicComponentLoader>
  );
}

// Pre-configured lazy components for heavy libraries
export const LazyRechartsComponents = {
  LineChart: createLazyComponent(
    () => import('recharts').then(mod => ({ default: mod.LineChart })),
    <MobileOptimizedLoader size="sm" />
  ),
  AreaChart: createLazyComponent(
    () => import('recharts').then(mod => ({ default: mod.AreaChart })),
    <MobileOptimizedLoader size="sm" />
  ),
  BarChart: createLazyComponent(
    () => import('recharts').then(mod => ({ default: mod.BarChart })),
    <MobileOptimizedLoader size="sm" />
  ),
  PieChart: createLazyComponent(
    () => import('recharts').then(mod => ({ default: mod.PieChart })),
    <MobileOptimizedLoader size="sm" />
  ),
};

// Lazy-loaded framer motion components
export const LazyMotionComponents = {
  MotionDiv: createLazyComponent(
    () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
    <div>Loading animation...</div>
  ),
  AnimatePresence: createLazyComponent(
    () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  ),
};

// Lazy loading utilities for non-React libraries
export const loadHTML2Canvas = () => import('html2canvas');
export const loadJSPDF = () => import('jspdf').then(mod => mod.jsPDF);

export default DynamicComponentLoader; 