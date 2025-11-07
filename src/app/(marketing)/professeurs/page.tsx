/**
 * Professeurs Page
 * 
 * Page présentant tous les instructeurs avec fiches détaillées
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import type { Metadata } from 'next';
import { Container, ParallaxBackground } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Coach, Club } from '@/lib/types';
import { ProfesseursHeroContent } from '@/components/marketing/ProfesseursHeroContent';
import { ProfesseursGrid } from '@/components/marketing/ProfesseursGrid';

export const metadata: Metadata = {
  title: 'Nos Professeurs',
  description: 'Découvrez nos instructeurs qualifiés et passionnés de Vo Dao. Expertise, expérience et pédagogie pour vous accompagner.',
};

export default async function ProfesseursPage() {
  const supabase = await createServerClient();
  
  // Récupérer tous les coaches actifs avec leurs clubs
  const { data: coaches } = await supabase
    .from('coaches')
    .select(`
      *,
      club:clubs(id, name, city, slug)
    `)
    .eq('active', true)
    .order('display_order');
  
  const typedCoaches = (coaches || []) as unknown as Array<Coach & { club: Pick<Club, 'id' | 'name' | 'city' | 'slug'> | null }>;

  return (
    <>
      {/* Hero Section */}
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
          <ProfesseursHeroContent totalCoaches={typedCoaches.length} />
        </Container>
      </section>

      {/* Grille des professeurs */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900">
        <Container>
          <ProfesseursGrid coaches={typedCoaches} />
        </Container>
      </section>
    </>
  );
}

