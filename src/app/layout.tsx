import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { CartProvider } from '@/lib/contexts/CartContext';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { CookieConsent } from '@/components/common/CookieConsent';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
  variable: '--font-sans',
});

const heading = Roboto({
  subsets: ['latin'],
  weight: ['500', '700', '900'],
  display: 'swap',
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: {
    default: 'Phuong Long Vo Dao - Arts Martiaux Vietnamiens',
    template: '%s | Phuong Long Vo Dao',
  },
  description: 'Découvrez le Phuong Long Vo Dao, art martial vietnamien traditionnel. 5 clubs en France. Cours pour tous niveaux, enfants et adultes.',
  keywords: ['vo dao', 'arts martiaux', 'phuong long', 'vietnam', 'self defense', 'karate', 'kung fu'],
  authors: [{ name: 'Phuong Long Vo Dao' }],
  creator: 'Phuong Long Vo Dao',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'Phuong Long Vo Dao - Arts Martiaux Vietnamiens',
    description: 'Découvrez le Phuong Long Vo Dao. 5 clubs en France. Cours pour tous niveaux.',
    siteName: 'Phuong Long Vo Dao',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Phuong Long Vo Dao',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phuong Long Vo Dao',
    description: 'Arts martiaux vietnamiens - 5 clubs en France',
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
    google: 'YOUR_GOOGLE_SITE_VERIFICATION',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${roboto.variable} ${heading.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              {children}
              <CookieConsent />
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

