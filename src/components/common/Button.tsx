/**
 * Button Component
 * 
 * Composant bouton réutilisable avec variants et tailles
 * 
 * @version 1.0
 * @date 2025-11-04 20:40
 */

import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-primary via-primary-dark to-primary text-white hover:shadow-xl hover:shadow-primary/30 hover:scale-105 focus:ring-primary/50 bg-[length:200%] hover:bg-[position:100%] transition-all duration-500',
  secondary: 'bg-gradient-to-r from-secondary via-secondary-dark to-secondary text-gray-900 dark:text-gray-100 text-gray-100 hover:shadow-xl hover:shadow-secondary/30 hover:scale-105 focus:ring-secondary/50 bg-[length:200%] hover:bg-[position:100%] transition-all duration-500',
  ghost: 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all duration-300',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-xl hover:shadow-red-500/30 hover:scale-105 focus:ring-red-500/50 transition-all duration-500',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold',
          'focus:outline-none focus:ring-4 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'active:scale-95',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          isLoading && 'cursor-wait',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Chargement...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

export type { ButtonProps };

