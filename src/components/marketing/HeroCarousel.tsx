/**
 * HeroCarousel Component
 * 
 * Carousel élégant avec vidéo YouTube en fond pour la page d'accueil
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container } from '@/components/common';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  youtube_video_id?: string | null;
  image_url?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
  overlay_opacity: number;
  active: boolean;
  display_order: number;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlayInterval?: number; // en millisecondes
}

export function HeroCarousel({ slides, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Filtrer uniquement les slides actifs et les trier par display_order
  const activeSlides = slides
    .filter(slide => slide.active)
    .sort((a, b) => a.display_order - b.display_order);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, activeSlides.length, autoPlayInterval]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false); // Pause auto-play lors d'une navigation manuelle
    // Reprendre après 10 secondes
    setTimeout(() => setIsPlaying(true), 10000);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % activeSlides.length);
  }, [currentIndex, activeSlides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + activeSlides.length) % activeSlides.length);
  }, [currentIndex, activeSlides.length, goToSlide]);

  // Si aucun slide actif, ne rien afficher
  if (activeSlides.length === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex];
  
  // Si aucun slide actif, ne rien afficher
  if (!currentSlide) {
    return null;
  }

  // Extraire l'ID de la vidéo YouTube (gère différents formats d'URL)
  const getYouTubeEmbedUrl = (videoId: string): string => {
    // Si c'est déjà un ID simple
    if (!videoId.includes('youtube.com') && !videoId.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
    }
    
    // Extraire l'ID depuis une URL complète
    let id = videoId;
    if (videoId.includes('youtube.com/watch?v=')) {
      id = videoId.split('v=')[1]?.split('&')[0] || videoId;
    } else if (videoId.includes('youtu.be/')) {
      id = videoId.split('youtu.be/')[1]?.split('?')[0] || videoId;
    } else if (videoId.includes('youtube.com/embed/')) {
      id = videoId.split('embed/')[1]?.split('?')[0] || videoId;
    }
    
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
  };

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Vidéo YouTube ou image de fond */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {currentSlide.youtube_video_id ? (
          <>
            {currentSlide.image_url && (
              <div className="absolute inset-0 w-full h-full md:hidden">
                <img
                  src={currentSlide.image_url}
                  alt={currentSlide.title || 'Illustration du slide'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className={`absolute inset-0 w-full h-full overflow-hidden ${currentSlide.image_url ? 'hidden md:block' : ''}`}>
              <iframe
                src={getYouTubeEmbedUrl(currentSlide.youtube_video_id)}
                className="absolute top-1/2 left-1/2 w-[177.78vh] h-[100vw] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: '100vw',
                  height: '56.25vw',
                  minHeight: '100%',
                  minWidth: '177.78%',
                }}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`Hero video ${currentIndex + 1}`}
              />
            </div>
          </>
        ) : currentSlide.image_url ? (
          <img
            src={currentSlide.image_url}
            alt={currentSlide.title || 'Illustration du slide'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      {/* Overlay avec opacité configurable */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${currentSlide.overlay_opacity})`,
        }}
      />

      {/* Contenu du slide */}
      <Container className="relative z-10 h-full flex items-center">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge/Subtitle */}
          {currentSlide.subtitle && (
            <div className="mb-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full shadow-xl">
                <Play className="w-4 h-4" />
                <span className="font-semibold text-sm tracking-wide">{currentSlide.subtitle}</span>
              </div>
            </div>
          )}

          {/* Titre */}
          {currentSlide.title && (
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up tracking-tight leading-[1.1]">
              {currentSlide.title}
            </h1>
          )}

          {/* Description */}
          {currentSlide.description && (
            <p className="text-xl md:text-2xl text-white/95 mb-10 animate-slide-up font-medium max-w-3xl mx-auto leading-relaxed">
              {currentSlide.description}
            </p>
          )}

          {/* CTA Button */}
          {currentSlide.cta_text && currentSlide.cta_link && (
            <div className="animate-scale-in">
              <Link href={currentSlide.cta_link}>
                <button
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-2xl min-w-[240px] overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, hsl(0, 84%, 48%) 0%, hsl(0, 84%, 38%) 50%, hsl(43, 96%, 56%) 100%)',
                    backgroundSize: '200% 200%',
                    boxShadow: '0 20px 40px rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundPosition = '100% 0%';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(220, 38, 38, 0.5), 0 0 30px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2) inset';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundPosition = '0% 0%';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
                  }}
                >
                  {/* Effet de brillance au hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  {/* Texte avec effet de glow */}
                  <span className="relative z-10 flex items-center gap-2">
                    {currentSlide.cta_text}
                    <svg 
                      className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </Link>
            </div>
          )}
        </div>
      </Container>

      {/* Navigation - Flèches */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
            aria-label="Slide précédent"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center group"
            aria-label="Slide suivant"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Indicateurs de slides (dots) */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

