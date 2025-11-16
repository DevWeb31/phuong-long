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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            club: user.club || null,
            status: 'active' as const, // Par défaut actif, à adapter selon vos besoins
            last_login: user.last_sign_in_at || null,
            created_at: user.created_at,
          };
        });

        setUsers(transformedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const columns: DataTableColumn<User>[] = [
    {
      key: 'full_name',
      label: 'Nom',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">{value || 'N/A'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => <span className="text-gray-600 dark:text-gray-500">{value}</span>,
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
    console.log('Edit user:', user);
    // TODO: Rediriger vers /admin/users/[id]/edit
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-500">
            Gérez les utilisateurs, rôles et permissions de la plateforme
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-500">
            Gérez les utilisateurs, rôles et permissions de la plateforme
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <p className="text-red-800 dark:text-red-200 font-semibold">Erreur</p>
          <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Gestion des Utilisateurs</h1>
        <p className="text-gray-600 dark:text-gray-500">
          Gérez les utilisateurs, rôles et permissions de la plateforme
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        data={users}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Rechercher un utilisateur..."
        emptyMessage="Aucun utilisateur trouvé"
      />
    </div>
  );
}

