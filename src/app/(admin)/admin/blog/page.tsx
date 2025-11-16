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
import { Badge, Button } from '@/components/common';

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
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          {value ? (
            <img
              src={value as string}
              alt={row.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'w-6 h-6 text-gray-400 dark:text-gray-600';
                fallbackDiv.innerHTML = '📝';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '';
                (e.target as HTMLImageElement).parentElement!.appendChild(fallbackDiv);
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
      render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>,
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
            <Badge key={index} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
          {value.length > 2 && (
            <Badge variant="default" size="sm">
              +{value.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'views_count',
      label: 'Vues',
      sortable: true,
      render: (value) => value ? (
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {value.toLocaleString('fr-FR')}
        </span>
      ) : (
        <span className="text-gray-400 dark:text-gray-400">0</span>
      ),
    },
    {
      key: 'published_at',
      label: 'Publié le',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }) : '-',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Gestion du Blog</h1>
          <p className="text-gray-600 dark:text-gray-500">
            Gérez les articles, brouillons et publications du blog
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          ➕ Nouvel Article
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 dark:border-gray-800"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-500">Chargement...</p>
        </div>
      ) : (
        <DataTable
          data={posts}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Rechercher un article..."
          emptyMessage="Aucun article trouvé"
        />
      )}

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

