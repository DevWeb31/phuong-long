/**
 * Upload Image API Route
 * 
 * Upload une image recadrée vers Supabase Storage
 * Optimise et convertit automatiquement en WebP
 * 
 * @version 2.0
 * @date 2025-11-06
 */

import { createAPIClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { optimizeAvatar } from '@/lib/utils/image-optimizer';

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
    const { image, folder = 'uploads', type = 'avatar' } = body;

    if (!image || !image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Image invalide' },
        { status: 400 }
      );
    }

    // Convertir base64 en buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    if (!base64Data || base64Data.length === 0) {
      return NextResponse.json(
        { error: 'Données base64 invalides' },
        { status: 400 }
      );
    }

    let originalBuffer: Buffer;
    try {
      originalBuffer = Buffer.from(base64Data, 'base64');
      if (!originalBuffer || originalBuffer.length === 0) {
        return NextResponse.json(
          { error: 'Impossible de convertir les données base64 en buffer' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Erreur conversion base64:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la conversion base64' },
        { status: 400 }
      );
    }

    // Optimiser l'image selon le type
    let optimizedBuffer: Buffer;
    let size: number;

    try {
      if (type === 'avatar' || folder === 'coaches') {
        // Pour les avatars/profils : carré 400x400px
        size = 400;
        optimizedBuffer = await optimizeAvatar(originalBuffer, size, 85);
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
      console.error('Détails de l\'erreur:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        bufferSize: originalBuffer.length,
      });
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'optimisation de l\'image',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

    // Déterminer le bucket selon le type/folder
    const bucketName = folder === 'coaches' ? 'coaches' : 'coaches'; // Bucket dédié aux photos de professeurs
    
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
        statusCode: error.statusCode,
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

    console.log('✅ Image convertie en WebP et uploadée avec succès:', {
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
    console.error('Erreur upload image:', error);
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

