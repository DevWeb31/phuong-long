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
import { Container, Card, CardContent, CardHeader, CardTitle, Badge, ImageCarousel } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
import { EventInteractions } from '@/components/marketing/EventInteractions';
import { SessionsList } from '@/components/marketing/SessionsList';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  CurrencyEuroIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
  ShareIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ClipboardList, Building2, Phone, Mail, Zap, Info, XCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('*, club:clubs(name), images:event_images(*)')
    .eq('slug', slug)
    .order('display_order', { foreignTable: 'event_images', ascending: true })
    .single();
  
  if (!event) return {};
  
  const typedEvent = event as unknown as Event & {
    images?: Array<{ image_url: string; is_cover: boolean }>;
  };
  
  // Utiliser l'image de couverture de la galerie, sinon fallback sur cover_image_url
  const coverImage = typedEvent.images?.find(img => img.is_cover)?.image_url 
                     || typedEvent.images?.[0]?.image_url
                     || typedEvent.cover_image_url;
  
  return {
    title: typedEvent.title,
    description: typedEvent.description || `${typedEvent.title} - Événement Phuong Long Vo Dao`,
    openGraph: coverImage ? {
      images: [coverImage],
    } : undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerClient();
  
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      club:clubs(id, name, city, slug, phone, email),
      images:event_images(*),
      sessions:event_sessions(*)
    `)
    .eq('slug', slug)
    .order('display_order', { foreignTable: 'event_images', ascending: true })
    .order('session_date', { foreignTable: 'event_sessions', ascending: true })
    .order('start_time', { foreignTable: 'event_sessions', ascending: true })
    .single();
  
  if (error || !event) {
    notFound();
  }
  
  const typedEvent = event as unknown as Event & { 
    club: { id: string; name: string; city: string; slug: string; phone: string | null; email: string | null } | null;
    images?: Array<{ image_url: string; alt_text: string | null; caption: string | null; is_cover: boolean; display_order: number }>;
    sessions?: Array<{ id: string; session_date: string; start_time: string; end_time: string | null; location: string | null; max_attendees: number | null; notes: string | null }>;
  };
  
  // Fusionner les images de la galerie avec l'image de couverture
  const allImages = [...(typedEvent.images || [])];
  
  // Ajouter cover_image_url si elle existe et n'est pas déjà dans la galerie
  if (typedEvent.cover_image_url) {
    const coverAlreadyInGallery = allImages.some(img => img.image_url === typedEvent.cover_image_url);
    if (!coverAlreadyInGallery) {
      // Insérer en premier si elle doit être la couverture
      allImages.unshift({
        image_url: typedEvent.cover_image_url,
        alt_text: typedEvent.title,
        caption: null,
        is_cover: true,
        display_order: -1, // Sera en premier
      });
    }
  }
  
  // Trier par display_order
  const sortedImages = allImages.sort((a, b) => a.display_order - b.display_order);
  
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
      {/* Bouton retour - Responsive */}
      <section className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="py-3 md:py-4">
            <Link 
              href="/events"
              className="inline-flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <ArrowLeftIcon className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Retour aux événements</span>
              <span className="sm:hidden">Retour</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* Alerte si événement complet ou terminé - Responsive */}
      {(isFull || isPast) && (
        <section className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-red-200 dark:border-red-800">
          <Container>
            <div className="py-3 md:py-4 flex items-start md:items-center gap-2 md:gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 md:w-6 md:h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 md:mt-0" />
              <div>
                <p className="font-semibold text-sm md:text-base text-red-900 dark:text-red-100">
                  {isPast ? 'Cet événement est terminé' : 'Places complètes'}
                </p>
                <p className="text-xs md:text-sm text-red-700 dark:text-red-300 mt-0.5">
                  {isPast 
                    ? 'Consultez nos autres événements à venir' 
                    : 'Contactez le club organisateur pour une éventuelle liste d\'attente'
                  }
                </p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Hero - Optimisé mobile */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark py-6 md:py-12 lg:py-16 text-white overflow-x-hidden">
        <Container>
          <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
            <Badge className="bg-secondary/20 text-white border-secondary/40 text-xs md:text-sm px-2.5 md:px-3 py-0.5">
              {eventTypeInfo?.label || 'Événement'}
            </Badge>
            {!isPast && placesLeft !== null && placesLeft > 0 && placesLeft <= 10 && (
              <Badge className="bg-orange-500/20 text-white border-orange-400/40 text-xs md:text-sm px-2.5 md:px-3 py-0.5 animate-pulse flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                Plus que {placesLeft} places
              </Badge>
            )}
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-3 md:mb-4 lg:mb-6 leading-tight">
            {typedEvent.title}
          </h1>
          
          {typedEvent.description && (
            <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-white/90 max-w-3xl mb-4 md:mb-6">
              {typedEvent.description}
            </p>
          )}

          {/* Quick facts - Version lisible */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 md:p-3 border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                <p className="text-xs md:text-sm text-white/70 font-medium">Date</p>
              </div>
              <p className="font-bold text-sm md:text-base truncate">
                {new Date(typedEvent.start_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 md:p-3 border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <ClockIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                <p className="text-xs md:text-sm text-white/70 font-medium">Heure</p>
              </div>
              <p className="font-bold text-sm md:text-base">
                {new Date(typedEvent.start_date).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 md:p-3 border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <CurrencyEuroIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                <p className="text-xs md:text-sm text-white/70 font-medium">Tarif</p>
              </div>
              <p className="font-bold text-sm md:text-base">
                {typedEvent.price_cents === 0 ? 'Gratuit' : `${(typedEvent.price_cents / 100).toFixed(0)}€`}
              </p>
            </div>

            {typedEvent.max_attendees && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 md:p-3 border border-white/20">
                <div className="flex items-center gap-1 mb-1">
                  <UsersIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                  <p className="text-xs md:text-sm text-white/70 font-medium">Places</p>
                </div>
                <p className="font-bold text-sm md:text-base">
                  {isFull ? 'Complet' : `${placesLeft}/${typedEvent.max_attendees}`}
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Galerie d'images (Carousel) - Inclut cover_image + galerie */}
      {sortedImages.length > 0 && (
        <section className="py-4 md:py-8 lg:py-12 bg-gray-50 dark:bg-gray-900">
          <Container>
            <ImageCarousel 
              images={sortedImages}
              className="shadow-lg md:shadow-2xl"
            />
          </Container>
        </section>
      )}

      {/* Informations */}
      <section className="py-8 md:py-12 lg:py-16 bg-white dark:bg-gray-950 overflow-x-hidden">
        <Container>
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {/* Sidebar - Apparaît en premier sur mobile */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="lg:sticky lg:top-8 space-y-4 md:space-y-6">
                {/* Carte de prix - Tailles lisibles */}
                <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
                  <div className="bg-gradient-to-br from-primary to-primary-dark p-4 md:p-6 text-white">
                    <p className="text-xs md:text-sm font-medium text-white/80 mb-1">Tarif de participation</p>
                    <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1">
                      {typedEvent.price_cents === 0 ? (
                        'Gratuit'
                      ) : (
                        <>{(typedEvent.price_cents / 100).toFixed(0)}€</>
                      )}
                    </p>
                    {typedEvent.price_cents > 0 && (
                      <p className="text-xs md:text-sm text-white/70">par personne</p>
                    )}
                  </div>
                  
                  <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                    {/* Status badge */}
                    {!isPast && (
                      <div className={`flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-lg font-semibold text-sm md:text-base ${
                        isFull 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' 
                          : placesLeft && placesLeft <= 10
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {isFull ? (
                          <><XCircle className="w-4 h-4" /> Complet</>
                        ) : placesLeft && placesLeft <= 10 ? (
                          <><Zap className="w-4 h-4 fill-current" /> Places limitées</>
                        ) : (
                          <><CheckCircle2 className="w-4 h-4" /> Places disponibles</>
                        )}
                      </div>
                    )}

                    {/* CTA Principal */}
                    {!isPast && !isFull && typedEvent.club && (
                      <>
                        <a
                          href={`mailto:${typedEvent.club.email}?subject=Inscription - ${typedEvent.title}`}
                          className="block w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 md:py-3.5 lg:py-4 px-4 md:px-5 lg:px-6 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-sm md:text-base"
                        >
                          Je m&apos;inscris
                        </a>
                        <p className="text-xs md:text-sm text-center text-gray-500 dark:text-gray-400">
                          Un email sera envoyé au club organisateur
                        </p>
                      </>
                    )}

                    {isFull && !isPast && typedEvent.club && (
                      <>
                        <a
                          href={`mailto:${typedEvent.club.email}?subject=Liste d'attente - ${typedEvent.title}`}
                          className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 md:py-3.5 lg:py-4 px-4 md:px-5 lg:px-6 rounded-lg text-center transition-all text-sm md:text-base"
                        >
                          Liste d&apos;attente
                        </a>
                        <p className="text-xs md:text-sm text-center text-gray-500 dark:text-gray-400">
                          Soyez prévenu en cas de désistement
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Carte info complémentaire */}
                <Card variant="bordered">
                  <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm md:text-base">
                          Date limite d&apos;inscription
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {typedEvent.registration_deadline 
                            ? new Date(typedEvent.registration_deadline).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : 'Jusqu\'au jour J'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 md:gap-3">
                      <Info className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm md:text-base">
                          Besoin d&apos;aide ?
                        </p>
                        <Link href="/contact" className="text-primary hover:underline text-xs md:text-sm">
                          Contactez-nous
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Colonne principale - Apparaît en second sur mobile */}
            <div className="lg:col-span-2 lg:order-1 space-y-4 md:space-y-6 lg:space-y-8">
              {/* Informations pratiques - Version responsive */}
              <div>
                <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 lg:mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  Informations Pratiques
                </h2>
                <Card variant="bordered" className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                      {/* Date */}
                      <div className="p-4 md:p-5 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <div className="flex items-start gap-3 md:gap-3.5 lg:gap-4">
                          <div className="bg-primary/10 p-2 md:p-2.5 lg:p-3 rounded-lg flex-shrink-0">
                            <CalendarIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date</p>
                            <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                              {new Date(typedEvent.start_date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            {typedEvent.end_date && typedEvent.end_date !== typedEvent.start_date && (
                              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                au {new Date(typedEvent.end_date).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Horaire */}
                      <div className="p-4 md:p-5 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <div className="flex items-start gap-3 md:gap-3.5 lg:gap-4">
                          <div className="bg-secondary/10 p-2 md:p-2.5 lg:p-3 rounded-lg flex-shrink-0">
                            <ClockIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Horaire</p>
                            <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">
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
                      </div>
                      
                      {/* Lieu */}
                      {typedEvent.location && (
                        <div className="p-4 md:p-5 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <div className="flex items-start gap-3 md:gap-3.5 lg:gap-4">
                            <div className="bg-accent/10 p-2 md:p-2.5 lg:p-3 rounded-lg flex-shrink-0">
                              <MapPinIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Lieu</p>
                              <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words leading-tight">
                                {typedEvent.location}
                              </p>
                              {typedEvent.club && (
                                <Link 
                                  href={`/clubs/${typedEvent.club.slug}`}
                                  className="text-xs md:text-sm text-primary hover:underline mt-1 md:mt-2 inline-flex items-center gap-1 font-medium"
                                >
                                  {typedEvent.club.name} - {typedEvent.club.city} →
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Capacité */}
                      {typedEvent.max_attendees && (
                        <div className="p-4 md:p-5 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <div className="flex items-start gap-3 md:gap-3.5 lg:gap-4">
                            <div className="bg-purple-100 dark:bg-purple-900/20 p-2 md:p-2.5 lg:p-3 rounded-lg flex-shrink-0">
                              <UsersIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Capacité</p>
                              <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {attendeesCount || 0} / {typedEvent.max_attendees} participants
                              </p>
                              {placesLeft !== null && (
                                <div className="mt-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all ${
                                          isFull ? 'bg-red-500' : 
                                          placesLeft <= 10 ? 'bg-orange-500' : 
                                          'bg-green-500'
                                        }`}
                                        style={{ width: `${((attendeesCount || 0) / typedEvent.max_attendees) * 100}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs md:text-sm font-bold whitespace-nowrap ${
                                      isFull ? 'text-red-600' : 
                                      placesLeft <= 10 ? 'text-orange-600' : 
                                      'text-green-600'
                                    }`}>
                                      {isFull ? 'Complet' : `${placesLeft} restantes`}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sessions multiples (si définies) */}
              {typedEvent.sessions && typedEvent.sessions.length > 0 && (
                <SessionsList sessions={typedEvent.sessions as any} />
              )}

              {/* Boutons d'interaction */}
              {!isPast && (
                <div>
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

              {/* Club organisateur - Lisible */}
              {typedEvent.club && (
                <div>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Building2 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    Club Organisateur
                  </h2>
                  <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-primary transition-all">
                    <CardContent className="p-4 md:p-5 lg:p-6">
                      <Link
                        href={`/clubs/${typedEvent.club.slug}`}
                        className="block group"
                      >
                        <div className="flex items-center gap-3 md:gap-3.5 lg:gap-4 mb-3 md:mb-4">
                          <div className="bg-primary/10 p-2 md:p-2.5 lg:p-3 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                            <BuildingOffice2Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors truncate">
                              {typedEvent.club.name}
                            </h3>
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                              <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                              {typedEvent.club.city}
                            </p>
                          </div>
                          <span className="text-xl md:text-2xl text-primary group-hover:translate-x-1 transition-transform flex-shrink-0">→</span>
                        </div>
                      </Link>

                      {(typedEvent.club.phone || typedEvent.club.email) && (
                        <div className="flex flex-col gap-2 md:gap-2.5 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-800">
                          {typedEvent.club.phone && (
                            <a
                              href={`tel:${typedEvent.club.phone}`}
                              className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm md:text-base overflow-hidden text-ellipsis"
                            >
                              <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                              <span className="truncate">{typedEvent.club.phone}</span>
                            </a>
                          )}
                          {typedEvent.club.email && (
                            <a
                              href={`mailto:${typedEvent.club.email}`}
                              className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm md:text-base overflow-hidden text-ellipsis"
                            >
                              <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                              <span className="truncate">{typedEvent.club.email}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

