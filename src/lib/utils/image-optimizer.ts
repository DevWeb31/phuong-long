/**
 * Image Optimizer Utility
 * 
 * Optimise et convertit les images en WebP pour améliorer les performances
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import sharp from 'sharp';

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Optimise une image et la convertit en WebP
 * 
 * @param buffer Buffer de l'image source
 * @param options Options d'optimisation
 * @returns Buffer optimisé en WebP
 */
export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 85,
    format = 'webp',
  } = options;

  let pipeline = sharp(buffer);

  // Obtenir les métadonnées de l'image
  const metadata = await pipeline.metadata();
  const { width, height } = metadata;

  if (!width || !height) {
    throw new Error('Impossible de lire les dimensions de l\'image');
  }

  // Redimensionner si nécessaire (en conservant le ratio)
  if (width > maxWidth || height > maxHeight) {
    pipeline = pipeline.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convertir et optimiser selon le format
  switch (format) {
    case 'webp':
      return pipeline
        .webp({
          quality,
          effort: 6, // Compression maximale (0-6)
        })
        .toBuffer();

    case 'jpeg':
      return pipeline
        .jpeg({
          quality,
          mozjpeg: true, // Compression optimale
        })
        .toBuffer();

    case 'png':
      return pipeline
        .png({
          quality,
          compressionLevel: 9, // Compression maximale
        })
        .toBuffer();

    default:
      throw new Error(`Format non supporté: ${format}`);
  }
}

/**
 * Optimise une image pour les avatars/profils (carré)
 * 
 * @param buffer Buffer de l'image source
 * @param size Taille du carré (défaut: 400px)
 * @param quality Qualité (défaut: 85)
 * @returns Buffer optimisé en WebP
 */
export async function optimizeAvatar(
  buffer: Buffer,
  size: number = 400,
  quality: number = 85
): Promise<Buffer> {
  try {
    // Vérifier que le buffer est valide
    if (!buffer || buffer.length === 0) {
      throw new Error('Buffer d\'image vide ou invalide');
    }

    // Vérifier que Sharp peut lire l'image
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Impossible de lire les métadonnées de l\'image');
    }

    return sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .webp({
        quality,
        effort: 6,
      })
      .toBuffer();
  } catch (error) {
    console.error('Erreur dans optimizeAvatar:', error);
    throw new Error(`Échec de l'optimisation avatar: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Optimise une image pour les thumbnails
 * 
 * @param buffer Buffer de l'image source
 * @param width Largeur (défaut: 800px)
 * @param height Hauteur (défaut: 450px)
 * @param quality Qualité (défaut: 80)
 * @returns Buffer optimisé en WebP
 */
export async function optimizeThumbnail(
  buffer: Buffer,
  width: number = 800,
  height: number = 450,
  quality: number = 80
): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .webp({
      quality,
      effort: 6,
    })
    .toBuffer();
}

