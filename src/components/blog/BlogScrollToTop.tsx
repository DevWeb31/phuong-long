'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Composant pour faire défiler vers le titre "Tous les articles" 
 * lors du changement de page dans la pagination
 */
export function BlogScrollToTop() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const previousPageRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    // Ne rien faire lors du premier chargement de la page
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      previousPageRef.current = page || '1';
      return;
    }

    // Ne faire le scroll que si la page a réellement changé (et n'est pas la page 1)
    const currentPage = page || '1';
    const previousPage = previousPageRef.current;

    // Si c'est un changement de page (différent de la page précédente)
    if (currentPage !== previousPage && currentPage !== '1') {
      // Attendre que le DOM soit prêt
      const timer = setTimeout(() => {
        const titleElement = document.getElementById('blog-articles-title');
        if (titleElement) {
          // Calculer la position avec offset pour le header sticky
          const headerOffset = 100; // Hauteur approximative du header + marge
          const elementPosition = titleElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 100); // Petit délai pour s'assurer que le contenu est rendu

      previousPageRef.current = currentPage;
      return () => clearTimeout(timer);
    } else {
      // Mettre à jour la référence même si on ne scroll pas
      previousPageRef.current = currentPage;
      return undefined;
    }
  }, [page]); // Se déclenche quand la page change

  return null;
}

