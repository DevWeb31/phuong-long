/**
 * Admin User Update API Route
 * 
 * Mise à jour d'un utilisateur (rôles, club, statut)
 * Note: Ne permet PAS de modifier nom, email ou mot de passe
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { checkAdminRole } from '@/lib/utils/check-admin-role';

export const runtime = 'nodejs';

// PATCH - Update user (roles, club, status only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const isAdmin = await checkAdminRole(user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const userId = params.id;
    const body = await request.json();

    // Vérifier que l'utilisateur existe
    const adminSupabase = createAdminClient();
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Mettre à jour les rôles si fournis
    if (body.role_id !== undefined) {
      // Supprimer tous les rôles existants de l'utilisateur
      const { error: deleteRolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteRolesError) {
        console.error('Error deleting user roles:', deleteRolesError);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour des rôles' }, { status: 500 });
      }

      // Ajouter le nouveau rôle
      if (body.role_id) {
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: body.role_id,
            club_id: body.club_id || null,
            granted_by: user.id,
          });

        if (insertRoleError) {
          console.error('Error inserting user role:', insertRoleError);
          return NextResponse.json({ error: 'Erreur lors de la mise à jour des rôles' }, { status: 500 });
        }
      }
    }

    // Mettre à jour le profil utilisateur (seulement les champs autorisés)
    const profileUpdates: Record<string, unknown> = {};
    
    if (body.username !== undefined) {
      profileUpdates.username = body.username;
    }
    if (body.bio !== undefined) {
      profileUpdates.bio = body.bio;
    }
    if (body.avatar_url !== undefined) {
      profileUpdates.avatar_url = body.avatar_url;
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...profileUpdates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
      }
    }

    // Récupérer les données mises à jour
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: updatedRoles } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        club_id,
        roles!inner(name),
        clubs(name)
      `)
      .eq('user_id', userId);

    return NextResponse.json({
      id: userId,
      email: authUser.user.email,
      full_name: updatedProfile?.full_name || null,
      username: updatedProfile?.username || null,
      avatar_url: updatedProfile?.avatar_url || null,
      bio: updatedProfile?.bio || null,
      user_roles: updatedRoles?.map((ur: any) => ({
        role_id: ur.role_id,
        role_name: ur.roles?.name,
        club_id: ur.club_id,
        club_name: ur.clubs?.name,
      })) || [],
      primary_role: updatedRoles?.[0]?.roles?.name || 'user',
      club: updatedRoles?.[0]?.clubs?.name || null,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

