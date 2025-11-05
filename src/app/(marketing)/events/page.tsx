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
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-24 lg:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0-5.523-4.477-10-10-10zm-20 0c0-5.523-4.477-10-10-10S10 44.477 10 50s4.477 10 10 10c0-5.523 4.477-10 10-10zM50 30c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0-5.523-4.477-10-10-10zm-20 0c0-5.523-4.477-10-10-10S10 24.477 10 30s4.477 10 10 10c0-5.523 4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Glow effects */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          <div className="text-center text-white max-w-4xl mx-auto">
            <div className="inline-flex items-center px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg shadow-black/10 animate-fade-in">
              <span className="text-secondary mr-2 text-xl">📅</span>
              <span className="font-semibold text-sm">{typedEvents?.length || 0} événements à venir</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 animate-slide-up tracking-tight">
              Événements & <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary">Compétitions</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Participez aux stages, compétitions et démonstrations dans toute la France
            </p>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark mb-2 group-hover:scale-110 transition-transform duration-300">{typedEvents?.length || 0}</div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Événements à venir</div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-dark mb-2 group-hover:scale-110 transition-transform duration-300">{eventsByType?.stage?.length || 0}</div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Stages</div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">{eventsByType?.competition?.length || 0}</div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Compétitions</div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold text-gray-700 mb-2 group-hover:scale-110 transition-transform duration-300">{eventsByType?.demonstration?.length || 0}</div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Démonstrations</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Events par type */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          {eventsByType && Object.entries(eventsByType).map(([type, typeEvents]) => (
            typeEvents && Array.isArray(typeEvents) && typeEvents.length > 0 && (
              <div key={type} className="mb-20 last:mb-0">
                <div className="flex items-center gap-4 mb-10">
                  <span className="w-2 h-12 bg-gradient-to-b from-primary to-primary-dark rounded-full shadow-lg shadow-primary/20" />
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {eventTypeLabels[type] || type}
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                  {typeEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.slug}`}>
                      <Card hoverable className="h-full flex flex-col border-none shadow-xl hover:shadow-2xl">
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
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary">Organisez</span> un Événement
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Vous êtes coach ou responsable de club ? Proposez votre événement.
            </p>
            <div className="animate-scale-in">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-50 shadow-2xl shadow-black/20 hover:shadow-white/40 min-w-[240px] text-lg py-4 px-8">
                  ✉️ Nous Contacter
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

