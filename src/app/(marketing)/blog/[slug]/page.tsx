/**
 * Blog Post Detail - Article Détaillé
 * 
 * Affiche un article complet avec métadonnées SEO, contenu riche et articles similaires
 * 
 * @version 1.0
 * @date 2025-11-04 22:35
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Card, CardHeader, CardTitle, CardDescription, Badge } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/types/database';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { 
  BlogJsonLd, 
  BlogBreadcrumb, 
  BlogShareButtons, 
  BlogTableOfContents,
  BlogReadingProgress,
  BlogArticleContent
} from '@/components/blog';

// Type étendu pour les pages blog (inclut tags)
type BlogPostWithTags = BlogPost & { tags?: string[] };

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    return {
      title: 'Article non trouvé',
    };
  }

  const typedPost = post as unknown as BlogPostWithTags;

  return {
    title: typedPost.seo_title || typedPost.title,
    description: typedPost.seo_description || typedPost.excerpt,
    openGraph: {
      title: typedPost.title,
      description: typedPost.excerpt || '',
      images: typedPost.cover_image_url ? [typedPost.cover_image_url] : [],
      type: 'article',
      publishedTime: typedPost.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: typedPost.title,
      description: typedPost.excerpt || '',
      images: typedPost.cover_image_url ? [typedPost.cover_image_url] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerClient();

  // Récupérer l'article
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    notFound();
  }

  const typedPost = post as unknown as BlogPostWithTags;

  // Incrémenter le compteur de vues (fire and forget)
  supabase
    .from('blog_posts')
    // @ts-ignore - Supabase update type incompatibility
    .update({ views_count: (typedPost.views_count || 0) + 1 })
    .eq('id', typedPost.id)
    .then(() => {})
    // @ts-ignore - PromiseLike doesn't have catch, but we want to ignore errors
    .catch(() => {});

  // Récupérer articles similaires (même tags)
  const { data: similarPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image_url, published_at, tags')
    .eq('status', 'published')
    .neq('id', typedPost.id)
    .limit(3);

  const typedSimilarPosts = (similarPosts || []) as unknown as Pick<
    BlogPostWithTags,
    'id' | 'title' | 'slug' | 'excerpt' | 'cover_image_url' | 'published_at' | 'tags'
  >[];

  // Formater la date
  const publishedDate = new Date(typedPost.published_at || typedPost.created_at);
  const formattedDate = publishedDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      {/* JSON-LD pour SEO */}
      <BlogJsonLd post={typedPost} />
      
      {/* Barre de progression de lecture */}
      <BlogReadingProgress />

      {/* Hero avec Cover Image */}
      <section className="relative bg-gray-900 py-16 lg:py-20">
        {typedPost.cover_image_url && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${typedPost.cover_image_url})` }}
            />
            {/* Overlay plus sombre pour meilleure lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/90" />
          </>
        )}

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb avec JSON-LD */}
            <BlogBreadcrumb
              items={[
                { label: 'Accueil', href: '/' },
                { label: 'Blog', href: '/blog' },
              ]}
              currentPage={typedPost.title}
            />

            {/* Tags */}
            {typedPost.tags && typedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {typedPost.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="primary" size="md" className="cursor-pointer hover:opacity-80">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {typedPost.title}
            </h1>

            {/* Excerpt */}
            {typedPost.excerpt && (
              <p className="text-xl mb-8 leading-relaxed text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {typedPost.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <time dateTime={typedPost.published_at || typedPost.created_at}>
                  {formattedDate}
                </time>
              </div>
              {typedPost.reading_time_minutes && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>{typedPost.reading_time_minutes} min de lecture</span>
                </div>
              )}
              {typedPost.views_count > 0 && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{typedPost.views_count.toLocaleString('fr-FR')} vues</span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contenu principal */}
            <div className="lg:col-span-8">
              {/* Article Content avec IDs automatiques sur les headings */}
              <BlogArticleContent
                content={typedPost.content}
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold prose-ul:my-6 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-img:rounded-lg prose-img:shadow-lg prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300"
              />

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t dark:border-gray-800">
                <h3 className="text-xl font-bold dark:text-gray-100 mb-6">
                  Partager cet article
                </h3>
                <BlogShareButtons
                  title={typedPost.title}
                  slug={typedPost.slug}
                  description={typedPost.excerpt || undefined}
                />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <BlogTableOfContents content={typedPost.content} />
            </aside>
          </div>
        </Container>
      </section>

      {/* Articles Similaires */}
      {typedSimilarPosts.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <Container>
            <h2 className="text-3xl font-bold dark:text-gray-100 mb-8">
              Articles similaires
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {typedSimilarPosts.map((similarPost) => (
                <Link key={similarPost.id} href={`/blog/${similarPost.slug}`} className="group">
                  <Card variant="bordered" hoverable className="h-full">
                    {similarPost.cover_image_url && (
                      <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={similarPost.cover_image_url}
                          alt={similarPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {similarPost.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {similarPost.excerpt}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link 
                href="/blog"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Voir tous les articles
              </Link>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

