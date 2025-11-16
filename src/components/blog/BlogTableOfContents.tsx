/**
 * BlogTableOfContents - Table des matières pour articles longs
 * 
 * Génère automatiquement une table des matières à partir des titres H2/H3
 * et permet une navigation rapide dans l'article
 * 
 * @version 1.0
 * @date 2025-11-11
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { ListBulletIcon } from '@heroicons/react/24/outline';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  content: string;
}

/**
 * Table des matières interactive avec scroll spy
 * Améliore l'UX pour les articles longs
 */
export function BlogTableOfContents({ content: _content }: BlogTableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isInSocialPreview, setIsInSocialPreview] = useState(false);
  const lastScrolledIdRef = useRef<string>('');

  // Détecter si on est dans un contexte de partage social (Twitter, Facebook, etc.)
  useEffect(() => {
    // Vérifier le user agent pour les bots de réseaux sociaux uniquement
    const userAgent = navigator.userAgent.toLowerCase();
    const isSocialBot = 
      userAgent.includes('twitterbot') ||
      userAgent.includes('facebookexternalhit') ||
      userAgent.includes('linkedinbot') ||
      userAgent.includes('whatsapp') ||
      userAgent.includes('telegram') ||
      userAgent.includes('slack') ||
      userAgent.includes('discordbot');
    
    // Seulement désactiver pour les bots sociaux réels
    setIsInSocialPreview(isSocialBot);
  }, []);

  // Premier useEffect : Extraire les headings et configurer le scroll spy
  useEffect(() => {
    // Attendre que le contenu soit rendu dans le DOM
    const timer = setTimeout(() => {
      // Extraire les headings directement du DOM (même dans les prévisualisations)
      const headingElements = document.querySelectorAll('article h2, article h3');
      const extractedHeadings: Heading[] = [];

      headingElements.forEach((heading) => {
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.substring(1));
        const id = heading.id;
        
        if (id) {
          extractedHeadings.push({ id, text, level });
        }
      });

      setHeadings(extractedHeadings);

      // Ne pas configurer le scroll spy si on est dans un contexte de partage social
      if (isInSocialPreview) {
        return;
      }

      // Fonction pour mettre à jour la section active basée sur le scroll
      const updateActiveHeading = () => {
        // Vérifier si le scroll est disponible avant de continuer
        const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
        if (scrollY === 0 && window.self !== window.top) {
          // Probablement dans un iframe sans scroll, ne pas mettre à jour
          return;
        }

        const scrollPosition = scrollY + 150; // Offset pour le header

        // Trouver le heading le plus proche au-dessus de la position de scroll
        let currentActiveId = '';
        
        headingElements.forEach((heading) => {
          const headingTop = (heading as HTMLElement).offsetTop;
          
          if (headingTop <= scrollPosition) {
            currentActiveId = heading.id;
          }
        });

        if (currentActiveId) {
          setActiveId(currentActiveId);
        }
      };

      // Vérifier si on est dans un contexte où le scroll fonctionne
      const isInScrollableContext = window.self === window.top && 
                                    (typeof window.scrollY !== 'undefined' || typeof window.pageYOffset !== 'undefined');

      // Mettre à jour immédiatement seulement si on est dans un contexte scrollable
      if (isInScrollableContext) {
        updateActiveHeading();

        // Écouter le scroll avec throttle pour les performances
        let ticking = false;
        const handleScroll = () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              updateActiveHeading();
              ticking = false;
            });
            ticking = true;
          }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
          window.removeEventListener('scroll', handleScroll);
        };
      }
    }, 200);

    // Cleanup
    return () => {
      clearTimeout(timer);
    };
  }, [isInSocialPreview]); // Dépend de isInSocialPreview pour éviter les animations dans les prévisualisations

  // Deuxième useEffect : Auto-scroll vers l'item actif dans la sidebar
  // IMPORTANT : Doit être AVANT tout return conditionnel (Rules of Hooks)
  useEffect(() => {
    // Ne rien faire si on est dans un contexte de partage social
    if (isInSocialPreview || !activeId || headings.length === 0) {
      return;
    }

    // Éviter de scroller si c'est le même élément que la dernière fois
    if (lastScrolledIdRef.current === activeId) {
      return;
    }

    // Utiliser requestAnimationFrame avec un petit délai pour éviter les conflits
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        const activeElement = document.getElementById(`toc-${activeId}`);
        if (activeElement) {
          // Vérifier si l'élément est déjà visible avant de scroller
          const rect = activeElement.getBoundingClientRect();
          const container = activeElement.closest('div[class*="overflow"]') as HTMLElement;
          
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const isVisible = rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
            
            // Seulement scroller si l'élément n'est pas visible
            if (!isVisible) {
              try {
                activeElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                });
                lastScrolledIdRef.current = activeId;
              } catch (error) {
                // Si scrollIntoView échoue, ignorer silencieusement
              }
            }
          } else {
            // Si pas de container avec overflow, scroller normalement
            try {
              activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
              });
              lastScrolledIdRef.current = activeId;
            } catch (error) {
              // Si scrollIntoView échoue, ignorer silencieusement
            }
          }
        }
      });
    }, 150); // Petit délai pour éviter les conflits

    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeId, headings.length, isInSocialPreview]);

  // Return conditionnel APRÈS tous les hooks
  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    // Ne rien faire si on est dans un contexte de partage social
    if (isInSocialPreview) {
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      try {
        // Utiliser scrollIntoView avec le scroll margin défini dans le CSS
        element.scrollIntoView({
          behavior: isInSocialPreview ? 'auto' : 'smooth',
          block: 'start',
        });
        
        // Mettre à jour l'URL sans recharger la page
        if (!isInSocialPreview) {
          window.history.pushState(null, '', `#${id}`);
        }
      } catch (error) {
        // Ignorer silencieusement si le scroll n'est pas disponible
      }
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm ${
        isInSocialPreview ? '' : 'sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto'
      }`}
      style={isInSocialPreview ? { animation: 'none' } : undefined}
    >
      <div className="flex items-center gap-2 mb-4">
        <ListBulletIcon className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-gray-900 dark:text-white">
          Table des matières
        </h3>
      </div>

      {headings.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Chargement...
        </p>
      ) : (
        <nav aria-label="Table des matières">
          <ul className="space-y-1 text-sm">
            {headings.map((heading) => (
              <li key={heading.id} id={`toc-${heading.id}`}>
                {isInSocialPreview ? (
                  // Version statique pour les prévisualisations sociales
                  <a
                    href={`#${heading.id}`}
                    className={`
                      block w-full text-left py-2 px-3 rounded-lg relative
                      ${heading.level === 3 ? 'pl-6 text-sm' : 'font-medium'}
                      text-gray-700 dark:text-gray-300
                    `}
                  >
                    {heading.text}
                  </a>
                ) : (
                  // Version interactive pour les utilisateurs normaux
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={`
                      block w-full text-left transition-all duration-200 py-2 px-3 rounded-lg relative
                      ${heading.level === 3 ? 'pl-6 text-sm' : 'font-medium'}
                      ${
                        activeId === heading.id
                          ? 'bg-primary text-white shadow-md transform scale-[1.02]'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    {activeId === heading.id && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full animate-pulse" />
                    )}
                    {heading.text}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

