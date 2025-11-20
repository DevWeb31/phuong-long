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
import { Badge } from '@/components/common';

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
  cover_image_url?: string | null;
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
      key: 'cover_image_url',
      label: 'Image',
      sortable: false,
      render: (value, row) => (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          {value ? (
            <img
              src={value as string}
              alt={row.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                const parent = img.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-2xl">📅</span>';
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          ) : (
            <span className="text-2xl">📅</span>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (value) => {
        const title = value as string;
        const truncatedTitle = title.length > 20 ? `${title.slice(0, 20)}...` : title;
        return (
          <div className="relative group">
            <span className="font-medium text-gray-900 dark:text-gray-100">{truncatedTitle}</span>
            {title.length > 20 && (
              <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 max-w-xs whitespace-normal">
                {title}
                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
              </div>
            )}
          </div>
        );
      },
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
      render: (_, row) => row.club ? row.club.city : '-',
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
      key: 'max_attendees',
      label: 'Places max',
      sortable: true,
      render: (value) => value ? (
        <Badge variant="primary" size="sm">
          {value} places
        </Badge>
      ) : (
        <span className="text-gray-400 dark:text-gray-400">Illimité</span>
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
      
      const images = eventData.images || [];
      const sessions = eventData.sessions || [];
      const eventDataWithoutExtras = { ...eventData };
      delete eventDataWithoutExtras.images;
      delete eventDataWithoutExtras.sessions;
      
      let eventId: string;
      
      if (selectedEvent) {
        // Mise à jour d'un événement existant
        const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventDataWithoutExtras),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Update error details:', errorData);
          throw new Error(errorData.details || 'Erreur lors de la mise à jour');
        }
        eventId = selectedEvent.id;
      } else {
        // Création d'un nouvel événement
        const response = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventDataWithoutExtras),
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Create error details:', errorData);
          throw new Error(errorData.details || 'Erreur lors de la création');
        }
        const createdEvent = await response.json();
        eventId = createdEvent.id;
      }

      // Sauvegarder les images si présentes
      if (images.length > 0) {
        // D'abord supprimer toutes les images existantes
        const existingImagesResponse = await fetch(`/api/events/${eventId}/images`);
        if (existingImagesResponse.ok) {
          const existingImages = await existingImagesResponse.json();
          for (const img of existingImages) {
            await fetch(`/api/events/images/${img.id}`, { method: 'DELETE' });
          }
        }

        // Puis créer les nouvelles images
        for (const image of images) {
          await fetch(`/api/events/${eventId}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(image),
          });
        }
      }

      // Sauvegarder les sessions si présentes
      if (sessions.length > 0) {
        // D'abord supprimer toutes les sessions existantes
        const existingSessionsResponse = await fetch(`/api/events/${eventId}/sessions`);
        if (existingSessionsResponse.ok) {
          const existingSessions = await existingSessionsResponse.json();
          for (const session of existingSessions) {
            await fetch(`/api/events/sessions/${session.id}`, { method: 'DELETE' });
          }
        }

        // Puis créer les nouvelles sessions
        for (const session of sessions) {
          await fetch(`/api/events/${eventId}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session),
          });
        }
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
      <DataTable
        data={events}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Rechercher un événement..."
        emptyMessage="Aucun événement trouvé"
        newItemLabel="Nouvel Événement"
        onNewItemClick={handleCreateNew}
      />

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

