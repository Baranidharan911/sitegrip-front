'use client';

export class MobilePerformanceEnhancer {
  private static instance: MobilePerformanceEnhancer;
  private observers: Set<IntersectionObserver> = new Set();
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): MobilePerformanceEnhancer {
    if (!MobilePerformanceEnhancer.instance) {
      MobilePerformanceEnhancer.instance = new MobilePerformanceEnhancer();
    }
    return MobilePerformanceEnhancer.instance;
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.optimizeViewport();
    this.setupIntersectionObservers();
    this.optimizeTouch();
    this.optimizeScrolling();
    this.setupResourceHints();
    this.optimizeFonts();
    this.isInitialized = true;
  }

  private optimizeViewport(): void {
    // Optimize viewport meta tag for mobile performance
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover'
      );
    }

    // Add mobile-specific CSS variables
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
  }

  private setupIntersectionObservers(): void {
    // Lazy load images
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      { 
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Lazy load videos
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = entry.target as HTMLVideoElement;
            if (video.dataset.src) {
              video.src = video.dataset.src;
              video.removeAttribute('data-src');
              video.load();
              videoObserver.unobserve(video);
            }
          }
        });
      },
      { 
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    // Store observers for cleanup
    this.observers.add(imageObserver);
    this.observers.add(videoObserver);

    // Observe existing elements
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    document.querySelectorAll('video[data-src]').forEach(video => {
      videoObserver.observe(video);
    });
  }

  private optimizeTouch(): void {
    // Optimize touch events for better performance
    const options = { passive: true };
    
    ['touchstart', 'touchmove', 'touchend'].forEach(event => {
      document.addEventListener(event, this.handleTouch, options);
    });

    // Add touch-action optimization
    document.body.style.touchAction = 'manipulation';
  }

  private handleTouch = (event: Event): void => {
    // Prevent default for certain touch events to improve performance
    const touchEvent = event as TouchEvent;
    if (touchEvent.type === 'touchstart' && touchEvent.touches && touchEvent.touches.length > 1) {
      // Prevent pinch-to-zoom on specific elements
      const target = touchEvent.target as HTMLElement;
      if (target.closest('.no-zoom')) {
        touchEvent.preventDefault();
      }
    }
  };

  private optimizeScrolling(): void {
    // Add momentum scrolling for iOS
    (document.body.style as any).webkitOverflowScrolling = 'touch';
    
    // Optimize scroll performance
    let ticking = false;
    const optimizeScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Perform scroll optimizations here
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizeScroll, { passive: true });
  }

  private setupResourceHints(): void {
    // Add prefetch for likely next pages
    const prefetchPages = ['/dashboard', '/seo-tools', '/uptime'];
    
    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

    // Preconnect to critical domains
    const criticalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = '';
      document.head.appendChild(link);
    });
  }

  private optimizeFonts(): void {
    // Optimize font loading
    if ('fonts' in document) {
      // Load critical fonts first
      const criticalFonts = [
        'Inter 400',
        'Inter 500',
        'Inter 600'
      ];

      criticalFonts.forEach(font => {
        (document as any).fonts.load(font).catch((error: Error) => {
          console.warn('Font loading failed:', font, error);
        });
      });
    }
  }

  public optimizeImages(): void {
    // Convert images to modern formats
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.src.includes('data:') && !img.hasAttribute('data-optimized')) {
        // Add loading attribute for native lazy loading
        img.loading = 'lazy';
        img.decoding = 'async';
        img.setAttribute('data-optimized', 'true');
      }
    });
  }

  public reducePaintComplexity(): void {
    // Reduce paint complexity for mobile
    const complexElements = document.querySelectorAll('.shadow-lg, .shadow-xl, .blur-');
    
    complexElements.forEach(element => {
      if (window.innerWidth <= 768) {
        element.classList.add('mobile-simplified');
      }
    });
  }

  public enableHardwareAcceleration(): void {
    // Enable hardware acceleration for key elements
    const acceleratedElements = document.querySelectorAll(
      '.transition-transform, .animate-spin, .animate-pulse, [data-accelerate]'
    );

    acceleratedElements.forEach(element => {
      (element as HTMLElement).style.transform = 'translateZ(0)';
      (element as HTMLElement).style.willChange = 'transform';
    });
  }

  public optimizeForLowEndDevices(): void {
    // Detect low-end devices and apply optimizations
    const isLowEnd = this.detectLowEndDevice();
    
    if (isLowEnd) {
      // Disable expensive animations
      document.documentElement.classList.add('low-end-device');
      
      // Reduce animation frame rate
      document.documentElement.style.setProperty('--animation-duration', '0.5s');
      
      // Disable non-critical effects
      const effects = document.querySelectorAll('.backdrop-blur, .drop-shadow');
      effects.forEach(effect => {
        effect.classList.add('disabled-on-low-end');
      });
    }
  }

  private detectLowEndDevice(): boolean {
    // Simple heuristics to detect low-end devices
    const cores = navigator.hardwareConcurrency || 1;
    const memory = (navigator as any).deviceMemory || 1;
    const connection = (navigator as any).connection;
    
    const isLowEnd = 
      cores <= 2 || 
      memory <= 2 || 
      (connection && ['slow-2g', '2g'].includes(connection.effectiveType));
    
    return isLowEnd;
  }

  public cleanup(): void {
    // Clean up observers and event listeners
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    ['touchstart', 'touchmove', 'touchend'].forEach(event => {
      document.removeEventListener(event, this.handleTouch);
    });
    
    this.isInitialized = false;
  }

  // Public API methods
  public static init(): void {
    MobilePerformanceEnhancer.getInstance().init();
  }

  public static optimizeImages(): void {
    MobilePerformanceEnhancer.getInstance().optimizeImages();
  }

  public static reducePaintComplexity(): void {
    MobilePerformanceEnhancer.getInstance().reducePaintComplexity();
  }

  public static enableHardwareAcceleration(): void {
    MobilePerformanceEnhancer.getInstance().enableHardwareAcceleration();
  }

  public static optimizeForLowEndDevices(): void {
    MobilePerformanceEnhancer.getInstance().optimizeForLowEndDevices();
  }
}

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      MobilePerformanceEnhancer.init();
    });
  } else {
    MobilePerformanceEnhancer.init();
  }
}

export default MobilePerformanceEnhancer; 