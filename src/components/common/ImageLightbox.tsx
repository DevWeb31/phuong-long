/**
 * ImageLightbox Component
 * 
 * Modal plein écran pour zoomer sur les images avec navigation
 * 
 * @version 1.0
 * @date 2025-11-08
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  images: Array<{
    image_url: string;
    alt_text?: string | null;
    caption?: string | null;
  }>;
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({ isOpen, images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsLoading(true);
  }, [initialIndex, isOpen]);

  // Reset zoom et position quand on change d'image
  useEffect(() => {
    setIsZoomed(false);
    setDragPosition({ x: 0, y: 0 });
    setIsLoading(true);
  }, [currentIndex]);

  // Navigation clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  // Empêcher le scroll du body quand la lightbox est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
    setDragPosition({ x: 0, y: 0 });
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
    setDragPosition({ x: 0, y: 0 });
  }, [images.length]);

  // Gestion du drag pour déplacer l'image zoomée
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - dragPosition.x, y: e.clientY - dragPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomed) return;
    setDragPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isZoomed || e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    setIsDragging(true);
    setDragStart({ x: touch.clientX - dragPosition.x, y: touch.clientY - dragPosition.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isZoomed || e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    setDragPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 md:p-6">
        <div className="flex items-center justify-between">
          {/* Compteur */}
          <div className="text-white font-semibold text-sm md:text-base">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Zoom toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isZoomed) {
                  setIsZoomed(false);
                  setDragPosition({ x: 0, y: 0 });
                } else {
                  setIsZoomed(true);
                }
              }}
              className="p-2 md:p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
              title={isZoomed ? "Dézoomer" : "Zoomer et déplacer"}
            >
              {isZoomed ? (
                <ZoomOut className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <ZoomIn className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>

            {/* Fermer */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 md:p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
              title="Fermer (ESC)"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation gauche */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 backdrop-blur-sm"
          title="Précédent"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      )}

      {/* Image principale */}
      <div 
        className={`relative w-full h-full flex items-center justify-center p-4 md:p-8 ${
          isZoomed 
            ? isDragging ? 'cursor-grabbing' : 'cursor-grab'
            : 'cursor-zoom-in'
        } ${!isDragging && !isZoomed ? 'transition-transform duration-300' : ''}`}
        style={isZoomed ? {
          transform: `scale(2.5) translate(${dragPosition.x}px, ${dragPosition.y}px)`,
          willChange: isDragging ? 'transform' : 'auto',
        } : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (!isZoomed && !isDragging) {
            setIsZoomed(true);
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative max-w-7xl max-h-full w-full h-full">
          <Image
            src={currentImage.image_url}
            alt={currentImage.alt_text || `Image ${currentIndex + 1}`}
            fill
            className="object-contain select-none pointer-events-none"
            priority
            unoptimized
            onLoad={() => setIsLoading(false)}
            draggable={false}
          />
        </div>
      </div>

      {/* Navigation droite */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 backdrop-blur-sm"
          title="Suivant"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      )}

      {/* Footer avec légende et thumbnails */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
        {/* Légende */}
        {currentImage.caption && (
          <div className="text-center mb-4">
            <p className="text-white text-sm md:text-base font-medium">
              {currentImage.caption}
            </p>
          </div>
        )}

        {/* Thumbnails navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide max-w-4xl mx-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setIsZoomed(false);
                }}
                className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary/50 scale-110'
                    : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={image.image_url}
                  alt={image.alt_text || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}

        {/* Hint clavier */}
        <div className="text-center mt-3 text-xs text-white/60 hidden md:block">
          Flèches gauche/droite pour naviguer | Cliquez pour zoomer | Déplacez l'image zoomée | ESC pour fermer
        </div>
      </div>

      {/* Indicateur de chargement (uniquement si image en cours de chargement) */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Bouton dézoom quand zoomé */}
      {isZoomed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(false);
            setDragPosition({ x: 0, y: 0 });
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white px-6 py-3 rounded-full text-sm font-medium transition-all hover:scale-105 backdrop-blur-sm z-30 flex items-center gap-2"
        >
          <ZoomOut className="w-4 h-4" />
          Double-cliquez ou cliquez ici pour dézoomer
        </button>
      )}

      {/* Hint de drag quand zoomé et en train de déplacer */}
      {isZoomed && !isLoading && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xs md:text-sm animate-fade-in pointer-events-none">
          {isDragging ? 'Déplacement en cours...' : 'Déplacez avec la souris ou le doigt'}
        </div>
      )}
    </div>
  );
}


