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
import { notFound } from 'next/navigation';
import { Container, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club, Coach, Event } from '@/lib/types';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';

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
            <Badge className="mb-4 bg-secondary/20 text-white border-secondary/40">
              {typedClub.city}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {typedClub.name}
            </h1>
            {typedClub.description && (
              <p className="text-xl leading-relaxed">
                {typedClub.description}
              </p>
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
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Coordonnées</CardTitle>
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
                  
                  {typedClub.phone && (
                    <div className="flex items-start gap-3">
                      <PhoneIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Téléphone</p>
                        <a href={`tel:${typedClub.phone}`} className="text-primary hover:underline">
                          {typedClub.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
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

              {/* Horaires */}
              {typedClub.schedule && (
                <Card variant="bordered">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-primary" />
                      <CardTitle>Horaires des Cours</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {Object.entries(typedClub.schedule as Record<string, string[]>).map(([day, hours]) => (
                        <div key={day} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{day}</span>
                          <div className="text-right">
                            {hours.map((hour, idx) => (
                              <div key={idx} className="text-sm dark:text-gray-500">{hour}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tarifs */}
              {typedClub.pricing && (
                <Card variant="bordered">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CurrencyEuroIcon className="w-5 h-5 text-primary" />
                      <CardTitle>Tarifs Annuels</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {Object.entries(typedClub.pricing as Record<string, number>).map(([category, price]) => (
                        <div key={category} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{category}</span>
                          <span className="text-2xl font-bold">{price}€</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm dark:text-gray-500">
                      💡 Cours d'essai gratuit - Sans engagement
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* CTA Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-primary to-primary-dark text-white sticky top-20">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Rejoignez-nous !</h3>
                  <p className="text-white/90 mb-6">
                    Profitez d'un cours d'essai 100% gratuit et sans engagement.
                  </p>
                  <div className="space-y-3">
                    <Link href={`/contact?club=${typedClub.slug}`}>
                      <Button fullWidth className="bg-white dark:bg-gray-900 text-primary hover:bg-gray-100">
                        Réserver un Essai
                      </Button>
                    </Link>
                    <a href={`tel:${typedClub.phone}`}>
                      <Button fullWidth variant="ghost" className="text-white border-white hover:bg-white/10">
                        Appeler le Club
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Cours pour tous</h4>
                  <ul className="space-y-2 text-sm dark:text-gray-500">
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Enfants dès 6 ans
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Adolescents
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Adultes tous niveaux
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Seniors
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Coaches */}
      {typedCoaches && typedCoaches.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
          <Container>
            <h2 className="text-3xl font-bold dark:text-gray-100 mb-8">
              Nos Enseignants
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typedCoaches.map((coach) => (
                <Card key={coach.id} variant="bordered">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold">
                          {coach.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold dark:text-gray-100 mb-1">
                          {coach.name}
                        </h3>
                        {coach.years_experience > 0 && (
                          <p className="text-sm dark:text-gray-500 mb-2">
                            {coach.years_experience} ans d'expérience
                          </p>
                        )}
                        {coach.bio && (
                          <p className="text-sm dark:text-gray-500 line-clamp-3">
                            {coach.bio}
                          </p>
                        )}
                        {coach.specialties && (coach.specialties as string[]).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {(coach.specialties as string[]).slice(0, 3).map((spec, idx) => (
                              <Badge key={idx} variant="default" size="sm">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Événements à venir */}
      {typedEvents && typedEvents.length > 0 && (
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold dark:text-gray-100">
                Prochains Événements
              </h2>
              <Link href="/events">
                <Button variant="ghost">Tous les événements →</Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {typedEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`}>
                  <Card variant="bordered" hoverable>
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
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold dark:text-gray-100 mb-4">
              Prêt à Commencer ?
            </h2>
            <p className="text-lg dark:text-gray-500 mb-8">
              Venez découvrir le Vo Dao lors d'un cours d'essai gratuit au {typedClub.name}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/contact?club=${typedClub.slug}`}>
                <Button size="lg">
                  Réserver mon Essai Gratuit
                </Button>
              </Link>
              <Link href="/clubs">
                <Button size="lg" variant="ghost">
                  Voir Autres Clubs
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

