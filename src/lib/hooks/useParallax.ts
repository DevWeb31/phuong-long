/**
 * useParallax Hook
 * 
 * Custom hook for parallax scroll effects
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useEffect, useState } from 'react';

export function useParallax() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollY;
}

/**
 * Calculate parallax offset based on scroll position and speed
 * @param scrollY Current scroll position
 * @param speed Parallax speed multiplier (0.5 = half speed, 2 = double speed)
 */
export function getParallaxOffset(scrollY: number, speed: number = 0.5): number {
  return scrollY * speed;
}

