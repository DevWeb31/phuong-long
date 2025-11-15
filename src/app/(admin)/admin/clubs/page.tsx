/**
 * Admin Clubs Page - Gestion des clubs
 * 
 * Page de liste et gestion des clubs avec DataTable
 * 
 * @version 1.0
 * @date 2025-11-05 01:05
 */

'use client';

import { useState, useEffect } from 'react';
import { DataTable, DataTableColumn, ConfirmModal } from '@/components/admin';
import { ClubFormModal } from '@/components/admin/ClubFormModal';
import { Badge, Button } from '@/components/common';
import { Shield } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  city: string;
  address: string;
  postal_code?: string;
  slug?: string;
  cover_image_url?: string;
  active: boolean;
  members_count?: number;
  created_at: string;
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les clubs depuis l'API
  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/clubs');
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: DataTableColumn<Club>[] = [
    {
      key: 'cover_image_url',
      label: 'Image',
      sortable: false,
      render: (value, row) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          {value ? (
            <img
              src={value as string}
              alt={row.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const shieldDiv = document.createElement('div');
                shieldDiv.className = 'w-12 h-12 text-gray-400';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '';
                (e.target as HTMLImageElement).parentElement!.appendChild(shieldDiv);
              }}
            />
          ) : (
            <Shield className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nom du club',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>,
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
      render: (value) => value ? (
        <Badge variant="primary" size="sm">
          {value} membres
        </Badge>
      ) : (
        <span className="text-gray-400 dark:text-gray-400">-</span>
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
    setSelectedClub(club);
    setIsFormOpen(true);
  };

  const handleDelete = (club: Club) => {
    setSelectedClub(club);
    setIsDeleteOpen(true);
  };

  const handleView = (club: Club) => {
    window.open(`/clubs/${club.slug || club.id}`, '_blank');
  };

  const handleCreateNew = () => {
    setSelectedClub(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (clubData: Partial<Club>) => {
    try {
      setIsSubmitting(true);
      
      if (selectedClub) {
        // Update
        const response = await fetch(`/api/admin/clubs/${selectedClub.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clubData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.details || errorData.error || 'Erreur lors de la mise à jour');
        }
      } else {
        // Create
        const response = await fetch('/api/admin/clubs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clubData),
        });

        if (!response.ok) throw new Error('Erreur lors de la création');
      }

      await loadClubs();
      setIsFormOpen(false);
      setSelectedClub(null);
    } catch (error) {
      console.error('Error submitting club:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      alert(`Erreur : ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClub) return;

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/clubs/${selectedClub.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      await loadClubs();
      setIsDeleteOpen(false);
      setSelectedClub(null);
    } catch (error) {
      console.error('Error deleting club:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Gestion des Clubs</h1>
          <p className="text-gray-600 dark:text-gray-500">
            Gérez les clubs, leurs informations et leurs membres
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          ➕ Nouveau Club
        </Button>
      </div>

      {/* DataTable */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 dark:border-gray-800"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-500">Chargement...</p>
        </div>
      ) : (
        <DataTable
          data={clubs}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Rechercher un club..."
          emptyMessage="Aucun club trouvé"
        />
      )}

      {/* Modals */}
      <ClubFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedClub(null);
        }}
        onSubmit={handleSubmit}
        club={selectedClub}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedClub(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le club"
        message={`Êtes-vous sûr de vouloir supprimer le club "${selectedClub?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

