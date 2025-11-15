/**
 * useBlogPosts - Hook pour récupérer les articles de blog
 * 
 * Hook React Query pour gérer le cache et les requêtes d'articles
 * 
 * @version 1.0
 * @date 2025-11-11
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import type { BlogPost } from '@/lib/types/database';

interface UseBlogPostsOptions {
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

type BlogPostWithTags = BlogPost & { tags?: string[] };

/**
 * Hook pour récupérer les articles de blog avec filtres
 * Utilise React Query pour le caching automatique
 */
export function useBlogPosts({ 
  tag, 
  search, 
  page = 1, 
  limit = 9 
}: UseBlogPostsOptions = {}) {
  return useQuery({
    queryKey: ['blog-posts', { tag, search, page, limit }],
    queryFn: async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      // Filtrer par tag
      if (tag) {
        query = query.contains('tags', [tag]);
      }

      // Recherche
      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        posts: (data || []) as unknown as BlogPostWithTags[],
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer un article par slug
 */
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data as unknown as BlogPostWithTags;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!slug,
  });
}

/**
 * Hook pour récupérer tous les tags uniques
 */
export function useBlogTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published');

      if (error) throw error;

      const typedData = (data || []) as unknown as { tags?: string[] }[];
      const allTags = Array.from(
        new Set(typedData.flatMap(post => post.tags || []))
      ).sort();

      return allTags;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

