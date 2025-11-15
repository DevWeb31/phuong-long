/**
 * Events List Component
 * 
 * Liste d'événements avec filtrage et organisation temporelle
 * 
 * @version 2.0
 * @date 2025-11-08
 */

'use client';

import { useState, useMemo } from 'react';
import { EventsFilters } from './EventsFilters';
import { EventsTabs, type EventTimeFilter } from './EventsTabs';
import { EventsCarousel } from './EventsCarousel';
import { EventCarouselCard } from './EventCarouselCard';
import { CalendarIcon } from '@heroicons/react/24/outline';
import type { Event } from '@/lib/types';

interface Club {
  id: string;
  name: string;
  city: string;
  slug: string;
}

interface EventWithClub extends Event {
  club: Club | null;
}

interface EventsListProps {
  events: EventWithClub[];
  clubs: Club[];
}

// Fonction helper pour déterminer le statut temporel d'un événement
function getEventTimeStatus(event: EventWithClub): EventTimeFilter {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : startDate;

  // En cours : start_date <= maintenant <= end_date
  if (startDate <= now && endDate >= now) {
    return 'current';
  }

  // À venir : start_date > maintenant
  if (startDate > now) {
    return 'upcoming';
  }

  // Passé : end_date < maintenant
  return 'past';
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  competition: 'Compétitions',
  stage: 'Stages',
  demonstration: 'Démonstrations',
  seminar: 'Séminaires',
  other: 'Autres',
};

export function EventsList({ events, clubs }: EventsListProps) {
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeTimeFilter, setActiveTimeFilter] = useState<EventTimeFilter>('upcoming');

  // Catégoriser les événements par statut temporel
  const categorizedEvents = useMemo(() => {
    const upcoming: EventWithClub[] = [];
    const current: EventWithClub[] = [];
    const past: EventWithClub[] = [];

    events.forEach((event) => {
      const status = getEventTimeStatus(event);
      if (status === 'upcoming') upcoming.push(event);
      else if (status === 'current') current.push(event);
      else past.push(event);
    });

    return { upcoming, current, past };
  }, [events]);

  // Événements à afficher selon l'onglet actif
  const eventsForActiveTab = useMemo(() => {
    return categorizedEvents[activeTimeFilter];
  }, [categorizedEvents, activeTimeFilter]);

  // Filtrer les événements
  const filteredEvents = useMemo(() => {
    let filtered = [...eventsForActiveTab];

    if (selectedClub) {
      filtered = filtered.filter((event) => event.club?.id === selectedClub);
    }

    if (selectedType) {
      filtered = filtered.filter((event) => event.event_type === selectedType);
    }

    return filtered;
  }, [eventsForActiveTab, selectedClub, selectedType]);

  // Calculer les compteurs pour les filtres en tenant compte des filtres déjà appliqués
  const eventCounts = useMemo(() => {
    // Base de calcul : événements de l'onglet actif avec les filtres partiels appliqués
    let baseEvents = [...eventsForActiveTab];

    // Si un filtre club est sélectionné, on calcule les compteurs de type sur ce club uniquement
    // Si un filtre type est sélectionné, on calcule les compteurs de club sur ce type uniquement
    // Si aucun filtre n'est sélectionné, on calcule sur tous les événements de l'onglet

    const byType: Record<string, number> = {};
    const byClub: Record<string, number> = {};

    // Calculer les compteurs en tenant compte des filtres déjà appliqués
    baseEvents.forEach((event) => {
      // Si un club est sélectionné, on ne compte que les événements de ce club pour les types
      if (selectedClub) {
        if (event.club?.id === selectedClub) {
          byType[event.event_type] = (byType[event.event_type] || 0) + 1;
        }
      } else {
        // Sinon, on compte tous les événements pour les types
        byType[event.event_type] = (byType[event.event_type] || 0) + 1;
      }

      // Si un type est sélectionné, on ne compte que les événements de ce type pour les clubs
      if (selectedType) {
        if (event.event_type === selectedType) {
          if (event.club?.id) {
            byClub[event.club.id] = (byClub[event.club.id] || 0) + 1;
          }
        }
      } else {
        // Sinon, on compte tous les événements pour les clubs
        if (event.club?.id) {
          byClub[event.club.id] = (byClub[event.club.id] || 0) + 1;
        }
      }
    });

    return {
      total: filteredEvents.length, // Total des événements après tous les filtres
      byType,
      byClub,
    };
  }, [eventsForActiveTab, selectedClub, selectedType, filteredEvents.length]);

  // Grouper par type
  const eventsByType = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      const type = event.event_type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(event);
      return acc;
    }, {} as Record<string, EventWithClub[]>);
  }, [filteredEvents]);

  // Compteurs pour les onglets
  const tabCounts = useMemo(() => ({
    upcoming: categorizedEvents.upcoming.length,
    current: categorizedEvents.current.length,
    past: categorizedEvents.past.length,
  }), [categorizedEvents]);

  // Changer d'onglet sans réinitialiser les filtres
  const handleTabChange = (tab: EventTimeFilter) => {
    setActiveTimeFilter(tab);
    // Les filtres (club et type) sont conservés lors du changement d'onglet
  };

  return (
    <>
      {/* Onglets temporels */}
      <EventsTabs
        activeTab={activeTimeFilter}
        onTabChange={handleTabChange}
        counts={tabCounts}
      />

      {/* Filtres */}
      <EventsFilters
        clubs={clubs}
        selectedClub={selectedClub}
        selectedType={selectedType}
        onClubChange={setSelectedClub}
        onTypeChange={setSelectedType}
        eventCounts={eventCounts}
      />

      {/* Liste des événements */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950 relative overflow-hidden min-h-[400px]">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Événements par type avec carrousel horizontal */}
          {Object.entries(eventsByType).map(([type, typeEvents]) => (
            <EventsCarousel
              key={type}
              title={!selectedType ? EVENT_TYPE_LABELS[type] || type : undefined}
              count={!selectedType ? typeEvents.length : undefined}
            >
              {typeEvents.map((event) => {
                const timeStatus = getEventTimeStatus(event);
                return (
                  <EventCarouselCard
                    key={event.id}
                    event={event}
                    timeStatus={timeStatus}
                  />
                );
              })}
            </EventsCarousel>
          ))}

          {/* Empty state contextuel */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <CalendarIcon className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {activeTimeFilter === 'upcoming' && 'Aucun événement à venir'}
                {activeTimeFilter === 'current' && 'Aucun événement en cours'}
                {activeTimeFilter === 'past' && 'Aucun événement passé'}
              </h3>
              {(selectedClub || selectedType) ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Aucun événement {activeTimeFilter === 'upcoming' && 'à venir'}{activeTimeFilter === 'current' && 'en cours'}{activeTimeFilter === 'past' && 'passé'} ne correspond à vos filtres.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedClub(null);
                      setSelectedType(null);
                    }}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Réinitialiser les filtres
                  </button>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {activeTimeFilter === 'upcoming' && 'Consultez les événements passés ou revenez plus tard.'}
                  {activeTimeFilter === 'current' && 'Aucun événement n\'est en cours actuellement.'}
                  {activeTimeFilter === 'past' && 'L\'historique des événements sera bientôt disponible.'}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

