'use client';

interface CriticalCSSConfig {
  viewport: { width: number; height: number };
  selectors: string[];
  excludeSelectors: string[];
}

export class CriticalCSSExtractor {
  private static instance: CriticalCSSExtractor;
  private criticalCSS: string = '';
  private isExtracted: boolean = false;

  private constructor() {}

  public static getInstance(): CriticalCSSExtractor {
    if (!CriticalCSSExtractor.instance) {
      CriticalCSSExtractor.instance = new CriticalCSSExtractor();
    }
    return CriticalCSSExtractor.instance;
  }

  // Critical CSS for mobile above-the-fold content
  private getCriticalCSS(): string {
    return `
      /* Critical CSS for above-the-fold content - Mobile optimized */
      html, body {
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      
      /* Critical layout styles */
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .flex-1 { flex: 1 1 0%; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .justify-between { justify-content: space-between; }
      .h-screen { height: 100vh; }
      .w-full { width: 100%; }
      .min-h-screen { min-height: 100vh; }
      
      /* Critical spacing */
      .p-4 { padding: 1rem; }
      .p-6 { padding: 1.5rem; }
      .px-4 { padding-left: 1rem; padding-right: 1rem; }
      .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .m-0 { margin: 0; }
      .mb-4 { margin-bottom: 1rem; }
      .mt-4 { margin-top: 1rem; }
      
      /* Critical colors */
      .bg-white { background-color: #ffffff; }
      .bg-gray-50 { background-color: #f9fafb; }
      .bg-gray-900 { background-color: #111827; }
      .text-gray-900 { color: #111827; }
      .text-gray-600 { color: #4b5563; }
      .text-white { color: #ffffff; }
      
      /* Critical buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-weight: 500;
        transition: background-color 0.15s ease-in-out;
        text-decoration: none;
        border: none;
        cursor: pointer;
      }
      
      .btn-primary {
        background-color: #3b82f6;
        color: #ffffff;
      }
      
      .btn-primary:hover {
        background-color: #2563eb;
      }
      
      /* Critical typography */
      .text-sm { font-size: 0.875rem; }
      .text-base { font-size: 1rem; }
      .text-lg { font-size: 1.125rem; }
      .text-xl { font-size: 1.25rem; }
      .text-2xl { font-size: 1.5rem; }
      .text-3xl { font-size: 1.875rem; }
      .font-medium { font-weight: 500; }
      .font-semibold { font-weight: 600; }
      .font-bold { font-weight: 700; }
      
      /* Critical responsive */
      @media (max-width: 768px) {
        .text-3xl { font-size: 1.5rem; }
        .text-2xl { font-size: 1.25rem; }
        .p-6 { padding: 1rem; }
      }
      
      /* Critical loading state */
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Critical header styles for above-the-fold */
      .app-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background-color: #ffffff;
        border-bottom: 1px solid #e5e7eb;
        backdrop-filter: blur(8px);
      }
      
      /* Critical sidebar for mobile */
      @media (max-width: 1024px) {
        .app-sidebar {
          position: fixed;
          inset-y: 0;
          left: 0;
          z-index: 50;
          width: 16rem;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          background-color: #ffffff;
        }
        
        .app-sidebar.open {
          transform: translateX(0);
        }
      }
      
      /* Critical dark mode support */
      @media (prefers-color-scheme: dark) {
        .bg-white { background-color: #111827; }
        .bg-gray-50 { background-color: #030712; }
        .text-gray-900 { color: #f9fafb; }
        .text-gray-600 { color: #9ca3af; }
        .app-header { 
          background-color: #111827; 
          border-bottom-color: #374151; 
        }
        .app-sidebar { background-color: #111827; }
      }
      
      /* Hardware acceleration for critical elements */
      .app-header, .app-sidebar, .btn {
        transform: translateZ(0);
        will-change: transform;
      }
    `;
  }

  public injectCriticalCSS(): void {
    if (this.isExtracted || typeof window === 'undefined') return;

    const criticalCSS = this.getCriticalCSS();
    
    // Create and inject critical CSS
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    
    // Insert as first style element for highest priority
    const firstStyle = document.querySelector('style');
    if (firstStyle) {
      document.head.insertBefore(style, firstStyle);
    } else {
      document.head.appendChild(style);
    }

    this.isExtracted = true;
    this.criticalCSS = criticalCSS;
  }

  public getCriticalCSSString(): string {
    return this.getCriticalCSS();
  }

  // Remove non-critical CSS after page load
  public deferNonCriticalCSS(): void {
    if (typeof window === 'undefined') return;

    // Find non-critical stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    stylesheets.forEach((link) => {
      const linkElement = link as HTMLLinkElement;
      
      // Skip critical stylesheets
      if (linkElement.href.includes('critical') || 
          linkElement.href.includes('globals')) {
        return;
      }

      // Defer loading
      linkElement.media = 'print';
      linkElement.onload = () => {
        linkElement.media = 'all';
      };
    });
  }

  // Preload critical fonts
  public preloadCriticalFonts(): void {
    if (typeof window === 'undefined') return;

    const criticalFonts = [
      { family: 'Inter', weight: '400', display: 'swap' },
      { family: 'Inter', weight: '500', display: 'swap' },
      { family: 'Inter', weight: '600', display: 'swap' },
    ];

    criticalFonts.forEach(font => {
      // Check if font is already preloaded
      const existing = document.querySelector(`link[href*="${font.family}"][href*="${font.weight}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2`;
      
      document.head.appendChild(link);
    });
  }

  // Initialize critical CSS optimization
  public init(): void {
    this.injectCriticalCSS();
    this.preloadCriticalFonts();
    
    // Defer non-critical CSS after initial render
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.deferNonCriticalCSS();
      }, 100);
    });
  }

  // Static methods for easy usage
  public static init(): void {
    CriticalCSSExtractor.getInstance().init();
  }

  public static injectCriticalCSS(): void {
    CriticalCSSExtractor.getInstance().injectCriticalCSS();
  }

  public static getCriticalCSS(): string {
    return CriticalCSSExtractor.getInstance().getCriticalCSSString();
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      CriticalCSSExtractor.init();
    });
  } else {
    CriticalCSSExtractor.init();
  }
}

export default CriticalCSSExtractor; 