import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Lato, Great_Vibes } from 'next/font/google';
import LuxuryNavbar from '@components/LuxuryNavbar';
import Footer from '@components/Footer';
import ClientLayout from './ClientLayout';
import { SITE_CONFIG } from '@lib/constants';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CherryBlossoms from '@/components/ui/CherryBlossoms';
import MagicCursor from '@/components/ui/MagicCursor';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
});

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-great-vibes',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FCEEF2',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://classik.mn'),
  title: {
    default: `Classik - Premium Luxury Skincare Boutique`,
    template: `%s | Classik`,
  },
  description: 'Premium skincare boutique featuring highly feminine, elegant, and spring-inspired formulations for radiant skin.',
  keywords: ['skincare', 'beauty', 'classik', 'premium skincare', 'glow', 'feminine skincare'],
  authors: [{ name: 'Classik' }],
  creator: 'Classik',
  publisher: 'Classik',
  manifest: '/manifest.json',
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
  openGraph: {
    type: 'website',
    locale: 'mn_MN',
    url: 'https://classik.mn',
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.description}`,
    description: 'Дээд зэргийн арьс арчилгааны бүтээгдэхүүн',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Online Shopping`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} - ${SITE_CONFIG.description}`,
    description: 'Олон улсын чанартай бүтээгдэхүүнийг бөөний үнээр',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <html lang="en" className={`${playfair.variable} ${lato.variable} ${greatVibes.variable} font-sans`}>
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Classik" />
        </head>
        <body className={`${lato.variable} ${playfair.variable} ${greatVibes.variable} min-h-screen bg-[#FAF9F6] text-[#333333] antialiased bg-[radial-gradient(circle_at_15%_50%,rgba(252,238,242,0.8),transparent_25%),radial-gradient(circle_at_85%_30%,rgba(224,107,139,0.05),transparent_25%)] font-sans`}>
          <CherryBlossoms />
          <ClientLayout>
            <LuxuryNavbar />
            <main className="min-h-screen relative z-0">{children}</main>
            <Footer />
          </ClientLayout>
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}
