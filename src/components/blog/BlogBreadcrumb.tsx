/**
 * BlogBreadcrumb - Fil d'Ariane pour le blog
 * 
 * Améliore la navigation et le SEO avec des breadcrumbs structurés
 * 
 * @version 1.0
 * @date 2025-11-11
 */

import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface Breadcrumb {
  label: string;
  href: string;
}

interface BlogBreadcrumbProps {
  items: Breadcrumb[];
  currentPage: string;
}

/**
 * Fil d'Ariane avec JSON-LD pour le SEO
 */
export function BlogBreadcrumb({ items, currentPage }: BlogBreadcrumbProps) {
  // JSON-LD pour breadcrumb (excellent pour SEO)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: `https://phuong-long-vo-dao.fr${item.href}`,
      })),
      {
        '@type': 'ListItem',
        position: items.length + 1,
        name: currentPage,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD pour Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb visuel */}
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex items-center gap-2 text-sm flex-wrap">
          {items.map((item, _index) => (
            <li key={item.href} className="flex items-center gap-2">
              <Link 
                href={item.href}
                className="text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-white/50" />
            </li>
          ))}
          <li className="text-white font-medium truncate max-w-xs md:max-w-md">
            {currentPage}
          </li>
        </ol>
      </nav>
    </>
  );
}

