"use client";
import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, Step, Styles } from 'react-joyride';
import { useTheme } from '@/contexts/ThemeContext';

const TOUR_KEY = 'sitegrip_tour_completed_v1';
const FEATURE_KEY = 'sitegrip_feature_highlight_v1';

const onboardingSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to Sitegrip! Let us show you around.',
    placement: 'center',
    disableBeacon: true,
    spotlightClicks: true,
  },
  {
    target: '#sidebar',
    content: 'This is your main navigation sidebar.',
    placement: 'right',
    spotlightClicks: true,
  },
  {
    target: '#dashboard',
    content: 'Here is your dashboard overview.',
    placement: 'bottom',
    spotlightClicks: true,
  },
  // Add more steps as needed
];

const featureSteps: Step[] = [
  {
    target: '#new-feature',
    content: 'Check out this new feature we just launched!',
    placement: 'bottom',
    spotlightClicks: true,
  },
  // Add more feature highlight steps as needed
];

export default function AppTour() {
  const [runTour, setRunTour] = useState(false);
  const [runFeature, setRunFeature] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  // Defensive: fallback to 'light' if context is missing
  const themeContext = typeof useTheme === 'function' ? useTheme() : undefined;
  // Use isDark from ThemeContextType
  const theme = themeContext && themeContext.isDark ? 'dark' : 'light';

  useEffect(() => {
    // Prevent running tour on SSR/hydration mismatch
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(TOUR_KEY)) {
      setSteps(onboardingSteps);
      setRunTour(true);
    } else if (!localStorage.getItem(FEATURE_KEY)) {
      setSteps(featureSteps);
      setRunFeature(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finished = status === 'finished' || status === 'skipped';
    if (finished && runTour) {
      localStorage.setItem(TOUR_KEY, 'true');
      setRunTour(false);
      if (!localStorage.getItem(FEATURE_KEY)) {
        setSteps(featureSteps);
        setRunFeature(true);
      }
    }
    if (finished && runFeature) {
      localStorage.setItem(FEATURE_KEY, 'true');
      setRunFeature(false);
    }
  };

  // Theme-aware Joyride styles
  const joyrideStyles: Partial<Styles> = {
    options: {
      zIndex: 13000,
      primaryColor: theme === 'dark' ? '#38bdf8' : '#2563eb',
      backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
      textColor: theme === 'dark' ? '#f4f4f5' : '#18181b',
      arrowColor: theme === 'dark' ? '#18181b' : '#fff',
      overlayColor: theme === 'dark' ? 'rgba(24,24,27,0.7)' : 'rgba(0,0,0,0.4)',
    },
    buttonClose: {
      color: theme === 'dark' ? '#f4f4f5' : '#18181b',
      opacity: 0.7,
      fontSize: 20,
      fontWeight: 600,
      borderRadius: 6,
      transition: 'background 0.2s',
    },
    buttonNext: {
      backgroundColor: theme === 'dark' ? '#38bdf8' : '#2563eb',
      color: '#fff',
      fontWeight: 600,
      borderRadius: 6,
      fontSize: 16,
      padding: '0.5rem 1.5rem',
      boxShadow: theme === 'dark'
        ? '0 2px 8px 0 rgba(56,189,248,0.15)'
        : '0 2px 8px 0 rgba(37,99,235,0.10)',
      transition: 'background 0.2s',
    },
    buttonBack: {
      color: theme === 'dark' ? '#f4f4f5' : '#18181b',
      fontWeight: 500,
      fontSize: 15,
      borderRadius: 6,
      marginRight: 8,
    },
    tooltip: {
      boxShadow: theme === 'dark'
        ? '0 8px 32px 0 rgba(0,0,0,0.85)'
        : '0 8px 32px 0 rgba(0,0,0,0.10)',
      borderRadius: 16,
      fontSize: 17,
      padding: '2.5rem 2rem 2rem 2rem',
      maxWidth: 420,
      minWidth: 320,
      border: theme === 'dark' ? '1.5px solid #262626' : '1.5px solid #e5e7eb',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      color: theme === 'dark' ? '#f4f4f5' : '#18181b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '1.2rem',
      position: 'relative',
    },
    spotlight: {
      borderRadius: 12,
      boxShadow: theme === 'dark'
        ? '0 0 0 4px #38bdf8, 0 2px 16px 0 rgba(0,0,0,0.7)'
        : '0 0 0 4px #2563eb, 0 2px 16px 0 rgba(0,0,0,0.12)',
      transition: 'box-shadow 0.2s',
    },
    overlay: {
      mixBlendMode: 'multiply',
    },
  };

  return (
    <Joyride
      steps={steps}
      run={runTour || runFeature}
      continuous
      showSkipButton
      showProgress
      disableScrolling={true}
      scrollToFirstStep={true}
      hideBackButton={false}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip',
      }}
      callback={handleJoyrideCallback}
      styles={joyrideStyles}
      spotlightPadding={6}
      disableOverlayClose={true}
      disableOverlay={false}
      // ariaLive removed (not a valid Joyride prop)
    />
  );
}
