/**
 * Events Carousel Component
 * 
 * Carrousel horizontal d'événements avec navigation
 * - Desktop: 3 vignettes visibles
 * - Tablette: 2 vignettes visibles
 * - Mobile: 1 vignette visible
 * - Scroll fluide sans barre de défilement visible
 * 
 * @version 1.0
 * @date 2025-11-11
 */

'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '@/components/common';

interface EventsCarouselProps {
  children: ReactNode;
  title?: string;
  count?: number;
}

export function EventsCarousel({ children, title, count }: EventsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Vérifier si on peut scroller
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [children]);

  // Scroll vers la gauche/droite
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector('[data-event-card]')?.clientWidth || 0;
    const gap = 24; // gap-6 = 24px
    const scrollAmount = cardWidth + gap;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;

    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2; // Vitesse de scroll
    container.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const container = scrollContainerRef.current;
      if (container) {
        container.style.cursor = 'grab';
      }
    }
  };

  return (
    <ScrollReveal direction="up" delay={0} className="mb-12 last:mb-0">
      {/* Header avec titre et navigation */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <ScrollReveal direction="left" delay={0}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
              {count !== undefined && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-gray-600 dark:text-gray-400 font-medium">
                  {count}
                </span>
              )}
            </div>
          </ScrollReveal>

          {/* Boutons de navigation */}
          <ScrollReveal direction="right" delay={50}>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full border-2 transition-all duration-200 ${
                  canScrollLeft
                    ? 'border-primary text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-md'
                    : 'border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
                }`}
                aria-label="Défiler vers la gauche"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-full border-2 transition-all duration-200 ${
                  canScrollRight
                    ? 'border-primary text-primary hover:bg-primary hover:text-white shadow-sm hover:shadow-md'
                    : 'border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
                }`}
                aria-label="Défiler vers la droite"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      )}

      {/* Container avec scroll horizontal */}
      <div className="relative group">
        {/* Gradient fade gauche */}
        <div
          className={`hidden md:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradient fade droite */}
        <div
          className={`hidden md:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth cursor-grab active:cursor-grabbing pb-2"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>

        {/* Indicateur de scroll mobile (points) */}
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-4">
          {canScrollLeft && (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          )}
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          {canScrollRight && (
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

