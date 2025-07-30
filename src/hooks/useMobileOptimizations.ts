'use client';

import { useEffect, useState, useCallback } from 'react';

interface MobileOptimizationOptions {
  enableReducedMotion?: boolean;
  enableTouchOptimizations?: boolean;
  enableBatteryOptimizations?: boolean;
  enableNetworkOptimizations?: boolean;
}

interface MobileOptimizationState {
  isMobile: boolean;
  isLowPowerMode: boolean;
  connectionType: string;
  devicePixelRatio: number;
  preferredColorScheme: 'light' | 'dark' | 'auto';
  reducedMotion: boolean;
}

export const useMobileOptimizations = (options: MobileOptimizationOptions = {}) => {
  const [optimizationState, setOptimizationState] = useState<MobileOptimizationState>({
    isMobile: false,
    isLowPowerMode: false,
    connectionType: 'unknown',
    devicePixelRatio: 1,
    preferredColorScheme: 'auto',
    reducedMotion: false,
  });

  // Detect mobile device
  const detectMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return isMobileDevice || (isTouchDevice && isSmallScreen);
  }, []);

  // Detect connection type
  const detectConnectionType = useCallback(() => {
    if (typeof window === 'undefined') return 'unknown';
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      return connection.effectiveType || connection.type || 'unknown';
    }
    return 'unknown';
  }, []);

  // Detect battery status
  const detectBatteryStatus = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const battery = await (navigator as any).getBattery?.();
      if (battery) {
        // Consider low power mode if battery is below 20% or charging is false and level is below 50%
        return battery.level < 0.2 || (!battery.charging && battery.level < 0.5);
      }
    } catch (error) {
      // Battery API not supported or blocked
    }
    return false;
  }, []);

  // Initialize optimizations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOptimizationState = async () => {
      const isMobile = detectMobile();
      const connectionType = detectConnectionType();
      const isLowPowerMode = await detectBatteryStatus();
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Detect color scheme preference
      const preferredColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : window.matchMedia('(prefers-color-scheme: light)').matches 
        ? 'light' 
        : 'auto';

      // Detect reduced motion preference
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setOptimizationState({
        isMobile,
        isLowPowerMode,
        connectionType,
        devicePixelRatio,
        preferredColorScheme,
        reducedMotion,
      });
    };

    updateOptimizationState();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(max-width: 768px)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];

    const handleChange = () => updateOptimizationState();
    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleChange);
    }

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
      if (connection) {
        connection.removeEventListener('change', handleChange);
      }
    };
  }, [detectMobile, detectConnectionType, detectBatteryStatus]);

  // Apply mobile optimizations
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { isMobile, isLowPowerMode, connectionType, reducedMotion } = optimizationState;

    // Apply reduced motion optimizations
    if (options.enableReducedMotion && (reducedMotion || isLowPowerMode || isMobile)) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.style.setProperty('--transition-duration', '0.1s');
    }

    // Apply touch optimizations
    if (options.enableTouchOptimizations && isMobile) {
      document.documentElement.style.setProperty('--touch-target-size', '44px');
      document.body.style.touchAction = 'manipulation';
    }

    // Apply battery optimizations
    if (options.enableBatteryOptimizations && isLowPowerMode) {
      // Disable non-critical animations
      document.documentElement.classList.add('low-power-mode');
    }

    // Apply network optimizations
    if (options.enableNetworkOptimizations && ['slow-2g', '2g', '3g'].includes(connectionType)) {
      // Enable aggressive caching
      document.documentElement.classList.add('slow-connection');
    }

    return () => {
      document.documentElement.classList.remove('low-power-mode', 'slow-connection');
    };
  }, [optimizationState, options]);

  // Utility functions
  const shouldLazyLoad = useCallback(() => {
    const { isMobile, connectionType, isLowPowerMode } = optimizationState;
    return isMobile || isLowPowerMode || ['slow-2g', '2g', '3g'].includes(connectionType);
  }, [optimizationState]);

  const shouldPreloadImages = useCallback(() => {
    const { connectionType, isLowPowerMode } = optimizationState;
    return !isLowPowerMode && !['slow-2g', '2g'].includes(connectionType);
  }, [optimizationState]);

  const shouldUseReducedMotion = useCallback(() => {
    const { reducedMotion, isLowPowerMode, isMobile } = optimizationState;
    return reducedMotion || isLowPowerMode || isMobile;
  }, [optimizationState]);

  const getOptimalImageFormat = useCallback(() => {
    const { connectionType, devicePixelRatio } = optimizationState;
    
    if (['slow-2g', '2g'].includes(connectionType)) {
      return 'jpeg'; // Smaller file size
    }
    
    if (devicePixelRatio >= 2) {
      return 'webp'; // Better compression for high DPI
    }
    
    return 'webp'; // Default to WebP for better compression
  }, [optimizationState]);

  return {
    ...optimizationState,
    shouldLazyLoad,
    shouldPreloadImages,
    shouldUseReducedMotion,
    getOptimalImageFormat,
  };
};

export default useMobileOptimizations; 