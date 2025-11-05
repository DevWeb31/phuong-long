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
import { Container, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club, Event } from '@/lib/types';
import { BoltIcon, TrophyIcon, UserGroupIcon, ShieldCheckIcon, UsersIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
      {/* Hero Section - Arts Martiaux - Full Screen Immersive */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] min-h-screen flex items-center overflow-hidden">
        {/* Background Pattern - Motif Asiatique */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0-5.523-4.477-10-10-10zm-20 0c0-5.523-4.477-10-10-10S10 44.477 10 50s4.477 10 10 10c0-5.523 4.477-10 10-10zM50 30c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0-5.523-4.477-10-10-10zm-20 0c0-5.523-4.477-10-10-10S10 24.477 10 30s4.477 10 10 10c0-5.523 4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Gradient Overlay pour profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
        
        {/* Glow effects */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />

        <Container className="relative z-10 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg">
                <span className="text-secondary mr-2 text-lg">⭐</span>
                <span className="font-semibold text-xs">40 ans d'expérience</span>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg">
                <span className="text-secondary mr-2 text-lg">🥋</span>
                <span className="font-semibold text-xs">Enseignement traditionnel</span>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg">
                <span className="text-secondary mr-2 text-lg">🎯</span>
                <span className="font-semibold text-xs">Cours d'essai gratuit</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-8 animate-slide-up tracking-tight leading-tight">
              Phuong Long
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary mt-4 animate-shimmer">
                Vo Dao
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl lg:text-4xl text-white/95 mb-8 animate-slide-up font-medium tracking-wide">
              L'art martial vietnamien traditionnel
            </p>
            
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Découvrez une discipline complète alliant <span className="text-secondary-light font-bold">techniques de combat</span>, 
              <span className="text-secondary-light font-bold"> développement personnel</span> et 
              <span className="text-secondary-light font-bold"> valeurs traditionnelles</span>. 
            </p>
            
            {/* Value Propositions */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-fade-in">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-3">💪</div>
                <h3 className="text-white font-bold text-lg mb-2">Force & Agilité</h3>
                <p className="text-white/70 text-sm">Développez votre condition physique</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-3">🧠</div>
                <h3 className="text-white font-bold text-lg mb-2">Esprit & Discipline</h3>
                <p className="text-white/70 text-sm">Cultivez concentration et persévérance</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="text-white font-bold text-lg mb-2">Communauté</h3>
                <p className="text-white/70 text-sm">Rejoignez une famille passionnée</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-scale-in">
              <Link href="/clubs">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-50 shadow-2xl shadow-black/20 hover:shadow-white/40 min-w-[240px] text-lg py-4 px-8">
                  🥋 Trouver un Club
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="min-w-[240px] text-lg py-4 px-8 shadow-2xl shadow-black/20">
                  ✨ Essai Gratuit
                </Button>
              </Link>
            </div>

            {/* Stats - Social Proof */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-8">
              <div className="text-center group">
                <div className="text-5xl lg:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">40+</div>
                <div className="text-xs text-white/70 uppercase tracking-widest font-semibold">Ans d'expérience</div>
              </div>
              <div className="text-center group">
                <div className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary-light to-secondary mb-2 group-hover:scale-110 transition-transform duration-300">5</div>
                <div className="text-xs text-white/70 uppercase tracking-widest font-semibold">Clubs actifs</div>
              </div>
              <div className="text-center group">
                <div className="text-5xl lg:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-xs text-white/70 uppercase tracking-widest font-semibold">Pratiquants</div>
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="animate-bounce mt-8">
              <div className="flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors cursor-pointer">
                <span className="text-sm font-medium uppercase tracking-wider">Découvrir</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Pourquoi choisir le <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">Vo Dao</span> ?
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une discipline complète qui développe le corps et l'esprit
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
            {/* Technique & Combat */}
            <Card variant="bordered" hoverable className="text-center border-none bg-white shadow-xl hover:shadow-2xl">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary-dark to-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/40 group-hover:scale-110 transition-all duration-500">
                  <BoltIcon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="mb-4 text-gray-900 text-2xl">Technique & Combat</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Maîtrisez les <span className="text-primary font-bold">techniques de frappe</span>, blocage et combat. 
                  Développez réflexes, coordination et self-défense efficace.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Excellence & Tradition */}
            <Card variant="bordered" hoverable className="text-center border-none bg-white shadow-xl hover:shadow-2xl">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary via-secondary-dark to-secondary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-secondary/20 group-hover:shadow-xl group-hover:shadow-secondary/40 group-hover:scale-110 transition-all duration-500">
                  <TrophyIcon className="w-10 h-10 text-gray-900" />
                </div>
                <CardTitle className="mb-4 text-gray-900 text-2xl">Excellence & Tradition</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Cultivez les valeurs martiales : <span className="text-secondary-dark font-bold">respect, humilité, persévérance</span>. 
                  Un cadre structurant pour enfants et adultes.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Communauté */}
            <Card variant="bordered" hoverable className="text-center border-none bg-white shadow-xl hover:shadow-2xl">
              <CardContent className="pt-10 pb-10 px-8">
                <div className="w-20 h-20 bg-gradient-to-br from-accent via-green-600 to-accent rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-accent/20 group-hover:shadow-xl group-hover:shadow-accent/40 group-hover:scale-110 transition-all duration-500">
                  <UserGroupIcon className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="mb-4 text-gray-900 text-2xl">Communauté Passionnée</CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Rejoignez une <span className="text-accent font-bold">famille soudée</span>. 
                  Participez à des stages, compétitions et événements dans toute la France.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Clubs Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos 5 Clubs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
        <section className="py-16 lg:py-24 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Prochains Événements
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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

      {/* CTA Section - Dégradé Rouge/Or */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Background dégradé */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40Z' fill='%23ffffff' fill-opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }} />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-secondary/20 border border-secondary/40 rounded-full backdrop-blur-sm">
              <span className="text-secondary font-semibold">⭐ Cours d'essai offert ⭐</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Prêt à Rejoindre le Dojo ?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
              Profitez d'un <span className="text-secondary font-bold">cours d'essai 100% gratuit</span> dans le club de votre choix. 
              Venez découvrir le Vo Dao et notre communauté passionnée.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/clubs">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-50 hover:shadow-xl hover:shadow-white/20 transition-all min-w-[220px] font-bold">
                  🥋 Choisir un Club
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="bg-secondary text-gray-900 hover:bg-secondary-light border-2 border-secondary hover:shadow-xl hover:shadow-secondary/30 transition-all min-w-[220px] font-bold">
                  ✉️ Nous Contacter
                </Button>
              </Link>
            </div>

            {/* Trust badges - Heroicons */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80 text-sm font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-secondary" />
                <span>40 ans d'expérience</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-secondary" />
                <span>500+ pratiquants</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-secondary" />
                <span>5 villes</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

