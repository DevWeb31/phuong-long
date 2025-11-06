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
      {/* Trust Badge */}
      <div 
        className="flex justify-center mb-8 animate-fade-in"
        style={{
          transform: `translateY(${badgesOffset}px)`,
          willChange: 'transform',
        }}
      >
        <div className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full shadow-xl shadow-black/10">
          <span className="text-accent mr-2.5">🎯</span>
          <span className="font-semibold text-sm tracking-wide">Cours d'essai gratuit</span>
        </div>
      </div>
      
      <div
        style={{
          transform: `translateY(${contentOffset}px)`,
          willChange: 'transform',
        }}
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up tracking-tight leading-[1.1]">
          <span className="text-white">Phuong Long</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent mt-3">
            Vo Dao
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/95 mb-6 animate-slide-up font-medium max-w-2xl mx-auto leading-relaxed">
          L'art martial vietnamien traditionnel
        </p>
        
        <p className="text-base md:text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
          Découvrez une discipline complète alliant <span className="text-accent font-semibold">techniques de combat</span>, 
          <span className="text-accent font-semibold"> développement personnel</span> et 
          <span className="text-accent font-semibold"> valeurs traditionnelles</span>. 
        </p>
        
        {/* Value Propositions */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💪</div>
            <h3 className="text-white font-semibold text-base mb-2">Force & Agilité</h3>
            <p className="text-white/75 text-sm leading-relaxed">Développez votre condition physique</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🧠</div>
            <h3 className="text-white font-semibold text-base mb-2">Esprit & Discipline</h3>
            <p className="text-white/75 text-sm leading-relaxed">Cultivez concentration et persévérance</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🤝</div>
            <h3 className="text-white font-semibold text-base mb-2">Communauté</h3>
            <p className="text-white/75 text-sm leading-relaxed">Rejoignez une famille passionnée</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-scale-in">
          <Link href="/clubs">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-2xl shadow-black/20 hover:shadow-white/30 min-w-[220px] font-semibold text-base py-6">
              🥋 Trouver un Club
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" className="bg-accent text-slate-900 hover:bg-accent/90 border-2 border-accent/50 min-w-[220px] font-semibold text-base py-6 shadow-2xl shadow-black/20 hover:shadow-accent/30">
              ✨ Essai Gratuit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats - Social Proof */}
      <div 
        className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        style={{
          transform: `translateY(${statsOffset}px)`,
          willChange: 'transform',
        }}
      >
        <div className="text-center group">
          <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">40+</div>
          <div className="text-xs text-white/70 uppercase tracking-widest font-medium">Ans d'expérience</div>
        </div>
        <div className="text-center group">
          <div className="text-4xl lg:text-5xl font-bold text-accent mb-2 group-hover:scale-105 transition-transform duration-300">5</div>
          <div className="text-xs text-white/70 uppercase tracking-widest font-medium">Clubs actifs</div>
        </div>
        <div className="text-center group">
          <div className="text-4xl lg:text-5xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">500+</div>
          <div className="text-xs text-white/70 uppercase tracking-widest font-medium">Pratiquants</div>
        </div>
      </div>
    </div>
  );
}

