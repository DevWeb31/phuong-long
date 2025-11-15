/**
 * ThemeToggle Component
 * 
 * Bouton élégant pour basculer entre light/dark mode
 * Animation soleil/lune fluide
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-lg transition-all duration-300',
        'hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
      aria-label={`Basculer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
    >
      {/* Container avec rotation */}
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun
          className={cn(
            'absolute inset-0 w-5 h-5 text-gold transition-all duration-500',
            theme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          )}
        />
        
        {/* Moon Icon */}
        <Moon
          className={cn(
            'absolute inset-0 w-5 h-5 text-primary transition-all duration-500',
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
    </button>
  );
}

