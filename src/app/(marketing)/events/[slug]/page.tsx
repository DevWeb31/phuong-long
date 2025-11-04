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
import { Container, Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  CurrencyEuroIcon,
  InformationCircleIcon 
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
  
  // Récupérer nombre d'inscrits
  const { count: registrationsCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', typedEvent.id)
    .eq('status', 'confirmed');
  
  const isFull = typedEvent.max_attendees ? (registrationsCount || 0) >= typedEvent.max_attendees : false;
  const placesLeft = typedEvent.max_attendees ? typedEvent.max_attendees - (registrationsCount || 0) : null;

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
              <p className="text-xl text-white/90 leading-relaxed">
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
                      <p className="font-medium text-gray-900">Date</p>
                      <p className="text-gray-600">
                        {new Date(typedEvent.start_date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      {typedEvent.end_date && typedEvent.end_date !== typedEvent.start_date && (
                        <p className="text-sm text-gray-500">
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
                      <p className="font-medium text-gray-900">Horaire</p>
                      <p className="text-gray-600">
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
                        <p className="font-medium text-gray-900">Lieu</p>
                        <p className="text-gray-600">{typedEvent.location}</p>
                        {typedEvent.club && (
                          <Link 
                            href={`/clubs/${typedEvent.club.slug}`}
                            className="text-sm text-primary hover:underline mt-1 inline-block"
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
                        <p className="font-medium text-gray-900">Capacité</p>
                        <p className="text-gray-600">
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
                      <p className="font-medium text-gray-900">Tarif</p>
                      <p className="text-2xl font-bold text-primary">
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

              {/* Deadline inscription */}
              {typedEvent.registration_deadline && !isPast && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4 flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-900">
                        Inscriptions jusqu'au {new Date(typedEvent.registration_deadline).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Inscription */}
            <div>
              <Card className="bg-gradient-to-br from-primary to-primary-dark text-white sticky top-20">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">
                    {typedEvent.price_cents === 0 ? 'Inscription Gratuite' : 'S\'inscrire'}
                  </h3>
                  
                  {isPast ? (
                    <div className="bg-white/10 rounded-lg p-4 mb-4">
                      <p className="text-white/90">Cet événement est terminé.</p>
                    </div>
                  ) : isFull ? (
                    <div className="bg-red-500/20 rounded-lg p-4 mb-4">
                      <p className="text-white/90">Événement complet</p>
                      <p className="text-sm text-white/70 mt-2">
                        Contactez-nous pour liste d'attente
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/10 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/90">Tarif</span>
                        <span className="text-2xl font-bold">
                          {typedEvent.price_cents === 0 ? 'Gratuit' : `${(typedEvent.price_cents / 100).toFixed(0)}€`}
                        </span>
                      </div>
                      {placesLeft !== null && (
                        <p className="text-sm text-white/70">
                          {placesLeft} places disponibles
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {!isPast && !isFull && (
                      <Button 
                        fullWidth 
                        className="bg-secondary text-gray-900 hover:bg-secondary-light font-bold"
                      >
                        S'inscrire Maintenant
                      </Button>
                    )}
                    
                    <Link href={`/contact?event=${typedEvent.slug}`}>
                      <Button 
                        fullWidth 
                        variant="ghost" 
                        className="text-white border-white hover:bg-white/10"
                      >
                        Poser une Question
                      </Button>
                    </Link>
                    
                    {typedEvent.club && (
                      <Link href={`/clubs/${typedEvent.club.slug}`}>
                        <Button 
                          fullWidth 
                          variant="ghost" 
                          className="text-white border-white hover:bg-white/10"
                        >
                          Voir le Club
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

