/**
 * Admin Clubs Page - Gestion des clubs
 * 
 * Page de liste et gestion des clubs avec DataTable
 * 
 * @version 1.0
 * @date 2025-11-05 01:05
 */

'use client';

import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin';
import { Badge } from '@/components/common';

interface Club {
  id: string;
  name: string;
  city: string;
  address: string;
  active: boolean;
  members_count: number;
  created_at: string;
}

// Données de démonstration
const mockClubs: Club[] = [
  {
    id: '1',
    name: 'Marseille Centre',
    city: 'Marseille',
    address: '12 Rue de la République, 13001 Marseille',
    active: true,
    members_count: 85,
    created_at: '2020-01-15',
  },
  {
    id: '2',
    name: 'Paris Bastille',
    city: 'Paris',
    address: '45 Boulevard Beaumarchais, 75011 Paris',
    active: true,
    members_count: 120,
    created_at: '2018-09-10',
  },
  {
    id: '3',
    name: 'Nice Promenade',
    city: 'Nice',
    address: '8 Promenade des Anglais, 06000 Nice',
    active: true,
    members_count: 65,
    created_at: '2021-03-20',
  },
  {
    id: '4',
    name: 'Créteil Université',
    city: 'Créteil',
    address: '23 Avenue du Général de Gaulle, 94000 Créteil',
    active: true,
    members_count: 42,
    created_at: '2022-01-05',
  },
  {
    id: '5',
    name: 'Strasbourg Centre',
    city: 'Strasbourg',
    address: '15 Rue du Dôme, 67000 Strasbourg',
    active: false,
    members_count: 30,
    created_at: '2019-11-12',
  },
];

export default function AdminClubsPage() {
  const [clubs] = useState<Club[]>(mockClubs);

  const columns: DataTableColumn<Club>[] = [
    {
      key: 'name',
      label: 'Nom du club',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
    },
    {
      key: 'city',
      label: 'Ville',
      sortable: true,
    },
    {
      key: 'address',
      label: 'Adresse',
      width: 'min-w-[200px]',
    },
    {
      key: 'members_count',
      label: 'Membres',
      sortable: true,
      render: (value) => (
        <Badge variant="primary" size="sm">
          {value} membres
        </Badge>
      ),
    },
    {
      key: 'active',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'default'} size="sm">
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Créé le',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  const handleEdit = (club: Club) => {
    console.log('Edit club:', club);
    // TODO: Rediriger vers /admin/clubs/[id]/edit
  };

  const handleDelete = (club: Club) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le club "${club.name}" ?`)) {
      console.log('Delete club:', club);
      // TODO: Implémenter la suppression
    }
  };

  const handleView = (club: Club) => {
    console.log('View club:', club);
    // TODO: Rediriger vers /clubs/[slug]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Clubs</h1>
        <p className="text-gray-600">
          Gérez les clubs, leurs informations et leurs membres
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        data={clubs}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Rechercher un club..."
        newItemLabel="Nouveau Club"
        newItemHref="/admin/clubs/new"
        emptyMessage="Aucun club trouvé"
      />
    </div>
  );
}

