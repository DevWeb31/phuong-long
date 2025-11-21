/**
 * Contact Page - Formulaire de Contact
 * 
 * Page avec formulaire de contact complet et informations
 * 
 * @version 1.0
 * @date 2025-11-04 23:10
 */

import Link from 'next/link';
import { Container, Button, ParallaxBackground } from '@/components/common';
import { ContactHeroContent } from '@/components/marketing/ContactHeroContent';
import { ContactInfo } from '@/components/marketing/ContactInfo';
import { ContactForm } from '@/components/marketing/ContactForm';
import { createServerClient } from '@/lib/supabase/server';
import { HelpCircle } from 'lucide-react';

export default async function ContactPage() {
  const supabase = await createServerClient();
  
  // Récupérer le contenu éditable de la page contact
  const { data: pageContentData } = await supabase
    .from('page_content')
    .select('section_key, content_type, content')
    .eq('page_slug', 'contact')
    .order('display_order', { ascending: true });

  // Transformer en objet pour faciliter l'utilisation
  const pageContent: Record<string, string> = {};
  if (pageContentData) {
    pageContentData.forEach((item: { section_key: string; content: string | null }) => {
      pageContent[item.section_key] = item.content || '';
    });
  }

  // Utiliser les valeurs de la base de données uniquement (pas de valeurs par défaut)
  const email = pageContent['email'] || '';
  const phone = pageContent['phone'] || '';
  const hours = pageContent['hours'] || '{}';
  const address = pageContent['address'] || '{}';

  const { data: clubsData } = await supabase
    .from('clubs')
    .select('id, name, city')
    .eq('active', true)
    .order('city');

  const clubs = (clubsData || []).map((club: { id: string; name: string; city: string }) => ({
    id: club.id,
    name: club.name,
    city: club.city,
  }));

  return (
    <>
      {/* Hero Section with Parallax */}
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
          <ContactHeroContent />
        </Container>
      </section>

      {/* Contact Content */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <ContactInfo 
                email={email}
                phone={phone}
                hours={hours}
                address={address}
              />
              
              {/* CTA Clubs */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 border mt-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Contacter un club directement
                </h3>
                <p className="text-sm dark:text-gray-500 mb-4">
                  Pour des questions spécifiques à un club (horaires, essai gratuit), contactez-le directement.
                </p>
                <Link href="/clubs">
                  <Button variant="primary" size="sm" className="w-full">
                    Voir les clubs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm clubs={clubs} />
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold dark:text-gray-100 mb-4">
              Consultez notre FAQ
            </h2>
            <p className="text-lg dark:text-gray-500 mb-8">
              La réponse à votre question s'y trouve peut-être déjà !
            </p>
            <div className="flex justify-center">
              <Link href="/faq">
                <Button size="lg" variant="secondary" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Voir la FAQ
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

