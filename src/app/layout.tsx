// src/app/layout.tsx
import './globals.css';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from '@/components/ScrollToTop';
import AppContent from '@/components/Layout/AppContent';
   // 👈  now resolvable

const font = Poppins({ subsets: ['latin'], weight: ['400','500','600','700'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider attribute="class" enableSystem defaultTheme="light">
          <AppContent>{children}</AppContent>
          <Toaster position="top-right" reverseOrder={false} />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
