/**
 * BlogReadingProgress - Barre de progression de lecture
 * 
 * Indique visuellement la progression de lecture dans l'article
 * 
 * @version 1.0
 * @date 2025-11-11
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * Barre de progression fixée en haut de la page
 * Excellent pour l'UX sur les articles longs
 */
export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      
      setProgress(Math.min(100, Math.max(0, progress)));
    };

    // Calculer au chargement
    calculateProgress();

    // Écouter le scroll
    window.addEventListener('scroll', calculateProgress, { passive: true });
    window.addEventListener('resize', calculateProgress);

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-50 transition-all duration-150"
      style={{ 
        width: `${progress}%`,
        opacity: progress > 0 ? 1 : 0
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progression de lecture"
    />
  );
}

