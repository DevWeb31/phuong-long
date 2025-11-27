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
    let newClubId: string | null = null;
    
    if (body.role_id !== undefined && body.role_id !== null) {
      // Normaliser role_id (convertir chaîne vide en null)
      const roleId = body.role_id && String(body.role_id).trim() !== '' ? body.role_id : null;
      
      // Récupérer le nom du rôle pour déterminer s'il nécessite un club
      let roleName: string | null = null;
      if (roleId) {
        const { data: roleData } = await adminSupabase
          .from('roles')
          .select('name')
          .eq('id', roleId)
          .single();
        roleName = (roleData as any)?.name || null;
      }
      
      // Supprimer tous les rôles existants de l'utilisateur (utiliser client admin pour contourner RLS)
      const { error: deleteRolesError } = await adminSupabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteRolesError) {
        console.error('Error deleting user roles:', deleteRolesError);
        return NextResponse.json({ 
          error: 'Erreur lors de la mise à jour des rôles',
          details: deleteRolesError.message 
        }, { status: 500 });
      }

      // Ajouter le nouveau rôle si un role_id valide est fourni
      if (roleId) {
        // Normaliser club_id (convertir chaîne vide en null)
        const clubId = body.club_id && String(body.club_id).trim() !== '' ? body.club_id : null;
        
        // Les rôles "student" et "coach" nécessitent un club_id
        // Si le rôle nécessite un club mais qu'aucun club_id n'est fourni, on utilise null
        // (l'admin devra peut-être le définir plus tard)
        newClubId = clubId;
        
        const { error: insertRoleError } = await adminSupabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: roleId,
            club_id: clubId,
            granted_by: user.id,
          } as any);

        if (insertRoleError) {
          console.error('Error inserting user role:', insertRoleError);
          return NextResponse.json({ 
            error: 'Erreur lors de la mise à jour des rôles',
            details: insertRoleError.message 
          }, { status: 500 });
        }
        
        // Si le rôle nécessite un club (student, coach), synchroniser favorite_club_id
        if ((roleName === 'student' || roleName === 'coach') && clubId) {
          // Mettre à jour favorite_club_id pour qu'il corresponde au club_id du rôle
          const { error: syncError } = await adminSupabase
            .from('user_profiles')
            .update({ favorite_club_id: clubId } as any)
            .eq('id', userId);
          
          if (syncError) {
            console.error('Error syncing favorite_club_id:', syncError);
            // Ne pas bloquer, juste logger l'erreur
          }
        } else if (roleName === 'admin' || roleName === 'developer' || roleName === 'moderator') {
          // Pour les rôles admin/developer/moderator, on ne change pas favorite_club_id
          // (ils peuvent avoir un club favori mais ce n'est pas lié à leur rôle)
        } else if (!roleId || !clubId) {
          // Si on supprime le rôle ou si le nouveau rôle n'a pas de club, 
          // on peut mettre favorite_club_id à null si c'était basé sur le rôle
          // Mais on préserve favorite_club_id si l'utilisateur l'a défini manuellement
          // (on ne le met à null que si body.club_id est explicitement null)
          if (body.club_id === null) {
            const { error: syncError } = await adminSupabase
              .from('user_profiles')
              .update({ favorite_club_id: null } as any)
              .eq('id', userId);
            
            if (syncError) {
              console.error('Error clearing favorite_club_id:', syncError);
            }
          }
        }
      } else {
        // Si on supprime tous les rôles, on peut aussi mettre favorite_club_id à null
        // si body.club_id est explicitement null
        if (body.club_id === null) {
          const { error: syncError } = await adminSupabase
            .from('user_profiles')
            .update({ favorite_club_id: null } as any)
            .eq('id', userId);
          
          if (syncError) {
            console.error('Error clearing favorite_club_id:', syncError);
          }
        }
      }
    }

    // Récupérer le profil existant pour préserver les valeurs non modifiées
    const { data: existingProfile } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Mettre à jour le profil utilisateur (seulement les champs autorisés)
    const profileUpdates: Record<string, unknown> = {
      // Préserver les valeurs existantes pour les champs obligatoires
      id: userId,
      username: existingProfile?.username || authUser.user.email?.split('@')[0] || `user_${userId.substring(0, 8)}`,
      full_name: existingProfile?.full_name || null,
      avatar_url: existingProfile?.avatar_url || null,
      bio: existingProfile?.bio || null,
      preferences: existingProfile?.preferences || {},
    };
    
    // Mettre à jour uniquement les champs fournis
    if (body.username !== undefined) {
      profileUpdates.username = body.username;
    }
    if (body.bio !== undefined) {
      profileUpdates.bio = body.bio;
    }
    if (body.avatar_url !== undefined) {
      profileUpdates.avatar_url = body.avatar_url;
    }
    
    // Mettre à jour favorite_club_id si un club_id est fourni
    // Normaliser club_id (convertir chaîne vide en null)
    console.log('[API UPDATE USER] body.club_id reçu:', body.club_id, 'type:', typeof body.club_id, 'is null:', body.club_id === null, 'is undefined:', body.club_id === undefined);
    if (body.club_id !== undefined) {
      // Si c'est null, garder null. Si c'est une chaîne vide, convertir en null. Sinon garder la valeur.
      let clubId: string | null = null;
      if (body.club_id === null) {
        clubId = null;
      } else if (typeof body.club_id === 'string' && body.club_id.trim() === '') {
        clubId = null;
      } else if (body.club_id) {
        clubId = String(body.club_id).trim();
      }
      console.log('[API UPDATE USER] clubId normalisé:', clubId, 'type:', typeof clubId);
      profileUpdates.favorite_club_id = clubId;
      console.log('[API UPDATE USER] profileUpdates.favorite_club_id défini à:', profileUpdates.favorite_club_id);
      
      // Récupérer les rôles actuels pour la synchronisation
      const { data: currentRoles } = await adminSupabase
        .from('user_roles')
        .select('id, role_id, club_id, roles(name)')
        .eq('user_id', userId);
      
      if (clubId) {
        // Si on assigne un club, synchroniser avec user_roles
        // (si l'utilisateur a un rôle student ou coach)
        const rolesWithClub = (currentRoles as any[])?.filter((ur: any) => {
          const roleName = ur.roles?.name;
          return (roleName === 'student' || roleName === 'coach');
        });
        
        // Si l'utilisateur a un rôle student ou coach, mettre à jour le club_id du rôle
        if (rolesWithClub && rolesWithClub.length > 0) {
          for (const userRole of rolesWithClub) {
            await adminSupabase
              .from('user_roles')
              .update({ club_id: clubId } as any)
              .eq('id', userRole.id);
          }
        }
        
        // Mettre à jour ou créer une demande d'adhésion approuvée dans club_membership_requests
        // pour maintenir la cohérence
        const { data: existingRequest } = await adminSupabase
          .from('club_membership_requests')
          .select('id, status')
          .eq('user_id', userId)
          .eq('club_id', clubId)
          .maybeSingle();
        
        if (existingRequest) {
          // Si la demande existe mais n'est pas approuvée, la mettre à jour
          if (existingRequest.status !== 'approved') {
            await adminSupabase
              .from('club_membership_requests')
              .update({
                status: 'approved',
                reviewed_at: new Date().toISOString(),
                reviewed_by: user.id,
              } as any)
              .eq('id', existingRequest.id);
          }
        } else {
          // Si aucune demande n'existe pour ce club, en créer une approuvée
          await adminSupabase
            .from('club_membership_requests')
            .insert({
              user_id: userId,
              club_id: clubId,
              status: 'approved',
              reviewed_at: new Date().toISOString(),
              reviewed_by: user.id,
            } as any);
        }
      } else {
        // Si on supprime le club (clubId est null), synchroniser avec user_roles et club_membership_requests
        console.log('[API UPDATE USER] Suppression du club - clubId est null');
        
        // Mettre à jour les rôles student/coach pour supprimer le club_id
        const rolesWithClub = (currentRoles as any[])?.filter((ur: any) => {
          const roleName = ur.roles?.name;
          return (roleName === 'student' || roleName === 'coach') && ur.club_id !== null;
        });
        
        console.log('[API UPDATE USER] Rôles avec club à mettre à jour:', rolesWithClub?.length || 0);
        
        if (rolesWithClub && rolesWithClub.length > 0) {
          for (const userRole of rolesWithClub) {
            console.log('[API UPDATE USER] Mise à jour user_role:', userRole.id, 'club_id -> null');
            const { error: updateError } = await adminSupabase
              .from('user_roles')
              .update({ club_id: null } as any)
              .eq('id', userRole.id);
            
            if (updateError) {
              console.error('[API UPDATE USER] Erreur lors de la mise à jour user_role:', updateError);
            } else {
              console.log('[API UPDATE USER] user_role mis à jour avec succès');
            }
          }
        }
        
        // Mettre à jour les demandes d'adhésion approuvées pour les rejeter
        // Cela permet de maintenir la cohérence : si on supprime le club, les demandes approuvées doivent être rejetées
        const { data: approvedRequests, error: requestsError } = await adminSupabase
          .from('club_membership_requests')
          .select('id, club_id, status')
          .eq('user_id', userId)
          .eq('status', 'approved');
        
        if (requestsError) {
          console.error('[API UPDATE USER] Erreur lors de la récupération des demandes approuvées:', requestsError);
        } else {
          console.log('[API UPDATE USER] Demandes approuvées trouvées:', approvedRequests?.length || 0);
          
          if (approvedRequests && approvedRequests.length > 0) {
            for (const request of approvedRequests) {
              console.log('[API UPDATE USER] Rejet de la demande d\'adhésion:', request.id, 'club:', request.club_id);
              const { error: rejectError } = await adminSupabase
                .from('club_membership_requests')
                .update({
                  status: 'rejected',
                  reviewed_at: new Date().toISOString(),
                  reviewed_by: user.id,
                  notes: 'Club supprimé manuellement par un administrateur',
                } as any)
                .eq('id', request.id);
              
              if (rejectError) {
                console.error('[API UPDATE USER] Erreur lors du rejet de la demande:', rejectError);
              } else {
                console.log('[API UPDATE USER] Demande rejetée avec succès');
              }
            }
          }
        }
      }
    }
    
    // Si body.club_id n'est pas fourni mais qu'on a un newClubId du changement de rôle, l'utiliser
    // MAIS seulement si favorite_club_id n'a pas déjà été défini explicitement
    if (body.club_id === undefined && newClubId !== null && profileUpdates.favorite_club_id === undefined) {
      console.log('[API UPDATE USER] Utilisation de newClubId du changement de rôle:', newClubId);
      profileUpdates.favorite_club_id = newClubId;
    }
    
    // Si body.club_id n'est pas fourni et qu'on n'a pas de newClubId, préserver l'existant
    // MAIS seulement si favorite_club_id n'a pas déjà été défini explicitement
    if (body.club_id === undefined && newClubId === null && profileUpdates.favorite_club_id === undefined && existingProfile?.favorite_club_id !== undefined) {
      console.log('[API UPDATE USER] Préservation du favorite_club_id existant:', existingProfile.favorite_club_id);
      profileUpdates.favorite_club_id = existingProfile.favorite_club_id;
    }
    
    console.log('[API UPDATE USER] État final de profileUpdates.favorite_club_id avant upsert:', profileUpdates.favorite_club_id);

    // Utiliser le client admin pour contourner RLS lors de la mise à jour du profil
    console.log('[API UPDATE USER] Mise à jour du profil avec:', {
      favorite_club_id: profileUpdates.favorite_club_id,
      favorite_club_id_type: typeof profileUpdates.favorite_club_id,
      favorite_club_id_is_null: profileUpdates.favorite_club_id === null,
      username: profileUpdates.username,
      bio: profileUpdates.bio,
      profileUpdates_keys: Object.keys(profileUpdates),
    });
    
    // Récupérer le profil actuel avant la mise à jour pour comparaison
    const { data: profileBefore } = await adminSupabase
      .from('user_profiles')
      .select('favorite_club_id')
      .eq('id', userId)
      .single();
    console.log('[API UPDATE USER] Profil AVANT mise à jour:', profileBefore);
    
    const { error: profileError, data: updatedProfileData } = await adminSupabase
      .from('user_profiles')
      .upsert({
        ...profileUpdates,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: 'id',
      })
      .select('favorite_club_id');

    if (profileError) {
      console.error('[API UPDATE USER] Erreur lors de la mise à jour du profil:', profileError);
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour du profil',
        details: profileError.message,
        code: profileError.code,
      }, { status: 500 });
    }
    
    console.log('[API UPDATE USER] Profil APRÈS mise à jour:', updatedProfileData?.[0]);
    console.log('[API UPDATE USER] favorite_club_id avant:', profileBefore?.favorite_club_id, 'après:', updatedProfileData?.[0]?.favorite_club_id);

    // Récupérer les données mises à jour (utiliser client admin pour contourner RLS)
    const { data: updatedProfile } = await adminSupabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: updatedRoles } = await adminSupabase
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

