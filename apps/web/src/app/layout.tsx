import type { Metadata } from 'next';
import { Cormorant_Garamond, JetBrains_Mono, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { AnalyticsScripts } from '@/components/AnalyticsScripts';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kazakhstan Travel — Private 4x4 Overland Expeditions',
  description:
    'Private 4x4 expeditions across Kazakhstan, Kyrgyzstan, and Central Asia since 2011.',
  icons: {
    icon: '/brand/logo-mark.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrains.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen bg-white text-[#111111] antialiased">
        <AnalyticsScripts />
        {children}
      </body>
    </html>
  );
}
