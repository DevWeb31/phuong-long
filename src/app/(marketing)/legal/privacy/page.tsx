/**
 * Privacy Policy Page - Politique de Confidentialité
 * 
 * Politique de confidentialité conforme RGPD
 * 
 * @version 1.0
 */

import { Container } from '@/components/common';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Phuong Long Vo Dao',
  description: 'Politique de confidentialité et protection des données personnelles conformément au RGPD',
  robots: 'index, follow',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '2025-01-06';
  const version = '1.0';
  
  // TODO: Remplacer par les informations réelles de l'organisation
  const organizationName = 'ECOLE DU COBRA THIEU LAM AMVM';
  const headquartersAddress = '481 chemin de Bouconne, 31530 Montaigut Sur Save';

  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 dark:text-gray-100">
          Politique de Confidentialité
        </h1>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          <p>Dernière mise à jour : {lastUpdated}</p>
          <p>Version : {version}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">1. Responsable du Traitement</h2>
            <p className="mb-4">
              Le responsable du traitement des données personnelles collectées sur ce site est :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Nom :</strong> {organizationName}</li>
              <li><strong>Adresse :</strong> {headquartersAddress}</li>
              <li><strong>Contact :</strong> <Link href="/contact" className="text-primary hover:underline">Page de contact</Link></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">2. Données Collectées</h2>
            <p className="mb-4">
              Nous collectons les données personnelles suivantes :
            </p>
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">2.1 Données d'Identité</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Nom complet</li>
              <li>Adresse email (obligatoire pour la création de compte)</li>
              <li>Numéro de téléphone (optionnel)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">2.2 Données de Connexion</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Adresse IP</li>
              <li>Données de navigation (cookies, logs)</li>
              <li>Horodatage des connexions</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">2.3 Cookies et Trackers</h3>
            <p className="mb-4">
              Nous utilisons des cookies pour améliorer votre expérience de navigation. 
              Vous pouvez gérer vos préférences de cookies à tout moment via notre{' '}
              <Link href="/legal/cookies" className="text-primary hover:underline">
                page dédiée aux cookies
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">3. Finalités du Traitement</h2>
            <p className="mb-4">Vos données personnelles sont utilisées pour :</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Fourniture du service</strong> : Gestion de votre compte, accès aux fonctionnalités de la plateforme</li>
              <li><strong>Communication</strong> : Réponses à vos demandes de contact, envoi d'informations importantes</li>
              <li><strong>Marketing</strong> : Newsletter et communications marketing (uniquement avec votre consentement explicite)</li>
              <li><strong>Amélioration du service</strong> : Analytics et statistiques de fréquentation (avec consentement)</li>
              <li><strong>Obligations légales</strong> : Respect des obligations légales en vigueur</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">4. Base Légale du Traitement</h2>
            <p className="mb-4">Le traitement de vos données repose sur :</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Exécution d'un contrat</strong> : Création et gestion de votre compte utilisateur</li>
              <li><strong>Consentement</strong> : Newsletter, cookies non essentiels, communications marketing</li>
              <li><strong>Intérêt légitime</strong> : Amélioration du service, analytics (avec anonymisation)</li>
              <li><strong>Obligation légale</strong> : Respect des obligations légales en vigueur</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">5. Destinataires des Données</h2>
            <p className="mb-4">Vos données peuvent être transmises à :</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Personnel autorisé</strong> : Membres de l'équipe ayant besoin d'accéder aux données pour leurs fonctions</li>
              <li><strong>Sous-traitants</strong> :
                <ul className="list-circle pl-6 mt-2">
                  <li><strong>Supabase</strong> : Hébergement base de données et authentification (USA - Standard Contractual Clauses)</li>
                  <li><strong>Vercel</strong> : Hébergement du site web (USA - Standard Contractual Clauses)</li>
                  <li><strong>Resend</strong> : Envoi d'emails transactionnels (USA - Standard Contractual Clauses)</li>
                </ul>
              </li>
              <li><strong>Autorités</strong> : En cas d'obligation légale ou de réquisition judiciaire</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">6. Transferts Hors Union Européenne</h2>
            <p className="mb-4">
              Certains de nos sous-traitants sont situés hors de l'Union Européenne (notamment aux États-Unis). 
              Ces transferts sont encadrés par :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Les <strong>Clauses Contractuelles Types</strong> (Standard Contractual Clauses) de la Commission Européenne</li>
              <li>La conformité RGPD des prestataires (Privacy Shield successor, etc.)</li>
            </ul>
            <p className="mb-4">
              Vous pouvez obtenir plus d'informations sur ces garanties en nous contactant via notre{' '}
              <Link href="/contact" className="text-primary hover:underline">page de contact</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">7. Durée de Conservation</h2>
            <p className="mb-4">Vos données sont conservées pour les durées suivantes :</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Compte utilisateur actif</strong> : Conservation pendant toute la durée d'utilisation + 6 mois après inactivité</li>
              <li><strong>Compte inactif</strong> : Rappel après 2 ans → Suppression après 3 ans si pas de réponse</li>
              <li><strong>Newsletter</strong> : Jusqu'à désabonnement</li>
              <li><strong>Logs de sécurité</strong> : 6 mois</li>
              <li><strong>Analytics</strong> : 12 mois puis anonymisation</li>
              <li><strong>Consentements</strong> : 3 ans (preuve de conformité RGPD)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">8. Vos Droits (RGPD)</h2>
            <p className="mb-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Droit d'accès (Art. 15)</strong> : Vous pouvez demander quelles données personnelles nous détenons sur vous</li>
              <li><strong>Droit de rectification (Art. 16)</strong> : Vous pouvez corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement (Art. 17)</strong> : Vous pouvez demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité (Art. 20)</strong> : Vous pouvez recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition (Art. 21)</strong> : Vous pouvez vous opposer au traitement de vos données</li>
              <li><strong>Droit à la limitation (Art. 18)</strong> : Vous pouvez demander la limitation du traitement</li>
            </ul>
            <p className="mb-4">
              Pour exercer ces droits, vous pouvez :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Utiliser l'interface "Mes données" dans votre tableau de bord</li>
              <li>Nous contacter via notre <Link href="/contact" className="text-primary hover:underline">page de contact</Link></li>
            </ul>
            <p className="mb-4">
              Nous répondrons à votre demande dans un délai d'<strong>un mois maximum</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">9. Sécurité des Données</h2>
            <p className="mb-4">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Chiffrement HTTPS sur toutes les communications</li>
              <li>Mots de passe hashés avec des algorithmes sécurisés (bcrypt)</li>
              <li>Row Level Security (RLS) au niveau de la base de données</li>
              <li>Authentification forte (2FA) disponible pour les comptes administrateurs</li>
              <li>Sauvegardes régulières et sécurisées</li>
              <li>Monitoring et détection d'intrusions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">10. Cookies</h2>
            <p className="mb-4">
              Nous utilisons des cookies pour améliorer votre expérience. Consultez notre{' '}
              <Link href="/legal/cookies" className="text-primary hover:underline">
                politique des cookies
              </Link>{' '}
              pour plus d'informations et pour gérer vos préférences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">11. Droit de Réclamation</h2>
            <p className="mb-4">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de :
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="font-semibold mb-2">Commission Nationale de l'Informatique et des Libertés (CNIL)</p>
              <p className="mb-2">3 Place de Fontenoy - TSA 80715</p>
              <p className="mb-2">75334 PARIS CEDEX 07</p>
              <p className="mb-2">Téléphone : 01 53 73 22 22</p>
              <p>
                Site web :{' '}
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.cnil.fr
                </a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">12. Modifications de cette Politique</h2>
            <p className="mb-4">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
              En cas de modification substantielle, nous vous en informerons par email ou via une notification sur le site.
            </p>
            <p className="mb-4">
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">13. Contact</h2>
            <p className="mb-4">
              Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, 
              vous pouvez nous contacter :
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="font-semibold mb-2">{organizationName}</p>
              <p className="mb-2">{headquartersAddress}</p>
              <p>
                Contact : <Link href="/contact" className="text-primary hover:underline">Page de contact</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}

