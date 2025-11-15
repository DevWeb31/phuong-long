/**
 * ShopHeroContent Component
 * 
 * Client component for shop page hero with parallax
 * 
 * @version 2.0 - Modern Design
 * @date 2025-11-06
 */

'use client';

import { useParallax, getParallaxOffset } from '@/lib/hooks/useParallax';
import { ShoppingCart } from 'lucide-react';

interface ShopHeroContentProps {
  totalProducts: number;
}

export function ShopHeroContent({ totalProducts }: ShopHeroContentProps) {
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
        <ShoppingCart className="w-4 h-4 text-accent" />
        <span className="font-semibold text-sm tracking-wide">Boutique officielle - {totalProducts} produits</span>
      </div>

      <div
        style={{
          transform: `translateY(${contentOffset}px)`,
          willChange: 'transform',
        }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up tracking-tight leading-[1.1]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent">Boutique</span>
          <span className="text-white"> Vo Dao</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 leading-relaxed animate-fade-in max-w-2xl mx-auto">
          Équipez-vous pour votre pratique du Vo Dao avec nos produits de qualité professionnelle.
        </p>
      </div>
    </div>
  );
}
