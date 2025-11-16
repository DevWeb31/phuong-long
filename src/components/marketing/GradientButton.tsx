/**
 * GradientButton Component
 * 
 * Bouton avec gradient rouge-or et effets hover
 * Client Component pour gérer les interactions
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import Link from 'next/link';
import { ComponentProps } from 'react';

interface GradientButtonProps extends ComponentProps<typeof Link> {
  children: React.ReactNode;
}

export function GradientButton({ children, className = '', ...props }: GradientButtonProps) {
  return (
    <Link
      {...props}
      className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-2xl min-w-[240px] overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, hsl(0, 84%, 48%) 0%, hsl(0, 84%, 38%) 50%, hsl(43, 96%, 56%) 100%)',
        backgroundSize: '200% 200%',
        boxShadow: '0 20px 40px rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundPosition = '100% 0%';
        e.currentTarget.style.boxShadow = '0 25px 50px rgba(220, 38, 38, 0.5), 0 0 30px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2) inset';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundPosition = '0% 0%';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
      }}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </Link>
  );
}

