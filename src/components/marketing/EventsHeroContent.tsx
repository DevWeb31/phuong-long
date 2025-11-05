/**
 * EventsHeroContent Component
 * 
 * Client component for events page hero with parallax
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/common';
import { useParallax, getParallaxOffset } from '@/lib/hooks/useParallax';

interface EventsHeroContentProps {
  totalEvents: number;
  stagesCount: number;
  competitionsCount: number;
  demonstrationsCount: number;
  seminarsCount: number;
}

export function EventsHeroContent({ 
  totalEvents, 
  stagesCount, 
  competitionsCount, 
  demonstrationsCount,
  seminarsCount 
}: EventsHeroContentProps) {
  const scrollY = useParallax();
  
  const contentOffset = getParallaxOffset(scrollY, 0.15);
  const badgeOffset = getParallaxOffset(scrollY, 0.25);
  const typesOffset = getParallaxOffset(scrollY, 0.2);
  const benefitsOffset = getParallaxOffset(scrollY, 0.1);

  return (
    <div className="text-center text-white max-w-5xl mx-auto">
      <div 
        className="inline-flex items-center px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg shadow-black/10 animate-fade-in"
        style={{
          transform: `translateY(${badgeOffset}px)`,
          willChange: 'transform',
        }}
      >
        <span className="text-secondary mr-2 text-xl">📅</span>
        <span className="font-semibold text-sm">{totalEvents} événements à venir</span>
      </div>
      
      <div
        style={{
          transform: `translateY(${contentOffset}px)`,
          willChange: 'transform',
        }}
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 animate-slide-up tracking-tight">
          Événements & <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary">Compétitions</span>
        </h1>
        
        <p className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-12 animate-fade-in">
          Participez aux stages, compétitions et démonstrations dans toute la France
        </p>
      </div>
      
      {/* Event Types Grid */}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 animate-scale-in"
        style={{
          transform: `translateY(${typesOffset}px)`,
          willChange: 'transform',
        }}
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-6 px-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">🥋</div>
          <p className="text-white font-bold text-lg mb-1">{stagesCount}</p>
          <p className="text-white/70 text-xs uppercase tracking-wider">Stages</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-6 px-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-white font-bold text-lg mb-1">{competitionsCount}</p>
          <p className="text-white/70 text-xs uppercase tracking-wider">Compétitions</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-6 px-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">🎭</div>
          <p className="text-white font-bold text-lg mb-1">{demonstrationsCount}</p>
          <p className="text-white/70 text-xs uppercase tracking-wider">Démonstrations</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl py-6 px-4 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div className="text-3xl mb-2">📚</div>
          <p className="text-white font-bold text-lg mb-1">{seminarsCount}</p>
          <p className="text-white/70 text-xs uppercase tracking-wider">Séminaires</p>
        </div>
      </div>
      
      {/* Benefits */}
      <div 
        className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-fade-in"
        style={{
          transform: `translateY(${benefitsOffset}px)`,
          willChange: 'transform',
        }}
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-white font-bold text-lg mb-2">Progression Technique</h3>
          <p className="text-white/70 text-sm">Améliorez vos compétences</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="text-white font-bold text-lg mb-2">Rencontres</h3>
          <p className="text-white/70 text-sm">Échangez avec d'autres pratiquants</p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
          <div className="text-4xl mb-3">🏅</div>
          <h3 className="text-white font-bold text-lg mb-2">Compétition</h3>
          <p className="text-white/70 text-sm">Testez-vous en combat</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-scale-in">
        <Link href="#events">
          <Button size="lg" className="bg-white text-primary hover:bg-gray-50 shadow-2xl shadow-black/20 hover:shadow-white/40 min-w-[240px] text-lg py-4 px-8">
            📅 Voir les Événements
          </Button>
        </Link>
        <Link href="/contact">
          <Button size="lg" variant="secondary" className="min-w-[240px] text-lg py-4 px-8 shadow-2xl shadow-black/20">
            ✉️ Organiser un Événement
          </Button>
        </Link>
      </div>
      
      {/* Scroll Indicator */}
      <div className="animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors">
          <span className="text-sm font-medium uppercase tracking-wider">Découvrir</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

