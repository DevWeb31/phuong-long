/**
 * CoverImageUploader Component
 * 
 * Composant simple pour uploader une image de couverture (URL ou fichier)
 * Sans recadrage, conversion automatique en WebP
 * 
 * @version 1.0
 * @date 2025-01-18
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/common';
import { ConfirmModal } from './Modal';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CoverImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  folder?: string;
  type?: string;
}

export function CoverImageUploader({
  value,
  onChange,
  error,
  folder = 'clubs',
  type = 'cover',
}: CoverImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extensions d'images autorisées
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

  const validateImageFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return (
      allowedExtensions.includes(extension) &&
      allowedMimeTypes.includes(file.type)
    );
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider que c'est une image
    if (!validateImageFile(file)) {
      alert('Veuillez sélectionner une image valide (JPG, PNG, WEBP, GIF, BMP)');
      return;
    }

    // Valider la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('L\'image est trop volumineuse. Taille maximale : 10MB');
      return;
    }

    setIsUploading(true);
    setUrlError(null);

    try {
      // Convertir le fichier en base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) {
          throw new Error('Impossible de lire le fichier');
        }

        // Upload vers Supabase avec conversion WebP automatique
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          image: base64Data,
          folder,
          type,
        }),
        });

        if (response.ok) {
          const data = await response.json();
          onChange(data.url);
          setImageUrl('');
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.details 
            ? `${errorData.error}: ${errorData.details}`
            : errorData.error || 'Échec de l\'upload';
          throw new Error(errorMessage);
        }
      };

      reader.onerror = () => {
        throw new Error('Erreur lors de la lecture du fichier');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
      alert(`Erreur lors de l'upload: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onChange]);

  const handleLoadFromUrl = useCallback(async () => {
    if (!imageUrl.trim()) {
      setUrlError('Veuillez saisir une URL');
      return;
    }

    setIsLoadingUrl(true);
    setUrlError(null);

    try {
      // Valider que c'est une URL valide
      try {
        new URL(imageUrl);
      } catch {
        throw new Error('URL invalide');
      }

      // Si c'est une URL externe, télécharger et convertir côté serveur pour éviter CORS
      // Si c'est déjà une URL Supabase, l'utiliser directement
      if (imageUrl.includes('/storage/v1/object/public/')) {
        // C'est déjà une URL Supabase, l'utiliser directement
        onChange(imageUrl);
        setImageUrl('');
      } else {
        // URL externe : télécharger et convertir côté serveur
        const response = await fetch('/api/admin/upload-image-from-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          imageUrl: imageUrl,
          folder,
          type,
        }),
        });

        if (response.ok) {
          const data = await response.json();
          onChange(data.url);
          setImageUrl('');
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.details 
            ? `${errorData.error}: ${errorData.details}`
            : errorData.error || 'Échec du téléchargement de l\'image';
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'URL:', error);
      setUrlError(error instanceof Error ? error.message : 'Erreur lors du chargement de l\'image');
    } finally {
      setIsLoadingUrl(false);
    }
  }, [imageUrl, onChange]);

  const handleRemoveClick = useCallback(() => {
    if (!value) return;
    setShowDeleteConfirm(true);
  }, [value]);

  const handleConfirmDelete = useCallback(() => {
    if (!value) return;
    
    // Ne pas supprimer immédiatement du storage, juste mettre à jour l'UI
    // La suppression réelle se fera lors de la sauvegarde du formulaire
    onChange('');
    setImageUrl('');
    setUrlError(null);
    setShowDeleteConfirm(false);
  }, [value, onChange]);

  return (
    <div className="space-y-4">
      {/* Aperçu de l'image actuelle */}
      {value && (
        <div className="relative">
          <div className="relative aspect-video w-full max-w-2xl rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-lg bg-gray-100 dark:bg-gray-800">
            <img
              src={value}
              alt="Aperçu de l'image de couverture"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Erreur lors du chargement de l\'image');
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveClick}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
            aria-label="Supprimer l'image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Options d'upload */}
      {!value && (
        <div className="space-y-4">
          {/* Upload depuis l'ordinateur */}
          <div>
            <label className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Télécharger depuis l'ordinateur
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Choisir un fichier
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Formats acceptés: JPG, PNG, WEBP, GIF, BMP (max 10MB)
              </p>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              L'image sera automatiquement convertie en WebP et optimisée au format 16:9 (1200x675px)
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                Ou
              </span>
            </div>
          </div>

          {/* URL */}
          <div>
            <label htmlFor="cover-image-url" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Utiliser une URL d'image
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="url"
                  id="cover-image-url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setUrlError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleLoadFromUrl();
                    }
                  }}
                  disabled={isLoadingUrl}
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                    error || urlError
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  )}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleLoadFromUrl}
                disabled={isLoadingUrl || !imageUrl.trim()}
                className="flex items-center gap-2"
              >
                {isLoadingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    Charger
                  </>
                )}
              </Button>
            </div>
            {urlError && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <X className="w-3 h-3" />
                {urlError}
              </p>
            )}
            {error && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <X className="w-3 h-3" />
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'image de couverture"
        message={
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer cette image ?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              L'image sera retirée de l'aperçu immédiatement, mais la suppression définitive du serveur ne sera effective qu'après la sauvegarde du formulaire.
            </p>
          </div>
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />
    </div>
  );
}

