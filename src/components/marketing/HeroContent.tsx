/**
 * HeroContent Component
 * 
 * Client component for homepage hero with parallax
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/common';
import { useParallax, getParallaxOffset } from '@/lib/hooks/useParallax';

export function HeroContent() {
  const scrollY = useParallax();
  
  // Content moves slower for depth effect (réduit pour effet léger)
  const contentOffset = getParallaxOffset(scrollY, 0.08);
  const badgesOffset = getParallaxOffset(scrollY, 0.12);
  const statsOffset = getParallaxOffset(scrollY, 0.05);

  return (
    <div className="max-w-5xl mx-auto text-center">
      {/* Trust Badges */}
      <div 
        className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in"
        style={{
          transform: `translateY(${badgesOffset}px)`,
          willChange: 'transform',
        }}
      >
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg">
          <span className="text-secondary mr-2 text-lg">⭐</span>
          <span className="font-semibold text-xs">40 ans d'expérience</span>
        </div>
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg">
          <span className="text-secondary mr-2 text-lg">🥋</span>
          <span className="font-semibold text-xs">Enseignement traditionnel</span>
        </div>
        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg">
          <span className="text-secondary mr-2 text-lg">🎯</span>
          <span className="font-semibold text-xs">Cours d'essai gratuit</span>
        </div>
      </div>
      
      <div
        style={{
          transform: `translateY(${contentOffset}px)`,
          willChange: 'transform',
        }}
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-8 animate-slide-up tracking-tight leading-tight">
          Phuong Long
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary mt-4 animate-shimmer">
            Vo Dao
          </span>
        </h1>
        
        <p className="text-2xl md:text-3xl lg:text-4xl text-white/95 mb-8 animate-slide-up font-medium tracking-wide">
          L'art martial vietnamien traditionnel
        </p>
        
        <p className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
          Découvrez une discipline complète alliant <span className="text-secondary-light font-bold">techniques de combat</span>, 
          <span className="text-secondary-light font-bold"> développement personnel</span> et 
          <span className="text-secondary-light font-bold"> valeurs traditionnelles</span>. 
        </p>
        
        {/* Value Propositions */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-white font-bold text-lg mb-2">Force & Agilité</h3>
            <p className="text-white/70 text-sm">Développez votre condition physique</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-white font-bold text-lg mb-2">Esprit & Discipline</h3>
            <p className="text-white/70 text-sm">Cultivez concentration et persévérance</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-white font-bold text-lg mb-2">Communauté</h3>
            <p className="text-white/70 text-sm">Rejoignez une famille passionnée</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-scale-in">
          <Link href="/clubs">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-50 shadow-2xl shadow-black/20 hover:shadow-white/40 min-w-[240px] text-lg py-4 px-8">
              🥋 Trouver un Club
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="min-w-[240px] text-lg py-4 px-8 shadow-2xl shadow-black/20">
              ✨ Essai Gratuit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats - Social Proof */}
      <div 
        className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-8"
        style={{
          transform: `translateY(${statsOffset}px)`,
          willChange: 'transform',
        }}
      >
        <div className="text-center group">
          <div className="text-5xl lg:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">40+</div>
          <div className="text-xs text-white/70 uppercase tracking-widest font-semibold">Ans d'expérience</div>
        </div>
        <div className="text-center group">
          <div className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary mb-2 group-hover:scale-110 transition-transform duration-300">5</div>
          <div className="text-xs text-white/70 uppercase tracking-widest font-semibold">Clubs actifs</div>
        </div>
        <div className="text-center group">
          <div className="text-5xl lg:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
          <div className="text-xs text-white/70 uppercase tracking-widest font-semibold">Pratiquants</div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="animate-bounce mt-8">
        <div className="flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors cursor-pointer">
          <span className="text-sm font-medium uppercase tracking-wider">Découvrir</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

