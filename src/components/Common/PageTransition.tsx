'use client';
import React, { memo, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = memo(({ children }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);

  const handleTransition = useCallback(() => {
    if (pathname !== currentPath) {
      setIsTransitioning(true);
      setCurrentPath(pathname);
      
      // Faster transition for better performance
      const timer = setTimeout(() => setIsTransitioning(false), 30);
      return () => clearTimeout(timer);
    }
  }, [pathname, currentPath]);

  useEffect(() => {
    handleTransition();
  }, [handleTransition]);

  return (
    <div 
      className={`transition-opacity duration-50 ease-in-out ${
        isTransitioning ? 'opacity-98' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
});

PageTransition.displayName = 'PageTransition';

export default PageTransition;
