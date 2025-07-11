'use client';
import React, { memo, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = memo(({ children }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Minimal transition effect for better performance
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div 
      className={`transition-opacity duration-75 ease-in-out ${
        isTransitioning ? 'opacity-95' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  );
});

PageTransition.displayName = 'PageTransition';

export default PageTransition;
