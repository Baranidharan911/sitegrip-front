'use client';

export class PreloadOptimizer {
  private static instance: PreloadOptimizer;
  private preloadedResources: Set<string> = new Set();
  private criticalResourcesLoaded: boolean = false;
  
  private constructor() {}

  public static getInstance(): PreloadOptimizer {
    if (!PreloadOptimizer.instance) {
      PreloadOptimizer.instance = new PreloadOptimizer();
    }
    return PreloadOptimizer.instance;
  }

  // Preload critical resources immediately
  public preloadCriticalResources(): void {
    if (this.criticalResourcesLoaded || typeof window === 'undefined') return;

    const criticalResources = [
      { href: '/dashboard', as: 'document' },
      { href: '/seo-tools', as: 'document' },
      { href: '/images/logo/logo.svg', as: 'image' },
    ];

    criticalResources.forEach(resource => {
      if (!this.preloadedResources.has(resource.href)) {
        this.createPreloadLink(resource.href, resource.as);
        this.preloadedResources.add(resource.href);
      }
    });

    this.criticalResourcesLoaded = true;
  }

  // Preload route-specific resources
  public preloadRouteResources(route: string): void {
    const routeResources = this.getRouteResources(route);
    
    routeResources.forEach(resource => {
      if (!this.preloadedResources.has(resource.href)) {
        setTimeout(() => {
          this.createPreloadLink(resource.href, resource.as);
          this.preloadedResources.add(resource.href);
        }, 100); // Delay to not block critical resources
      }
    });
  }

  // Get resources for specific routes
  private getRouteResources(route: string): Array<{ href: string; as: string }> {
    const resourceMap: Record<string, Array<{ href: string; as: string }>> = {
      '/dashboard': [
        { href: '/_next/static/chunks/chart-libs.js', as: 'script' },
        { href: '/api/analytics/data', as: 'fetch' },
      ],
      '/seo-tools': [
        { href: '/_next/static/chunks/ui-libs.js', as: 'script' },
        { href: '/images/icons/seo-icon.png', as: 'image' },
      ],
      '/uptime': [
        { href: '/_next/static/chunks/utils.js', as: 'script' },
        { href: '/images/icons/uptime-icon.png', as: 'image' },
      ],
      '/reporting-analytics': [
        { href: '/_next/static/chunks/chart-libs.js', as: 'script' },
        { href: '/_next/static/chunks/animation-libs.js', as: 'script' },
      ],
    };

    return resourceMap[route] || [];
  }

  // Create preload link element
  private createPreloadLink(href: string, as: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    // Add crossorigin for scripts and styles
    if (['script', 'style', 'font'].includes(as)) {
      link.crossOrigin = 'anonymous';
    }

    // Add type for fonts
    if (as === 'font') {
      link.type = 'font/woff2';
    }

    document.head.appendChild(link);
  }

  // Preload based on user interactions
  public preloadOnHover(element: HTMLElement, resources: string[]): (() => void) {
    let hoverTimer: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      hoverTimer = setTimeout(() => {
        resources.forEach(resource => {
          if (!this.preloadedResources.has(resource)) {
            this.createPreloadLink(resource, this.inferResourceType(resource));
            this.preloadedResources.add(resource);
          }
        });
      }, 100); // Small delay to avoid unnecessary preloads
    };

