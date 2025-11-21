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
import { Container, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, ScrollReveal } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club, Event } from '@/lib/types';
import { ShieldCheckIcon, UsersIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeroCarousel, type HeroSlide } from '@/components/marketing/HeroCarousel';
import { AnimatedCounter } from '@/components/marketing/AnimatedCounter';
import { Sparkles, Mail, Shield } from 'lucide-react';
import { getFeatureIcon } from '@/lib/icons/feature-icons';

export const metadata: Metadata = {
  title: 'Accueil - Art Martial Vietnamien',
  description: 'Découvrez le Phuong Long Vo Dao, art martial vietnamien traditionnel. 5 clubs en France. Cours pour tous niveaux, enfants et adultes.',
};

export default async function HomePage() {
  const supabase = await createServerClient();
  
  // Récupérer le contenu éditable de la page d'accueil
  const { data: pageContentData } = await supabase
    .from('page_content')
    .select('section_key, content_type, content')
    .eq('page_slug', 'home')
    .order('display_order', { ascending: true });

  // Transformer en objet pour faciliter l'utilisation
  const pageContent: Record<string, string> = {};
  if (pageContentData) {
    pageContentData.forEach((item: { section_key: string; content: string | null }) => {
      pageContent[item.section_key] = item.content || '';
    });
  }

  // Valeurs par défaut si le contenu n'existe pas en base
  const featuresTitle = pageContent['features_title'] || 'Pourquoi choisir le Vo Dao ?';
  const featuresSubtitle = pageContent['features_subtitle'] || 'Une discipline complète qui développe le corps et l\'esprit';
  const feature1Title = pageContent['feature_1_title'] || 'Technique & Combat';
  const feature1Description = pageContent['feature_1_description'] || 'Maîtrisez les <span class="text-primary dark:text-primary-light font-semibold">techniques de frappe</span>, blocage et combat. Développez réflexes, coordination et self-défense efficace.';
  const feature1IconName = pageContent['feature_1_icon'] || 'Bolt';
  const Feature1Icon = getFeatureIcon(feature1IconName);
  const feature2Title = pageContent['feature_2_title'] || 'Excellence & Tradition';
  const feature2Description = pageContent['feature_2_description'] || 'Apprenez un <span class="text-secondary dark:text-secondary-light font-semibold">art martial traditionnel</span> transmis de génération en génération. Respect des maîtres et de la philosophie orientale.';
  const feature2IconName = pageContent['feature_2_icon'] || 'Trophy';
  const Feature2Icon = getFeatureIcon(feature2IconName);
  const feature3Title = pageContent['feature_3_title'] || 'Bien-être & Développement';
  const feature3Description = pageContent['feature_3_description'] || 'Renforcez votre <span class="text-accent dark:text-accent-light font-semibold">santé physique</span> et mentale. Améliorez souplesse, endurance, concentration et confiance en soi.';
  const feature3IconName = pageContent['feature_3_icon'] || 'Users';
  const Feature3Icon = getFeatureIcon(feature3IconName);
  
  // Récupérer les slides du carousel hero
  const { data: heroSlides } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('active', true)
    .order('display_order');
  
  const typedHeroSlides = (heroSlides || []) as HeroSlide[];
  
  // Récupérer les clubs actifs
  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name, slug, city, description, cover_image_url')
    .eq('active', true)
    .order('city');
  
  const typedClubs = (clubs || []) as unknown as Pick<Club, 'id' | 'name' | 'slug' | 'city' | 'description' | 'cover_image_url'>[];
  
  // Récupérer les prochains événements
  const { data: events } = await supabase
    .from('events')
    .select('id, title, slug, start_date, event_type, location, cover_image_url')
    .eq('active', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date')
    .limit(3);
  
  const typedEvents = (events || []) as unknown as Pick<Event, 'id' | 'title' | 'slug' | 'start_date' | 'event_type' | 'location' | 'cover_image_url'>[];

  return (
    <>
      {/* Hero Carousel avec vidéo YouTube */}
      {typedHeroSlides.length > 0 ? (
        <HeroCarousel slides={typedHeroSlides} autoPlayInterval={5000} />
      ) : (
        // Fallback si aucun slide n'est configuré
        <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-20 lg:py-24 overflow-hidden">
          <Container className="relative z-10">
            <div className="max-w-5xl mx-auto text-center text-white">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
                <span className="text-white">Phuong Long</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent mt-3">
                  Vo Dao
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-6 font-medium max-w-2xl mx-auto leading-relaxed">
                L'art martial vietnamien traditionnel
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-3xl" />
        
        <Container className="relative z-10">
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-primary dark:text-primary-light" />
                <span className="text-sm font-semibold text-primary dark:text-primary-light">Nos Valeurs</span>
              </div>
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-5 tracking-tight"
                dangerouslySetInnerHTML={{ __html: featuresTitle || 'Pourquoi choisir le Vo Dao ?' }}
              />
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {featuresSubtitle}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Technique & Combat */}
            <ScrollReveal direction="up" delay={100} className="h-full">
            <Card hoverable className="group text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full flex flex-col">
              <CardContent className="pt-10 pb-10 px-8 flex-1 flex flex-col">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Feature1Icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl text-slate-900 dark:text-slate-100">{feature1Title}</CardTitle>
                <CardDescription 
                  className="text-base leading-relaxed text-slate-600 dark:text-slate-400"
                  dangerouslySetInnerHTML={{ __html: feature1Description }}
                />
              </CardContent>
            </Card>
            </ScrollReveal>

            {/* Excellence & Tradition */}
            <ScrollReveal direction="up" delay={200} className="h-full">
            <Card hoverable className="group text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-secondary/30 dark:hover:border-secondary/30 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 h-full flex flex-col">
              <CardContent className="pt-10 pb-10 px-8 flex-1 flex flex-col">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Feature2Icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl text-slate-900 dark:text-slate-100">{feature2Title}</CardTitle>
                <CardDescription 
                  className="text-base leading-relaxed text-slate-600 dark:text-slate-400"
                  dangerouslySetInnerHTML={{ __html: feature2Description }}
                />
              </CardContent>
            </Card>
            </ScrollReveal>

            {/* Communauté */}
            <ScrollReveal direction="up" delay={300} className="h-full">
            <Card hoverable className="group text-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-accent/30 dark:hover:border-accent/30 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 h-full flex flex-col">
              <CardContent className="pt-10 pb-10 px-8 flex-1 flex flex-col">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-amber-600 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                  <div className="relative w-full h-full bg-gradient-to-br from-accent to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Feature3Icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl text-slate-900 dark:text-slate-100">{feature3Title}</CardTitle>
                <CardDescription 
                  className="text-base leading-relaxed text-slate-600 dark:text-slate-400"
                  dangerouslySetInnerHTML={{ __html: feature3Description }}
                />
              </CardContent>
            </Card>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Clubs Section */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50">
        <Container>
          <ScrollReveal direction="down" delay={0}>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 dark:bg-secondary/20 rounded-full mb-6">
                <MapPinIcon className="w-4 h-4 text-secondary dark:text-secondary-light" />
                <span className="text-sm font-semibold text-secondary dark:text-secondary-light">Nos Emplacements</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-5 tracking-tight">
                Nos {typedClubs.length} {typedClubs.length > 1 ? 'Clubs' : 'Club'}
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Trouvez le club le plus proche de chez vous
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center gap-6">
            {typedClubs?.map((club, index) => (
              <ScrollReveal key={club.id} direction="up" delay={index * 100} className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-md">
              <Link href={`/clubs/${club.slug}`} className="h-full block">
                <Card variant="bordered" hoverable className="h-full flex flex-col relative overflow-hidden">
                  {/* Image de fond avec transparence */}
                  {club.cover_image_url && (
                    <>
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                        style={{ backgroundImage: `url(${club.cover_image_url})` }}
                      />
                      {/* Overlay pour améliorer la lisibilité */}
                      <div className="absolute inset-0 bg-white/85 dark:bg-slate-900/85 z-0" />
                    </>
                  )}
                  
                  {/* Contenu au-dessus de l'image */}
                  <CardHeader className="relative z-10">
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
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="fade" delay={500}>
            <div className="text-center mt-10">
              <Link href="/clubs">
                <Button size="lg" variant="primary">
                  Voir Tous les Clubs
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Events Section */}
      {typedEvents && typedEvents.length > 0 && (
        <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
          <Container>
            <ScrollReveal direction="down" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold dark:text-gray-100 mb-4">
                  Prochains Événements
                </h2>
                <p className="text-lg dark:text-gray-500 max-w-2xl mx-auto">
                  Stages, compétitions, démonstrations
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {typedEvents.map((event, index) => (
                <ScrollReveal key={event.id} direction="up" delay={index * 100} className="h-full">
                <Link href={`/events/${event.slug}`} className="h-full block">
                  <Card variant="bordered" hoverable className="h-full flex flex-col relative overflow-hidden">
                    {/* Image de fond avec transparence */}
                    {event.cover_image_url && (
                      <>
                        <div 
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
                          style={{ backgroundImage: `url(${event.cover_image_url})` }}
                        />
                        {/* Overlay pour améliorer la lisibilité */}
                        <div className="absolute inset-0 bg-white/85 dark:bg-slate-900/85 z-0" />
                      </>
                    )}
                    
                    {/* Contenu au-dessus de l'image */}
                    <CardHeader className="relative z-10">
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
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal direction="fade" delay={400}>
              <div className="text-center mt-10">
                <Link href="/events">
                  <Button size="lg" variant="primary">
                    Tous les Événements
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
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
            <ScrollReveal direction="down" delay={0}>
              <div className="inline-flex items-center px-5 py-2.5 bg-accent/20 border border-accent/30 rounded-full backdrop-blur-sm mb-6">
                <span className="text-accent font-semibold text-sm">⭐ Cours d'essai offert</span>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={100}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                Prêt à Rejoindre le Dojo ?
              </h2>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                Profitez d'un <span className="text-accent font-semibold">cours d'essai 100% gratuit</span> dans le club de votre choix. 
                Venez découvrir le Vo Dao et notre communauté passionnée.
              </p>
            </ScrollReveal>
            
            <ScrollReveal direction="fade" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/clubs">
                  <Button size="lg" variant="primary" className="min-w-[200px] font-semibold flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Choisir un Club
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="primary" className="min-w-[200px] font-semibold flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Nous Contacter
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Trust badges */}
            <ScrollReveal direction="fade" delay={400}>
              <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-300 text-sm font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-accent" />
                  </div>
                  <span>
                    <AnimatedCounter end={40} suffix=" ans d'expérience" className="text-accent font-bold" />
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-accent" />
                  </div>
                  <span>
                    <AnimatedCounter end={500} suffix="+ pratiquants" className="text-accent font-bold" />
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <MapPinIcon className="w-5 h-5 text-accent" />
                  </div>
                  <span>
                    <AnimatedCounter end={5} suffix=" villes" className="text-accent font-bold" />
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </Container>
      </section>
    </>
  );
}

