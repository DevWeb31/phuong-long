/**
 * Admin Users Page - Gestion des utilisateurs
 * 
 * Page de liste et gestion des utilisateurs avec DataTable
 * 
 * @version 1.0
 * @date 2025-11-05 01:25
 */

'use client';

import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin';
import { Badge } from '@/components/common';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'coach' | 'admin';
  club: string | null;
  status: 'active' | 'inactive' | 'suspended';
  last_login: string | null;
  created_at: string;
}

// Données de démonstration
const mockUsers: User[] = [
  {
    id: '1',
    full_name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'admin',
    club: null,
    status: 'active',
    last_login: '2025-11-04T15:30:00',
    created_at: '2023-01-15',
  },
  {
    id: '2',
    full_name: 'Sarah Martin',
    email: 'sarah.martin@example.com',
    role: 'coach',
    club: 'Marseille Centre',
    status: 'active',
    last_login: '2025-11-03T18:45:00',
    created_at: '2023-03-20',
  },
  {
    id: '3',
    full_name: 'Pierre Leroy',
    email: 'pierre.leroy@example.com',
    role: 'user',
    club: 'Paris Bastille',
    status: 'active',
    last_login: '2025-11-04T10:20:00',
    created_at: '2024-06-10',
  },
  {
    id: '4',
    full_name: 'Marie Dubois',
    email: 'marie.dubois@example.com',
    role: 'user',
    club: 'Nice Promenade',
    status: 'active',
    last_login: '2025-10-28T14:15:00',
    created_at: '2024-08-05',
  },
  {
    id: '5',
    full_name: 'Thomas Bernard',
    email: 'thomas.bernard@example.com',
    role: 'coach',
    club: 'Strasbourg Centre',
    status: 'active',
    last_login: '2025-11-01T09:30:00',
    created_at: '2022-11-12',
  },
  {
    id: '6',
    full_name: 'Sophie Laurent',
    email: 'sophie.laurent@example.com',
    role: 'user',
    club: 'Créteil Université',
    status: 'inactive',
    last_login: '2025-08-15T16:00:00',
    created_at: '2023-09-01',
  },
  {
    id: '7',
    full_name: 'Lucas Petit',
    email: 'lucas.petit@example.com',
    role: 'user',
    club: null,
    status: 'suspended',
    last_login: '2025-09-20T12:00:00',
    created_at: '2024-02-14',
  },
];

const roleLabels: Record<string, string> = {
  user: 'Utilisateur',
  coach: 'Coach',
  admin: 'Administrateur',
};

const roleColors: Record<string, 'default' | 'primary' | 'warning'> = {
  user: 'default',
  coach: 'primary',
  admin: 'warning',
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
  const [users] = useState<User[]>(mockUsers);

  const columns: DataTableColumn<User>[] = [
    {
      key: 'full_name',
      label: 'Nom',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => <span className="text-gray-600">{value}</span>,
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
      render: (value) => value || <span className="text-gray-400 italic">Aucun</span>,
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
        if (!value) return <span className="text-gray-400 italic">Jamais</span>;
        
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h1>
        <p className="text-gray-600">
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

