import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost, DM_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RSVP – Please Confirm Attendance',
  description: 'Confirm your attendance for our special event',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} ${dmMono.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e1a17',
                color: '#f5f4f0',
                fontFamily: 'var(--font-jost)',
                fontSize: '14px',
                border: '1px solid rgba(212, 169, 49, 0.3)',
                borderRadius: '8px',
              },
              success: {
                iconTheme: { primary: '#d4a931', secondary: '#1e1a17' },
              },
              error: {
                iconTheme: { primary: '#d96e5a', secondary: '#1e1a17' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
