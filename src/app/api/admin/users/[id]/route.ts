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
  { params }: { params: Promise<{ id: string }> }
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

    const { id: userId } = await params;
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
          } as any);

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
        } as any, {
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

    const profile = updatedProfile as { full_name?: string; username?: string; avatar_url?: string; bio?: string } | null;
    const roles = updatedRoles as Array<{ roles?: { name: string }; clubs?: { name: string } }> | null;
    
    return NextResponse.json({
      id: userId,
      email: authUser.user.email,
      full_name: profile?.full_name || null,
      username: profile?.username || null,
      avatar_url: profile?.avatar_url || null,
      bio: profile?.bio || null,
      user_roles: roles?.map((ur: any) => ({
        role_id: ur.role_id,
        role_name: ur.roles?.name,
        club_id: ur.club_id,
        club_name: ur.clubs?.name,
      })) || [],
      primary_role: roles?.[0]?.roles?.name || 'user',
      club: roles?.[0]?.clubs?.name || null,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un utilisateur (avec cascade)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: userId } = await params;

    // Empêcher l'auto-suppression
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Vérifier que l'utilisateur existe
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Supprimer les blog posts de l'utilisateur (avant la suppression de l'utilisateur)
    // Les commentaires seront supprimés automatiquement via CASCADE
    const { error: deletePostsError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('author_id', userId);

    if (deletePostsError) {
      console.error('Error deleting user blog posts:', deletePostsError);
      // On continue quand même la suppression de l'utilisateur
    }

    // Supprimer l'utilisateur dans auth.users
    // Cela déclenchera automatiquement les CASCADE sur :
    // - user_profiles
    // - user_roles
    // - blog_comments
    // - event_registrations
    // - user_bookmarks
    // Les orders et audit_logs resteront (orders pour comptabilité, audit_logs pour traçabilité)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'utilisateur' },
        { status: 500 }
      );
    }

    // Créer un log d'audit pour la suppression
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'delete',
        table_name: 'auth.users',
        record_id: userId,
        old_data: {
          email: authUser.user.email,
          created_at: authUser.user.created_at,
        },
        new_data: null,
      } as any);
    } catch (auditError) {
      // Log l'erreur mais ne bloque pas la suppression
      console.error('Error creating audit log:', auditError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

