/**
 * BlogTagFilter - Filtrage par tags pour le blog
 * 
 * Filtres intégrés discrètement dans la section articles
 * 
 * @version 3.0
 * @date 2025-11-11
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { FunnelIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface BlogTagFilterProps {
  availableTags: string[];
}

/**
 * Composant de filtrage par tags avec dropdown élégant
 */
export function BlogTagFilter({ availableTags }: BlogTagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // S'assurer que le composant est monté côté client pour le portail
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedTag === tag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    
    params.delete('page');
    setIsOpen(false);
    
    const queryString = params.toString();
    // Utiliser replace() pour éviter d'ajouter des entrées dans l'historique
    router.replace(`/blog${queryString ? `?${queryString}` : ''}`);
  };

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tag');
    params.delete('page');
    setIsOpen(false);
    
    const queryString = params.toString();
    // Utiliser replace() pour éviter d'ajouter des entrées dans l'historique
    router.replace(`/blog${queryString ? `?${queryString}` : ''}`);
  };

  // Calculer et mettre à jour la position du dropdown quand il s'ouvre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current && dropdownRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          dropdownRef.current.style.top = `${rect.bottom + 8}px`;
          dropdownRef.current.style.right = `${window.innerWidth - rect.right}px`;
        }
      };

      // Utiliser requestAnimationFrame pour s'assurer que le DOM est rendu
      requestAnimationFrame(() => {
        updatePosition();
      });

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block">
      {/* Bouton trigger */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${
            selectedTag
              ? 'bg-primary text-white shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-primary hover:text-primary'
          }
        `}
        aria-label="Filtrer par catégorie"
      >
        <FunnelIcon className="w-4 h-4" />
        <span className="hidden sm:inline">
          {selectedTag ? selectedTag : 'Catégories'}
        </span>
        {selectedTag && (
          <span className="sm:hidden">{selectedTag}</span>
        )}
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown - Rendu via portail pour éviter les problèmes de z-index */}
      {mounted && isOpen && createPortal(
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown - Fixed positioning pour être au-dessus de tout */}
          <div 
            ref={dropdownRef}
            className="fixed w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] max-h-96 overflow-y-auto"
          >
            <div className="p-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Filtrer par catégorie
                </h3>
                {selectedTag && (
                  <button
                    onClick={handleClearFilter}
                    className="text-xs text-gray-500 hover:text-primary transition-colors"
                  >
                    Effacer
                  </button>
                )}
              </div>

              {/* Tags list */}
              <div className="space-y-1">
                {availableTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                        ${
                          isSelected
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{tag}</span>
                        {isSelected && (
                          <span className="text-primary">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Badge du filtre actif (affiché à côté du bouton) */}
      {selectedTag && !isOpen && (
        <button
          onClick={handleClearFilter}
          className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          aria-label="Effacer le filtre"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

