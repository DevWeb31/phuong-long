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
import { Container, Badge, ParallaxBackground, ScrollReveal } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/lib/types/database';
import { BlogHeroContent } from '@/components/marketing/BlogHeroContent';
import { BlogGrid, BlogPagination, BlogSearchBar, BlogTagFilter, BlogHeroCard, BlogScrollToTop } from '@/components/blog';

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
  q?: string; // Recherche
}

interface Props {
  searchParams: Promise<BlogPageSearchParams>;
}

const POSTS_PER_PAGE = 9;

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const selectedTag = params.tag;
  const searchQuery = params.q;

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

  // Construire la requête avec filtres optionnels
  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (selectedTag) {
    // Utiliser l'opérateur PostgreSQL @> pour vérifier si le tableau JSONB contient le tag
    // Format SQL: tags @> '["tag"]'::jsonb
    // En Supabase JS, .contains() attend un JSONB valide (tableau stringifié)
    query = query.contains('tags', `["${selectedTag}"]`);
  }

  // Recherche par titre ou contenu
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
  }

  // Pagination
  // Sur la première page sans filtres, on récupère 1 article de plus pour le hero
  const isFirstPageNoFilters = currentPage === 1 && !selectedTag && !searchQuery;
  const postsToFetch = isFirstPageNoFilters ? POSTS_PER_PAGE + 1 : POSTS_PER_PAGE;
  
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + postsToFetch - 1;

  const { data: posts, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / POSTS_PER_PAGE) : 0;

  const typedPosts = (posts || []) as unknown as BlogPostWithTags[];

  return (
    <>
      <BlogScrollToTop />
      {/* Header Section with Parallax */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#E6110A] py-12 lg:py-16 overflow-hidden">
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

      {/* Barre de recherche */}
      <section className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-8">
        <Container>
          <ScrollReveal direction="down" delay={0}>
            <BlogSearchBar />
          </ScrollReveal>
        </Container>
      </section>

      {/* Articles Grid */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          {/* Header avec filtres intégrés */}
          <ScrollReveal direction="down" delay={0}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              {/* Message de recherche ou titre */}
              {searchQuery ? (
                <ScrollReveal direction="left" delay={0}>
                  <div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {typedPosts.length > 0 ? (
                        <>
                          <span className="font-semibold text-gray-900 dark:text-white">{count}</span> résultat{count! > 1 ? 's' : ''} pour <span className="font-semibold text-primary">"{searchQuery}"</span>
                        </>
                      ) : (
                        <>Aucun résultat pour <span className="font-semibold text-gray-900 dark:text-white">"{searchQuery}"</span></>
                      )}
                    </p>
                  </div>
                </ScrollReveal>
              ) : (
                <ScrollReveal direction="left" delay={0}>
                  <div>
                    <h2 id="blog-articles-title" className="text-2xl font-bold text-gray-900 dark:text-white scroll-mt-24">
                      {selectedTag ? `Articles : ${selectedTag}` : 'Tous les articles'}
                    </h2>
                    {selectedTag && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {count} article{count! > 1 ? 's' : ''} trouvé{count! > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </ScrollReveal>
              )}

              {/* Filtres par Tags intégrés */}
              {allTags.length > 0 && (
                <ScrollReveal direction="right" delay={50}>
                  <BlogTagFilter availableTags={allTags} />
                </ScrollReveal>
              )}
            </div>
          </ScrollReveal>

          {/* Hero Article - Dernier article publié (uniquement sur première page sans filtres) */}
          {currentPage === 1 && !selectedTag && !searchQuery && typedPosts.length > 0 && typedPosts[0] && (
            <ScrollReveal direction="up" delay={100} className="mb-16">
              <BlogHeroCard post={typedPosts[0]} />
            </ScrollReveal>
          )}

          {/* Grille des autres articles */}
          <ScrollReveal direction="up" delay={200}>
            <BlogGrid 
              posts={
                // Si première page sans filtres, on affiche les articles à partir du 2ème
                currentPage === 1 && !selectedTag && !searchQuery && typedPosts.length > 0
                  ? typedPosts.slice(1)
                  : typedPosts
              }
              emptyMessage={
                selectedTag 
                  ? `Aucun article trouvé pour le tag "${selectedTag}"` 
                  : searchQuery
                  ? 'Aucun article ne correspond à votre recherche'
                  : 'Aucun article publié pour le moment'
              }
            />
          </ScrollReveal>

          {/* Lien retour si filtré */}
          {(selectedTag || searchQuery) && typedPosts.length === 0 && (
            <ScrollReveal direction="fade" delay={0}>
              <div className="text-center mt-8">
                <Link href="/blog" className="inline-block">
                  <Badge variant="primary" size="lg">Voir tous les articles</Badge>
                </Link>
              </div>
            </ScrollReveal>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <ScrollReveal direction="fade" delay={300}>
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/blog"
                searchParams={{ 
                  ...(selectedTag && { tag: selectedTag }),
                  ...(searchQuery && { q: searchQuery })
                }}
              />
            </ScrollReveal>
          )}
        </Container>
      </section>
    </>
  );
}

