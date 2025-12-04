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
import { DataTable, DataTableColumn } from '@/components/admin';
import { ClubFormModal } from '@/components/admin/ClubFormModal';
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
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-2 border-primary/30 dark:border-primary/20 flex items-center justify-center shadow-sm shadow-primary/10">
          {value ? (
            <img
              src={value as string}
              alt={row.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '';
                  const shieldDiv = document.createElement('div');
                  shieldDiv.className = 'w-6 h-6 text-primary dark:text-primary-light';
                  parent.appendChild(shieldDiv);
                }
              }}
            />
          ) : (
            <Shield className="w-6 h-6 text-primary dark:text-primary-light" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nom du club',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
          {value}
        </span>
      ),
    },
    {
      key: 'members_count',
      label: 'Membres',
      sortable: true,
      align: 'center',
      render: (value) => {
        const count = value ?? 0;
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20 dark:border-primary/30">
            {count}
          </span>
        );
      },
    },
  ];

  const handleEdit = (club: Club) => {
    setSelectedClub(club);
    setIsFormOpen(true);
  };

  const handleView = (club: Club) => {
    window.open(`/clubs/${club.slug || club.id}`, '_blank');
  };

  const handleSubmit = async (clubData: Partial<Club>) => {
    try {
      setIsSubmitting(true);
      
      // Update only (création désactivée)
      const response = await fetch(`/api/admin/clubs/${selectedClub!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la mise à jour');
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Gestion des Clubs
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Gérez vos clubs et leurs informations
          </p>
        </div>
      </div>

      <DataTable
        data={clubs}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onView={handleView}
        searchPlaceholder="Rechercher un club..."
        emptyMessage="Aucun club trouvé"
        defaultSortColumn="name"
        defaultSortDirection="asc"
      />

      {/* Modal d'édition seulement (suppression et création désactivées) */}
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
    </div>
  );
}

