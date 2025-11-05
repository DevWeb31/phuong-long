/**
 * BlogHeroContent Component
 * 
 * Client component for blog page hero with parallax
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useParallax, getParallaxOffset } from '@/lib/hooks/useParallax';

interface BlogHeroContentProps {
  totalPosts: number;
}

export function BlogHeroContent({ totalPosts }: BlogHeroContentProps) {
  const scrollY = useParallax();
  
  const badgeOffset = getParallaxOffset(scrollY, 0.12);
  const contentOffset = getParallaxOffset(scrollY, 0.08);

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div 
        className="inline-flex items-center px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg shadow-black/10 animate-fade-in"
        style={{
          transform: `translateY(${badgeOffset}px)`,
          willChange: 'transform',
        }}
      >
        <span className="text-secondary mr-2 text-xl">📰</span>
        <span className="font-semibold text-sm">{totalPosts} articles publiés</span>
      </div>

      <div
        style={{
          transform: `translateY(${contentOffset}px)`,
          willChange: 'transform',
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 animate-slide-up tracking-tight">
          Blog & <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary">Actualités</span>
        </h1>

        <p className="text-xl md:text-2xl text-white/90 leading-relaxed animate-fade-in max-w-3xl mx-auto">
          Articles, conseils techniques, actualités de nos clubs et événements. 
          Plongez dans l'univers des arts martiaux vietnamiens.
        </p>
      </div>
    </div>
  );
}

