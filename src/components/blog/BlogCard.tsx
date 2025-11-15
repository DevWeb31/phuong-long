/**
 * BlogCard - Carte d'aperçu d'article de blog
 * 
 * Composant réutilisable pour afficher un article dans une grille
 * 
 * @version 1.0
 * @date 2025-11-11
 */

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/common';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { BlogPost } from '@/lib/types/database';

interface BlogCardProps {
  post: BlogPost & { tags?: string[] };
  priority?: boolean;
  variant?: 'default' | 'tall' | 'short';
}

/**
 * Carte d'article de blog optimisée pour les performances et le SEO
 */
export function BlogCard({ post, priority = false, variant = 'default' }: BlogCardProps) {
  const publishedDate = new Date(post.published_at || post.created_at);
  const formattedDate = publishedDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Hauteurs d'image selon la variante
  const imageHeight = variant === 'tall' ? 'h-64' : variant === 'short' ? 'h-40' : 'h-52';
  
  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="group block h-full"
    >
      <article className="flex flex-col h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Image de couverture */}
        {post.cover_image_url ? (
          <div className={`relative w-full ${imageHeight} overflow-hidden bg-gray-100 dark:bg-gray-700`}>
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={priority}
            />
            
            {/* Overlay avec gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ) : (
          <div className="relative w-full h-52 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <span className="text-6xl">📝</span>
          </div>
        )}

        {/* Contenu */}
        <div className="flex flex-col flex-1 p-6">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="default" 
                  size="sm"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 2 && (
                <Badge variant="default" size="sm" className="text-xs">
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Titre */}
          <h3 className={`${variant === 'tall' ? 'text-2xl' : variant === 'short' ? 'text-lg' : 'text-xl'} font-bold text-gray-900 dark:text-white mb-3 ${variant === 'tall' ? 'line-clamp-3' : variant === 'short' ? 'line-clamp-2' : 'line-clamp-2'} group-hover:text-primary transition-colors leading-snug`}>
            {post.title}
          </h3>

          {/* Extrait */}
          {post.excerpt && (
            <p className={`text-gray-600 dark:text-gray-400 ${variant === 'tall' ? 'text-base' : 'text-sm'} mb-4 ${variant === 'tall' ? 'line-clamp-5' : variant === 'short' ? 'line-clamp-2' : 'line-clamp-3'} flex-1 leading-relaxed`}>
              {post.excerpt}
            </p>
          )}

          {/* Footer avec meta info */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <time dateTime={post.published_at || post.created_at}>
                  {formattedDate}
                </time>
              </div>
              
              {post.reading_time_minutes && (
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4" />
                  <span>{post.reading_time_minutes} min</span>
                </div>
              )}
            </div>

            <span className="text-primary font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Lire
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

