/**
 * ImagesEditor Component
 * 
 * Gestionnaire d'images multiples pour les événements (admin)
 * 
 * @version 1.0
 * @date 2025-11-08
 */

'use client';

import { useState } from 'react';
import { Image as ImageIcon, Trash2, Star, GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/common';
import type { EventImage } from '@/lib/types';

interface ImagesEditorProps {
  eventId?: string;
  images: Partial<EventImage>[];
  onChange: (images: Partial<EventImage>[]) => void;
  disabled?: boolean;
}

export function ImagesEditor({ images, onChange, disabled = false }: ImagesEditorProps) {
  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = () => {
    if (!newImageUrl.trim()) return;

    const newImage: Partial<EventImage> = {
      image_url: newImageUrl.trim(),
      display_order: images.length,
      caption: '',
      alt_text: '',
      is_cover: images.length === 0, // Première image = cover par défaut
    };

    onChange([...images, newImage]);
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // Réorganiser les display_order
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));
    onChange(reorderedImages);
  };

  const updateImage = (index: number, field: keyof EventImage, value: any) => {
    const updatedImages = [...images];
    updatedImages[index] = {
      ...updatedImages[index],
      [field]: value,
    };
    onChange(updatedImages);
  };

  const setCover = (index: number) => {
    const updatedImages = images.map((img, idx) => ({
      ...img,
      is_cover: idx === index,
    }));
    onChange(updatedImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const updatedImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Échanger les positions
    const temp = updatedImages[index];
    const target = updatedImages[targetIndex];
    if (temp && target) {
      updatedImages[index] = target;
      updatedImages[targetIndex] = temp;
    }
    
    // Réorganiser les display_order
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));
    
    onChange(reorderedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold dark:text-gray-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          Galerie d'images ({images.length})
        </label>
      </div>

      {/* Liste des images */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex gap-4">
                {/* Preview */}
                <div className="flex-shrink-0">
                  {image.image_url ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || 'Aperçu'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {image.is_cover && (
                        <div className="absolute top-1 right-1 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Champs */}
                <div className="flex-1 space-y-2">
                  {/* URL */}
                  <input
                    type="url"
                    value={image.image_url || ''}
                    onChange={(e) => updateImage(index, 'image_url', e.target.value)}
                    placeholder="URL de l'image"
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {/* Caption */}
                    <input
                      type="text"
                      value={image.caption || ''}
                      onChange={(e) => updateImage(index, 'caption', e.target.value)}
                      placeholder="Légende (optionnelle)"
                      disabled={disabled}
                      className="px-3 py-1.5 text-xs border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />

                    {/* Alt text */}
                    <input
                      type="text"
                      value={image.alt_text || ''}
                      onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                      placeholder="Texte alternatif (SEO)"
                      disabled={disabled}
                      className="px-3 py-1.5 text-xs border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  {/* Ordre */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'up')}
                      disabled={disabled || index === 0}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                      title="Déplacer vers le haut"
                    >
                      <GripVertical className="w-4 h-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'down')}
                      disabled={disabled || index === images.length - 1}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                      title="Déplacer vers le bas"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image de couverture */}
                  <button
                    type="button"
                    onClick={() => setCover(index)}
                    disabled={disabled}
                    className={`p-1.5 rounded transition-colors ${
                      image.is_cover
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title={image.is_cover ? 'Image de couverture' : 'Définir comme couverture'}
                  >
                    <Star className={`w-4 h-4 ${image.is_cover ? 'fill-current' : ''}`} />
                  </button>

                  {/* Supprimer */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={disabled}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ajouter une image */}
      <div className="flex gap-2">
        <input
          type="url"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
          placeholder="URL de la nouvelle image..."
          disabled={disabled}
          className="flex-1 px-4 py-2.5 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button
          type="button"
          onClick={addImage}
          disabled={disabled || !newImageUrl.trim()}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      {/* Info */}
      {images.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Ajoutez plusieurs images pour créer un carousel sur la page de l'événement. 
          La première image sera automatiquement définie comme image de couverture.
        </p>
      )}
    </div>
  );
}

