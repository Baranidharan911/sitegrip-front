'use client';

import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsent {
  timestamp: string;
  preferences: CookiePreferences;
}

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing consent in localStorage
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent) as CookieConsent;
        setConsent(parsedConsent);
      } catch (error) {
        console.error('Error parsing cookie consent from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('cookie-consent');
      }
    }
    setIsLoading(false);
  }, []);

  const hasConsent = (type: keyof CookiePreferences): boolean => {
    if (!consent) return false;
    return consent.preferences[type];
  };

  const hasAnyConsent = (): boolean => {
    return consent !== null;
  };

  const getConsentDate = (): Date | null => {
    if (!consent) return null;
    return new Date(consent.timestamp);
  };

  const clearConsent = (): void => {
    localStorage.removeItem('cookie-consent');
    setConsent(null);
  };

  // Helper methods for common checks
  const canUseAnalytics = (): boolean => hasConsent('analytics');
  const canUseMarketing = (): boolean => hasConsent('marketing');
  const canUsePreferences = (): boolean => hasConsent('preferences');

  return {
    consent,
    isLoading,
    hasConsent,
    hasAnyConsent,
    getConsentDate,
    clearConsent,
    canUseAnalytics,
    canUseMarketing,
    canUsePreferences,
  };
};

export default useCookieConsent; 
