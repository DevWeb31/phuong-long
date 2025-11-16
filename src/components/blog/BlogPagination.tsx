/**
 * BlogPagination - Pagination pour le blog
 * 
 * Composant de pagination accessible et responsive
 * 
 * @version 1.0
 * @date 2025-11-11
 */

import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

/**
 * Pagination optimisée pour le SEO avec liens prev/next
 */
export function BlogPagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  searchParams = {}
}: BlogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const buildUrl = (page: number): string => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  // Calculer les pages à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Afficher toutes les pages si <= 7
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique complexe avec ellipsis
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= Math.min(4, totalPages - 1); i++) {
          pages.push(i);
        }
        pages.push('...');
      } else if (currentPage >= totalPages - 2) {
        pages.push('...');
        for (let i = Math.max(2, totalPages - 3); i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav 
      className="flex items-center justify-center gap-2 mt-12"
      aria-label="Pagination du blog"
    >
      {/* Bouton Précédent */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </Link>
      ) : (
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed">
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
        </div>
      )}

      {/* Numéros de page */}
      <div className="flex items-center gap-2">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span 
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-400 dark:text-gray-600"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <Link
              key={pageNumber}
              href={buildUrl(pageNumber)}
              className={`
                inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 py-2 text-sm font-medium rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
              aria-label={`Page ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      {/* Bouton Suivant */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRightIcon className="w-4 h-4" />
        </Link>
      ) : (
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed">
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRightIcon className="w-4 h-4" />
        </div>
      )}
    </nav>
  );
}

