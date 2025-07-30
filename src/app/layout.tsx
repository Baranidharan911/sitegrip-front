import type { Metadata } from 'next'
import { Inter, Roboto } from 'next/font/google'
import './globals.css'
import '../Style/tour-highlights.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SidebarProvider } from '@/context/SidebarContext'
import I18nProvider from '@/components/Common/I18nProvider'
import AppTour from '@/components/Common/AppTour'
// Critical CSS is now inlined statically for better SSR performance

// Optimized font loading for better mobile performance
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'], // Only load needed weights
})

// Alternative to Google Sans using Roboto (more widely supported)
const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Secondary font, load after critical
  fallback: ['Inter', 'system-ui', 'arial'],
  variable: '--font-roboto',
  weight: ['400', '500', '700'], // Reduced weights for performance
})

export const metadata: Metadata = {
  title: 'SiteGrip - Advanced SEO & Performance Monitoring Platform',
  description: 'Professional SEO tools, performance monitoring, and analytics platform for businesses. Monitor uptime, analyze performance, and optimize your website for better rankings.',
  keywords: 'SEO tools, performance monitoring, uptime monitoring, website analytics, SEO optimization',
  authors: [{ name: 'SiteGrip Team' }],
  creator: 'SiteGrip',
  publisher: 'SiteGrip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.sitegrip.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SiteGrip - Advanced SEO & Performance Monitoring Platform',
    description: 'Professional SEO tools, performance monitoring, and analytics platform for businesses.',
    url: 'https://www.sitegrip.com',
    siteName: 'SiteGrip',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SiteGrip Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteGrip - Advanced SEO & Performance Monitoring Platform',
    description: 'Professional SEO tools, performance monitoring, and analytics platform for businesses.',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${roboto.variable}`}>
      <head>
        {/* Critical CSS for above-the-fold content */}
        <style
          id="critical-css"
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS for above-the-fold content - Mobile optimized */
              html, body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
              .flex { display: flex; } .flex-col { flex-direction: column; } .flex-1 { flex: 1 1 0%; } .items-center { align-items: center; } .justify-center { justify-content: center; } .justify-between { justify-content: space-between; } .h-screen { height: 100vh; } .w-full { width: 100%; } .min-h-screen { min-height: 100vh; }
              .p-4 { padding: 1rem; } .p-6 { padding: 1.5rem; } .px-4 { padding-left: 1rem; padding-right: 1rem; } .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; } .m-0 { margin: 0; } .mb-4 { margin-bottom: 1rem; } .mt-4 { margin-top: 1rem; }
              .bg-white { background-color: #ffffff; } .bg-gray-50 { background-color: #f9fafb; } .bg-gray-900 { background-color: #111827; } .text-gray-900 { color: #111827; } .text-gray-600 { color: #4b5563; } .text-white { color: #ffffff; }
              .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; transition: background-color 0.15s ease-in-out; text-decoration: none; border: none; cursor: pointer; } .btn-primary { background-color: #3b82f6; color: #ffffff; } .btn-primary:hover { background-color: #2563eb; }
              .text-sm { font-size: 0.875rem; } .text-base { font-size: 1rem; } .text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; } .text-2xl { font-size: 1.5rem; } .text-3xl { font-size: 1.875rem; } .font-medium { font-weight: 500; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
              @media (max-width: 768px) { .text-3xl { font-size: 1.5rem; } .text-2xl { font-size: 1.25rem; } .p-6 { padding: 1rem; } }
              .app-header { position: sticky; top: 0; z-index: 50; background-color: #ffffff; border-bottom: 1px solid #e5e7eb; backdrop-filter: blur(8px); }
              @media (max-width: 1024px) { .app-sidebar { position: fixed; inset-y: 0; left: 0; z-index: 50; width: 16rem; transform: translateX(-100%); transition: transform 0.3s ease-in-out; background-color: #ffffff; } .app-sidebar.open { transform: translateX(0); } }
              @media (prefers-color-scheme: dark) { .bg-white { background-color: #111827; } .bg-gray-50 { background-color: #030712; } .text-gray-900 { color: #f9fafb; } .text-gray-600 { color: #9ca3af; } .app-header { background-color: #111827; border-bottom-color: #374151; } .app-sidebar { background-color: #111827; } }
              .app-header, .app-sidebar, .btn { transform: translateZ(0); will-change: transform; }
            `
          }}
        />
        
        {/* Critical resource hints for mobile performance */}
        <link rel="preconnect" href="https://sitegrip-backend-pu22v4ao5a-uc.a.run.app" />
        <link rel="preconnect" href="https://sitegrip-backend.firebaseapp.com" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//firebaseapp.com" />
        <link rel="dns-prefetch" href="//googleapis.com" />
        
        {/* Preload critical images */}
        <link rel="preload" href="/images/logo/logo.svg" as="image" type="image/svg+xml" />
        
        {/* Mobile-specific optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/_next/static/media/inter-latin-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/_next/static/media/inter-latin-500-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Resource hints - load after critical content */}
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/seo-tools" />
        <link rel="prefetch" href="/uptime" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Register Service Worker for mobile performance
              if ('serviceWorker' in navigator && '${process.env.NODE_ENV}' === 'production') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `
          }}
        />
        
        {/* Performance monitoring script */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Performance monitoring
                if ('performance' in window) {
                  window.addEventListener('load', function() {
                    setTimeout(function() {
                      const perfData = performance.getEntriesByType('navigation')[0];
                      if (perfData) {
                        // Send performance data to analytics
                        if (typeof gtag !== 'undefined') {
                          gtag('event', 'performance', {
                            event_category: 'Performance',
                            event_label: 'Page Load',
                            value: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                            custom_map: {
                              dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                              first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                              first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
                            }
                          });
                        }
                      }
                    }, 0);
                  });
                }
                
                // Memory monitoring
                if ('memory' in performance) {
                  setInterval(function() {
                    const memory = performance.memory;
                    const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
                    
                    if (usage > 0.8) {
                      console.warn('High memory usage detected:', (usage * 100).toFixed(1) + '%');
                    }
                  }, 30000);
                }
              `,
            }}
          />
        )}
      </head>
      <body className={`${inter.className} font-google`}>
        <ThemeProvider>
          <SidebarProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
