/**
 * EventsHeroContent Component
 * 
 * Client component for events page hero with parallax
 * 
 * @version 2.0 - Modern Design
 * @date 2025-11-06
 */

'use client';

import { useParallax, getParallaxOffset } from '@/lib/hooks/useParallax';
import { Calendar } from 'lucide-react';

interface EventsHeroContentProps {
  totalEvents: number;
}

export function EventsHeroContent({ 
  totalEvents
}: EventsHeroContentProps) {
  const scrollY = useParallax();
  
  const badgeOffset = getParallaxOffset(scrollY, 0.12);
  const contentOffset = getParallaxOffset(scrollY, 0.08);

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div 
        className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full shadow-xl shadow-black/10 animate-fade-in"
        style={{
          transform: `translateY(${badgeOffset}px)`,
          willChange: 'transform',
        }}
      >
        <Calendar className="w-4 h-4 text-accent" />
        <span className="font-semibold text-sm tracking-wide">{totalEvents} événements à venir</span>
      </div>

      <div
        style={{
          transform: `translateY(${contentOffset}px)`,
          willChange: 'transform',
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up tracking-tight leading-[1.1]">
          <span className="text-white">Événements & </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent">Compétitions</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 leading-relaxed animate-fade-in max-w-2xl mx-auto">
          Participez aux stages, compétitions et démonstrations dans toute la France.
        </p>
      </div>
    </div>
  );
}
