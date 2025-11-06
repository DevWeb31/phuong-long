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
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, ParallaxBackground, ClubImage } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club } from '@/lib/types';
import { ClubsHeroContent } from '@/components/marketing/ClubsHeroContent';

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
          <ClubsHeroContent />
        </Container>
      </section>

      {/* Clubs Grid */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          {/* Map Placeholder - Modern illustration */}
          <div className="mb-16 p-10 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-6 shadow-xl shadow-primary/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Carte Interactive des Clubs</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 font-medium">Marseille • Paris • Nice • Créteil • Strasbourg</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 inline-flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-full">
                <span className="text-lg">🗺️</span> Intégration Google Maps à venir
              </p>
            </div>
          </div>

          {/* Clubs List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {typedClubs?.map((club) => (
              <Card key={club.id} hoverable className="flex flex-col border-none shadow-xl hover:shadow-2xl overflow-hidden">
                {/* Image de couverture */}
                <div className="relative aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                  {club.cover_image_url ? (
                    <ClubImage
                      src={club.cover_image_url}
                      alt={club.name}
                      clubName={club.name}
                      clubCity={club.city}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="text-5xl mb-3">🥋</div>
                      <div className="font-bold text-gray-700 dark:text-gray-300">{club.name}</div>
                      <div className="text-gray-500 dark:text-gray-500 mt-1">{club.city}</div>
                    </div>
                  )}
                  
                  {/* Badge ville en overlay */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="primary">{club.city}</Badge>
                  </div>
                  
                  {/* Badge actif en overlay */}
                  {club.active && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="success" size="sm">Actif</Badge>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle>{club.name}</CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">
                    {club.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  {/* Address */}
                  {club.address && (
                    <div className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <svg className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{club.address}, {club.postal_code}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {club.phone && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${club.phone}`} className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                        {club.phone}
                      </a>
                    </div>
                  )}

                  {/* Email */}
                  {club.email && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${club.email}`} className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors truncate">
                        {club.email}
                      </a>
                    </div>
                  )}

                  {/* Pricing */}
                  {club.pricing && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tarifs :</p>
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

                <CardFooter className="pt-4 border-t border-slate-200 dark:border-slate-700">
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
              <p className="text-gray-600 dark:text-gray-500">Aucun club disponible pour le moment.</p>
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background moderne */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900" />
        
        {/* Effets lumineux subtils */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_50%)]" />
        
        {/* Grid pattern subtil */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M0 0h1v1H0zM30 0h1v1h-1zM0 30h1v1H0zM30 30h1v1h-1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px',
          }} />
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in tracking-tight">
              Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent">Rejoindre</span> un Club ?
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up">
              Contactez le club de votre choix pour un cours d'essai gratuit
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-xl shadow-black/20 hover:shadow-white/40 min-w-[200px] font-semibold">
                  ✉️ Nous Contacter
                </Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" className="border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-xl min-w-[200px] font-semibold">
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

