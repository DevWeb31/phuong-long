/**
 * HeroSlideFormModal Component
 * 
 * Modal pour créer/éditer un slide du carousel hero
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';
import type { HeroSlide } from '@/components/marketing/HeroCarousel';

interface HeroSlideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slide: Partial<HeroSlide>) => Promise<void>;
  slide?: HeroSlide | null;
  isLoading?: boolean;
}

export function HeroSlideFormModal({ isOpen, onClose, onSubmit, slide, isLoading = false }: HeroSlideFormModalProps) {
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    description: '',
    youtube_video_id: '',
    cta_text: '',
    cta_link: '',
    overlay_opacity: 0.5,
    active: true,
    display_order: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (slide && slide.id) {
        setFormData({
          ...slide,
        });
      } else {
        setFormData({
          title: '',
          subtitle: '',
          description: '',
          youtube_video_id: '',
          cta_text: '',
          cta_link: '',
          overlay_opacity: 0.5,
          active: true,
          display_order: 0,
        });
      }
    }
  }, [slide, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'display_order' || name === 'overlay_opacity') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
      return;
    }
    
    if (name === 'active') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Extraire l'ID YouTube depuis une URL complète pour l'affichage
  const extractYouTubeId = (input: string): string => {
    if (!input) return '';
    
    // Si c'est déjà un ID simple (11 caractères, pas d'espaces)
    if (input.length === 11 && !input.includes(' ') && !input.includes('youtube.com') && !input.includes('youtu.be')) {
      return input;
    }
    
    // Extraire depuis une URL complète
    let id = input;
    if (input.includes('youtube.com/watch?v=')) {
      id = input.split('v=')[1]?.split('&')[0] || input;
    } else if (input.includes('youtu.be/')) {
      id = input.split('youtu.be/')[1]?.split('?')[0] || input;
    } else if (input.includes('youtube.com/embed/')) {
      id = input.split('embed/')[1]?.split('?')[0] || input;
    }
    
    return id;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={slide ? 'Modifier le Slide' : 'Nouveau Slide'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {slide ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Phuong Long Vo Dao"
          />
        </div>

        {/* Sous-titre */}
        <div>
          <label htmlFor="subtitle" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Sous-titre / Badge
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            value={formData.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Cours d'essai gratuit"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            placeholder="L'art martial vietnamien traditionnel"
          />
        </div>

        {/* YouTube Video ID */}
        <div>
          <label htmlFor="youtube_video_id" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            ID Vidéo YouTube <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="youtube_video_id"
            name="youtube_video_id"
            value={formData.youtube_video_id}
            onChange={(e) => {
              const extractedId = extractYouTubeId(e.target.value);
              setFormData(prev => ({
                ...prev,
                youtube_video_id: extractedId,
              }));
            }}
            required
            className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="dQw4w9WgXcQ ou https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Vous pouvez coller l'URL complète ou juste l'ID de la vidéo
          </p>
        </div>

        {/* CTA Text */}
        <div>
          <label htmlFor="cta_text" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Texte du bouton CTA
          </label>
          <input
            type="text"
            id="cta_text"
            name="cta_text"
            value={formData.cta_text || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Trouver un Club"
          />
        </div>

        {/* CTA Link */}
        <div>
          <label htmlFor="cta_link" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Lien du bouton CTA
          </label>
          <input
            type="text"
            id="cta_link"
            name="cta_link"
            value={formData.cta_link || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="/clubs"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Overlay Opacity */}
          <div>
            <label htmlFor="overlay_opacity" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Opacité de l'overlay ({Math.round((formData.overlay_opacity || 0) * 100)}%)
            </label>
            <input
              type="range"
              id="overlay_opacity"
              name="overlay_opacity"
              min="0"
              max="1"
              step="0.05"
              value={formData.overlay_opacity || 0.5}
              onChange={handleChange}
              className="w-full"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Contrôle la visibilité du texte sur la vidéo
            </p>
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="display_order" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Ordre d'affichage
            </label>
            <input
              type="number"
              id="display_order"
              name="display_order"
              value={formData.display_order}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 border dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="0"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Plus petit = affiché en premier
            </p>
          </div>
        </div>

        {/* Actif */}
        <div className="flex items-center gap-3 border-t dark:border-slate-700 pt-6">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active ?? true}
            onChange={handleChange}
            className="w-5 h-5 text-primary border-slate-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Slide actif (visible sur le site)
          </label>
        </div>
      </form>
    </Modal>
  );
}

