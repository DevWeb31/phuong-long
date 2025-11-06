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
      {/* Hero avec Cover Image */}
      <section className="relative bg-gray-900 py-16 lg:py-20">
        {typedPost.cover_image_url && (
          <>
            <div 
              className="absolute inset-0 bg-cover"
              style={{ backgroundImage: `url(${typedPost.cover_image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
          </>
        )}

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm">
              <Link href="/" className="hover:text-white transition-colors">
                Accueil
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-white">{typedPost.title}</span>
            </div>

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {typedPost.title}
            </h1>

            {/* Excerpt */}
            {typedPost.excerpt && (
              <p className="text-xl mb-8 leading-relaxed">
                {typedPost.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                <span>{formattedDate}</span>
              </div>
              {typedPost.reading_time_minutes && (
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>{typedPost.reading_time_minutes} min de lecture</span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 dark:text-gray-100 prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-6 prose-li:text-gray-700 prose-img:rounded-lg prose-img:shadow-lg prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 dark:bg-gray-900 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-gray-700"
              dangerouslySetInnerHTML={{ __html: typedPost.content }}
            />

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t dark:border-gray-800">
              <h3 className="text-lg font-semibold dark:text-gray-100 mb-4">
                Partager cet article
              </h3>
              <div className="flex gap-4">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://phuong-long-vo-dao.fr/blog/${typedPost.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://phuong-long-vo-dao.fr/blog/${typedPost.slug}`)}&text=${encodeURIComponent(typedPost.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://phuong-long-vo-dao.fr/blog/${typedPost.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  LinkedIn
                </a>
              </div>
            </div>
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

