/**
 * Admin Hero Slides Page - Gestion du carousel hero
 * 
 * Page de liste et gestion des slides du carousel hero
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { DataTable, DataTableColumn, ConfirmModal } from '@/components/admin';
import { HeroSlideFormModal } from '@/components/admin/HeroSlideFormModal';
import { Badge } from '@/components/common';
import { Play } from 'lucide-react';
import type { HeroSlide } from '@/components/marketing/HeroCarousel';

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/hero-slides');
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      }
    } catch (error) {
      console.error('Error loading hero slides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: DataTableColumn<HeroSlide>[] = [
    {
      key: 'youtube_video_id',
      label: 'Vidéo',
      sortable: false,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            <Play className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            {(value as string).substring(0, 11)}
          </span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">{value as string}</span>
      ),
    },
    {
      key: 'subtitle',
      label: 'Sous-titre',
      sortable: false,
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'display_order',
      label: 'Ordre',
      sortable: true,
      render: (value) => (
        <Badge size="sm" variant="default">
          {value as number}
        </Badge>
      ),
    },
    {
      key: 'active',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'default'} size="sm">
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
  ];

  const handleCreate = () => {
    setSelectedSlide(null);
    setIsFormOpen(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setIsFormOpen(true);
  };

  const handleDelete = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (slideData: Partial<HeroSlide>) => {
    try {
      setIsSubmitting(true);
      
      const url = selectedSlide
        ? `/api/admin/hero-slides/${selectedSlide.id}`
        : '/api/admin/hero-slides';
      
      const method = selectedSlide ? 'PUT' : 'POST';
      
      const dataToSend: Partial<HeroSlide> = {
        title: slideData.title || '',
        subtitle: slideData.subtitle || null,
        description: slideData.description || null,
        youtube_video_id: slideData.youtube_video_id || '',
        cta_text: slideData.cta_text || null,
        cta_link: slideData.cta_link || null,
        overlay_opacity: slideData.overlay_opacity ?? 0.5,
        active: slideData.active ?? true,
        display_order: slideData.display_order || 0,
      };
      
      if (selectedSlide) {
        delete (dataToSend as any).id;
        delete (dataToSend as any).created_at;
        delete (dataToSend as any).updated_at;
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        await loadSlides();
        setIsFormOpen(false);
        setSelectedSlide(null);
      }
    } catch (error) {
      console.error('Error saving hero slide:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSlide) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/hero-slides/${selectedSlide.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadSlides();
        setIsDeleteOpen(false);
        setSelectedSlide(null);
      }
    } catch (error) {
      console.error('Error deleting hero slide:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={slides}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Aucun slide pour le moment"
        newItemLabel="Nouveau Slide"
        onNewItemClick={handleCreate}
      />

      <HeroSlideFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedSlide(null);
        }}
        onSubmit={handleSubmit}
        slide={selectedSlide}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedSlide(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le slide"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedSlide?.title}" ? Cette action est irréversible.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

