"use client";

import React, { useEffect, useState, Suspense, lazy, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

// Lazy load components for better performance
const AnimatedBackground = lazy(() => import('../components/Home/AnimatedBackground'));
const NewHeader = lazy(() => import('../components/Home/NewHeader'));
const NewHero = lazy(() => import('../components/Home/NewHero'));
const TrustedBy = lazy(() => import('../components/Home/TrustedBy'));
const Process = lazy(() => import('../components/Home/Process'));
const NewFeatures = lazy(() => import('../components/Home/NewFeatures'));
const GoogleIndexing = lazy(() => import('../components/Home/GoogleIndexing'));
const SEOTools = lazy(() => import('../components/Home/SEOTools'));
const Analytics = lazy(() => import('../components/Home/Analytics'));
const Integrations = lazy(() => import('../components/Home/Integrations'));
const NewPricing = lazy(() => import('../components/Home/NewPricing'));
const Roadmap = lazy(() => import('../components/Home/Roadmap'));
const FAQ = lazy(() => import('../components/Home/FAQ'));
const Contact = lazy(() => import('../components/Home/Contact'));
const FinalCTA = lazy(() => import('../components/Home/FinalCTA'));
const Testimonials = lazy(() => import('../components/Home/Testimonials'));
const NewFooter = lazy(() => import('../components/Home/NewFooter'));
const CookieBanner = lazy(() => import('../components/Common/CookieBanner'));

// Loading component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export const dynamic = 'force-dynamic';

const Home = memo(() => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    // Only access localStorage after component is mounted
    if (!mounted) return;
    
    // Optional: Check if the user is authenticated and show different content
    // For now, we'll let users browse the home page and interact with OAuth
    const storedUser = localStorage.getItem('Sitegrip-user');
    if (storedUser) {
      console.log('User is authenticated, showing enhanced home page features');
    } else {
      console.log('User not authenticated, showing public home page');
    }
  }, [mounted, router]);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gray-50 dark:bg-[#0a0b1e] transition-colors duration-300">
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatedBackground />
      </Suspense>
      
      <div className="relative z-10 pt-28">
        <Suspense fallback={<LoadingSpinner />}>
          <NewHeader />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <NewHero />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <TrustedBy />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <Process />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <NewFeatures />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <GoogleIndexing />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <SEOTools />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <Analytics />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <Integrations />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <NewPricing />
        </Suspense>
        
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
      </div>
      
      {/* GDPR Cookie Banner */}
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