    const handleMouseLeave = () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    
    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (hoverTimer) clearTimeout(hoverTimer);
    };
  }

  // Preload on viewport intersection
  public preloadOnVisible(element: HTMLElement, resources: string[]): (() => void) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            resources.forEach(resource => {
              if (!this.preloadedResources.has(resource)) {
                this.createPreloadLink(resource, this.inferResourceType(resource));
                this.preloadedResources.add(resource);
              }
            });
            observer.unobserve(element);
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(element);
    
    return () => observer.disconnect();
  }

  // Infer resource type from URL
  private inferResourceType(url: string): string {
    if (url.endsWith('.js')) return 'script';
    if (url.endsWith('.css')) return 'style';
    if (url.match(/\.(woff2|woff|ttf|otf)$/)) return 'font';
    if (url.match(/\.(jpg|jpeg|png|webp|avif|svg)$/)) return 'image';
    if (url.startsWith('/api/')) return 'fetch';
    return 'document';
  }

  // Prefetch next likely pages based on current route
  public prefetchLikelyPages(currentRoute: string): void {
    const likelyPages = this.getLikelyNextPages(currentRoute);
    
    likelyPages.forEach(page => {
      if (!this.preloadedResources.has(page)) {
        setTimeout(() => {
          this.createPrefetchLink(page);
          this.preloadedResources.add(page);
        }, 2000); // Delay prefetch to avoid competing with critical resources
      }
    });
  }

  // Get likely next pages based on user journey
  private getLikelyNextPages(currentRoute: string): string[] {
    const journeyMap: Record<string, string[]> = {
      '/': ['/dashboard', '/seo-tools', '/signup'],
      '/dashboard': ['/seo-tools', '/uptime', '/reporting-analytics'],
      '/seo-tools': ['/page-speed-analyzer', '/meta-tag-analyzer', '/dashboard'],
      '/uptime': ['/uptime/monitors', '/uptime/status', '/dashboard'],
      '/page-speed-analyzer': ['/meta-tag-analyzer', '/seo-tools', '/dashboard'],
    };

    return journeyMap[currentRoute] || [];
  }

  // Create prefetch link (lower priority than preload)
  private createPrefetchLink(href: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  // Optimize based on connection speed
  public optimizeForConnection(): void {
    const connection = (navigator as any).connection;
    
    if (!connection) return;

    const { effectiveType, downlink } = connection;
    
    // Reduce preloading on slow connections
    if (['slow-2g', '2g'].includes(effectiveType) || downlink < 1) {
      this.preloadedResources.clear(); // Clear existing preloads
      return;
    }

    // Aggressive preloading on fast connections
    if (['4g'].includes(effectiveType) && downlink > 5) {
      this.preloadCriticalResources();
      setTimeout(() => this.preloadAdditionalResources(), 1000);
    }
  }

  // Preload additional resources for fast connections
  private preloadAdditionalResources(): void {
    const additionalResources = [
      { href: '/_next/static/chunks/ui-libs.js', as: 'script' },
      { href: '/_next/static/chunks/utils.js', as: 'script' },
      { href: '/images/banner/hero-bg.webp', as: 'image' },
    ];

    additionalResources.forEach(resource => {
      if (!this.preloadedResources.has(resource.href)) {
        this.createPreloadLink(resource.href, resource.as);
        this.preloadedResources.add(resource.href);
      }
    });
  }

  // Initialize optimization
  public init(): void {
    if (typeof window === 'undefined') return;

    // Start with critical resources
    requestAnimationFrame(() => {
      this.preloadCriticalResources();
      this.optimizeForConnection();
    });

    // Listen for route changes
    window.addEventListener('popstate', () => {
      const currentRoute = window.location.pathname;
      this.prefetchLikelyPages(currentRoute);
    });

    // Listen for connection changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        this.optimizeForConnection();
      });
    }
  }

  // Static methods for easy usage
  public static init(): void {
    PreloadOptimizer.getInstance().init();
  }

  public static preloadRoute(route: string): void {
    PreloadOptimizer.getInstance().preloadRouteResources(route);
  }

  public static preloadOnHover(element: HTMLElement, resources: string[]): () => void {
    return PreloadOptimizer.getInstance().preloadOnHover(element, resources);
  }

  public static preloadOnVisible(element: HTMLElement, resources: string[]): () => void {
    return PreloadOptimizer.getInstance().preloadOnVisible(element, resources);
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    PreloadOptimizer.init();
  });
}

export default PreloadOptimizer; 