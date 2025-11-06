/**
 * BlogFormModal Component
 * 
 * Modal pour créer/éditer un article de blog
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';

export interface BlogPost {
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  cover_image_url?: string;
  status: 'draft' | 'published';
  tags?: string[];
  author_id?: string;
  published_at?: string;
  created_at?: string;
}

interface BlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<BlogPost>) => Promise<void>;
  post?: BlogPost | null;
  isLoading?: boolean;
}

export function BlogFormModal({ isOpen, onClose, onSubmit, post, isLoading = false }: BlogFormModalProps) {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image_url: '',
    status: 'draft',
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (post) {
      setFormData(post);
      setTagsInput(post.tags?.join(', ') || '');
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        cover_image_url: '',
        status: 'draft',
        tags: [],
      });
      setTagsInput('');
    }
  }, [post, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertir les tags
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    await onSubmit({ ...formData, tags });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, title, slug }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post ? 'Modifier l\'Article' : 'Nouvel Article'}
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {post ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>

          <div>
            <label htmlFor="cover_image_url" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Image de couverture (URL)
            </label>
            <input
              type="url"
              id="cover_image_url"
              name="cover_image_url"
              value={formData.cover_image_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="excerpt" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Extrait
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt || ''}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="tags" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="technique, débutant, compétition"
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-semibold dark:text-gray-300 mb-2">
            Contenu (Markdown) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content || ''}
            onChange={handleChange}
            required
            rows={12}
            className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder="# Titre de l'article&#10;&#10;Contenu en markdown..."
          />
        </div>
      </form>
    </Modal>
  );
}

