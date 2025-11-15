/**
 * BlogArticleContent - Wrapper pour le contenu d'article avec IDs sur les headings
 * 
 * Injecte automatiquement des IDs sur les H2 et H3 pour permettre
 * le fonctionnement de la table des matières et du scroll spy
 * 
 * @version 1.0
 * @date 2025-11-11
 */

'use client';

import { useEffect, useRef } from 'react';

interface BlogArticleContentProps {
  content: string;
  className?: string;
}

/**
 * Composant qui injecte le contenu HTML et ajoute des IDs aux headings
 * pour la navigation et le scroll spy
 */
export function BlogArticleContent({ content, className = '' }: BlogArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Trouver tous les H2 et H3 et leur ajouter des IDs
    const headings = contentRef.current.querySelectorAll('h2, h3');
    
    headings.forEach((heading, index) => {
      // Générer un ID unique et lisible basé sur le texte
      const text = heading.textContent || '';
      const slug = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9\s-]/g, '') // Garder uniquement lettres, chiffres, espaces et tirets
        .trim()
        .replace(/\s+/g, '-') // Remplacer espaces par tirets
        .substring(0, 50); // Limiter la longueur
      
      // ID unique avec index pour éviter les doublons
      const id = `heading-${index}-${slug}`;
      heading.id = id;
      
      // Ajouter un peu de scroll margin pour le scroll smooth
      if (heading instanceof HTMLElement) {
        heading.style.scrollMarginTop = '100px';
        
        // Rendre le heading cliquable (copier l'ancre)
        heading.style.cursor = 'pointer';
        heading.title = 'Cliquer pour copier le lien de cette section';
        
        heading.addEventListener('click', () => {
          const url = `${window.location.origin}${window.location.pathname}#${id}`;
          navigator.clipboard.writeText(url).then(() => {
            // Visual feedback
            const originalText = heading.innerHTML;
            heading.innerHTML = '🔗 ' + originalText;
            setTimeout(() => {
              heading.innerHTML = originalText;
            }, 1000);
          });
        });
      }
    });

    // Gérer le scroll vers l'ancre si présente dans l'URL
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [content]);

  return (
    <article
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

