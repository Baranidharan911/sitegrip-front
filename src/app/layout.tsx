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
          <AppContent>{children}</AppContent>
          <Toaster position="top-right" reverseOrder={false} />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
