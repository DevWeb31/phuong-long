import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const heading = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
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
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'Phuong Long Vo Dao - Arts Martiaux Vietnamiens',
    description: 'Découvrez le Phuong Long Vo Dao. 5 clubs en France. Cours pour tous niveaux.',
    siteName: 'Phuong Long Vo Dao',
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
    <html lang="fr" className={`${inter.variable} ${heading.variable}`}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}

