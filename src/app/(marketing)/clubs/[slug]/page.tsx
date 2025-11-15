/**
 * Club Detail Page
 * 
 * Page détail d'un club avec coaches, horaires, tarifs, carte
 * 
 * @version 1.0
 * @date 2025-11-04 21:45
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Container, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, ScrollReveal } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club, Coach, Event } from '@/lib/types';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import { Lightbulb, Check, Facebook, Instagram, Youtube } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();
  
  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (!club) return {};
  
  const typedClub = club as unknown as Club;
  
  const title = `${typedClub.name} - Vo Dao ${typedClub.city}`;
  const description = typedClub.description 
    ? typedClub.description.substring(0, 160)
    : `Découvrez le club Phuong Long Vo Dao de ${typedClub.city}. Cours pour tous niveaux, enfants et adultes.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function ClubDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerClient();
  
  // Récupérer le club
  const { data: club, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !club) {
    notFound();
  }
  
  const typedClub = club as unknown as Club;
  
  // Récupérer les coaches du club
  const { data: coaches } = await supabase
    .from('coaches')
    .select('*')
    .eq('club_id', typedClub.id)
    .eq('active', true)
    .order('display_order');
  
  const typedCoaches = (coaches || []) as unknown as Coach[];
  
  // Récupérer les événements à venir du club
  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, start_date, event_type, location, price_cents')
    .eq('club_id', typedClub.id)
    .eq('active', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date')
    .limit(3);
  
  const typedEvents = (events || []) as unknown as Pick<Event, 'id' | 'title' | 'slug' | 'start_date' | 'event_type' | 'location' | 'price_cents'>[];

  return (
    <>
      {/* Hero */}
      <section className="relative py-16 lg:py-20 text-white overflow-hidden">
        {/* Background - Image du club ou gradient */}
        {typedClub.cover_image_url ? (
          <>
            {/* Image de fond */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${typedClub.cover_image_url})` }}
            />
            {/* Overlay sombre pour lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />
          </>
        ) : (
          /* Gradient bleu par défaut si pas d'image */
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark" />
        )}
        
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <ScrollReveal direction="down" delay={0}>
              <Badge className="mb-4 bg-secondary/20 text-white border-secondary/40">
                {typedClub.city}
              </Badge>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {typedClub.name}
              </h1>
            </ScrollReveal>
            {typedClub.description && (
              <ScrollReveal direction="up" delay={200}>
                <p className="text-xl leading-relaxed">
                  {typedClub.description}
                </p>
              </ScrollReveal>
            )}
          </div>
        </Container>
      </section>

      {/* Informations Principales */}
      <section className="py-12 lg:py-16 bg-white dark:bg-gray-900">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coordonnées */}
            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal direction="up" delay={100}>
                <Card variant="bordered">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-primary" />
                    <CardTitle>Coordonnées</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {typedClub.address && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Adresse</p>
                        <p className="text-gray-600 dark:text-gray-500">{typedClub.address}</p>
                        <p className="text-gray-600 dark:text-gray-500">{typedClub.postal_code} {typedClub.city}</p>
                      </div>
                    </div>
                  )}
                  
                  {typedClub.phone && (() => {
                    // Séparer les numéros de téléphone par virgule
                    const phoneNumbers = typedClub.phone.split(',').map(phone => phone.trim()).filter(phone => phone);
                    
                    return (
                      <div className="flex items-start gap-3">
                        <PhoneIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {phoneNumbers.length > 1 ? 'Téléphones' : 'Téléphone'}
                          </p>
                          <div className="space-y-1.5">
                            {phoneNumbers.map((phone, index) => (
                              <a 
                                key={index}
                                href={`tel:${phone}`} 
                                className="block text-primary hover:underline"
                              >
                                {phone}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {typedClub.email && (
                    <div className="flex items-start gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Email</p>
                        <a href={`mailto:${typedClub.email}`} className="text-primary hover:underline">
                          {typedClub.email}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
                </Card>
              </ScrollReveal>

              {/* Horaires */}
              {typedClub.schedule && (
                <ScrollReveal direction="up" delay={200}>
                {(() => {
                const schedule = typedClub.schedule as Record<string, any[]>;
                
                // Ordre des jours de la semaine
                const dayOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
                
                // Fonction pour extraire l'heure de début d'une session pour le tri
                const getStartTime = (session: any): string => {
                  const isString = typeof session === 'string';
                  const time = isString ? session : session.time;
                  // Extraire l'heure de début (format "18h00-19h30" -> "18h00")
                  const startTime = time.split('-')[0].trim();
                  // Convertir en format comparable (18h00 -> 1800)
                  return startTime.replace('h', '').padStart(4, '0');
                };
                
                // Fonction pour trier les sessions par heure de début
                const sortSessions = (sessions: any[]) => {
                  return [...sessions].sort((a, b) => {
                    const timeA = getStartTime(a);
                    const timeB = getStartTime(b);
                    return timeA.localeCompare(timeB);
                  });
                };
                
                // Séparer les jours de la semaine (lundi-vendredi) et le weekend
                const weekdays = dayOrder.slice(0, 5).filter(day => schedule[day]);
                const weekend = dayOrder.slice(5).filter(day => schedule[day]);
                
                return (
                  <Card variant="bordered">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-primary" />
                        <CardTitle>Horaires des Cours</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Lundi au Vendredi */}
                      {weekdays.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                            Semaine
                          </h3>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {weekdays.map((day) => {
                              const sortedSessions = sortSessions(schedule[day] || []);
                              return (
                                <div 
                                  key={day} 
                                  className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors duration-300"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize text-base">
                                      {day}
                                    </span>
                                  </div>
                                  <div className="space-y-2.5">
                                    {sortedSessions.map((session, idx) => {
                                      const isString = typeof session === 'string';
                                      const time = isString ? session : session.time;
                                      const type = !isString ? session.type : null;
                                      const level = !isString ? session.level : null;
                                      
                                      return (
                                        <div 
                                          key={idx} 
                                          className="flex items-start gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                        >
                                          <div className="flex-shrink-0 mt-0.5">
                                            <ClockIcon className="w-4 h-4 text-primary" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                              {time}
                                            </div>
                                            {type && (
                                              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                {type}
                                              </div>
                                            )}
                                            {level && (
                                              <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                                                {level}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Weekend (Samedi et Dimanche) */}
                      {weekend.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                            Weekend
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {weekend.map((day) => {
                              const sortedSessions = sortSessions(schedule[day] || []);
                              return (
                                <div 
                                  key={day} 
                                  className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 rounded-xl border border-accent/20 dark:border-accent/30"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                                    <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize text-base">
                                      {day}
                                    </span>
                                  </div>
                                  <div className="space-y-2.5">
                                    {sortedSessions.map((session, idx) => {
                                      const isString = typeof session === 'string';
                                      const time = isString ? session : session.time;
                                      const type = !isString ? session.type : null;
                                      const level = !isString ? session.level : null;
                                      
                                      return (
                                        <div 
                                          key={idx} 
                                          className="flex items-start gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                        >
                                          <div className="flex-shrink-0 mt-0.5">
                                            <ClockIcon className="w-4 h-4 text-accent" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                              {time}
                                            </div>
                                            {type && (
                                              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                {type}
                                              </div>
                                            )}
                                            {level && (
                                              <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                                                {level}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
                })()}
                </ScrollReveal>
              )}

              {/* Tarifs */}
              <ScrollReveal direction="up" delay={300}>
                <Card variant="bordered">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CurrencyEuroIcon className="w-5 h-5 text-primary" />
                    <CardTitle>Tarifs Annuels</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {typedClub.pricing && Object.keys(typedClub.pricing).length > 0 ? (
                    <>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {Object.entries(typedClub.pricing as Record<string, number>).map(([category, price]) => (
                          <div key={category} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{category}</span>
                            <span className="text-2xl font-bold">{price}€</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-sm dark:text-gray-500 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Cours d'essai gratuit - Sans engagement</span>
                      </p>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
                        <CurrencyEuroIcon className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">
                        Tarifs sur demande
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                        Contactez le club pour connaître nos tarifs et nos formules d'abonnement
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {typedClub.phone && (
                          <a 
                            href={`tel:${typedClub.phone}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 text-sm font-medium"
                          >
                            <PhoneIcon className="w-4 h-4" />
                            Appeler
                          </a>
                        )}
                        {typedClub.email && (
                          <a 
                            href={`mailto:${typedClub.email}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300 text-sm font-medium"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                            Envoyer un email
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            {/* CTA Sidebar */}
            <div className="space-y-6">
              <ScrollReveal direction="left" delay={150}>
              <Card className="bg-gradient-to-br from-primary to-primary-dark text-white sticky top-20 shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-3">Essayez gratuitement</h3>
                    <p className="text-white/95 text-base leading-relaxed mb-2">
                      Rejoignez-nous pour un cours d'essai <strong>100% gratuit</strong> et sans engagement.
                    </p>
                    <p className="text-white/80 text-sm">
                      Découvrez le Vo Dao dans une ambiance conviviale et bienveillante.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Link href={`/contact?club=${typedClub.slug}`}>
                      <Button fullWidth className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 hover:shadow-lg font-semibold transition-all duration-300">
                        Réserver mon Essai Gratuit
                      </Button>
                    </Link>
                    {typedClub.phone && (
                      <a href={`tel:${typedClub.phone}`}>
                        <Button fullWidth className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 font-semibold transition-all duration-300">
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          Appeler le Club
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={250}>
                <Card variant="bordered">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Cours pour tous</h4>
                  <ul className="space-y-2 text-sm dark:text-gray-500">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" /> Enfants dès 6 ans
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" /> Adolescents
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" /> Adultes tous niveaux
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent" /> Seniors
                    </li>
                  </ul>
                </CardContent>
              </Card>
              </ScrollReveal>

              {/* Réseaux sociaux */}
              {typedClub.social_media && (
                typedClub.social_media.facebook || 
                typedClub.social_media.instagram || 
                typedClub.social_media.youtube
              ) ? (
                <ScrollReveal direction="left" delay={350}>
                  <Card variant="bordered">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Suivez-nous</h4>
                      <div className="flex flex-col gap-3">
                        {typedClub.social_media.facebook && (
                          <a
                            href={typedClub.social_media.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                              <Facebook className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              Facebook
                            </span>
                          </a>
                        )}
                        {typedClub.social_media.instagram && (
                          <a
                            href={typedClub.social_media.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-pink-600 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center group-hover:from-pink-700 group-hover:to-purple-700 transition-colors">
                              <Instagram className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                              Instagram
                            </span>
                          </a>
                        )}
                        {typedClub.social_media.youtube && (
                          <a
                            href={typedClub.social_media.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center group-hover:bg-red-700 transition-colors">
                              <Youtube className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                              YouTube
                            </span>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      {/* Coaches */}
      {typedCoaches && typedCoaches.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
          <Container>
            <ScrollReveal direction="down" delay={0}>
              <h2 className="text-3xl font-bold dark:text-gray-100 mb-8">
                Nos Enseignants
              </h2>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typedCoaches.map((coach, index) => (
                <ScrollReveal key={coach.id} direction="up" delay={index * 100} className="h-full">
                <Card variant="bordered" className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Photo de l'enseignant */}
                  <div className="relative w-full h-64 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                    {coach.photo_url ? (
                      <Image
                        src={coach.photo_url}
                        alt={coach.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-5xl font-bold text-white">
                            {coach.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Overlay gradient pour meilleure lisibilité */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                  
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Nom et expérience */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {coach.name}
                      </h3>
                      {coach.years_experience > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Badge variant="primary" size="sm" className="font-semibold">
                            {coach.years_experience} ans
                          </Badge>
                          <span className="text-gray-500 dark:text-gray-500">d'expérience</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bio */}
                    {coach.bio && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                        {coach.bio}
                      </p>
                    )}
                    
                    {/* Spécialités */}
                    {coach.specialties && (coach.specialties as string[]).length > 0 && (
                      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                          Spécialités
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(coach.specialties as string[]).slice(0, 3).map((spec, idx) => (
                            <Badge key={idx} variant="default" size="sm" className="bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30">
                              {spec}
                            </Badge>
                          ))}
                          {(coach.specialties as string[]).length > 3 && (
                            <Badge variant="default" size="sm" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              +{(coach.specialties as string[]).length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Événements à venir */}
      {typedEvents && typedEvents.length > 0 && (
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
          <Container>
            <ScrollReveal direction="down" delay={0}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold dark:text-gray-100">
                  Prochains Événements
                </h2>
                <Link href="/events">
                  <Button variant="ghost" className="text-black dark:text-gray-300">Tous les événements →</Button>
                </Link>
              </div>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {typedEvents.map((event, index) => (
                <ScrollReveal key={event.id} direction="up" delay={index * 100} className="h-full">
                  <Link href={`/events/${event.slug}`} className="h-full block">
                    <Card variant="bordered" hoverable className="h-full flex flex-col">
                    <CardHeader>
                      <Badge variant="warning" size="sm" className="mb-2">
                        {new Date(event.start_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Badge>
                      <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      <CardDescription>
                        {event.location}
                      </CardDescription>
                      {event.price_cents > 0 && (
                        <div className="mt-3">
                          <Badge variant="primary">
                            {(event.price_cents / 100).toFixed(0)}€
                          </Badge>
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <ScrollReveal direction="down" delay={0}>
              <h2 className="text-3xl font-bold text-white mb-4">
                Prêt à Commencer ?
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <p className="text-lg text-slate-300 mb-8">
                Venez découvrir le Vo Dao lors d'un cours d'essai gratuit au {typedClub.name}
              </p>
            </ScrollReveal>
            <ScrollReveal direction="fade" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/contact?club=${typedClub.slug}`}>
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:shadow-2xl min-w-[200px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  Réserver mon Essai Gratuit
                </Button>
              </Link>
              <Link href="/clubs">
                <Button size="lg" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40 min-w-[200px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  Voir Autres Clubs
                </Button>
              </Link>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>
    </>
  );
}

