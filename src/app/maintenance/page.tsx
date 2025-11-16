/**
 * Maintenance Page
 * 
 * Page affichée lorsque le site est en maintenance
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/common';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Site en maintenance',
  description: 'Le site est actuellement en maintenance. Nous serons de retour bientôt.',
  robots: 'noindex, nofollow',
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4 relative">
      <Container className="max-w-2xl text-center">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-12 border dark:border-gray-800 relative">
          {/* Bouton de thème en haut à droite */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6 relative overflow-hidden">
              {/* Logo du site */}
              <picture className="absolute inset-0 flex items-center justify-center z-0">
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo.png"
                  alt="Phuong Long Vo Dao"
                  className="w-20 h-20 object-contain opacity-50 dark:opacity-40"
                />
              </picture>
              {/* Masque transparent panneau d'attention */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <svg
                  className="w-16 h-16 text-yellow-600 dark:text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Site en maintenance
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Nous effectuons actuellement une maintenance programmée.
            </p>
            <p className="text-base text-gray-500 dark:text-gray-500">
              Le site sera de retour très bientôt. Merci de votre patience.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Phuong Long Vo Dao
            </p>
          </div>
        </div>
      </Container>

      {/* Bouton discret pour accéder au back office */}
      <Link
        href="/signin?redirect=/admin&from=maintenance"
        className="fixed bottom-6 right-6 p-3 rounded-full bg-gray-800/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 z-50"
        title="Accéder au back office"
        aria-label="Accéder au back office"
      >
        <Cog6ToothIcon className="w-5 h-5" />
      </Link>
    </div>
  );
}

