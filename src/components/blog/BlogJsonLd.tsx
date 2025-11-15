/**
 * BlogJsonLd - JSON-LD Schema pour les articles de blog
 * 
 * Génère les métadonnées structurées pour améliorer le référencement SEO
 * et l'affichage dans les résultats de recherche Google
 * 
 * @version 1.0
 * @date 2025-11-11
 */

import type { BlogPost } from '@/lib/types/database';

interface BlogJsonLdProps {
  post: BlogPost;
  authorName?: string;
}

/**
 * Composant pour injecter le JSON-LD Schema dans la page
 * Améliore significativement le SEO en fournissant des données structurées à Google
 */
export function BlogJsonLd({ post, authorName = 'Phuong Long Vo Dao' }: BlogJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seo_description || '',
    image: post.cover_image_url || 'https://phuong-long-vo-dao.fr/og-image.jpg',
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: 'https://phuong-long-vo-dao.fr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Phuong Long Vo Dao',
      logo: {
        '@type': 'ImageObject',
        url: 'https://phuong-long-vo-dao.fr/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://phuong-long-vo-dao.fr/blog/${post.slug}`,
    },
    wordCount: post.content.split(/\s+/).length,
    articleBody: post.content.substring(0, 500), // Extrait pour preview
    timeRequired: post.reading_time_minutes ? `PT${post.reading_time_minutes}M` : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

