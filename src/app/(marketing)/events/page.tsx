/**
 * Events List Page
 * 
 * Page liste événements avec filtres par club et type
 * 
 * @version 2.0
 * @date 2025-11-08
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Button, ParallaxBackground } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Event } from '@/lib/types';
import { EventsHeroContent } from '@/components/marketing/EventsHeroContent';
import { EventsList } from '@/components/marketing/EventsList';
import { GraduationCap, Trophy, Theater, Circle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Événements',
  description: 'Stages, compétitions, démonstrations et séminaires Phuong Long Vo Dao. Participez aux événements dans toute la France. Filtrez par club et par type.',
};

export default async function EventsPage() {
  const supabase = await createServerClient();
  
  // Récupérer TOUS les événements (passés, en cours, à venir)
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      club:clubs(id, name, city, slug)
    `)
    .eq('active', true)
    .order('start_date', { ascending: false }); // Les plus récents d'abord

  const typedEvents = (events || []) as unknown as Array<Event & { 
    club: { 
      id: string;
      name: string; 
      city: string; 
      slug: string;
    } | null 
  }>;

  // Catégoriser les événements pour les stats du hero
  const now = new Date();
  const upcomingEvents = typedEvents.filter(e => new Date(e.start_date) > now);
  const currentEvents = typedEvents.filter(e => {
    const start = new Date(e.start_date);
    const end = e.end_date ? new Date(e.end_date) : start;
    return start <= now && end >= now;
  });

  // Récupérer la liste des clubs qui ont des événements
  const clubsWithEvents = Array.from(
    new Map(
      typedEvents
        .filter(e => e.club)
        .map(e => [e.club!.id, e.club!])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Calculer les stats pour les événements à venir uniquement (pour les stats du hero)
  const eventsByType = upcomingEvents.reduce((acc, event) => {
    const type = event.event_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Hero with Parallax */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-12 lg:py-16 overflow-hidden">
        {/* Parallax Background */}
        <ParallaxBackground>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </ParallaxBackground>
        
        {/* Gradient Overlay pour profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
        
        <Container className="relative z-10">
          <EventsHeroContent
            totalEvents={upcomingEvents.length + currentEvents.length}
          />
        </Container>
      </section>

      {/* Stats - Version ultra discrète */}
      <section className="py-3 md:py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Container>
          <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap text-xs md:text-sm">
            {currentEvents.length > 0 && (
              <>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {currentEvents.length}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    en cours
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
              </>
            )}
            
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-primary">
                {upcomingEvents.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                à venir
              </span>
            </div>
            
            {(eventsByType.stage || 0) > 0 && (
              <>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {eventsByType.stage || 0}
                  </span>
                </div>
              </>
            )}
            
            {(eventsByType.competition || 0) > 0 && (
              <>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {eventsByType.competition || 0}
                  </span>
                </div>
              </>
            )}
            
            {(eventsByType.demonstration || 0) > 0 && (
              <>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
                <div className="flex items-center gap-1.5">
                  <Theater className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {eventsByType.demonstration || 0}
                  </span>
                </div>
              </>
            )}
          </div>
        </Container>
      </section>

      {/* Liste des événements avec filtres */}
      <EventsList events={typedEvents} clubs={clubsWithEvents} />

      {/* CTA */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent">Organisez</span> <span className="text-white">un Événement</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Vous êtes coach ou responsable de club ? Proposez votre événement.
            </p>
            <div className="animate-scale-in">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-2xl shadow-black/20 hover:shadow-white/40 min-w-[240px] py-4 px-8 font-semibold flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Nous Contacter
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

