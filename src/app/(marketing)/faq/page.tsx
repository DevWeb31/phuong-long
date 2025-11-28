/**
 * FAQ Page - Questions Fréquentes
 * 
 * Page avec toutes les questions fréquentes organisées par catégories
 * Les FAQ sont chargées dynamiquement depuis la base de données
 * 
 * @version 2.0
 * @date 2025-01-XX
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Accordion, Button, ParallaxBackground } from '@/components/common';
import type { AccordionItem } from '@/components/common';
import { FAQHeroContent } from '@/components/marketing/FAQHeroContent';
import { Shield, Calendar, Shirt, Mail, MapPin } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'FAQ - Questions Fréquentes | Phuong Long Vo Dao',
  description: 'Toutes les réponses à vos questions sur le Vo Dao, nos clubs, les cours, les tarifs et les inscriptions.',
  openGraph: {
    title: 'FAQ - Questions Fréquentes | Phuong Long Vo Dao',
    description: 'Toutes les réponses à vos questions sur le Vo Dao, nos clubs, les cours et les inscriptions.',
  },
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

// Questions par défaut (fallback si aucune FAQ en base)
const defaultGeneralQuestions: AccordionItem[] = [
  {
    id: 'general-1',
    question: 'Qu\'est-ce que le Phuong Long Vo Dao ?',
    answer: 'Le Phuong Long Vo Dao est un art martial vietnamien traditionnel qui combine techniques de combat (frappes, blocages, projections), développement physique et mental, et valeurs traditionnelles. Fondé il y a plus de 40 ans, notre école met l\'accent sur la discipline, le respect et l\'excellence martiale.',
  },
  {
    id: 'general-2',
    question: 'Quelle est la différence entre le Vo Dao et d\'autres arts martiaux ?',
    answer: 'Le Vo Dao vietnamien se distingue par sa fluidité, l\'utilisation de techniques circulaires, et l\'importance accordée à l\'équilibre entre force et souplesse. Contrairement au karaté plus linéaire ou au taekwondo axé sur les jambes, le Vo Dao offre un répertoire technique très varié incluant frappes, clés, projections et armes traditionnelles.',
  },
];

const defaultCourseQuestions: AccordionItem[] = [
  {
    id: 'course-1',
    question: 'Quels sont les horaires des cours ?',
    answer: 'Chaque club propose plusieurs créneaux horaires adaptés aux enfants, adolescents et adultes. Les horaires varient selon les clubs (généralement en soirée en semaine et le week-end). Consultez la page de votre club pour connaître les horaires précis.',
  },
  {
    id: 'course-2',
    question: 'Puis-je faire un cours d\'essai gratuit ?',
    answer: 'Absolument ! Nous offrons un cours d\'essai 100% gratuit sans engagement. C\'est l\'occasion idéale de découvrir notre discipline, rencontrer les professeurs et les élèves, et vous faire votre propre avis. Contactez le club de votre choix pour réserver votre essai.',
  },
];

const defaultEquipmentQuestions: AccordionItem[] = [
  {
    id: 'equipment-1',
    question: 'Quel équipement faut-il pour débuter ?',
    answer: 'Pour votre premier cours, un jogging et un t-shirt suffisent. Une fois inscrit, vous aurez besoin d\'un "Vo Phuc" (tenue traditionnelle) que vous pourrez acheter via notre boutique ou directement au club. Les protections (gants, protège-tibias) seront nécessaires après quelques mois.',
  },
];

const defaultSubscriptionQuestions: AccordionItem[] = [
  {
    id: 'subscription-1',
    question: 'Quels sont les tarifs des cours ?',
    answer: 'Les tarifs varient selon les clubs et le nombre de séances par semaine. Comptez entre 200€ et 350€ par an. Des tarifs réduits sont souvent proposés pour les familles (2ème enfant, fratrie). Consultez la page de votre club pour les tarifs exacts.',
  },
];

// Convertir les FAQ de la base en format AccordionItem
function convertFAQToAccordion(faqItems: FAQItem[]): AccordionItem[] {
  return faqItems.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));
}

export default async function FAQPage() {
  // Charger les FAQ générales depuis la base de données
  const supabase = await createServerClient();
  const { data: faqData } = await supabase
    .from('faq')
    .select('*')
    .is('club_id', null)
    .order('display_order', { ascending: true });

  const generalQuestions = faqData && faqData.length > 0
    ? convertFAQToAccordion(faqData as FAQItem[])
    : defaultGeneralQuestions;
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
          <FAQHeroContent />
        </Container>
      </section>

      {/* Table of Contents - Affichée uniquement si on utilise les sections par défaut */}
      {(!faqData || faqData.length === 0) && (
        <section className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-6">
          <Container>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="#general" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
                Généralités
              </a>
              <a href="#courses" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
                Cours
              </a>
              <a href="#equipment" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
                Équipement
              </a>
              <a href="#subscription" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
                Inscription
              </a>
            </div>
          </Container>
        </section>
      )}

      {/* FAQ Sections */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Généralités - FAQ depuis la base de données */}
            {generalQuestions.length > 0 && (
              <div id="general">
                <h2 className="text-3xl font-bold dark:text-gray-100 mb-6 flex items-center gap-3">
                  <Shield className="w-7 h-7 text-primary" />
                  Questions Fréquentes
                </h2>
                <Accordion items={generalQuestions} />
              </div>
            )}

            {/* Sections par défaut si aucune FAQ en base */}
            {(!faqData || faqData.length === 0) && (
              <>
                {/* Cours */}
                {defaultCourseQuestions.length > 0 && (
                  <div id="courses">
                    <h2 className="text-3xl font-bold dark:text-gray-100 mb-6 flex items-center gap-3">
                      <Calendar className="w-7 h-7 text-primary" />
                      Les Cours
                    </h2>
                    <Accordion items={defaultCourseQuestions} />
                  </div>
                )}

                {/* Équipement */}
                {defaultEquipmentQuestions.length > 0 && (
                  <div id="equipment">
                    <h2 className="text-3xl font-bold dark:text-gray-100 mb-6 flex items-center gap-3">
                      <Shirt className="w-7 h-7 text-primary" />
                      Équipement
                    </h2>
                    <Accordion items={defaultEquipmentQuestions} />
                  </div>
                )}

                {/* Inscription */}
                {defaultSubscriptionQuestions.length > 0 && (
                  <div id="subscription">
                    <h2 className="text-3xl font-bold dark:text-gray-100 mb-6">
                      💳 Inscription & Tarifs
                    </h2>
                    <Accordion items={defaultSubscriptionQuestions} />
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold dark:text-gray-100 mb-4">
              Vous n'avez pas trouvé votre réponse ?
            </h2>
            <p className="text-lg dark:text-gray-500 mb-8">
              N'hésitez pas à nous contacter directement, nous vous répondrons avec plaisir !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact">
                <Button size="lg" variant="primary" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Nous Contacter
                </Button>
              </Link>
              <Link href="/clubs">
                <Button size="lg" variant="secondary" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Trouver un Club
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

