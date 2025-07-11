import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';
import AppContent from '@/components/Layout/AppContent';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'SiteGrip - Local SEO & Website Monitoring',
  description: 'Comprehensive local SEO tools and website monitoring platform for businesses',
  keywords: 'local SEO, website monitoring, Google Business Profile, citation builder, rank tracker',
  authors: [{ name: 'SiteGrip Team' }],
  creator: 'SiteGrip',
  publisher: 'SiteGrip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sitegrip.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SiteGrip - Local SEO & Website Monitoring',
    description: 'Comprehensive local SEO tools and website monitoring platform for businesses',
    url: 'https://sitegrip.com',
    siteName: 'SiteGrip',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SiteGrip - Local SEO & Website Monitoring',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteGrip - Local SEO & Website Monitoring',
    description: 'Comprehensive local SEO tools and website monitoring platform for businesses',
    images: ['/images/og-image.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preload critical pages */}
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/seo-tools" />
        
        {/* Preload critical assets */}
        <link rel="preload" href="/images/logo/logo.svg" as="image" type="image/svg+xml" />
        
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Resource hints for faster loading */}
        <link rel="preload" href="/api/monitoring" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/web-vitals" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <SidebarProvider>
            <AppContent>
              {children}
            </AppContent>
          </SidebarProvider>
        </ThemeProvider>
        
        {/* Performance monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if ('performance' in window) {
                window.addEventListener('load', () => {
                  setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                      console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                      console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
                    }
                  }, 0);
                });
              }
              
              // Service Worker registration for caching
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(console.error);
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
