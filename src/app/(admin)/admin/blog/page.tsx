/**
 * Admin Blog Page - Gestion des articles
 * 
 * Page de liste et gestion des articles de blog avec DataTable
 * 
 * @version 1.0
 * @date 2025-11-05 01:20
 */

'use client';

import { useState, useEffect } from 'react';
import { DataTable, DataTableColumn, ConfirmModal } from '@/components/admin';
import { BlogFormModal } from '@/components/admin/BlogFormModal';
import { Badge } from '@/components/common';

interface BlogPost {
  id: string;
  title: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  tags?: string[];
  created_at: string;
  slug?: string;
  views_count?: number;
  cover_image_url?: string | null;
}

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
};

const statusColors: Record<string, 'default' | 'success'> = {
  draft: 'default',
  published: 'success',
};

const BLOG_LIMIT = 50;

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/blog');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: DataTableColumn<BlogPost>[] = [
    {
      key: 'cover_image_url',
      label: 'Image',
      sortable: false,
      render: (value, row) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-2 border-primary/30 dark:border-primary/20 flex items-center justify-center shadow-sm shadow-primary/10">
          {value ? (
            <img
              src={value as string}
              alt={row.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const parent = img.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-2xl">📝</span>';
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          ) : (
            <span className="text-2xl">📝</span>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (value) => {
        const title = value as string;
        const truncatedTitle = title.length > 30 ? `${title.slice(0, 30)}...` : title;
        return (
          <div className="relative group">
            <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {truncatedTitle}
            </span>
            {title.length > 30 && (
              <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 max-w-xs whitespace-normal">
                {title}
                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
              </div>
            )}
          </div>
        );
      },
      width: 'min-w-[250px]',
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={statusColors[value]} size="sm">
          {statusLabels[value]}
        </Badge>
      ),
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((tag, index) => (
            <Badge 
              key={index} 
              variant="default" 
              size="sm"
              className="bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent border-accent/30 dark:border-accent/20"
            >
              {tag}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge 
              variant="default" 
              size="sm"
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
            >
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'published_at',
      label: 'Publié le',
      sortable: true,
      render: (value) => value ? (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {new Date(value).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ) : '-',
    },
  ];

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setIsFormOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDeleteOpen(true);
  };

  const handleView = (post: BlogPost) => {
    window.open(`/blog/${post.slug || post.id}`, '_blank');
  };

  const handleCreateNew = () => {
    if (posts.length >= BLOG_LIMIT) {
      alert(`Limite de ${BLOG_LIMIT} articles atteinte. Veuillez supprimer des articles avant d'en créer de nouveaux.`);
      return;
    }
    setSelectedPost(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (postData: any) => {
    try {
      setIsSubmitting(true);
      
      if (selectedPost) {
        const response = await fetch(`/api/admin/blog/${selectedPost.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      } else {
        const response = await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });
        if (!response.ok) throw new Error('Erreur lors de la création');
      }

      await loadPosts();
      setIsFormOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPost) return;
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/blog/${selectedPost.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await loadPosts();
      setIsDeleteOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${ids.length} article(s) ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const deletePromises = ids.map((id) =>
        fetch(`/api/admin/blog/${id}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok));

      if (failed.length > 0) {
        alert(`${failed.length} article(s) n'ont pas pu être supprimé(s).`);
      } else {
        alert(`${ids.length} article(s) supprimé(s) avec succès.`);
      }

      await loadPosts();
    } catch (error) {
      console.error('Error bulk deleting posts:', error);
      alert('Une erreur est survenue lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Gestion du Blog
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Gérez vos articles et publications
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <DataTable
        data={posts}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Rechercher un article..."
        emptyMessage="Aucun article trouvé"
        newItemLabel="Nouvel Article"
        onNewItemClick={handleCreateNew}
        newItemDisabled={posts.length >= BLOG_LIMIT}
        newItemTooltip={posts.length >= BLOG_LIMIT ? `Limite de ${BLOG_LIMIT} articles atteinte` : undefined}
        minItemsPerPage={8}
        itemsPerPage={8}
        selectable={true}
        onBulkDelete={handleBulkDelete}
        />
      </div>

      <BlogFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPost(null);
        }}
        onSubmit={handleSubmit}
        post={selectedPost as any}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedPost(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'article"
        message={`Êtes-vous sûr de vouloir supprimer l'article "${selectedPost?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

