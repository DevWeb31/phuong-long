/**
 * BlogHeroCard - Carte Hero pour le dernier article publié
 * 
 * Affiche le dernier article de manière imposante et attractive
 * 
 * @version 1.0
 * @date 2025-11-11
 */

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/common';
import { CalendarIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { BlogPost } from '@/lib/types/database';

interface BlogHeroCardProps {
  post: BlogPost & { tags?: string[] };
}

/**
 * Carte hero pour mettre en avant le dernier article publié
 */
export function BlogHeroCard({ post }: BlogHeroCardProps) {
  const publishedDate = new Date(post.published_at || post.created_at);
  const formattedDate = publishedDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="group block"
    >
      <article className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Image de couverture - Grande */}
          {post.cover_image_url ? (
            <div className="relative w-full h-64 lg:h-96 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                priority
              />
              
              {/* Overlay avec gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Badge "Nouveau" */}
              <div className="absolute top-4 left-4 z-10">
                <Badge 
                  variant="primary" 
                  size="sm" 
                  className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-primary dark:text-primary-light font-bold shadow-lg border border-primary/20"
                >
                  ✨ Nouveau
                </Badge>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-64 lg:h-96 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-8xl">📝</span>
            </div>
          )}

          {/* Contenu */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="default" 
                    size="sm"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge variant="default" size="sm" className="text-xs">
                    +{post.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Titre - Grand et imposant */}
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors leading-tight">
              {post.title}
            </h2>

            {/* Extrait - Plus long */}
            {post.excerpt && (
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg mb-6 line-clamp-4 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Footer avec meta info */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  <time dateTime={post.published_at || post.created_at}>
                    {formattedDate}
                  </time>
                </div>
                
                {post.reading_time_minutes && (
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4" />
                    <span>{post.reading_time_minutes} min de lecture</span>
                  </div>
                )}
              </div>

              <span className="inline-flex items-center gap-2 text-primary font-semibold text-base group-hover:gap-3 transition-all">
                Lire l'article
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

