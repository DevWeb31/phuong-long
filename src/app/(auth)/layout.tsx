/**
 * Auth Layout
 * 
 * Layout minimaliste pour les pages d'authentification
 * 
 * @version 1.0
 * @date 2025-11-04 23:30
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export const metadata: Metadata = {
  title: {
    template: '%s | Phuong Long Vo Dao',
    default: 'Connexion',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-4">
        <Container>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center group w-fit">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Phuong Long Vo Dao"
                  className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                />
              </picture>
            </Link>
            <ThemeToggle />
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-6">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm dark:text-gray-500">
            <p>&copy; {new Date().getFullYear()} Phuong Long Vo Dao. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link href="/faq" className="hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                Confidentialité
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

