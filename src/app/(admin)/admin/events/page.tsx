/**
 * Admin Events Page - Gestion des événements
 * 
 * Page de liste et gestion des événements avec DataTable
 * 
 * @version 1.0
 * @date 2025-11-05 01:15
 */

'use client';

import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin';
import { Badge } from '@/components/common';

interface Event {
  id: string;
  title: string;
  event_type: 'competition' | 'stage' | 'demonstration' | 'seminar' | 'other';
  club: string;
  start_date: string;
  location: string;
  max_attendees: number | null;
  registered: number;
  active: boolean;
}

// Données de démonstration
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Stage National de Vo Dao',
    event_type: 'stage',
    club: 'Marseille Centre',
    start_date: '2025-12-15',
    location: 'Marseille',
    max_attendees: 100,
    registered: 45,
    active: true,
  },
  {
    id: '2',
    title: 'Compétition Régionale PACA',
    event_type: 'competition',
    club: 'Nice Promenade',
    start_date: '2025-11-20',
    location: 'Nice',
    max_attendees: 150,
    registered: 89,
    active: true,
  },
  {
    id: '3',
    title: 'Démonstration Fête de la Ville',
    event_type: 'demonstration',
    club: 'Paris Bastille',
    start_date: '2025-11-10',
    location: 'Paris 11ème',
    max_attendees: null,
    registered: 12,
    active: true,
  },
  {
    id: '4',
    title: 'Séminaire Techniques Avancées',
    event_type: 'seminar',
    club: 'Strasbourg Centre',
    start_date: '2026-01-25',
    location: 'Strasbourg',
    max_attendees: 40,
    registered: 18,
    active: true,
  },
  {
    id: '5',
    title: 'Stage d\'été Enfants',
    event_type: 'stage',
    club: 'Créteil Université',
    start_date: '2025-07-10',
    location: 'Créteil',
    max_attendees: 60,
    registered: 55,
    active: false,
  },
];

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
  const [events] = useState<Event[]>(mockEvents);

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
      sortable: true,
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
      key: 'registered',
      label: 'Inscrits',
      sortable: true,
      render: (value, row) => {
        const percentage = row.max_attendees ? (value / row.max_attendees) * 100 : 0;
        const variant = percentage >= 80 ? 'warning' : percentage >= 50 ? 'primary' : 'default';
        
        return (
          <Badge variant={variant} size="sm">
            {value}{row.max_attendees ? ` / ${row.max_attendees}` : ''}
          </Badge>
        );
      },
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
    console.log('Edit event:', event);
    // TODO: Rediriger vers /admin/events/[id]/edit
  };

  const handleDelete = (event: Event) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`)) {
      console.log('Delete event:', event);
      // TODO: Implémenter la suppression
    }
  };

  const handleView = (event: Event) => {
    console.log('View event:', event);
    // TODO: Rediriger vers /events/[slug]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Événements</h1>
        <p className="text-gray-600">
          Gérez les événements, stages, compétitions et inscriptions
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        data={events}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Rechercher un événement..."
        newItemLabel="Nouvel Événement"
        newItemHref="/admin/events/new"
        emptyMessage="Aucun événement trouvé"
      />
    </div>
  );
}

