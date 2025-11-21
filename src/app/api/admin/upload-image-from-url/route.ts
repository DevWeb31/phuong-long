/**
 * Upload Image From URL API Route
 * 
 * Télécharge une image depuis une URL externe, la convertit en WebP et l'upload vers Supabase Storage
 * 
 * @version 1.0
 * @date 2025-01-18
 */

import { createAPIClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { optimizeCover } from '@/lib/utils/image-optimizer';

// Forcer l'utilisation du runtime Node.js (nécessaire pour Sharp)
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 secondes max pour le traitement

export async function POST(request: Request) {
  try {
    const supabase = await createAPIClient();
    
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier les permissions admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .single();

    if (!roles || (roles as any).roles?.name !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrl, folder = 'clubs', type = 'cover' } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL de l\'image requise' },
        { status: 400 }
      );
    }

    // Valider l'URL
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      );
    }

    // Télécharger l'image depuis l'URL
    console.log('📥 Téléchargement de l\'image depuis:', imageUrl);
    
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Impossible de télécharger l'image (${imageResponse.status})` },
        { status: 400 }
      );
    }

    // Vérifier que c'est bien une image
    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'L\'URL ne pointe pas vers une image valide' },
        { status: 400 }
      );
    }

    // Convertir la réponse en buffer
    const arrayBuffer = await imageResponse.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    if (!originalBuffer || originalBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Impossible de convertir l\'image en buffer' },
        { status: 400 }
      );
    }

    // Optimiser l'image selon le type
    let optimizedBuffer: Buffer;

    try {
      if (type === 'cover' || folder === 'clubs' || type === 'hero-slide' || folder === 'hero-slides') {
        // Pour les images de couverture de clubs : 16:9 (1200x675px)
        optimizedBuffer = await optimizeCover(originalBuffer, 1200, 675, 85);
      } else {
        // Pour les autres images : max 1200px avec ratio conservé
        const { optimizeImage } = await import('@/lib/utils/image-optimizer');
        optimizedBuffer = await optimizeImage(originalBuffer, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 85,
          format: 'webp',
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'optimisation de l\'image',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

    // Déterminer le bucket selon le type/folder
    const bucketName =
      folder === 'coaches'
        ? 'coaches'
        : folder === 'clubs'
          ? 'clubs'
          : folder === 'hero-slides'
            ? 'hero-slides'
            : folder || 'uploads';
    
    // Générer un nom de fichier unique en WebP
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

    // Upload vers Supabase Storage (toujours en WebP maintenant)
    console.log('📤 Tentative d\'upload vers Supabase Storage:', {
      bucket: bucketName,
      fileName,
      format: 'WebP',
      bufferSize: `${(optimizedBuffer.length / 1024).toFixed(2)} KB`,
      user: user.id,
    });

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      console.error('❌ Erreur upload Supabase:', {
        error,
        message: error.message,
        bucket: bucketName,
        fileName,
      });
      return NextResponse.json(
        { 
          error: 'Échec de l\'upload',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    console.log('✅ Upload réussi vers Supabase Storage:', data);

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log('✅ Image téléchargée, convertie en WebP et uploadée avec succès:', {
      fileName,
      url: urlData.publicUrl,
      bucket: bucketName,
      format: 'WebP',
      size: `${(optimizedBuffer.length / 1024).toFixed(2)} KB`,
    });

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
    });
  } catch (error) {
    console.error('Erreur upload image depuis URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Stack trace:', error instanceof Error ? error.stack : undefined);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

