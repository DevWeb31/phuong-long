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

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  club: string | null;
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
};

const roleColors: Record<string, 'default' | 'primary' | 'warning'> = {
  user: 'default',
  coach: 'primary',
  admin: 'warning',
  moderator: 'primary',
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
            status: 'active' as const, // Par défaut actif, à adapter selon vos besoins
            last_login: user.last_sign_in_at || null,
            created_at: user.created_at,
            user_roles: user.user_roles || [],
            // Ajouter club_city pour l'affichage
            club_city: user.club_city || null,
          } as User & { club_city?: string | null };
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
      render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">{value || 'N/A'}</span>,
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

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
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

  const handleDelete = (user: User) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.full_name}" ?`)) {
      console.log('Delete user:', user);
      // TODO: Implémenter la suppression
    }
  };

  const handleView = (user: User) => {
    console.log('View user:', user);
    // TODO: Ouvrir modal ou page détails utilisateur
  };

  return (
    <div className="space-y-6">
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
        onView={handleView}
        searchPlaceholder="Rechercher un utilisateur..."
        emptyMessage="Aucun utilisateur trouvé"
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

