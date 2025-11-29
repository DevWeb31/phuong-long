/**
 * Terms of Service Page - Conditions Générales d'Utilisation
 * 
 * CGU conforme à la législation française
 * 
 * @version 1.0
 */

import { Container } from '@/components/common';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation | Phuong Long Vo Dao',
  description: 'Conditions générales d\'utilisation de la plateforme Phuong Long Vo Dao',
  robots: 'index, follow',
};

export default function TermsOfServicePage() {
  const lastUpdated = '2025-01-06';
  
  // TODO: Remplacer par les informations réelles de l'organisation
  const organizationName = 'ECOLE DU COBRA THIEU LAM AMVM';
  const headquartersAddress = '481 chemin de Bouconne, 31530 Montaigut Sur Save';

  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 dark:text-gray-100">
          Conditions Générales d'Utilisation
        </h1>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          <p>Dernière mise à jour : {lastUpdated}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">1. Objet</h2>
            <p className="mb-4">
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités 
              et conditions d'utilisation du site web {organizationName} ainsi que les droits et obligations 
              des parties dans ce cadre.
            </p>
            <p className="mb-4">
              Elles constituent un contrat entre {organizationName} et tout utilisateur du site. 
              L'utilisation du site implique l'acceptation pleine et entière des présentes CGU.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">2. Description du Service</h2>
            <p className="mb-4">
              Le site {organizationName} propose les services suivants :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Présentation des clubs et activités de Phuong Long Vo Dao</li>
              <li>Blog et actualités liés aux arts martiaux</li>
              <li>Calendrier des événements (compétitions, stages, démonstrations)</li>
              <li>Gestion de compte utilisateur avec fonctionnalités personnalisées</li>
              <li>Inscription et gestion d'inscriptions aux événements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">3. Création de Compte</h2>
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">3.1 Inscription</h3>
            <p className="mb-4">
              Pour accéder à certaines fonctionnalités du site, vous devez créer un compte en fournissant :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Une adresse email valide</li>
              <li>Un mot de passe sécurisé (minimum 8 caractères)</li>
              <li>Vos nom et prénom (optionnel)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">3.2 Obligations de l'Utilisateur</h3>
            <p className="mb-4">En créant un compte, vous vous engagez à :</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Fournir des informations exactes, complètes et à jour</li>
              <li>Maintenir la confidentialité de vos identifiants de connexion</li>
              <li>Accepter les présentes CGU et la{' '}
                <Link href="/legal/privacy" className="text-primary hover:underline">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>Utiliser le site conformément à la loi et aux bonnes mœurs</li>
              <li>Ne pas utiliser le site à des fins illégales ou frauduleuses</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">3.3 Sécurité du Compte</h3>
            <p className="mb-4">
              Vous êtes responsable de toutes les activités effectuées depuis votre compte. 
              Vous devez immédiatement nous informer de toute utilisation non autorisée de votre compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">4. Utilisation Acceptable</h2>
            <p className="mb-4">Il est strictement interdit d'utiliser le site pour :</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Publier des contenus illégaux, diffamatoires, injurieux, obscènes ou offensants</li>
              <li>Violer les droits de propriété intellectuelle de tiers</li>
              <li>Envoyer des spams, virus ou tout code malveillant</li>
              <li>Tenter d'accéder de manière non autorisée aux systèmes ou données</li>
              <li>Imiter ou usurper l'identité d'une autre personne</li>
              <li>Collecter des informations sur d'autres utilisateurs sans leur consentement</li>
              <li>Utiliser le site à des fins commerciales non autorisées</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">5. Propriété Intellectuelle</h2>
            <p className="mb-4">
              L'ensemble du contenu du site (textes, images, logos, graphismes, vidéos, etc.) 
              est la propriété exclusive de {organizationName} ou de ses partenaires et est protégé 
              par les lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="mb-4">
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie 
              des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, 
              sauf autorisation écrite préalable.
            </p>
            <p className="mb-4">
              Les contenus publiés par les utilisateurs (commentaires, contributions) restent leur propriété. 
              En publiant sur le site, vous accordez à {organizationName} une licence non exclusive, 
              gratuite et mondiale pour utiliser, reproduire et afficher ces contenus dans le cadre du service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">6. Responsabilités et Limitations</h2>
            <p className="mb-4">
              {organizationName} s'efforce de fournir des informations exactes et à jour, 
              mais ne peut garantir l'exactitude, la complétude ou l'actualité de toutes les informations du site.
            </p>
            <p className="mb-4">
              {organizationName} ne saurait être tenu responsable :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Des dommages directs ou indirects résultant de l'utilisation du site</li>
              <li>De la perte de données ou de l'indisponibilité temporaire du service</li>
              <li>Des contenus publiés par les utilisateurs</li>
              <li>Des liens vers des sites tiers</li>
            </ul>
            <p className="mb-4">
              Vous êtes responsable de l'utilisation que vous faites du site et de vos contenus publiés.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">7. Résiliation du Compte</h2>
            <p className="mb-4">
              {organizationName} se réserve le droit de suspendre ou supprimer votre compte en cas de :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse du site</li>
              <li>Inactivité prolongée du compte</li>
            </ul>
            <p className="mb-4">
              Vous pouvez également supprimer votre compte à tout moment via les paramètres de votre profil 
              ou en nous contactant. Les données seront supprimées conformément à notre{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">8. Modification des CGU</h2>
            <p className="mb-4">
              {organizationName} se réserve le droit de modifier les présentes CGU à tout moment. 
              Les modifications entrent en vigueur dès leur publication sur le site.
            </p>
            <p className="mb-4">
              Il est recommandé de consulter régulièrement cette page pour prendre connaissance 
              des éventuelles modifications. En cas de modification substantielle, 
              nous vous en informerons par email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">9. Loi Applicable et Juridiction</h2>
            <p className="mb-4">
              Les présentes CGU sont régies par le droit français.
            </p>
            <p className="mb-4">
              En cas de litige et à défaut d'accord amiable, le litige sera porté devant 
              les tribunaux compétents français, conformément aux règles de compétence en vigueur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">10. Contact</h2>
            <p className="mb-4">
              Pour toute question concernant les présentes CGU, vous pouvez nous contacter :
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="font-semibold mb-2">{organizationName}</p>
              <p className="mb-2">{headquartersAddress}</p>
              <div className="mt-4">
                <Link 
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}

