/**
 * Clubs List Page
 * 
 * Page liste de tous les clubs avec carte
 * 
 * @version 1.0
 * @date 2025-11-04 21:00
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Nos Clubs',
  description: '5 clubs Phuong Long Vo Dao en France : Marseille, Paris, Nice, Créteil, Strasbourg. Trouvez le club le plus proche de chez vous.',
};

export default async function ClubsPage() {
  const supabase = await createServerClient();
  
  const { data: clubs, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('active', true)
    .order('city');

  if (error) {
    console.error('Error fetching clubs:', error);
  }
  
  const typedClubs = (clubs || []) as unknown as Club[];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-dark py-16 lg:py-20">
        <Container>
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Nos 5 Clubs
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Trouvez le club Phuong Long Vo Dao le plus proche de chez vous et profitez d'un cours d'essai gratuit
            </p>
          </div>
        </Container>
      </section>

      {/* Clubs Grid */}
      <section className="py-16 lg:py-24">
        <Container>
          {/* Map Placeholder - Simple illustration */}
          <div className="mb-12 p-8 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-600">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-lg font-medium">Carte Interactive des Clubs</p>
              <p className="text-sm mt-2">Marseille • Paris • Nice • Créteil • Strasbourg</p>
              <p className="text-xs mt-4 text-gray-500">
                🗺️ Intégration Google Maps à venir
              </p>
            </div>
          </div>

          {/* Clubs List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {typedClubs?.map((club) => (
              <Card key={club.id} variant="bordered" className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="primary">{club.city}</Badge>
                    {club.active && (
                      <Badge variant="success" size="sm">Actif</Badge>
                    )}
                  </div>
                  <CardTitle>{club.name}</CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">
                    {club.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  {/* Address */}
                  {club.address && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{club.address}, {club.postal_code}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {club.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${club.phone}`} className="hover:text-primary">
                        {club.phone}
                      </a>
                    </div>
                  )}

                  {/* Email */}
                  {club.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${club.email}`} className="hover:text-primary truncate">
                        {club.email}
                      </a>
                    </div>
                  )}

                  {/* Pricing */}
                  {club.pricing && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Tarifs :</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(club.pricing as Record<string, number>).map(([key, value]) => (
                          <Badge key={key} variant="default" size="sm">
                            {key.charAt(0).toUpperCase() + key.slice(1)}: {value}€
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4 border-t border-gray-200">
                  <Link href={`/clubs/${club.slug}`} className="w-full">
                    <Button fullWidth variant="primary">
                      Voir le Club
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {!typedClubs || typedClubs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Aucun club disponible pour le moment.</p>
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prêt à Rejoindre un Club ?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Contactez le club de votre choix pour un cours d'essai gratuit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">
                  Nous Contacter
                </Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="ghost">
                  Questions Fréquentes
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

