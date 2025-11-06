/**
 * ClubsHeroContent Component
 * 
 * Client component for clubs page hero with parallax
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useParallax, getParallaxOffset } from '@/lib/hooks/useParallax';

export function ClubsHeroContent() {
  const scrollY = useParallax();
  
  const badgeOffset = getParallaxOffset(scrollY, 0.12);
  const contentOffset = getParallaxOffset(scrollY, 0.08);

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div 
        className="inline-flex items-center px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full shadow-xl shadow-black/10 animate-fade-in"
        style={{
          transform: `translateY(${badgeOffset}px)`,
          willChange: 'transform',
        }}
      >
        <span className="text-accent mr-2.5">🥋</span>
        <span className="font-semibold text-sm tracking-wide">5 clubs actifs en France</span>
      </div>

      <div
        style={{
          transform: `translateY(${contentOffset}px)`,
          willChange: 'transform',
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up tracking-tight leading-[1.1]">
          <span className="text-white">Nos </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent">Clubs</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 leading-relaxed animate-fade-in max-w-2xl mx-auto">
          Trouvez le club Phuong Long Vo Dao le plus proche de chez vous et profitez d'un cours d'essai gratuit.
        </p>
      </div>
    </div>
  );
}

