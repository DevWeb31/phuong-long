/**
 * ScrollReveal Component
 * 
 * Composant pour animer les éléments au scroll avec Intersection Observer
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  distance?: number;
}

export function ScrollReveal({ 
  children, 
  delay = 0, 
  className = '',
  direction = 'up',
  distance = 30 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsRevealed(true);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [delay]);

  const directionStyles = {
    up: { transform: `translateY(${distance}px)`, opacity: 0 },
    down: { transform: `translateY(-${distance}px)`, opacity: 0 },
    left: { transform: `translateX(${distance}px)`, opacity: 0 },
    right: { transform: `translateX(-${distance}px)`, opacity: 0 },
    fade: { opacity: 0 },
  };

  const revealedStyles = {
    transform: 'translate(0, 0)',
    opacity: 1,
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        ...(isRevealed ? revealedStyles : directionStyles[direction]),
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

