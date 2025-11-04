/**
 * Container Component
 * 
 * Conteneur responsive pour centrer le contenu
 * 
 * @version 1.0
 * @date 2025-11-04 20:40
 */

import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ContainerProps extends ComponentProps<'div'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}

const sizeStyles = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container(
    { size = 'lg', padding = true, children, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          sizeStyles[size],
          padding && 'px-4 sm:px-6 lg:px-8',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type { ContainerProps };

