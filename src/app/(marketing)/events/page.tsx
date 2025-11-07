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
import Image from 'next/image';
import { Container, Card, CardHeader, CardTitle, Badge, Button, ParallaxBackground } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import { EventsHeroContent } from '@/components/marketing/EventsHeroContent';

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
      {/* Hero with Parallax */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-20 lg:py-24 overflow-hidden">
        {/* Parallax Background */}
        <ParallaxBackground>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </ParallaxBackground>
        
        {/* Gradient Overlay pour profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
        
        <Container className="relative z-10">
          <EventsHeroContent
            totalEvents={typedEvents?.length || 0}
          />
        </Container>
      </section>

      {/* Stats */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-white dark:from-gray-950 to-gray-50 dark:to-gray-900">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-clip-text from-primary to-primary-dark mb-2 group-hover:scale-110 transition-transform duration-300">{typedEvents?.length || 0}</div>
              <div className="text-sm font-semibold dark:text-gray-500 uppercase tracking-wide">Événements à venir</div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-clip-text from-secondary to-secondary-dark mb-2 group-hover:scale-110 transition-transform duration-300">{eventsByType?.stage?.length || 0}</div>
              <div className="text-sm font-semibold dark:text-gray-500 uppercase tracking-wide">Stages</div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold bg-clip-text from-accent to-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">{eventsByType?.competition?.length || 0}</div>
              <div className="text-sm font-semibold dark:text-gray-500 uppercase tracking-wide">Compétitions</div>
            </div>
            <div className="group">
              <div className="text-4xl lg:text-5xl font-bold dark:text-gray-300 mb-2 group-hover:scale-110 transition-transform duration-300">{eventsByType?.demonstration?.length || 0}</div>
              <div className="text-sm font-semibold dark:text-gray-500 uppercase tracking-wide">Démonstrations</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Events par type */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          {eventsByType && Object.entries(eventsByType).map(([type, typeEvents]) => (
            typeEvents && Array.isArray(typeEvents) && typeEvents.length > 0 && (
              <div key={type} className="mb-20 last:mb-0">
                <div className="flex items-center gap-4 mb-10">
                  <span className="w-2 h-12 bg-gradient-to-b from-primary to-primary-dark rounded-full shadow-lg shadow-primary/20" />
                  <h2 className="text-3xl lg:text-4xl font-bold dark:text-gray-100">
                    {eventTypeLabels[type] || type}
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                  {typeEvents.map((event) => (
                    <Link key={event.id} href={`/events/${event.slug}`}>
                      <Card hoverable className="h-full flex flex-col border-none shadow-xl hover:shadow-2xl overflow-hidden group">
                        {/* Image de couverture */}
                        {event.cover_image_url ? (
                          <div className="relative w-full h-52 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            <Image
                              src={event.cover_image_url}
                              alt={event.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                            {/* Overlay gradient pour les badges */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                            
                            {/* Badges sur l'image */}
                            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                              <Badge variant="warning" size="sm" className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
                                {new Date(event.start_date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </Badge>
                              {event.price_cents === 0 ? (
                                <Badge variant="success" size="sm" className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">Gratuit</Badge>
                              ) : (
                                <Badge variant="primary" size="sm" className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
                                  {(event.price_cents / 100).toFixed(0)}€
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Fallback si pas d'image
                          <div className="relative w-full h-52 bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] flex items-center justify-center">
                            <CalendarIcon className="w-20 h-20 text-white/20" />
                            <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                              <Badge variant="warning" size="sm" className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
                                {new Date(event.start_date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </Badge>
                              {event.price_cents === 0 ? (
                                <Badge variant="success" size="sm" className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">Gratuit</Badge>
                              ) : (
                                <Badge variant="primary" size="sm" className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
                                  {(event.price_cents / 100).toFixed(0)}€
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Contenu de la carte */}
                        <CardHeader className="flex-1">
                          <CardTitle className="line-clamp-2 mb-3">
                            {event.title}
                          </CardTitle>
                          
                          <div className="space-y-2 text-sm dark:text-gray-500">
                            {event.club && (
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <span>{event.club.city}</span>
                              </div>
                            )}
                            
                            {event.location && (
                              <div className="flex items-start gap-2">
                                <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            )}
                            
                            {event.max_attendees && (
                              <div className="flex items-center gap-2">
                                <UsersIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
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
              <p className="text-lg dark:text-gray-500">Aucun événement à venir pour le moment.</p>
              <p className="text-sm dark:text-gray-500 mt-2">Revenez bientôt pour découvrir nos prochains stages et compétitions !</p>
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent">Organisez</span> <span className="text-white">un Événement</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Vous êtes coach ou responsable de club ? Proposez votre événement.
            </p>
            <div className="animate-scale-in">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-2xl shadow-black/20 hover:shadow-white/40 min-w-[240px] py-4 px-8 font-semibold">
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

