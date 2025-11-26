/**
 * Delete Image API Route
 * 
 * Supprime une image du bucket Supabase Storage
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import { createAPIClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

export async function DELETE(request: Request) {
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

    // Vérifier le rôle admin
    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès refusé. Rôle admin requis.' },
        { status: 403 }
      );
    }

    // Récupérer l'URL de l'image à supprimer
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'URL de l\'image requise' },
        { status: 400 }
      );
    }

    // Extraire le nom du fichier depuis l'URL Supabase Storage
    // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[filename]
    const urlMatch = imageUrl.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/);
    
    if (!urlMatch || !urlMatch[1] || !urlMatch[2]) {
      return NextResponse.json(
        { error: 'URL invalide ou non issue de Supabase Storage' },
        { status: 400 }
      );
    }

    const [, bucketName, fileName] = urlMatch;

    // Vérifier que c'est bien un bucket autorisé (coaches ou clubs)
    if (bucketName !== 'coaches' && bucketName !== 'clubs') {
      return NextResponse.json(
        { error: 'Seules les images des buckets coaches ou clubs peuvent être supprimées' },
        { status: 403 }
      );
    }

    // Vérifier que fileName est défini
    if (!fileName) {
      return NextResponse.json(
        { error: 'Nom de fichier invalide' },
        { status: 400 }
      );
    }

    // Supprimer le fichier
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      return NextResponse.json(
        { 
          error: 'Échec de la suppression',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Image supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur dans delete-image:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Erreur inconnue')
          : undefined
      },
      { status: 500 }
    );
  }
}

