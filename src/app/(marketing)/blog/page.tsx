/**
 * Blog - Liste des Articles
 * 
 * Affiche tous les articles de blog publiés avec pagination et filtres
 * 
 * @version 1.0
 * @date 2025-11-04 22:30
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, ParallaxBackground } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/types/database';
import { BlogHeroContent } from '@/components/marketing/BlogHeroContent';

// Type étendu pour les pages blog (inclut tags)
type BlogPostWithTags = BlogPost & { tags?: string[] };

export const metadata: Metadata = {
  title: 'Blog & Actualités - Phuong Long Vo Dao',
  description: 'Découvrez nos articles sur le Vo Dao, les arts martiaux vietnamiens, nos événements et actualités. Conseils, techniques et culture martiale.',
  openGraph: {
    title: 'Blog & Actualités - Phuong Long Vo Dao',
    description: 'Articles sur le Vo Dao, techniques, événements et culture martiale vietnamienne.',
    type: 'website',
  },
};

interface BlogPageSearchParams {
  tag?: string;
  page?: string;
}

interface Props {
  searchParams: Promise<BlogPageSearchParams>;
}

const POSTS_PER_PAGE = 9;

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const selectedTag = params.tag;

  const supabase = await createServerClient();

  // Récupérer tous les tags uniques
  const { data: allPosts } = await supabase
    .from('blog_posts')
    .select('tags')
    .eq('status', 'published');

  const typedAllPosts = (allPosts || []) as unknown as { tags?: string[] }[];
  
  const allTags = Array.from(
    new Set(
      typedAllPosts.flatMap(post => post.tags || [])
    )
  ).sort();

  // Construire la requête avec filtre optionnel par tag
  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (selectedTag) {
    query = query.contains('tags', [selectedTag]);
  }

  // Pagination
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data: posts, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / POSTS_PER_PAGE) : 0;

  const typedPosts = (posts || []) as unknown as BlogPostWithTags[];

  return (
    <>
      {/* Header Section with Parallax */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-20 lg:py-24 overflow-hidden">
        <ParallaxBackground>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </ParallaxBackground>

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

        <Container className="relative z-10">
          <BlogHeroContent totalPosts={count || 0} />
        </Container>
      </section>

      {/* Filtres par Tags */}
      {allTags.length > 0 && (
        <section className="bg-white border-b border-gray-200 py-6">
          <Container>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Filtrer par tag :</span>
              <Link href="/blog">
                <Badge 
                  variant={!selectedTag ? 'primary' : 'default'} 
                  size="md"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  Tous
                </Badge>
              </Link>
              {allTags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  <Badge 
                    variant={selectedTag === tag ? 'primary' : 'default'} 
                    size="md"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <Container>
          {typedPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                {selectedTag 
                  ? `Aucun article trouvé pour le tag "${selectedTag}"`
                  : 'Aucun article publié pour le moment'}
              </p>
              {selectedTag && (
                <Link href="/blog" className="mt-4 inline-block">
                  <Badge variant="primary" size="lg">Voir tous les articles</Badge>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {typedPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <Card variant="bordered" hoverable className="h-full flex flex-col">
                      {/* Cover Image */}
                      {post.cover_image_url && (
                        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <CardHeader className="flex-1">
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="default" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Title */}
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>

                        {/* Excerpt */}
                        <CardDescription className="line-clamp-3 mt-2">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {new Date(post.published_at || post.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-primary font-medium group-hover:underline">
                            Lire l'article →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {currentPage > 1 && (
                    <Link 
                      href={`/blog?page=${currentPage - 1}${selectedTag ? `&tag=${selectedTag}` : ''}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Précédent
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/blog?page=${page}${selectedTag ? `&tag=${selectedTag}` : ''}`}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </Link>
                  ))}

                  {currentPage < totalPages && (
                    <Link 
                      href={`/blog?page=${currentPage + 1}${selectedTag ? `&tag=${selectedTag}` : ''}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Suivant →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}

