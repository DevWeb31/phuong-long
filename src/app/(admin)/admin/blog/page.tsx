/**
 * Admin Blog Page - Gestion des articles
 * 
 * Page de liste et gestion des articles de blog avec DataTable
 * 
 * @version 1.0
 * @date 2025-11-05 01:20
 */

'use client';

import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin';
import { Badge } from '@/components/common';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  views_count: number;
  tags: string[];
  created_at: string;
}

// Données de démonstration
const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Les Fondamentaux du Vo Dao pour Débutants',
    author: 'Maître Nguyen',
    status: 'published',
    published_at: '2025-10-15',
    views_count: 1245,
    tags: ['Débutant', 'Technique'],
    created_at: '2025-10-10',
  },
  {
    id: '2',
    title: 'Histoire et Tradition des Arts Martiaux Vietnamiens',
    author: 'Sarah Dubois',
    status: 'published',
    published_at: '2025-10-20',
    views_count: 856,
    tags: ['Histoire', 'Culture'],
    created_at: '2025-10-18',
  },
  {
    id: '3',
    title: 'Préparation Physique pour les Compétitions',
    author: 'Jean Martin',
    status: 'draft',
    published_at: null,
    views_count: 0,
    tags: ['Compétition', 'Entraînement'],
    created_at: '2025-11-01',
  },
  {
    id: '4',
    title: 'Philosophie et Méditation dans le Vo Dao',
    author: 'Maître Nguyen',
    status: 'published',
    published_at: '2025-10-25',
    views_count: 672,
    tags: ['Philosophie', 'Méditation'],
    created_at: '2025-10-22',
  },
  {
    id: '5',
    title: 'Techniques de Self-Défense Essentielles',
    author: 'Sarah Dubois',
    status: 'published',
    published_at: '2025-11-02',
    views_count: 1890,
    tags: ['Self-défense', 'Technique'],
    created_at: '2025-10-30',
  },
  {
    id: '6',
    title: 'Guide Complet des Ceintures et Grades',
    author: 'Jean Martin',
    status: 'archived',
    published_at: '2024-06-10',
    views_count: 3421,
    tags: ['Guide', 'Progression'],
    created_at: '2024-06-05',
  },
];

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié',
  archived: 'Archivé',
};

const statusColors: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'default',
  published: 'success',
  archived: 'warning',
};

export default function AdminBlogPage() {
  const [posts] = useState<BlogPost[]>(mockPosts);

  const columns: DataTableColumn<BlogPost>[] = [
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
      width: 'min-w-[250px]',
    },
    {
      key: 'author',
      label: 'Auteur',
      sortable: true,
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
      render: (value) => (
        <span className="text-gray-700 font-medium">
          {value.toLocaleString('fr-FR')}
        </span>
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
    console.log('Edit post:', post);
    // TODO: Rediriger vers /admin/blog/[id]/edit
  };

  const handleDelete = (post: BlogPost) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${post.title}" ?`)) {
      console.log('Delete post:', post);
      // TODO: Implémenter la suppression
    }
  };

  const handleView = (post: BlogPost) => {
    console.log('View post:', post);
    // TODO: Rediriger vers /blog/[slug]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion du Blog</h1>
        <p className="text-gray-600">
          Gérez les articles, brouillons et publications du blog
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        data={posts}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Rechercher un article..."
        newItemLabel="Nouvel Article"
        newItemHref="/admin/blog/new"
        emptyMessage="Aucun article trouvé"
      />
    </div>
  );
}

