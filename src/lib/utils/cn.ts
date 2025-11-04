import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to resolve conflicts
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * cn('px-4 py-2', condition && 'bg-blue-500', 'bg-red-500')
 * // If condition is true: 'px-4 py-2 bg-blue-500'
 * // Tailwind-merge resolves bg-red-500 being overridden by bg-blue-500
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

