/**
 * ClubImage Component
 * 
 * Composant client pour afficher les images de clubs avec fallback
 * 
 * @version 1.0
 * @date 2025-11-05 05:50
 */

'use client';

import { useState } from 'react';

interface ClubImageProps {
  src?: string;
  alt: string;
  clubName: string;
  clubCity: string;
  className?: string;
}

export function ClubImage({ src, alt, clubName, clubCity, className = '' }: ClubImageProps) {
  const [imageError, setImageError] = useState(false);

  // Générer un SVG de fallback élégant
  const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23f3f4f6" width="400" height="225"/%3E%3Ctext x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="18" font-weight="bold"%3E${encodeURIComponent(clubName)}%3C/text%3E%3Ctext x="50%25" y="60%25" dominant-baseline="middle" text-anchor="middle" fill="%23d1d5db" font-family="sans-serif" font-size="14"%3E${encodeURIComponent(clubCity)}%3C/text%3E%3C/svg%3E`;

  if (!src || imageError) {
    return (
      <img
        src={fallbackSvg}
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}

