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
import { Badge, Button } from '@/components/common';

interface Coach {
  id: string;
  name: string;
  bio?: string | null;
  photo_url?: string | null;
  specialties?: string[] | null;
  years_experience: number;
  active: boolean;
  display_order: number;
  club_id?: string | null;
  created_at: string;
}

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCoaches();
  }, []);

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

  const columns: DataTableColumn<Coach>[] = [
    {
      key: 'photo_url',
      label: 'Photo',
      sortable: false,
      render: (value) => (
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
          {value ? (
            <img
              src={value as string}
              alt="Coach"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-2xl">👨‍🏫</div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">{value as string}</span>
      ),
    },
    {
      key: 'years_experience',
      label: 'Expérience',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {value} ans
        </span>
      ),
    },
    {
      key: 'specialties',
      label: 'Spécialités',
      sortable: false,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {(value as string[] || []).slice(0, 3).map((spec, idx) => (
            <Badge key={idx} size="sm" className="bg-secondary/20 text-secondary-dark border-secondary/30">
              {spec}
            </Badge>
          ))}
          {(value as string[] || []).length > 3 && (
            <Badge size="sm" variant="default">
              +{(value as string[]).length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'display_order',
      label: 'Ordre',
      sortable: true,
      render: (value) => (
        <Badge size="sm" variant="default">
          {value as number}
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
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coachData),
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Professeurs / Coaches
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les instructeurs et leur affichage sur le site
          </p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          ➕ Nouveau Coach
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={coaches}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Aucun coach pour le moment"
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

