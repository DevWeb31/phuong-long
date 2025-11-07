/**
 * Event Detail Page
 * 
 * Page détail événement avec inscription
 * 
 * @version 1.0
 * @date 2025-11-04 21:55
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
import { EventInteractions } from '@/components/marketing/EventInteractions';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  CurrencyEuroIcon,
  TrophyIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('*, club:clubs(name)')
    .eq('slug', slug)
    .single();
  
  if (!event) return {};
  
  const typedEvent = event as unknown as Event;
  
  return {
    title: typedEvent.title,
    description: typedEvent.description || `${typedEvent.title} - Événement Phuong Long Vo Dao`,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerClient();
  
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      club:clubs(id, name, city, slug, phone, email)
    `)
    .eq('slug', slug)
    .single();
  
  if (error || !event) {
    notFound();
  }
  
  const typedEvent = event as unknown as Event & { club: { id: string; name: string; city: string; slug: string; phone: string | null; email: string | null } | null };
  
  // Vérifier si événement passé
  const isPast = new Date(typedEvent.start_date) < new Date();
  
  // Vérifier si l'utilisateur est authentifié
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  
  // Récupérer nombre de likes
  const { count: likesCount } = await supabase
    .from('event_likes')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', typedEvent.id);
  
  // Vérifier si l'utilisateur a liké
  let userLiked = false;
  if (user) {
    const { data: userLike } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', typedEvent.id)
      .eq('user_id', user.id)
      .single();
    userLiked = !!userLike;
  }
  
  // Récupérer nombre de participants
  const { count: attendeesCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', typedEvent.id)
    .eq('status', 'confirmed');
  
  // Vérifier si l'utilisateur participe
  let userAttending = false;
  if (user) {
    const { data: userRegistration } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', typedEvent.id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single();
    userAttending = !!userRegistration;
  }
  
  const isFull = typedEvent.max_attendees ? (attendeesCount || 0) >= typedEvent.max_attendees : false;
  const placesLeft = typedEvent.max_attendees ? typedEvent.max_attendees - (attendeesCount || 0) : null;

  const eventTypeLabels: Record<string, { label: string; color: string }> = {
    competition: { label: 'Compétition', color: 'primary' },
    stage: { label: 'Stage', color: 'secondary' },
    demonstration: { label: 'Démonstration', color: 'accent' },
    seminar: { label: 'Séminaire', color: 'info' },
    other: { label: 'Événement', color: 'default' },
  };

  const eventTypeInfo = eventTypeLabels[typedEvent.event_type] ?? eventTypeLabels.other;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark py-16 lg:py-20 text-white">
        <Container>
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge className="bg-secondary/20 text-white border-secondary/40">
                {eventTypeInfo?.label || 'Événement'}
              </Badge>
              {isPast && (
                <Badge className="bg-gray-500/20 text-white border-gray-400/40">
                  Terminé
                </Badge>
              )}
              {isFull && !isPast && (
                <Badge className="bg-red-500/20 text-white border-red-400/40">
                  Complet
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {typedEvent.title}
            </h1>
            
            {typedEvent.description && (
              <p className="text-xl leading-relaxed">
                {typedEvent.description}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Informations */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Détails */}
            <div className="lg:col-span-2 space-y-6">
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Informations Pratiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Date</p>
                      <p className="text-gray-600 dark:text-gray-500">
                        {new Date(typedEvent.start_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      {typedEvent.end_date && typedEvent.end_date !== typedEvent.start_date && (
                        <p className="text-sm dark:text-gray-500">
                          au {new Date(typedEvent.end_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Horaire */}
                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Horaire</p>
                      <p className="text-gray-600 dark:text-gray-500">
                        {new Date(typedEvent.start_date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {typedEvent.end_date && (
                          <> - {new Date(typedEvent.end_date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Lieu */}
                  {typedEvent.location && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Lieu</p>
                        <p className="text-gray-600 dark:text-gray-500">{typedEvent.location}</p>
                        {typedEvent.club && (
                          <Link 
                            href={`/clubs/${typedEvent.club.slug}`}
                            className="text-sm hover:underline mt-1 inline-block"
                          >
                            {typedEvent.club.name} - {typedEvent.club.city}
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Capacité */}
                  {typedEvent.max_attendees && (
                    <div className="flex items-start gap-3">
                      <UsersIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Capacité</p>
                        <p className="text-gray-600 dark:text-gray-500">
                          {typedEvent.max_attendees} places maximum
                        </p>
                        {placesLeft !== null && (
                          <p className="text-sm mt-1">
                            {isFull ? (
                              <span className="text-red-600 font-medium">Complet</span>
                            ) : (
                              <span className="text-accent font-medium">{placesLeft} places restantes</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Prix */}
                  <div className="flex items-start gap-3">
                    <CurrencyEuroIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Tarif</p>
                      <p className="text-2xl font-bold">
                        {typedEvent.price_cents === 0 ? (
                          <span className="text-accent">Gratuit</span>
                        ) : (
                          <>{(typedEvent.price_cents / 100).toFixed(0)}€</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Boutons d'interaction style Facebook */}
              {!isPast && (
                <div className="mt-6">
                  <EventInteractions
                    eventId={typedEvent.id}
                    initialLikesCount={likesCount || 0}
                    initialAttendeesCount={attendeesCount || 0}
                    initialUserLiked={userLiked}
                    initialUserAttending={userAttending}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              )}

              {/* Contact club */}
              {typedEvent.club && (
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BuildingOffice2Icon className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">
                        Club organisateur
                      </h3>
                    </div>
                    
                    <Link
                      href={`/clubs/${typedEvent.club.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:shadow-md transition-all w-full"
                    >
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {typedEvent.club.name}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        • {typedEvent.club.city}
                      </span>
                      <span className="ml-auto text-primary">→</span>
                    </Link>

                    {(typedEvent.club.phone || typedEvent.club.email) && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {typedEvent.club.phone && (
                          <a
                            href={`tel:${typedEvent.club.phone}`}
                            className="text-sm text-primary hover:underline"
                          >
                            📞 {typedEvent.club.phone}
                          </a>
                        )}
                        {typedEvent.club.email && (
                          <a
                            href={`mailto:${typedEvent.club.email}`}
                            className="text-sm text-primary hover:underline"
                          >
                            ✉️ {typedEvent.club.email}
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Info complémentaire */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Des questions sur cet événement ?{' '}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                Contactez-nous
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

