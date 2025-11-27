/**
 * Admin Users Page - Gestion des utilisateurs
 * 
 * Page de liste et gestion des utilisateurs avec DataTable
 * 
 * @version 1.0
 * @date 2025-11-05 01:25
 */

'use client';

import { useState, useEffect } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { Badge } from '@/components/common';
import { useAuth } from '@/lib/hooks/useAuth';

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  club: string | null;
  club_city?: string | null;
  favorite_club_id?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  last_login: string | null;
  created_at: string;
  user_roles?: Array<{
    role_id: string;
    role_name: string;
    club_id: string | null;
    club_name: string | null;
  }>;
}

const roleLabels: Record<string, string> = {
  user: 'Utilisateur',
  coach: 'Coach',
  admin: 'Administrateur',
  moderator: 'Modérateur',
  student: 'Élève',
  developer: 'Développeur',
};

const roleColors: Record<string, 'default' | 'primary' | 'warning'> = {
  user: 'default',
  coach: 'primary',
  admin: 'warning',
  moderator: 'primary',
  student: 'default',
  developer: 'warning',
};

const statusLabels: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  suspended: 'Suspendu',
};

const statusColors: Record<string, 'success' | 'default' | 'danger'> = {
  active: 'success',
  inactive: 'default',
  suspended: 'danger',
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Array<{ id: string; name: string; city: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          if (response.status === 403) {
            setError('Vous n\'avez pas les permissions nécessaires pour accéder à cette page.');
            return;
          }
          throw new Error('Erreur lors du chargement des utilisateurs');
        }

        const data = await response.json();
        
        // Transformer les données de l'API en format attendu par le composant
        const transformedUsers: User[] = data.map((user: any) => {
          return {
            id: user.id,
            full_name: user.full_name || user.email?.split('@')[0] || 'Utilisateur',
            email: user.email || '',
            role: user.primary_role || 'user',
            club: user.club_city || user.club || null, // Utiliser club_city si disponible
            club_city: user.club_city || null,
            favorite_club_id: user.favorite_club_id || null,
            status: 'active' as const, // Par défaut actif, à adapter selon vos besoins
            last_login: user.last_sign_in_at || null,
            created_at: user.created_at,
            user_roles: user.user_roles || [],
          } as User;
        });

        setUsers(transformedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    async function fetchClubs() {
      try {
        const response = await fetch('/api/admin/clubs');
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        }
      } catch (err) {
        console.error('Error fetching clubs:', err);
      }
    }

    fetchUsers();
    fetchClubs();
  }, []);

  const columns: DataTableColumn<User>[] = [
    {
      key: 'full_name',
      label: 'Nom',
      sortable: true,
      render: (value) => (
        <span className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      sortable: true,
      render: (value) => (
        <Badge variant={roleColors[value]} size="sm">
          {roleLabels[value]}
        </Badge>
      ),
    },
    {
      key: 'club',
      label: 'Club',
      sortable: true,
      render: (value) => value || <span className="text-gray-400 dark:text-gray-400 italic">Aucun</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={statusColors[value]} size="sm">
          {statusLabels[value]}
        </Badge>
      ),
    },
    {
      key: 'last_login',
      label: 'Dernière connexion',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-gray-400 dark:text-gray-400 italic">Jamais</span>;
        
        const date = new Date(value);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Aujourd\'hui';
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        });
      },
    },
  ];

  const handleEdit = (user: User) => {
    // Empêcher la modification de l'utilisateur courant
    if (currentUser && user.id === currentUser.id) {
      alert('Vous ne pouvez pas modifier votre propre compte depuis cette interface.');
      return;
    }
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleSubmit = async (userData: {
    role_id: string | null;
    club_id: string | null;
    username?: string;
    bio?: string;
    avatar_url?: string;
  }) => {
    if (!selectedUser) return;

    console.log('[AdminUsersPage] handleSubmit appelé avec:', {
      userId: selectedUser.id,
      userData,
      userDataStringified: JSON.stringify(userData),
    });

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      console.log('[AdminUsersPage] Réponse API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la mise à jour';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          console.error('API Error:', errorData);
        } catch (e) {
          console.error('Error parsing response:', e);
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Recharger la liste des utilisateurs
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        const transformedUsers: User[] = data.map((user: any) => {
          return {
            id: user.id,
            full_name: user.full_name || user.email?.split('@')[0] || 'Utilisateur',
            email: user.email || '',
            role: user.primary_role || 'user',
            club: user.club_city || user.club || null, // Utiliser club_city si disponible
            status: 'active' as const,
            last_login: user.last_sign_in_at || null,
            created_at: user.created_at,
            user_roles: user.user_roles || [],
            // Ajouter club_city pour l'affichage
            club_city: user.club_city || null,
          } as User & { club_city?: string | null };
        });
        setUsers(transformedUsers);
      }

      setIsFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    // Empêcher la suppression de l'utilisateur courant
    if (currentUser && user.id === currentUser.id) {
      alert('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }

    // Double confirmation pour une action critique
    const confirmed = confirm(
      `⚠️ ATTENTION : Cette action est irréversible !\n\n` +
      `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${user.full_name || user.email}" ?\n\n` +
      `Toutes les données associées seront supprimées (profil, rôles, commentaires, inscriptions aux événements, favoris).\n\n` +
      `Les commandes seront conservées pour des raisons comptables.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      // Recharger la liste des utilisateurs
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        const transformedUsers: User[] = data.map((u: any) => {
          return {
            id: u.id,
            full_name: u.full_name || u.email?.split('@')[0] || 'Utilisateur',
            email: u.email || '',
            role: u.primary_role || 'user',
            club: u.club_city || u.club || null,
            status: 'active' as const,
            last_login: u.last_sign_in_at || null,
            created_at: u.created_at,
            user_roles: u.user_roles || [],
            club_city: u.club_city || null,
          } as User & { club_city?: string | null };
        });
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Gestion des Utilisateurs
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Gérez les utilisateurs de votre plateforme
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <p className="text-red-800 dark:text-red-200 font-semibold">Erreur</p>
          <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
        </div>
      )}
      <DataTable
        data={users}
        columns={columns}
        isLoading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Rechercher un utilisateur..."
        emptyMessage="Aucun utilisateur trouvé"
        canEdit={(user) => currentUser ? user.id !== currentUser.id : true}
        canDelete={(user) => currentUser ? user.id !== currentUser.id : true}
      />

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSubmit}
        user={selectedUser}
        clubs={clubs}
        isLoading={isSubmitting}
      />
    </div>
  );
}

