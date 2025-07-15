import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SidebarProvider } from '@/context/SidebarContext'
import I18nProvider from '@/components/Common/I18nProvider'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
  fallback: ['system-ui', 'arial'],
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
  metadataBase: new URL('https://sitegrip.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SiteGrip - Advanced SEO & Performance Monitoring Platform',
    description: 'Professional SEO tools, performance monitoring, and analytics platform for businesses.',
    url: 'https://sitegrip.io',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://sitegrip-backend-pu22v4ao5a-uc.a.run.app" />
        <link rel="preconnect" href="https://sitegrip-backend.firebaseapp.com" />
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//www.googleapis.com" />
        <link rel="dns-prefetch" href="//firebaseapp.com" />
        <link rel="dns-prefetch" href="//googleapis.com" />
        {/* Preload critical CSS */}
        <link rel="preload" href="/globals.css" as="style" />
        {/* Preload critical images */}
        <link rel="preload" href="/images/logo/logo.svg" as="image" type="image/svg+xml" />
        {/* Resource hints */}
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/seo-tools" />
        <link rel="prefetch" href="/uptime" />
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
      <body className={inter.className}>
        <ThemeProvider>
          <SidebarProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </SidebarProvider>
        </ThemeProvider>
        {/* Service Worker for caching */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}
