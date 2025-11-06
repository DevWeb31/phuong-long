/**
 * Homepage - Landing Page
 * 
 * Page d'accueil avec Hero section et présentation
 * 
 * @version 1.0
 * @date 2025-11-04 20:50
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, ParallaxBackground } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club, Event } from '@/lib/types';
import { BoltIcon, TrophyIcon, UserGroupIcon, ShieldCheckIcon, UsersIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeroContent } from '@/components/marketing/HeroContent';

export const metadata: Metadata = {
  title: 'Accueil - Art Martial Vietnamien',
  description: 'Découvrez le Phuong Long Vo Dao, art martial vietnamien traditionnel. 5 clubs en France. Cours pour tous niveaux, enfants et adultes.',
};

export default async function HomePage() {
  const supabase = await createServerClient();
  
  // Récupérer les clubs actifs
  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name, slug, city, description')
    .eq('active', true)
    .order('city');
  
  const typedClubs = (clubs || []) as unknown as Pick<Club, 'id' | 'name' | 'slug' | 'city' | 'description'>[];
  
  // Récupérer les prochains événements
  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, start_date, event_type, location')
    .eq('active', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date')
    .limit(3);
  
  const typedEvents = (events || []) as unknown as Pick<Event, 'id' | 'title' | 'slug' | 'start_date' | 'event_type' | 'location'>[];

  return (
    <>
      {/* Hero Section - Moderne & Premium */}
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
          <HeroContent />
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-6">
              <span className="text-sm font-semibold text-primary dark:text-primary-light">✨ Nos Valeurs</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-5 tracking-tight">
              Pourquoi choisir le <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-dark to-secondary">Vo Dao</span> ?
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Une discipline complète qui développe le corps et l'esprit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Technique & Combat */}
            <Card hoverable className="group text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <BoltIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl text-slate-900 dark:text-slate-100">Technique & Combat</CardTitle>
                <CardDescription className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Maîtrisez les <span className="text-primary dark:text-primary-light font-semibold">techniques de frappe</span>, blocage et combat. 
                  Développez réflexes, coordination et self-défense efficace.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Excellence & Tradition */}
            <Card hoverable className="group text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-secondary/30 dark:hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrophyIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl text-slate-900 dark:text-slate-100">Excellence & Tradition</CardTitle>
                <CardDescription className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Cultivez les valeurs martiales : <span className="text-secondary dark:text-secondary-light font-semibold">respect, humilité, persévérance</span>. 
                  Un cadre structurant pour enfants et adultes.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Communauté */}
            <Card hoverable className="group text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent/30 dark:hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-amber-600 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-accent to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <UserGroupIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl text-slate-900 dark:text-slate-100">Communauté Passionnée</CardTitle>
                <CardDescription className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Rejoignez une <span className="text-accent dark:text-amber-400 font-semibold">famille soudée</span>. 
                  Participez à des stages, compétitions et événements dans toute la France.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Clubs Section */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
        <Container>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-secondary/10 dark:bg-secondary/20 rounded-full mb-6">
              <span className="text-sm font-semibold text-secondary dark:text-secondary-light">📍 Nos Emplacements</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-5 tracking-tight">
              Nos 5 Clubs
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Trouvez le club le plus proche de chez vous
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedClubs?.map((club) => (
              <Link key={club.id} href={`/clubs/${club.slug}`}>
                <Card variant="bordered" hoverable>
                  <CardHeader>
                    <Badge variant="primary" size="sm" className="mb-2">
                      {club.city}
                    </Badge>
                    <CardTitle>{club.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {club.description || `Club de ${club.city}`}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/clubs">
              <Button size="lg" variant="primary">
                Voir Tous les Clubs
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Events Section */}
      {typedEvents && typedEvents.length > 0 && (
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold dark:text-gray-100 mb-4">
                Prochains Événements
              </h2>
              <p className="text-lg dark:text-gray-500 max-w-2xl mx-auto">
                Stages, compétitions, démonstrations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {typedEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`}>
                  <Card variant="bordered" hoverable>
                    <CardHeader>
                      <Badge variant="warning" size="sm" className="mb-2">
                        {new Date(event.start_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Badge>
                      <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      <CardDescription>{event.location}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/events">
                <Button size="lg" variant="ghost">
                  Tous les Événements
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* CTA Section - Moderne */}
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
            <div className="inline-flex items-center px-5 py-2.5 bg-accent/20 border border-accent/30 rounded-full backdrop-blur-sm mb-6">
              <span className="text-accent font-semibold text-sm">⭐ Cours d'essai offert</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Prêt à Rejoindre le Dojo ?
            </h2>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Profitez d'un <span className="text-accent font-semibold">cours d'essai 100% gratuit</span> dans le club de votre choix. 
              Venez découvrir le Vo Dao et notre communauté passionnée.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/clubs">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 hover:shadow-xl hover:shadow-white/20 transition-all min-w-[200px] font-semibold">
                  🥋 Choisir un Club
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="bg-primary text-white hover:bg-primary-dark border-2 border-primary hover:shadow-xl hover:shadow-primary/30 transition-all min-w-[200px] font-semibold">
                  ✉️ Nous Contacter
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-300 text-sm font-medium">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-accent" />
                </div>
                <span>40 ans d'expérience</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-accent" />
                </div>
                <span>500+ pratiquants</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-accent" />
                </div>
                <span>5 villes</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

