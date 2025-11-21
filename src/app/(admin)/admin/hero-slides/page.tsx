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

const MAX_SLIDES = 4;

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
      label: 'Média',
      sortable: false,
      render: (_value, row) => {
        if (row.youtube_video_id) {
          return (
            <div className="flex items-center gap-2">
              <div className="w-12 h-8 rounded bg-gradient-to-br from-red-500/20 to-red-600/20 dark:from-red-500/30 dark:to-red-600/30 border-2 border-red-500/30 dark:border-red-500/20 flex items-center justify-center shadow-sm shadow-red-500/20">
                <Play className="w-4 h-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
              </div>
              <span className="text-xs text-red-600 dark:text-red-400 font-mono font-semibold">
                {row.youtube_video_id.substring(0, 11)}
              </span>
            </div>
          );
        }
        if (row.image_url) {
          return (
            <div className="flex items-center gap-2">
              <div className="w-12 h-8 rounded bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-2 border-primary/30 dark:border-primary/20 flex items-center justify-center shadow-sm shadow-primary/10">
                <span className="text-xs font-bold text-primary dark:text-primary-light">IMG</span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px] font-medium">
                Image statique
              </span>
            </div>
          );
        }
        return <span className="text-xs text-gray-500 dark:text-gray-400">-</span>;
      },
    },
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (value) => (
        <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
          {value as string}
        </span>
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
        <Badge size="sm" variant="default" className="bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent border-accent/30 dark:border-accent/20">
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

  const isMaxSlidesReached = slides.length >= MAX_SLIDES;

  const handleCreate = () => {
    if (isMaxSlidesReached) {
      return;
    }
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
      if (!selectedSlide && slides.length >= MAX_SLIDES) {
        return;
      }
      setIsSubmitting(true);
      
      const url = selectedSlide
        ? `/api/admin/hero-slides/${selectedSlide.id}`
        : '/api/admin/hero-slides';
      
      const method = selectedSlide ? 'PUT' : 'POST';
      
      const dataToSend: Partial<HeroSlide> = {
        title: slideData.title || '',
        subtitle: slideData.subtitle || null,
        description: slideData.description || null,
        youtube_video_id: slideData.youtube_video_id ?? null,
        image_url: slideData.image_url ? slideData.image_url : null,
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Gestion du Carousel Hero
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Gérez les slides de la page d'accueil
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={slides}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Aucun slide pour le moment"
        newItemLabel={isMaxSlidesReached ? undefined : 'Nouveau Slide'}
        onNewItemClick={!isMaxSlidesReached ? handleCreate : undefined}
      />

      {isMaxSlidesReached && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Limite atteinte : vous pouvez créer jusqu&apos;à {MAX_SLIDES} slides maximum. Supprimez un slide pour en ajouter un nouveau.
        </p>
      )}

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

