'use client';

import React from 'react';
import Header from '../components/Common/Header';
import HeroSection from '../components/Home/HeroSection';
import FeatureCards from '../components/Home/FeatureCards';
import CompanyLogos from '../components/Home/CompanyLogos';
import FeatureDetails from '../components/Home/FeatureDetails';
import PricingSection from '../components/Home/PricingSection';
import CallToAction from '../components/Home/CallToAction';
import Footer from '../components/Common/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white font-inter antialiased transition-colors duration-300">
      <Header />

      {/* Push content below sticky header */}
      <main className="pt-24 md:pt-28">
        <HeroSection />
        <FeatureCards />
        <CompanyLogos />
        <FeatureDetails />
        <PricingSection />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
