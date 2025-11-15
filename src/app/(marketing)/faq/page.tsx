/**
 * FAQ Page - Questions Fréquentes
 * 
 * Page avec toutes les questions fréquentes organisées par catégories
 * 
 * @version 1.0
 * @date 2025-11-04 23:05
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Accordion, Button, ParallaxBackground } from '@/components/common';
import type { AccordionItem } from '@/components/common';
import { FAQHeroContent } from '@/components/marketing/FAQHeroContent';
import { Shield, Calendar, Shirt, Trophy, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ - Questions Fréquentes | Phuong Long Vo Dao',
  description: 'Toutes les réponses à vos questions sur le Vo Dao, nos clubs, les cours, les tarifs et les inscriptions.',
  openGraph: {
    title: 'FAQ - Questions Fréquentes | Phuong Long Vo Dao',
    description: 'Toutes les réponses à vos questions sur le Vo Dao, nos clubs, les cours et les inscriptions.',
  },
};

const generalQuestions: AccordionItem[] = [
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
  {
    id: 'general-3',
    question: 'À partir de quel âge peut-on commencer ?',
    answer: 'Nous acceptons les enfants dès 6 ans dans nos cours débutants. Pour les adultes, il n\'y a pas de limite d\'âge supérieure ! Nous adaptons les exercices et l\'intensité en fonction du niveau et de la condition physique de chacun.',
  },
  {
    id: 'general-4',
    question: 'Faut-il être sportif pour débuter ?',
    answer: 'Absolument pas ! Le Vo Dao s\'adapte à tous les niveaux de condition physique. Les débutants commencent en douceur et progressent à leur rythme. Nos professeurs qualifiés veillent à ce que chaque pratiquant évolue de manière sécurisée et adaptée.',
  },
];

const courseQuestions: AccordionItem[] = [
  {
    id: 'course-1',
    question: 'Quels sont les horaires des cours ?',
    answer: 'Chaque club propose plusieurs créneaux horaires adaptés aux enfants, adolescents et adultes. Les horaires varient selon les clubs (généralement en soirée en semaine et le week-end). Consultez la page de votre club pour connaître les horaires précis.',
  },
  {
    id: 'course-2',
    question: 'Combien de fois par semaine faut-il s\'entraîner ?',
    answer: 'Pour les débutants, nous recommandons 2 séances par semaine pour une progression optimale. Les pratiquants confirmés peuvent s\'entraîner 3 à 4 fois par semaine. La régularité est plus importante que la quantité !',
  },
  {
    id: 'course-3',
    question: 'Les cours sont-ils mixtes ?',
    answer: 'Oui, tous nos cours sont mixtes et ouverts aux hommes comme aux femmes. Le Vo Dao est un art martial qui convient parfaitement aux deux genres, avec des techniques basées sur l\'efficacité plutôt que la force brute.',
  },
  {
    id: 'course-4',
    question: 'Puis-je faire un cours d\'essai gratuit ?',
    answer: 'Absolument ! Nous offrons un cours d\'essai 100% gratuit sans engagement. C\'est l\'occasion idéale de découvrir notre discipline, rencontrer les professeurs et les élèves, et vous faire votre propre avis. Contactez le club de votre choix pour réserver votre essai.',
  },
];

const equipmentQuestions: AccordionItem[] = [
  {
    id: 'equipment-1',
    question: 'Quel équipement faut-il pour débuter ?',
    answer: 'Pour votre premier cours, un jogging et un t-shirt suffisent. Une fois inscrit, vous aurez besoin d\'un "Vo Phuc" (tenue traditionnelle) que vous pourrez acheter via notre boutique ou directement au club. Les protections (gants, protège-tibias) seront nécessaires après quelques mois.',
  },
  {
    id: 'equipment-2',
    question: 'Où puis-je acheter l\'équipement ?',
    answer: 'Notre boutique en ligne propose tous les équipements nécessaires : tenues, ceintures, protections et accessoires. Vous pouvez également acheter directement auprès de votre professeur au club, qui peut vous conseiller sur les tailles et les modèles adaptés.',
  },
  {
    id: 'equipment-3',
    question: 'Combien coûte l\'équipement complet ?',
    answer: 'Une tenue complète (Vo Phuc + ceinture) coûte entre 40€ et 60€. Les protections (gants, protège-tibias, coquille) représentent environ 50€ à 80€. L\'investissement initial pour débuter se situe donc autour de 100€ à 140€, en plus de l\'inscription.',
  },
];

const subscriptionQuestions: AccordionItem[] = [
  {
    id: 'subscription-1',
    question: 'Quels sont les tarifs des cours ?',
    answer: 'Les tarifs varient selon les clubs et le nombre de séances par semaine. Comptez entre 200€ et 350€ par an. Des tarifs réduits sont souvent proposés pour les familles (2ème enfant, fratrie). Consultez la page de votre club pour les tarifs exacts.',
  },
  {
    id: 'subscription-2',
    question: 'Y a-t-il un engagement minimum ?',
    answer: 'L\'inscription se fait généralement à l\'année (septembre à juin), mais certains clubs proposent des inscriptions trimestrielles. Aucun engagement à long terme : si vous souhaitez arrêter, il suffit de nous prévenir.',
  },
  {
    id: 'subscription-3',
    question: 'La licence est-elle obligatoire ?',
    answer: 'Oui, la licence fédérale est obligatoire pour pratiquer. Elle coûte environ 35€ par an et inclut une assurance responsabilité civile et accidents corporels. Elle est valable dans tous nos clubs et vous permet de participer aux stages et compétitions.',
  },
  {
    id: 'subscription-4',
    question: 'Proposez-vous des facilités de paiement ?',
    answer: 'Oui, nous proposons des paiements échelonnés (3 ou 4 fois) par chèque. Certains clubs acceptent également les chèques vacances et les bons CAF. N\'hésitez pas à en discuter avec votre club.',
  },
];

const progressQuestions: AccordionItem[] = [
  {
    id: 'progress-1',
    question: 'Comment fonctionne la progression par ceintures ?',
    answer: 'Le système de ceintures va de blanche (débutant) à noire (expert), avec plusieurs niveaux intermédiaires (jaune, orange, verte, bleue, marron). Les passages de grades ont lieu 1 à 2 fois par an et sont évalués par un jury qualifié sur la technique, la forme physique et l\'attitude.',
  },
  {
    id: 'progress-2',
    question: 'Combien de temps pour avoir la ceinture noire ?',
    answer: 'En moyenne, il faut 6 à 8 ans de pratique régulière pour atteindre la ceinture noire. Cela dépend de votre assiduité, de vos capacités et de votre investissement. La ceinture noire n\'est pas une fin en soi, mais le début d\'un apprentissage encore plus approfondi !',
  },
  {
    id: 'progress-3',
    question: 'Y a-t-il des compétitions ?',
    answer: 'Oui ! Nous organisons et participons à des compétitions régionales et nationales (combats, techniques, armes). La participation n\'est pas obligatoire, mais c\'est une excellente occasion de se mesurer, progresser et représenter son club. Nous proposons aussi des stages avec d\'autres clubs.',
  },
];

export default function FAQPage() {
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

      {/* Table of Contents */}
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
            <a href="#progress" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
              Progression
            </a>
          </div>
        </Container>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Généralités */}
            <div id="general">
              <h2 className="text-3xl font-bold dark:text-gray-100 mb-6 flex items-center gap-3">
                <Shield className="w-7 h-7 text-primary" />
                Généralités sur le Vo Dao
              </h2>
              <Accordion items={generalQuestions} />
            </div>

            {/* Cours */}
            <div id="courses">
              <h2 className="text-3xl font-bold dark:text-gray-100 mb-6 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-primary" />
                Les Cours
              </h2>
              <Accordion items={courseQuestions} />
            </div>

            {/* Équipement */}
            <div id="equipment">
              <h2 className="text-3xl font-bold dark:text-gray-100 mb-6 flex items-center gap-3">
                <Shirt className="w-7 h-7 text-primary" />
                Équipement
              </h2>
              <Accordion items={equipmentQuestions} />
            </div>

            {/* Inscription */}
            <div id="subscription">
              <h2 className="text-3xl font-bold dark:text-gray-100 mb-6">
                💳 Inscription & Tarifs
              </h2>
              <Accordion items={subscriptionQuestions} />
            </div>

            {/* Progression */}
            <div id="progress">
              <h2 className="text-3xl font-bold dark:text-gray-100 mb-6 flex items-center gap-3">
                <Trophy className="w-7 h-7 text-primary" />
                Progression & Compétitions
              </h2>
              <Accordion items={progressQuestions} />
            </div>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" variant="primary" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Nous Contacter
                </Button>
              </Link>
              <Link href="/clubs">
                <Button size="lg" variant="ghost" className="flex items-center gap-2">
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

