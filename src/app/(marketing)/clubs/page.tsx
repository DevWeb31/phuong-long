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
              <span className="text-secondary mr-2 text-xl">🥋</span>
              <span className="font-semibold text-sm">5 clubs en France</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 animate-slide-up tracking-tight">
              Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary">Clubs</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Trouvez le club Phuong Long Vo Dao le plus proche de chez vous et profitez d'un cours d'essai gratuit
            </p>
          </div>
        </Container>
      </section>

      {/* Clubs Grid */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          {/* Map Placeholder - Modern illustration */}
          <div className="mb-16 p-12 bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200/60 shadow-xl shadow-gray-200/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-6 shadow-lg shadow-primary/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Carte Interactive des Clubs</h2>
              <p className="text-lg text-gray-600 mb-4 font-medium">Marseille • Paris • Nice • Créteil • Strasbourg</p>
              <p className="text-sm text-gray-500 inline-flex items-center gap-2">
                <span className="text-xl">🗺️</span> Intégration Google Maps à venir
              </p>
            </div>
          </div>

          {/* Clubs List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {typedClubs?.map((club) => (
              <Card key={club.id} hoverable className="flex flex-col border-none shadow-xl hover:shadow-2xl">
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
              Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary">Rejoindre</span> un Club ?
            </h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Contactez le club de votre choix pour un cours d'essai gratuit
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-50 shadow-2xl shadow-black/20 hover:shadow-white/40 min-w-[240px] text-lg py-4 px-8">
                  ✉️ Nous Contacter
                </Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="ghost" className="border-white/30 text-white hover:bg-white/10 min-w-[240px] text-lg py-4 px-8">
                  ❓ Questions Fréquentes
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

