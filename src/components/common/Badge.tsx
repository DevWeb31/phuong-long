/**
 * Badge Component
 * 
 * Badge pour afficher des statuts, tags, ou labels
 * 
 * @version 1.0
 * @date 2025-11-04 20:40
 */

import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends ComponentProps<'span'> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(
    { variant = 'default', size = 'md', children, className, ...props },
    ref
  ) {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

export type { BadgeProps };

