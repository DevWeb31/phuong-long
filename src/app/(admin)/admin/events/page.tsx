/**
 * Admin Events Page - Gestion des événements
 * 
 * Page de liste et gestion des événements avec DataTable
 * 
 * @version 1.0
 * @date 2025-11-05 01:15
 */

'use client';

import { useState, useEffect } from 'react';
import { DataTable, DataTableColumn, ConfirmModal } from '@/components/admin';
import { EventFormModal } from '@/components/admin/EventFormModal';
import { Badge, Button } from '@/components/common';

interface Event {
  id: string;
  title: string;
  event_type: 'competition' | 'stage' | 'demonstration' | 'seminar' | 'other';
  club?: { name: string; city: string };
  start_date: string;
  location?: string;
  max_attendees?: number | null;
  active: boolean;
  slug?: string;
}

const eventTypeLabels: Record<string, string> = {
  competition: 'Compétition',
  stage: 'Stage',
  demonstration: 'Démonstration',
  seminar: 'Séminaire',
  other: 'Autre',
};

const eventTypeColors: Record<string, 'primary' | 'warning' | 'info' | 'success'> = {
  competition: 'warning',
  stage: 'primary',
  demonstration: 'info',
  seminar: 'success',
  other: 'primary',
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Array<{ id: string; name: string; city: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
    loadClubs();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClubs = async () => {
    try {
      const response = await fetch('/api/admin/clubs');
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    }
  };

  const columns: DataTableColumn<Event>[] = [
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
      width: 'min-w-[200px]',
    },
    {
      key: 'event_type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <Badge variant={eventTypeColors[value]} size="sm">
          {eventTypeLabels[value]}
        </Badge>
      ),
    },
    {
      key: 'club',
      label: 'Club',
      sortable: false,
      render: (_, row) => row.club ? `${row.club.name} - ${row.club.city}` : '-',
    },
    {
      key: 'start_date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    },
    {
      key: 'location',
      label: 'Lieu',
      sortable: true,
    },
    {
      key: 'max_attendees',
      label: 'Places max',
      sortable: true,
      render: (value) => value ? (
        <Badge variant="primary" size="sm">
          {value} places
        </Badge>
      ) : (
        <span className="text-gray-400 text-sm">Illimité</span>
      ),
    },
    {
      key: 'active',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'default'} size="sm">
          {value ? 'Actif' : 'Terminé'}
        </Badge>
      ),
    },
  ];

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  };

  const handleView = (event: Event) => {
    window.open(`/events/${event.slug || event.id}`, '_blank');
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (eventData: any) => {
    try {
      setIsSubmitting(true);
      
      if (selectedEvent) {
        const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      } else {
        const response = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (!response.ok) throw new Error('Erreur lors de la création');
      }

      await loadEvents();
      setIsFormOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await loadEvents();
      setIsDeleteOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Événements</h1>
          <p className="text-gray-600">
            Gérez les événements, stages, compétitions et inscriptions
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          ➕ Nouvel Événement
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : (
        <DataTable
          data={events}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Rechercher un événement..."
          emptyMessage="Aucun événement trouvé"
        />
      )}

      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleSubmit}
        event={selectedEvent as any}
        clubs={clubs}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'événement"
        message={`Êtes-vous sûr de vouloir supprimer l'événement "${selectedEvent?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

