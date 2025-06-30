'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedBackground from '../components/Home/AnimatedBackground';
import NewHeader from '../components/Home/NewHeader';
import NewHero from '../components/Home/NewHero';
import TrustedBy from '../components/Home/TrustedBy';
import Process from '../components/Home/Process';
import NewFeatures from '../components/Home/NewFeatures';
import GoogleIndexing from '../components/Home/GoogleIndexing';
import SEOTools from '../components/Home/SEOTools';
import Analytics from '../components/Home/Analytics';
import Integrations from '../components/Home/Integrations';
import NewPricing from '../components/Home/NewPricing';
import Roadmap from '../components/Home/Roadmap';
import FAQ from '../components/Home/FAQ';
import Contact from '../components/Home/Contact';
import FinalCTA from '../components/Home/FinalCTA';
import Testimonials from '../components/Home/Testimonials';
import NewFooter from '../components/Home/NewFooter';
import CookieBanner from '../components/Common/CookieBanner';
import { Toaster } from 'react-hot-toast';

export default function Home() {
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
      <AnimatedBackground />
      
      <div className="relative z-10 pt-28">
        <NewHeader />
        <NewHero />
        <TrustedBy />
        <Process />
        <NewFeatures />
        <GoogleIndexing />
        <SEOTools />
        <Analytics />
        <Integrations />
        <NewPricing />
        <Roadmap />
        <FAQ />
        <Contact />
        <FinalCTA />
        <Testimonials />
        <NewFooter />
      </div>
      
      {/* GDPR Cookie Banner */}
      <CookieBanner />

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
}
