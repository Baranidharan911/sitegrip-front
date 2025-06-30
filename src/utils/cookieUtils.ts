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

export const COOKIE_CONSENT_KEY = 'cookie-consent';
export const COOKIE_BANNER_VERSION = '1.0';

// Get cookie consent from localStorage
export const getCookieConsent = (): CookieConsent | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return consent ? JSON.parse(consent) : null;
  } catch (error) {
    console.error('Error parsing cookie consent:', error);
    return null;
  }
};

// Save cookie consent to localStorage
export const saveCookieConsent = (preferences: CookiePreferences): void => {
  if (typeof window === 'undefined') return;
  
  const consent: CookieConsent = {
    timestamp: new Date().toISOString(),
    preferences,
  };
  
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  
  // Trigger analytics/marketing setup based on preferences
  handleCookiePreferences(preferences);
};

// Clear cookie consent
export const clearCookieConsent = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  
  // Clear any tracking cookies if needed
  clearTrackingCookies();
};

// Handle cookie preferences and integrate with analytics/marketing tools
const handleCookiePreferences = (preferences: CookiePreferences): void => {
  // Google Analytics integration
  if (preferences.analytics) {
    enableGoogleAnalytics();
  } else {
    disableGoogleAnalytics();
  }
  
  // Marketing cookies (e.g., Facebook Pixel, Google Ads)
  if (preferences.marketing) {
    enableMarketingTracking();
  } else {
    disableMarketingTracking();
  }
  
  // Preference cookies (e.g., theme, language)
  if (preferences.preferences) {
    enablePreferenceCookies();
  }
};

// Google Analytics functions
const enableGoogleAnalytics = (): void => {
  // Example: Initialize Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
  }
  console.log('Analytics cookies enabled');
};

const disableGoogleAnalytics = (): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: 'denied'
    });
  }
  console.log('Analytics cookies disabled');
};

// Marketing tracking functions
const enableMarketingTracking = (): void => {
  // Example: Enable Facebook Pixel, Google Ads, etc.
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
  }
  console.log('Marketing cookies enabled');
};

const disableMarketingTracking = (): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
  console.log('Marketing cookies disabled');
};

// Preference cookies functions
const enablePreferenceCookies = (): void => {
  console.log('Preference cookies enabled');
  // Example: Enable theme persistence, language settings, etc.
};

// Clear tracking cookies
const clearTrackingCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear Google Analytics cookies
  const cookiesToClear = [
    '_ga',
    '_ga_',
    '_gid',
    '_gat',
    '_gtag',
    '_fbp',
    '_fbc'
  ];
  
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  });
  
  console.log('Tracking cookies cleared');
};

// Check if consent is still valid (not older than 13 months as per GDPR)
export const isConsentValid = (consent: CookieConsent): boolean => {
  const consentDate = new Date(consent.timestamp);
  const thirteenMonthsAgo = new Date();
  thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);
  
  return consentDate > thirteenMonthsAgo;
};

// Check if user needs to consent again
export const needsConsent = (): boolean => {
  const consent = getCookieConsent();
  if (!consent) return true;
  
  return !isConsentValid(consent);
};

export type { CookiePreferences, CookieConsent }; 
