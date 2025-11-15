/**
 * BlogSearchBar - Barre de recherche pour les articles de blog
 * 
 * Permet aux utilisateurs de rechercher des articles par titre ou contenu
 * 
 * @version 1.0
 * @date 2025-11-11
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { debounce } from '@/lib/utils/debounce';

/**
 * Barre de recherche avec debouncing pour éviter trop de requêtes
 */
export function BlogSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');

  // Debounce pour éviter trop de requêtes pendant que l'utilisateur tape
  const debouncedSearch = useCallback(
    // @ts-ignore - debounce type incompatibility
    debounce((value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value.trim()) {
        params.set('q', value.trim());
        params.delete('page'); // Reset à la page 1
      } else {
        params.delete('q');
      }
      
      router.push(`/blog?${params.toString()}`);
    }, 500),
    [searchParams, router]
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        
        <input
          type="search"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher un article..."
          className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-sm"
          aria-label="Rechercher dans le blog"
        />

        {searchValue && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Effacer la recherche"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {searchValue && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          Recherche : <span className="font-medium text-gray-900 dark:text-white">{searchValue}</span>
        </p>
      )}
    </div>
  );
}

