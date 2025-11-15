/**
 * BlogGrid - Grille d'articles de blog
 * 
 * Affiche une grille responsive d'articles avec gestion du loading
 * 
 * @version 1.0
 * @date 2025-11-11
 */

import { BlogCard } from './BlogCard';
import type { BlogPost } from '@/lib/types/database';

interface BlogGridProps {
  posts: (BlogPost & { tags?: string[] })[];
  emptyMessage?: string;
}

/**
 * Grille responsive d'articles de blog
 */
export function BlogGrid({ 
  posts, 
  emptyMessage = 'Aucun article disponible pour le moment.' 
}: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
          <svg 
            className="w-10 h-10 text-gray-400 dark:text-gray-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" 
            />
          </svg>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          {emptyMessage}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Revenez bientôt pour découvrir nos nouveaux contenus !
        </p>
      </div>
    );
  }

  // Pattern ordonné avec différentes tailles
  // Alterne entre différentes hauteurs pour créer un effet visuel varié mais organisé
  const getVariant = (index: number): 'default' | 'tall' | 'short' => {
    // Pattern qui alterne les hauteurs de manière équilibrée
    // 0 = default, 1 = tall, 2 = short
    const pattern = [0, 1, 0, 2, 1, 0, 2, 1, 0]; // Pattern de 9 éléments
    const patternIndex = index % pattern.length;
    const variantIndex = pattern[patternIndex];
    
    switch (variantIndex) {
      case 1:
        return 'tall';
      case 2:
        return 'short';
      default:
        return 'default';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-max">
      {posts.map((post, index) => {
        const variant = getVariant(index);
        return (
          <BlogCard 
            key={post.id} 
            post={post}
            variant={variant}
            priority={index < 3} // Priorité pour les 3 premiers (optimisation LCP)
          />
        );
      })}
    </div>
  );
}

