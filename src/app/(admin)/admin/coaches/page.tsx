/**
 * Admin Coaches Page - Gestion des professeurs
 * 
 * Page de liste et gestion des coaches/instructeurs
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useState, useEffect } from 'react';
import { DataTable, DataTableColumn, ConfirmModal } from '@/components/admin';
import { CoachFormModal } from '@/components/admin/CoachFormModal';
import { Badge } from '@/components/common';
import { UserCircle } from 'lucide-react';

interface Coach {
  id: string;
  name: string;
  bio?: string | null;
  photo_url?: string | null;
  specialties?: string[] | null;
  years_experience: number;
  active: boolean;
  club_id?: string | null;
  created_at: string;
}

interface Club {
  id: string;
  name: string;
  city: string;
}

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCoaches();
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const response = await fetch('/api/clubs');
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    }
  };

  const loadCoaches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/coaches');
      if (response.ok) {
        const data = await response.json();
        setCoaches(data);
      }
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClubName = (clubId: string | null | undefined): string => {
    if (!clubId) return 'Tous les clubs';
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Club inconnu';
  };

  const columns: DataTableColumn<Coach>[] = [
    {
      key: 'photo_url',
      label: 'Photo',
      sortable: false,
      render: (value) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-2 border-primary/30 dark:border-primary/20 flex items-center justify-center shadow-sm shadow-primary/10">
          {value ? (
            <img
              src={value as string}
              alt="Coach"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-6 h-6 text-primary dark:text-primary-light" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (value) => {
        const fullName = value as string;
        const truncatedName = fullName.length > 40 ? `${fullName.substring(0, 40)}...` : fullName;
        return (
          <span 
            className="font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent"
            title={fullName.length > 40 ? fullName : undefined}
          >
            {truncatedName}
          </span>
        );
      },
    },
    {
      key: 'club_id',
      label: 'Club',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-secondary-light border border-secondary/20 dark:border-secondary/30">
          {getClubName(value as string | null)}
        </span>
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
  ];

  const handleCreate = () => {
    setSelectedCoach(null);
    setIsFormOpen(true);
  };

  const handleEdit = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsFormOpen(true);
  };

  const handleDelete = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (coachData: Partial<Coach>) => {
    try {
      setIsSubmitting(true);
      
      const url = selectedCoach
        ? `/api/admin/coaches/${selectedCoach.id}`
        : '/api/admin/coaches';
      
      const method = selectedCoach ? 'PUT' : 'POST';
      
      // Filtrer les champs vides et préparer les données
      const dataToSend: Partial<Coach> = {
        name: coachData.name || '',
        bio: coachData.bio || null,
        photo_url: coachData.photo_url && coachData.photo_url.trim() !== '' 
          ? coachData.photo_url 
          : null,
        specialties: coachData.specialties || [],
        years_experience: coachData.years_experience || 0,
        active: coachData.active ?? true,
        club_id: coachData.club_id || null,
      };
      
      // Si c'est une mise à jour, ne pas envoyer id, created_at, updated_at
      if (selectedCoach) {
        delete (dataToSend as any).id;
        delete (dataToSend as any).created_at;
        delete (dataToSend as any).updated_at;
      }
      
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        await loadCoaches();
        setIsFormOpen(false);
        setSelectedCoach(null);
      }
    } catch (error) {
      console.error('Error saving coach:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCoach) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/coaches/${selectedCoach.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCoaches();
        setIsDeleteOpen(false);
        setSelectedCoach(null);
      }
    } catch (error) {
      console.error('Error deleting coach:', error);
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
            Gestion des Professeurs
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Gérez vos coaches et instructeurs
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={coaches}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Aucun coach pour le moment"
        defaultSortColumn="name"
        defaultSortDirection="asc"
        newItemLabel="Nouveau Coach"
        onNewItemClick={handleCreate}
      />

      <CoachFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCoach(null);
        }}
        onSubmit={handleSubmit}
        coach={selectedCoach}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCoach(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le coach"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedCoach?.name} ? Cette action est irréversible.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

