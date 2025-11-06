/**
 * Card Component
 * 
 * Composant carte réutilisable pour afficher du contenu
 * 
 * @version 1.0
 * @date 2025-11-04 20:40
 */

import { ComponentProps, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends ComponentProps<'div'> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const variantStyles = {
  default: 'bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50',
  bordered: 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-md',
  elevated: 'bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/20 dark:shadow-slate-950/20',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      children,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden',
          variantStyles[variant],
          paddingStyles[padding],
          hoverable && 'transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 hover:-translate-y-2 hover:scale-[1.03] cursor-pointer group',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

interface CardHeaderProps extends ComponentProps<'div'> {}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends ComponentProps<'h3'> {}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-xl font-semibold text-slate-900 dark:text-slate-100', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends ComponentProps<'p'> {}

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-slate-600 dark:text-slate-400', className)} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends ComponentProps<'div'> {}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends ComponentProps<'div'> {}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-4 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

export type { CardProps };

