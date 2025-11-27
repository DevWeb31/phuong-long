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
import { Mail, Shield, HelpCircle, MapPin, Phone } from 'lucide-react';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, ParallaxBackground, ClubImage, ScrollReveal } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club } from '@/lib/types';
import { ClubsHeroContent } from '@/components/marketing/ClubsHeroContent';
import { ClubsMap } from '@/components/marketing/ClubsMap';
import { canViewClubContact } from '@/lib/utils/check-contact-visibility';

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
  
  // Vérifier si l'utilisateur peut voir les informations de contact
  const canViewContact = await canViewClubContact();

  return (
    <>
      {/* Hero with Parallax */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#E6110A] py-12 lg:py-16 overflow-hidden">
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
        {/* Subtle background decoration avec animation */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        <Container className="relative z-10">
          {/* Carte Interactive */}
          <ScrollReveal direction="fade" delay={100}>
            <ClubsMap clubs={typedClubs} />
          </ScrollReveal>

          {/* Clubs List */}
          <div className="flex flex-wrap justify-center items-stretch gap-6 lg:gap-8 mt-16 max-w-7xl mx-auto">
            {typedClubs?.map((club, index) => (
              <ScrollReveal 
                key={club.id}
                direction="up" 
                delay={index * 100}
                className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc((100%-4rem)/3)] flex h-full"
              >
                <Card 
                  className="flex flex-col h-full w-full border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                {/* Image de couverture */}
                <div className="relative aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-t-xl">
                  {club.cover_image_url ? (
                    <ClubImage
                      src={club.cover_image_url}
                      alt={club.name}
                      clubName={club.name}
                      clubCity={club.city}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="mb-3">
                        <Shield className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto" />
                      </div>
                      <div className="font-bold text-gray-700 dark:text-gray-300">{club.name}</div>
                      <div className="text-gray-500 dark:text-gray-500 mt-1">{club.city}</div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl mb-2">{club.name}</CardTitle>
                  {club.description && (
                    <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                      {club.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Informations de contact */}
                  <div className="space-y-3">
                    {/* Address */}
                    {club.address && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                            {club.address}
                            {club.postal_code && `, ${club.postal_code}`}
                            {club.city && ` ${club.city}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {canViewContact && club.phone && (() => {
                      // Séparer les numéros de téléphone par virgule
                      const phoneNumbers = club.phone.split(',').map(phone => phone.trim()).filter(phone => phone);
                      
                      return (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {phoneNumbers.length > 1 ? (
                              <div className="space-y-1.5">
                                {phoneNumbers.map((phone, index) => (
                                  <a 
                                    key={index}
                                    href={`tel:${phone}`} 
                                    className="block text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors duration-300 font-medium"
                                  >
                                    {phone}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <a 
                                href={`tel:${phoneNumbers[0]}`} 
                                className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors duration-300 font-medium"
                              >
                                {phoneNumbers[0]}
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Email */}
                    {canViewContact && club.email && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <a 
                          href={`mailto:${club.email}`} 
                          className="text-sm text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors font-medium truncate flex-1 min-w-0"
                          title={club.email}
                        >
                          {club.email}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
                  <Link href={`/clubs/${club.slug}`} className="w-full">
                    <Button 
                      fullWidth 
                      variant="primary"
                    >
                      Voir le Club
                    </Button>
                  </Link>
                </CardFooter>
                </Card>
              </ScrollReveal>
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
            <ScrollReveal direction="down" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent animate-shimmer bg-[length:200%_auto]">Rejoindre</span> un Club ?
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Contactez le club de votre choix pour un cours d'essai gratuit
              </p>
            </ScrollReveal>
            <ScrollReveal direction="fade" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact" className="group/cta">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:shadow-2xl min-w-[200px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <Mail className="w-4 h-4 group-hover/cta:rotate-12 transition-transform duration-300" />
                  <span>Nous Contacter</span>
                </Button>
              </Link>
              <Link href="/faq" className="group/cta">
                <Button size="lg" className="bg-gradient-to-r from-accent to-amber-500 text-white hover:from-amber-500 hover:to-accent shadow-xl shadow-accent/30 hover:shadow-accent/50 hover:shadow-2xl min-w-[200px] font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                  <HelpCircle className="w-4 h-4 group-hover/cta:rotate-12 transition-transform duration-300" />
                  <span>Questions Fréquentes</span>
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

