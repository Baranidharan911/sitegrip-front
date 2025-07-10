import './globals.css';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from '@/components/ScrollToTop';
import AppContent from '@/components/Layout/AppContent';
import Script from 'next/script';

const font = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="cXKaq4OvFNWsGqgh5Yn3Kad4UNPPiVilWyRJ_BP-Azo" />
        {/* SEO Meta Tags */}
        <title>Site Grip – Fast Track Your Website's Growth & Performance</title>
        <meta name="description" content="Site Grip is the ultimate all-in-one platform for rapid indexing, in-depth SEO audits, and reliable website uptime monitoring. Fast track your website's growth and performance in minutes." />
        <meta name="keywords" content="SEO, Google Indexing, SEO Audit, Uptime Monitoring, Website Performance, Site Grip, Website Growth, Site Monitoring" />
        <meta name="author" content="Site Grip Team" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.sitegrip.com/" />
        <meta property="og:title" content="Site Grip – Fast Track Your Website's Growth & Performance" />
        <meta property="og:description" content="The ultimate all-in-one platform for rapid indexing, in-depth SEO audits, and reliable website uptime monitoring. Get started for free and power your website's growth." />
        <meta property="og:image" content="https://www.sitegrip.com/og-image.png" />
        <meta property="og:site_name" content="Site Grip" />
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sitegrip" />
        <meta name="twitter:title" content="Site Grip – Fast Track Your Website's Growth & Performance" />
        <meta name="twitter:description" content="The ultimate all-in-one platform for rapid indexing, in-depth SEO audits, and reliable website uptime monitoring. Get started for free and power your website's growth." />
        <meta name="twitter:image" content="https://www.sitegrip.com/og-image.png" />
        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Site Grip",
          "url": "https://www.sitegrip.com/",
          "description": "Site Grip is the ultimate all-in-one platform for rapid indexing, in-depth SEO audits, and reliable website uptime monitoring. Fast track your website's growth and performance in minutes.",
          "publisher": {
            "@type": "Organization",
            "name": "Site Grip",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.sitegrip.com/logo.png"
            }
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.sitegrip.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "sameAs": [
            "https://twitter.com/sitegrip"
          ]
        }` }} />
        {/* ✅ Google Tag Manager (head) */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5XZQX57L');`}
        </Script>

        {/* ✅ Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7CTCNPM9JL"
          strategy="afterInteractive"
        />
        <Script id="ga-script" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7CTCNPM9JL');
          `}
        </Script>
      </head>

      <body className={font.className}>
        {/* ✅ Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5XZQX57L"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>

        <ThemeProvider attribute="class" enableSystem defaultTheme="light">
          <ScrollToTop />
          <AppContent children={children} />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
