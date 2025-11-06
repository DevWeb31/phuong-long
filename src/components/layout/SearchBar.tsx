/**
 * SearchBar Component
 * 
 * Barre de recherche intégrée dans le header
 * Avec animation et raccourcis clavier
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Raccourci clavier Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input quand ouvert
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
      className={cn(
        'group hidden md:flex items-center gap-2 px-3 py-1.5',
        'bg-gray-50 dark:bg-gray-900 bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg',
        'border border-gray-200 dark:border-gray-800 border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        'transition-all duration-200'
      )}
        aria-label="Rechercher"
      >
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        <span className="text-sm dark:text-gray-500">Rechercher...</span>
        <div className="flex items-center gap-0.5 ml-2">
          <kbd className="px-1.5 py-0.5 text-xs font-semibold dark:text-gray-500 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded">
            <Command className="w-3 h-3" />
          </kbd>
          <kbd className="px-1.5 py-0.5 text-xs font-semibold dark:text-gray-500 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded">
            K
          </kbd>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-0 top-20 z-50 px-4 animate-in slide-in-from-top-4 duration-300">
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSearch}
            className={cn(
              'relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
              'border border-gray-200 dark:border-gray-800 border-gray-700 rounded-2xl shadow-2xl',
              'overflow-hidden'
            )}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b dark:border-gray-800">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des clubs, événements, articles..."
                className="flex-1 bg-transparent text-base dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 dark:text-gray-400" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold dark:text-gray-500 bg-gray-100 dark:bg-gray-800 border dark:border-gray-800 rounded">
                ESC
              </kbd>
            </div>

            {/* Quick Links */}
            <div className="p-3 bg-gradient-to-b from-gray-50/50 dark:from-gray-800/50 to-white dark:to-gray-900">
              <p className="text-xs font-medium dark:text-gray-500 mb-2 px-2">Recherches populaires</p>
              <div className="flex flex-wrap gap-2">
                {['Marseille', 'Cours adultes', 'Compétitions', 'Équipements'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      router.push(`/search?q=${encodeURIComponent(term)}`);
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 text-sm dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 border dark:border-gray-800 rounded-lg transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

