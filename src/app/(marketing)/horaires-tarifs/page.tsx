/**
 * Horaires & Tarifs Page
 * 
 * Page affichant les horaires et tarifs de tous les clubs
 * avec calendrier hebdomadaire et sélecteur de clubs
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import type { Metadata } from 'next';
import { Container } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Club } from '@/lib/types';
import { HorairesContent } from '@/components/marketing/HorairesContent';

export const metadata: Metadata = {
  title: 'Horaires & Tarifs',
  description: 'Consultez les horaires de cours et les tarifs de tous nos clubs Phuong Long Vo Dao en France.',
};

export default async function HorairesTarifsPage() {
  const supabase = await createServerClient();
  
  // Récupérer tous les clubs actifs avec horaires et tarifs
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .eq('active', true)
    .order('city');
  
  const typedClubs = (clubs || []) as unknown as Club[];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-16 lg:py-20 overflow-hidden">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full shadow-xl shadow-black/10 animate-fade-in">
              <span className="text-accent mr-2.5">🗓️</span>
              <span className="font-semibold text-sm tracking-wide">{typedClubs.length} clubs disponibles</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-up tracking-tight leading-[1.1]">
              <span className="text-white">Horaires & </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-accent">Tarifs</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 leading-relaxed animate-fade-in max-w-2xl mx-auto">
              Consultez les horaires de cours et les tarifs de nos clubs partout en France
            </p>
          </div>
        </Container>
      </section>

      {/* Contenu principal */}
      <HorairesContent clubs={typedClubs} />
    </>
  );
}

