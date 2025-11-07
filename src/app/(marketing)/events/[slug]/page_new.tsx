/**
 * Event Detail Page
 * 
 * Page détail événement style Facebook avec interactions sociales
 * 
 * @version 2.0
 * @date 2025-11-06
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Card, CardContent, Badge } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
import { EventInteractions } from '@/components/marketing/EventInteractions';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  CurrencyEuroIcon,
  BuildingOffice2Icon,
  UserGroupIcon
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
      club:clubs(id, name, city, slug, phone, email, cover_image_url)
    `)
    .eq('slug', slug)
    .single();
  
  if (error || !event) {
    notFound();
  }
  
  const typedEvent = event as unknown as Event & { club: { id: string; name: string; city: string; slug: string; phone: string | null; email: string | null; cover_image_url: string | null } | null };
  
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

  const eventTypeLabels: Record<string, { label: string; emoji: string }> = {
    competition: { label: 'Compétition', emoji: '🏆' },
    stage: { label: 'Stage', emoji: '🥋' },
    demonstration: { label: 'Démonstration', emoji: '🎭' },
    seminar: { label: 'Séminaire', emoji: '📚' },
    other: { label: 'Événement', emoji: '📅' },
  };

  const eventTypeInfo = eventTypeLabels[typedEvent.event_type] ?? eventTypeLabels.other;

  return (
    <>
      {/* Header simple */}
      <section className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 py-4">
        <Container>
          <Link
            href="/events"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            ← Retour aux événements
          </Link>
        </Container>
      </section>

      {/* Carte style Facebook Post */}
      <section className="py-8 lg:py-12 bg-slate-50 dark:bg-slate-900">
        <Container className="max-w-4xl">
          <Card className="overflow-hidden shadow-xl">
            <CardContent padding="none">
              {/* Header du post - Info organisateur */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  {/* Logo/Photo du club */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark flex-shrink-0">
                    {typedEvent.club?.cover_image_url ? (
                      <img
                        src={typedEvent.club.cover_image_url}
                        alt={typedEvent.club.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {typedEvent.club?.name.charAt(0) || 'P'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {/* Nom du club */}
                    {typedEvent.club && (
                      <Link
                        href={`/clubs/${typedEvent.club.slug}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:underline"
                      >
                        {typedEvent.club.name}
                      </Link>
                    )}
                    
                    {/* Date de publication */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>
                        {new Date(typedEvent.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                      <span>•</span>
                      <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-none text-[10px]">
                        {eventTypeInfo.emoji} {eventTypeInfo.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Badges statut */}
                  <div className="flex flex-col gap-2">
                    {isPast && (
                      <Badge className="bg-slate-500 text-white">
                        Terminé
                      </Badge>
                    )}
                    {isFull && !isPast && (
                      <Badge className="bg-red-500 text-white">
                        Complet
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Titre et description */}
              <div className="p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  {typedEvent.title}
                </h1>
                
                {typedEvent.description && (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {typedEvent.description}
                  </p>
                )}
              </div>

              {/* Image de l'événement (Affiche) */}
              {typedEvent.cover_image_url && (
                <div className="w-full">
                  <img
                    src={typedEvent.cover_image_url}
                    alt={typedEvent.title}
                    className="w-full object-cover max-h-[600px]"
                  />
                </div>
              )}

              {/* Informations détaillées */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Date
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {new Date(typedEvent.start_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      {typedEvent.end_date && typedEvent.end_date !== typedEvent.start_date && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          au {new Date(typedEvent.end_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Horaire */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <ClockIcon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Horaire
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {new Date(typedEvent.start_date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Lieu */}
                  {typedEvent.location && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <MapPinIcon className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Lieu
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {typedEvent.location}
                        </p>
                        {typedEvent.club && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {typedEvent.club.city}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Prix */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded-lg">
                      <CurrencyEuroIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Tarif
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {typedEvent.price_cents === 0 ? (
                          <span className="text-green-600">Gratuit</span>
                        ) : (
                          <>{(typedEvent.price_cents / 100).toFixed(0)}€</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Capacité */}
                  {typedEvent.max_attendees && (
                    <div className="flex items-start gap-3 sm:col-span-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                        <UsersIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Capacité
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {typedEvent.max_attendees} places maximum
                        </p>
                        {placesLeft !== null && !isPast && (
                          <p className="text-sm mt-1">
                            {isFull ? (
                              <span className="text-red-600 font-medium">⚠️ Événement complet</span>
                            ) : (
                              <span className="text-green-600 font-medium">✓ {placesLeft} places restantes</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'interaction style Facebook */}
              {!isPast && (
                <div className="p-6">
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
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <BuildingOffice2Icon className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                      Club organisateur
                    </h3>
                  </div>
                  
                  <Link
                    href={`/clubs/${typedEvent.club.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:shadow-md transition-all"
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info complémentaire */}
          <div className="mt-6 text-center">
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

