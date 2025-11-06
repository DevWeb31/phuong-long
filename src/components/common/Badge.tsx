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
  default: 'bg-gray-100 dark:bg-gray-800 bg-gray-800 text-gray-800 dark:text-gray-200 text-gray-200',
  primary: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
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

