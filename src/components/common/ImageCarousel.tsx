/**
 * ImageCarousel Component
 * 
 * Carousel d'images responsive avec navigation et thumbnails
 * 
 * @version 1.0
 * @date 2025-11-08
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

interface ImageCarouselProps {
  images: Array<{
    image_url: string;
    alt_text?: string | null;
    caption?: string | null;
  }>;
  className?: string;
}

export function ImageCarousel({ images, className = '' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToImage = (index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  // Swipe gesture pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      goToNext();
    }
    if (touchStart - touchEnd < -75) {
      // Swipe right
      goToPrevious();
    }
  };

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) return; // Ne pas interférer avec la lightbox

      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Enter':
        case ' ':
          openLightbox();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, lightboxOpen]);

  return (
    <div className={`relative ${className}`}>
      {/* Image principale avec swipe support */}
      <div 
        className="relative w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div onClick={openLightbox} className="relative w-full h-full cursor-pointer">
          <Image
            src={currentImage.image_url}
            alt={currentImage.alt_text || `Image ${currentIndex + 1}`}
            fill
            className={`object-contain transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
            priority={currentIndex === 0}
            unoptimized
          />
        </div>

        {/* Bouton Zoom - toujours visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openLightbox();
          }}
          className="absolute top-3 md:top-4 right-3 md:right-4 p-2 md:p-2.5 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200 dark:border-gray-700 z-10"
          title="Voir en plein écran"
        >
          <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Hint swipe sur mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium md:hidden opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
            Glissez pour naviguer
          </div>
        )}

        {/* Navigation - toujours visible avec meilleur design */}
        {images.length > 1 && (
          <>
            {/* Bouton Précédent */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              disabled={isTransitioning}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 md:p-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 z-10"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Bouton Suivant */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              disabled={isTransitioning}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 md:p-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700 z-10"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Indicateur de position - design amélioré */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 z-10">
              <span className="text-sm font-bold text-primary">{currentIndex + 1}</span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{images.length}</span>
            </div>

            {/* Indicateurs à points (dots) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(index);
                  }}
                  className={`transition-all ${
                    index === currentIndex
                      ? 'w-8 md:w-10 h-2 bg-primary shadow-lg'
                      : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                  } rounded-full`}
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Légende avec design amélioré */}
        {currentImage.caption && (
          <div className="absolute bottom-16 left-0 right-0 px-4 z-10">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
              <p className="text-sm md:text-base text-gray-900 dark:text-gray-100 text-center font-medium leading-relaxed">
                {currentImage.caption}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails améliorés */}
      {images.length > 1 && (
        <div className="mt-4 md:mt-6">
          <div className="flex items-center justify-center mb-2">
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
              Cliquez sur une miniature pour y accéder directement
            </p>
          </div>
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToImage(index);
                }}
                disabled={isTransitioning}
                className={`relative flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'border-3 border-primary ring-4 ring-primary/30 scale-105 shadow-xl'
                    : 'border-2 border-gray-300 dark:border-gray-700 hover:border-primary/50 opacity-70 hover:opacity-100 hover:scale-105 shadow-md'
                }`}
                title={`Image ${index + 1}${image.caption ? ` - ${image.caption}` : ''}`}
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Numéro sur thumbnail */}
                <div className="absolute top-1 left-1 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
                {/* Checkmark sur image active */}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hints d'utilisation */}
      {images.length > 1 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 flex-wrap justify-center">
            <span className="hidden md:inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <ArrowRight className="w-3 h-3" />
              <span>pour naviguer</span>
            </span>
            <span className="md:hidden">Glissez pour naviguer</span>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              <span>Cliquez pour agrandir</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
            <span className="hidden sm:inline">{images.length} photo{images.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Lightbox pour zoom plein écran */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={images}
        initialIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

