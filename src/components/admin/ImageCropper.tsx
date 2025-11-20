/**
 * ImageCropper Component
 * 
 * Composant pour recadrer une image avec focus sur le visage
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/common';
import { Upload, X, ZoomIn, ZoomOut, Check, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ImageCropperProps {
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: number;
  circular?: boolean;
  minZoom?: number;
  maxZoom?: number;
  bucket?: 'coaches' | 'clubs'; // Bucket Supabase à utiliser
  imageType?: 'avatar' | 'cover'; // Type d'image pour optimisation
}

export function ImageCropper({
  value,
  onChange,
  aspectRatio: _aspectRatio,
  circular = true,
  minZoom = 0.5,
  maxZoom = 3,
  bucket = 'coaches',
  imageType = 'avatar',
}: ImageCropperProps) {
  // Calculer le ratio d'aspect selon le type d'image
  const aspectRatio = _aspectRatio ?? (imageType === 'cover' ? 16 / 9 : 1);
  const [imageSrc, setImageSrc] = useState<string | null>(value || null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Vérifier si une URL vient d'un bucket Supabase autorisé
  const isBucketUrl = useCallback((url: string | null | undefined): boolean => {
    if (!url) return false;
    return /\/storage\/v1\/object\/public\/(coaches|clubs)\//.test(url);
  }, []);

  // Charger l'image depuis la valeur initiale (URL existante)
  useEffect(() => {
    if (value && value !== imageSrc && !imageSrc) {
      // Si on a une valeur mais pas d'imageSrc, c'est une URL existante
      // On la charge directement pour pouvoir la recadrer
      setImageSrc(value);
      setImageUrl(value);
      // Mémoriser l'URL existante pour pouvoir la supprimer plus tard
      if (isBucketUrl(value)) {
        setUploadedImageUrl(value);
      }
    }
  }, [value, imageSrc, isBucketUrl]);

  // Initialiser la position quand une image est chargée
  useEffect(() => {
    if (imageSrc) {
      setPosition({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [imageSrc]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
      setImageUrl('');
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setUrlError(null);
      // Réinitialiser uploadedImageUrl car c'est une nouvelle image locale
      setUploadedImageUrl(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleLoadFromUrl = useCallback(async () => {
    if (!imageUrl.trim()) {
      setUrlError('Veuillez saisir une URL');
      return;
    }

    setIsLoadingUrl(true);
    setUrlError(null);

    try {
      // Créer une image pour vérifier qu'elle peut être chargée
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Pour éviter les erreurs CORS si possible

      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Convertir l'image en base64 via un canvas pour éviter les problèmes CORS
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'));
            return;
          }

          try {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setImageSrc(dataUrl);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            // Si c'est une URL d'un bucket autorisé, la mémoriser, sinon réinitialiser
            if (isBucketUrl(imageUrl)) {
              setUploadedImageUrl(imageUrl);
            } else {
              setUploadedImageUrl(null);
            }
            resolve(dataUrl);
          } catch (error) {
            // Si CORS bloque, on utilise directement l'URL
            console.warn('CORS bloqué, utilisation directe de l\'URL:', error);
            setImageSrc(imageUrl);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
            // Si c'est une URL d'un bucket autorisé, la mémoriser, sinon réinitialiser
            if (isBucketUrl(imageUrl)) {
              setUploadedImageUrl(imageUrl);
            } else {
              setUploadedImageUrl(null);
            }
            resolve(imageUrl);
          }
        };

        img.onerror = () => {
          reject(new Error('Impossible de charger l\'image depuis cette URL'));
        };

        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'URL:', error);
      setUrlError(error instanceof Error ? error.message : 'Erreur lors du chargement de l\'image');
      setUploadedImageUrl(null);
    } finally {
      setIsLoadingUrl(false);
    }
  }, [imageUrl, isBucketUrl]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
  }, [minZoom, maxZoom]);

  const getCroppedImage = useCallback(async (): Promise<string | null> => {
    if (!imageSrc || !imageRef.current || !containerRef.current) {
      console.error('Image source ou références manquantes');
      return null;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Ne pas utiliser crossOrigin pour les data URLs (images locales)
      if (!imageSrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onerror = () => {
        console.error('Erreur lors du chargement de l\'image pour recadrage');
        reject(new Error('Impossible de charger l\'image'));
      };

      img.onload = () => {
        // Vérifier que l'image est bien chargée
        if (img.width === 0 || img.height === 0) {
          console.error('Image invalide (dimensions nulles)');
          reject(new Error('Image invalide'));
          return;
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        const containerRect = containerRef.current!.getBoundingClientRect();
        
        // Calculer la taille du crop selon le ratio d'aspect
        let cropWidth: number;
        let cropHeight: number;
        
        if (aspectRatio >= 1) {
          // Ratio largeur >= hauteur (ex: 16:9)
          cropWidth = Math.min(containerRect.width, containerRect.height * aspectRatio);
          cropHeight = cropWidth / aspectRatio;
        } else {
          // Ratio hauteur > largeur
          cropHeight = Math.min(containerRect.height, containerRect.width / aspectRatio);
          cropWidth = cropHeight * aspectRatio;
        }
        
        // Calculer les dimensions réelles de l'image affichée (object-contain, sans zoom ni translate)
        const containerAspect = containerRect.width / containerRect.height;
        const imageAspect = img.width / img.height;
        
        let displayedWidth: number;
        let displayedHeight: number;
        
        if (imageAspect > containerAspect) {
          // Image plus large que le conteneur : elle remplit la largeur
          displayedWidth = containerRect.width;
          displayedHeight = containerRect.width / imageAspect;
        } else {
          // Image plus haute que le conteneur : elle remplit la hauteur
          displayedWidth = containerRect.height * imageAspect;
          displayedHeight = containerRect.height;
        }

        // Calculer les offsets pour centrer l'image dans le conteneur (sans transformations)
        const offsetX = (containerRect.width - displayedWidth) / 2;
        const offsetY = (containerRect.height - displayedHeight) / 2;

        // Calculer le scale entre l'image affichée (sans zoom) et l'image source
        const scaleX = img.width / displayedWidth;
        const scaleY = img.height / displayedHeight;

        // Position du crop dans le conteneur (centré selon le ratio d'aspect)
        const cropX = (containerRect.width - cropWidth) / 2;
        const cropY = (containerRect.height - cropHeight) / 2;
        const cropCenterX = cropX + cropWidth / 2;
        const cropCenterY = cropY + cropHeight / 2;

        // Coordonnées du centre du crop par rapport au conteneur
        // Convertir en coordonnées relatives à l'image affichée (sans transformations)
        const cropCenterXRelative = cropCenterX - offsetX;
        const cropCenterYRelative = cropCenterY - offsetY;

        // La transformation CSS est : scale(zoom) translate(position.x / zoom, position.y / zoom)
        // avec transformOrigin: 'center center'
        //
        // IMPORTANT: En CSS, les transformations sont appliquées de droite à gauche.
        // Donc scale(zoom) translate(x, y) signifie :
        // 1. D'abord translate(x, y) - déplace l'image
        // 2. Puis scale(zoom) depuis le centre (transformOrigin)
        //
        // Mais dans notre cas, le translate est déjà divisé par zoom dans le CSS,
        // donc translate(position.x / zoom, position.y / zoom).
        //
        // Pour inverser correctement :
        // 1. Le crop est au centre du conteneur
        // 2. Convertir en coordonnées relatives à l'image affichée (soustraire offset)
        // 3. Inverser le scale : diviser par zoom depuis le centre
        // 4. Inverser le translate : soustraire (position.x / zoom, position.y / zoom)
        
        // Le centre de l'image affichée dans son propre système de coordonnées
        const imageCenterX = displayedWidth / 2;
        const imageCenterY = displayedHeight / 2;

        // Étape 1: Le crop est au centre du conteneur, converti en coordonnées relatives à l'image
        // cropCenterXRelative et cropCenterYRelative sont déjà calculés ci-dessus
        
        // Étape 2: Inverser le scale (zoom depuis le centre)
        // Le zoom agrandit l'image depuis son centre, donc pour inverser :
        // point_normal = center + (point_zoomed - center) / zoom
        const cropXAfterScale = imageCenterX + (cropCenterXRelative - imageCenterX) / zoom;
        const cropYAfterScale = imageCenterY + (cropCenterYRelative - imageCenterY) / zoom;

        // Étape 3: Inverser le translate
        // Le translate est (position.x / zoom, position.y / zoom) dans l'espace normal
        const cropXNormal = cropXAfterScale - (position.x / zoom);
        const cropYNormal = cropYAfterScale - (position.y / zoom);

        // Taille du crop dans l'espace de l'image affichée normale
        const cropWidthNormal = cropWidth / zoom;
        const cropHeightNormal = cropHeight / zoom;

        // Position du coin supérieur gauche du crop dans l'espace de l'image affichée normale
        const cropXNormalTopLeft = cropXNormal - cropWidthNormal / 2;
        const cropYNormalTopLeft = cropYNormal - cropHeightNormal / 2;

        // Convertir en coordonnées de l'image source
        const sourceX = cropXNormalTopLeft * scaleX;
        const sourceY = cropYNormalTopLeft * scaleY;
        const sourceWidth = cropWidthNormal * scaleX;
        const sourceHeight = cropHeightNormal * scaleY;

        // Logs de débogage (uniquement en développement)
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Calculs de recadrage:', {
            containerSize: `${containerRect.width.toFixed(2)}x${containerRect.height.toFixed(2)}`,
            imageSource: `${img.width}x${img.height}`,
            displayedImage: `${displayedWidth.toFixed(2)}x${displayedHeight.toFixed(2)}`,
            offset: `X:${offsetX.toFixed(2)}, Y:${offsetY.toFixed(2)}`,
            scale: `X:${scaleX.toFixed(4)}, Y:${scaleY.toFixed(4)}`,
            zoom,
            position: `X:${position.x.toFixed(2)}, Y:${position.y.toFixed(2)}`,
            cropCenterRelative: `X:${cropCenterXRelative.toFixed(2)}, Y:${cropCenterYRelative.toFixed(2)}`,
            cropAfterScale: `X:${cropXAfterScale.toFixed(2)}, Y:${cropYAfterScale.toFixed(2)}`,
            cropNormal: `X:${cropXNormal.toFixed(2)}, Y:${cropYNormal.toFixed(2)}`,
            cropSizeNormal: `${cropWidthNormal.toFixed(2)}x${cropHeightNormal.toFixed(2)}`,
            source: `X:${sourceX.toFixed(2)}, Y:${sourceY.toFixed(2)}, W:${sourceWidth.toFixed(2)}, H:${sourceHeight.toFixed(2)}`,
          });
        }

        // S'assurer que les coordonnées sont valides
        const clampedSourceX = Math.max(0, Math.min(sourceX, img.width - sourceWidth));
        const clampedSourceY = Math.max(0, Math.min(sourceY, img.height - sourceHeight));
        const clampedSourceWidth = Math.min(
          sourceWidth, 
          img.width - clampedSourceX
        );
        const clampedSourceHeight = Math.min(
          sourceHeight,
          img.height - clampedSourceY
        );

        // Créer le canvas de sortie
        if (circular) {
          const size = Math.min(clampedSourceWidth, clampedSourceHeight);
          canvas.width = size;
          canvas.height = size;
        } else {
          canvas.width = clampedSourceWidth;
          canvas.height = clampedSourceHeight;
        }

        // Dessiner l'image recadrée sur le canvas
        if (circular) {
          // Pour un crop circulaire, dessiner dans un cercle
          const size = Math.min(clampedSourceWidth, clampedSourceHeight);
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = size / 2;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.clip();
          
          ctx.drawImage(
            img,
            clampedSourceX + (clampedSourceWidth - size) / 2,
            clampedSourceY + (clampedSourceHeight - size) / 2,
            size,
            size,
            0,
            0,
            canvas.width,
            canvas.height
          );
        } else {
          ctx.drawImage(
            img,
            clampedSourceX,
            clampedSourceY,
            clampedSourceWidth,
            clampedSourceHeight,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }

        // Convertir en base64 (JPEG pour compatibilité maximale)
        try {
          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
          if (!croppedDataUrl || croppedDataUrl === 'data:,') {
            throw new Error('Échec de la conversion canvas en base64');
          }
          resolve(croppedDataUrl);
        } catch (error) {
          console.error('Erreur conversion canvas:', error);
          reject(error);
        }
      };
      
      // Charger l'image
      img.src = imageSrc;
    });
  }, [imageSrc, zoom, position]);

  const handleCrop = useCallback(async () => {
    setIsCropping(true);
    try {
      console.log('Début du recadrage et conversion en WebP...');
      
      // Supprimer l'ancienne image si elle existe et vient d'un bucket autorisé
      const imageToDelete = uploadedImageUrl || value;
      if (isBucketUrl(imageToDelete)) {
        console.log('🗑️ Suppression de l\'ancienne image:', imageToDelete);
        try {
          const deleteResponse = await fetch('/api/admin/delete-image', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: imageToDelete,
            }),
          });

          if (deleteResponse.ok) {
            console.log('✅ Ancienne image supprimée avec succès');
          } else {
            // Ne pas bloquer l'upload si la suppression échoue (l'image peut déjà être supprimée)
            console.warn('⚠️ Impossible de supprimer l\'ancienne image (peut-être déjà supprimée)');
          }
        } catch (deleteError) {
          // Ne pas bloquer l'upload si la suppression échoue
          console.warn('⚠️ Erreur lors de la suppression de l\'ancienne image:', deleteError);
        }
      }

      const croppedDataUrl = await getCroppedImage();
      if (croppedDataUrl) {
        console.log(`Image recadrée obtenue, upload vers Supabase Storage (bucket: ${bucket})...`);
        // Upload vers Supabase Storage (optimisé en WebP automatiquement)
        const response = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: croppedDataUrl,
            folder: bucket, // Utiliser le bucket spécifié (coaches ou clubs)
            type: imageType, // Utiliser le type spécifié (avatar ou cover)
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const sizeInfo = imageType === 'cover' ? '1200x675px' : '400x400px';
          console.log('✅ Image convertie en WebP et uploadée avec succès:', data.url);
          console.log(`📦 Bucket Supabase: ${bucket}`);
          console.log(`📏 Taille optimisée: ${sizeInfo}`);
          setUploadedImageUrl(data.url); // Mémoriser l'URL uploadée
          onChange(data.url);
          setIsCropping(false);
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.details 
            ? `${errorData.error}: ${errorData.details}`
            : errorData.error || 'Échec de l\'upload';
          throw new Error(errorMessage);
        }
      } else {
        throw new Error('Impossible de recadrer l\'image');
      }
    } catch (error) {
      console.error('❌ Erreur lors du recadrage:', error);
      alert(`Erreur lors du recadrage de l'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setIsCropping(false);
    }
  }, [getCroppedImage, onChange, uploadedImageUrl, value, isBucketUrl, bucket, imageType]);

  const handleRemove = useCallback(async () => {
    // Supprimer l'image du storage si elle existe
    const imageToDelete = uploadedImageUrl || value;
    if (isBucketUrl(imageToDelete)) {
      try {
        console.log('🗑️ Suppression de l\'image lors de la suppression:', imageToDelete);
        await fetch('/api/admin/delete-image', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: imageToDelete,
          }),
        });
        console.log('✅ Image supprimée du storage');
      } catch (error) {
        console.warn('⚠️ Erreur lors de la suppression de l\'image:', error);
      }
    }

    setImageSrc(null);
    setUploadedImageUrl(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange, uploadedImageUrl, value, isBucketUrl]);

  if (!imageSrc) {
    return (
      <div className="space-y-4">
        {/* Option URL */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Charger depuis une URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setUrlError(null);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLoadFromUrl();
                }
              }}
              placeholder="https://example.com/photo.jpg"
              className={cn(
                'flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all',
                'border-slate-300 dark:border-slate-700',
                urlError ? 'border-red-500' : ''
              )}
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleLoadFromUrl}
              isLoading={isLoadingUrl}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Charger
            </Button>
          </div>
          {urlError && (
            <p className="text-xs text-red-500 mt-2">{urlError}</p>
          )}
        </div>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
              ou
            </span>
          </div>
        </div>

        {/* Option Upload fichier */}
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            'border-slate-300 dark:border-slate-700',
            'hover:border-primary hover:bg-primary/5'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Cliquez pour télécharger une photo
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Formats acceptés: JPG, PNG, WEBP
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zone de recadrage */}
      <div className="relative">
        <div
          ref={containerRef}
          className={cn(
            'relative overflow-hidden bg-slate-100 dark:bg-slate-800',
            circular ? 'rounded-full' : 'rounded-xl',
            'w-full max-w-md mx-auto',
            circular ? 'aspect-square' : '',
            'cursor-move'
          )}
          style={circular ? undefined : { aspectRatio: aspectRatio.toString() }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transformOrigin: 'center center',
            }}
            draggable={false}
          />
          
          {/* Overlay de recadrage - centré */}
          <div
            className={cn(
              'absolute border-4 border-primary shadow-lg bg-transparent',
              circular ? 'rounded-full' : 'rounded-xl',
              'pointer-events-none'
            )}
            style={{
              left: '10%',
              top: '10%',
              width: '80%',
              height: '80%',
            }}
          >
            {/* Grille de cadrage (règle des tiers) */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              <div className="border-t border-l border-white/40" />
              <div className="border-t border-white/40" />
              <div className="border-t border-r border-white/40" />
              <div className="border-l border-white/40" />
              <div />
              <div className="border-r border-white/40" />
              <div className="border-b border-l border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-b border-r border-white/40" />
            </div>
          </div>

          {/* Zone sombre autour */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: circular
                ? `radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 100%)`
                : `linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.6) 100%), linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 10%, transparent 90%, rgba(0,0,0,0.6) 100%)`,
            }}
          />
        </div>

        {/* Contrôles */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(-0.1)}
            disabled={zoom <= minZoom}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleZoom(0.1)}
            disabled={zoom >= maxZoom}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          💡 Glissez l'image pour la positionner • Utilisez le zoom pour cadrer le visage
        </p>
        <p className="text-xs font-semibold text-primary dark:text-primary-light">
          ⚠️ N'oubliez pas de cliquer sur "Valider le recadrage"
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setImageSrc(null);
            setImageUrl('');
            setUrlError(null);
          }}
          className="text-gray-900 dark:text-gray-100"
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Changer l'URL
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-900 dark:text-gray-100"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload fichier
        </Button>
        
        <Button
          type="button"
          variant="primary"
          onClick={handleCrop}
          isLoading={isCropping}
          disabled={isCropping || (!!uploadedImageUrl && uploadedImageUrl === value)}
        >
          <Check className="w-4 h-4 mr-2" />
          {isCropping 
            ? 'Conversion en WebP...' 
            : (uploadedImageUrl && uploadedImageUrl === value)
              ? '✅ Photo enregistrée'
              : 'Valider le recadrage (WebP)'}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={handleRemove}
          className="text-gray-900 dark:text-gray-100"
        >
          <X className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Aperçu final */}
      {value && (
        <div className="mt-4 text-center">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            ✅ Photo validée et uploadée
          </p>
          <div className={cn(
            'w-32 h-32 overflow-hidden border-4 border-primary dark:border-primary mx-auto',
            circular ? 'rounded-full' : 'rounded-xl'
          )}>
            <img
              src={value}
              alt="Aperçu final"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Erreur chargement aperçu:', value);
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJldXI8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
