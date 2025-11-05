/**
 * ParallaxSection Component
 * 
 * Wrapper component for parallax effects
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useParallax, getParallaxOffset } from '@/lib/hooks/useParallax';
import { type ReactNode } from 'react';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({ children, speed = 0.5, className = '' }: ParallaxSectionProps) {
  const scrollY = useParallax();
  const offset = getParallaxOffset(scrollY, speed);

  return (
    <div
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

interface ParallaxBackgroundProps {
  children: ReactNode;
}

export function ParallaxBackground({ children }: ParallaxBackgroundProps) {
  const scrollY = useParallax();
  
  // Background moves slower (0.15x - très léger)
  const bgOffset = getParallaxOffset(scrollY, 0.15);
  
  // Glow effects move at different speeds (réduit pour effet subtil)
  const glow1Offset = getParallaxOffset(scrollY, 0.2);
  const glow2Offset = getParallaxOffset(scrollY, 0.1);

  return (
    <>
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          transform: `translateY(${bgOffset}px)`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
      
      {/* Glow effects with parallax */}
      <div
        className="absolute top-1/4 -left-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"
        style={{
          transform: `translateY(${glow1Offset}px)`,
          willChange: 'transform',
        }}
      />
      <div
        className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"
        style={{
          transform: `translateY(${glow2Offset}px)`,
          willChange: 'transform',
        }}
      />
    </>
  );
}

