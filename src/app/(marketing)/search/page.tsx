/**
 * Search Page
 * 
 * Page de recherche globale
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/common';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Recherche - Phuong Long Vo Dao',
  description: 'Recherchez des clubs, événements, articles et produits.',
};

function SearchResults() {
  // TODO: Implémenter la vraie recherche avec Supabase
  return (
    <div className="py-12">
      <div className="text-center">
        <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold dark:text-gray-100 mb-2">
          Recherche en cours de développement
        </h2>
        <p className="text-gray-600 dark:text-gray-500">
          La fonctionnalité de recherche sera bientôt disponible !
        </p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Container className="py-8">
      <Suspense fallback={<div>Chargement...</div>}>
        <SearchResults />
      </Suspense>
    </Container>
  );
}

