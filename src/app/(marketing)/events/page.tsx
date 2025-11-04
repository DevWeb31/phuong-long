/**
 * Events List Page
 * 
 * Page liste événements avec filtres
 * 
 * @version 1.0
 * @date 2025-11-04 21:50
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, CardHeader, CardTitle, Badge, Button } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Événements',
  description: 'Stages, compétitions, démonstrations et séminaires Phuong Long Vo Dao. Participez aux événements dans toute la France.',
};

export default async function EventsPage() {
  const supabase = await createServerClient();
  
  // Récupérer tous les événements à venir
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      club:clubs(name, city, slug)
    `)
    .eq('active', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date');

  const typedEvents = (events || []) as unknown as Array<Event & { club: { name: string; city: string; slug: string } | null }>;

  // Grouper par type
  const eventsByType = typedEvents?.reduce((acc, event) => {
    const type = event.event_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(event);
    return acc;
  }, {} as Record<string, typeof typedEvents>);

  const eventTypeLabels: Record<string, string> = {
    competition: 'Compétitions',
    stage: 'Stages',
    demonstration: 'Démonstrations',
    seminar: 'Séminaires',
    other: 'Autres',
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-16 lg:py-20">
        <Container>
          <div className="text-center text-white max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Événements & Compétitions
            </h1>
            <p className="text-xl text-white/90">
              Participez aux stages, compétitions et démonstrations dans toute la France
            </p>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-8 bg-white border-b">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{typedEvents?.length || 0}</div>
              <div className="text-sm text-gray-600">Événements à venir</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">{eventsByType?.stage?.length || 0}</div>
              <div className="text-sm text-gray-600">Stages</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">{eventsByType?.competition?.length || 0}</div>
              <div className="text-sm text-gray-600">Compétitions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-700">{eventsByType?.demonstration?.length || 0}</div>
              <div className="text-sm text-gray-600">Démonstrations</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Events par type */}
      <section className="py-16 lg:py-24">
        <Container>
          {eventsByType && Object.entries(eventsByType).map(([type, typeEvents]) => (
            typeEvents && Array.isArray(typeEvents) && typeEvents.length > 0 && (
              <div key={type} className="mb-16 last:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-primary rounded-full" />
                  {eventTypeLabels[type] || type}
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {typeEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.slug}`}>
                      <Card variant="bordered" hoverable className="h-full flex flex-col">
                        <CardHeader className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="warning" size="sm">
                              {new Date(event.start_date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </Badge>
                            {event.price_cents === 0 ? (
                              <Badge variant="success" size="sm">Gratuit</Badge>
                            ) : (
                              <Badge variant="primary" size="sm">
                                {(event.price_cents / 100).toFixed(0)}€
                              </Badge>
                            )}
                          </div>
                          
                          <CardTitle className="line-clamp-2 mb-3">
                            {event.title}
                          </CardTitle>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            {event.club && (
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-gray-400" />
                                <span>{event.club.city}</span>
                              </div>
                            )}
                            
                            {event.location && (
                              <div className="flex items-start gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            )}
                            
                            {event.max_attendees && (
                              <div className="flex items-center gap-2">
                                <UsersIcon className="w-4 h-4 text-gray-400" />
                                <span>Max {event.max_attendees} places</span>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          ))}

          {/* Empty state */}
          {(!typedEvents || typedEvents.length === 0) && (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Aucun événement à venir pour le moment.</p>
              <p className="text-sm text-gray-500 mt-2">Revenez bientôt pour découvrir nos prochains stages et compétitions !</p>
            </div>
          )}
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Organisez un Événement
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Vous êtes coach ou responsable de club ? Proposez votre événement.
            </p>
            <Link href="/contact">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Nous Contacter
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

