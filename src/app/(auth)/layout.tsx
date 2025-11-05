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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <Container>
          <Link href="/" className="flex items-center group w-fit">
            <img
              src="/logo.png"
              alt="Phuong Long Vo Dao"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
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

