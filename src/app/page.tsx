"use client";

import React, { useEffect, useState, Suspense, lazy, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

// Critical components - load immediately
import NewHeader from '../components/Home/NewHeader';
import NewHero from '../components/Home/NewHero';

// Progressive loading - load in batches
const AnimatedBackground = lazy(() => import('../components/Home/AnimatedBackground'));

// Batch 1: Above the fold content
const TrustedBy = lazy(() => import('../components/Home/TrustedBy'));
const CompanyShowcase = lazy(() => import('../components/Home/CompanyShowcase'));
const Process = lazy(() => import('../components/Home/Process'));

// Batch 2: Main content (load after initial render)
const CustomerSuccessStories = lazy(() => import('../components/Home/CustomerSuccessStories'));
const IndustryInnovations = lazy(() => import('../components/Home/IndustryInnovations'));
const GoogleIndexing = lazy(() => import('../components/Home/GoogleIndexing'));
const SEOTools = lazy(() => import('../components/Home/SEOTools'));

// Batch 3: Secondary content (load when needed)
const Analytics = lazy(() => import('../components/Home/Analytics'));
const Integrations = lazy(() => import('../components/Home/Integrations'));
const NewPricing = lazy(() => import('../components/Home/NewPricing'));

// Batch 4: Footer content (load last)
const Roadmap = lazy(() => import('../components/Home/Roadmap'));
const FAQ = lazy(() => import('../components/Home/FAQ'));
const Contact = lazy(() => import('../components/Home/Contact'));
const FinalCTA = lazy(() => import('../components/Home/FinalCTA'));
const Testimonials = lazy(() => import('../components/Home/Testimonials'));
const NewFooter = lazy(() => import('../components/Home/NewFooter'));
const CookieBanner = lazy(() => import('../components/Common/CookieBanner'));

// Optimized loading component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export const dynamic = 'force-dynamic';

const Home = memo(() => {
  const [mounted, setMounted] = useState(false);
  const [loadBatch2, setLoadBatch2] = useState(false);
  const [loadBatch3, setLoadBatch3] = useState(false);
  const [loadBatch4, setLoadBatch4] = useState(false);
  const router = useRouter();
  
  // Progressive loading strategy
  useEffect(() => {
    setMounted(true);
    
    // Load batch 2 after initial render
    const timer1 = setTimeout(() => setLoadBatch2(true), 100);
    
    // Load batch 3 when user scrolls or after 2 seconds
    const timer2 = setTimeout(() => setLoadBatch3(true), 2000);
    
    // Load batch 4 when user scrolls near bottom or after 5 seconds
    const timer3 = setTimeout(() => setLoadBatch4(true), 5000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);
  
  // Intersection Observer for progressive loading
  useEffect(() => {
    if (!mounted) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('batch-2-trigger')) {
              setLoadBatch2(true);
            } else if (entry.target.classList.contains('batch-3-trigger')) {
              setLoadBatch3(true);
            } else if (entry.target.classList.contains('batch-4-trigger')) {
              setLoadBatch4(true);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    // Observe trigger elements
    const triggers = document.querySelectorAll('.batch-2-trigger, .batch-3-trigger, .batch-4-trigger');
    triggers.forEach(trigger => observer.observe(trigger));
    
    return () => observer.disconnect();
  }, [mounted]);
  
  useEffect(() => {
    if (!mounted) return;
    
    const storedUser = localStorage.getItem('Sitegrip-user');
    if (storedUser) {
      console.log('User is authenticated, showing enhanced home page features');
    } else {
      console.log('User not authenticated, showing public home page');
    }
  }, [mounted, router]);

  // Memoize components to prevent unnecessary re-renders
  const aboveTheFoldContent = useMemo(() => (
    <>
      <NewHeader />
      <NewHero />
    </>
  ), []);

  const batch1Content = useMemo(() => (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <TrustedBy />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <CompanyShowcase />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <Process />
      </Suspense>
    </>
  ), []);

  const batch2Content = useMemo(() => (
    loadBatch2 ? (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <CustomerSuccessStories />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <IndustryInnovations />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <GoogleIndexing />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <SEOTools />
        </Suspense>
      </>
    ) : (
      <div className="batch-2-trigger h-32 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  ), [loadBatch2]);

  const batch3Content = useMemo(() => (
    loadBatch3 ? (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <Analytics />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <Integrations />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <NewPricing />
        </Suspense>
      </>
    ) : (
      <div className="batch-3-trigger h-32 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  ), [loadBatch3]);

  const batch4Content = useMemo(() => (
    loadBatch4 ? (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <Roadmap />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <Contact />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <FinalCTA />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <NewFooter />
        </Suspense>
      </>
    ) : (
      <div className="batch-4-trigger h-32 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  ), [loadBatch4]);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gray-50 dark:bg-[#0a0b1e] transition-colors duration-300">
      {/* Background - load immediately but with SSR disabled */}
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>
      
      <div className="relative z-10 pt-28">
        {/* Above the fold content - no Suspense */}
        {aboveTheFoldContent}
        
        {/* Batch 1: Above the fold content */}
        {batch1Content}
        
        {/* Batch 2: Main content */}
        {batch2Content}
        
        {/* Batch 3: Secondary content */}
        {batch3Content}
        
        {/* Batch 4: Footer content */}
        {batch4Content}
      </div>
      
      {/* Cookie Banner - load last */}
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
