/**
 * Cookies Policy Page - Politique des Cookies
 * 
 * Politique des cookies conforme RGPD
 * 
 * @version 1.0
 */

import { Container } from '@/components/common';
import { Metadata } from 'next';
import Link from 'next/link';
import { CookieConsentSettings } from '@/components/common/CookieConsentSettings';

export const metadata: Metadata = {
  title: 'Politique des Cookies | Phuong Long Vo Dao',
  description: 'Politique de gestion des cookies et traceurs sur le site Phuong Long Vo Dao',
  robots: 'index, follow',
};

export default function CookiesPage() {
  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 dark:text-gray-100">
          Politique des Cookies
        </h1>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          <p>Dernière mise à jour : 2025-01-06</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">1. Qu'est-ce qu'un Cookie ?</h2>
            <p className="mb-4">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) 
              lors de la visite d'un site web. Il permet au site de reconnaître votre navigateur et de stocker 
              certaines informations vous concernant.
            </p>
            <p className="mb-4">
              Les cookies peuvent être des "cookies de session" (temporaires, supprimés à la fermeture du navigateur) 
              ou des "cookies persistants" (restent sur votre terminal jusqu'à leur expiration ou suppression manuelle).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">2. Types de Cookies Utilisés</h2>
            
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">2.1 Cookies Essentiels (Nécessaires)</h3>
            <p className="mb-4">
              Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés. 
              Ils ne nécessitent pas votre consentement.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookies d'authentification</strong> : Maintien de votre session connectée (Supabase JWT)</li>
                <li><strong>Cookies de sécurité</strong> : Protection contre les attaques CSRF</li>
                <li><strong>Cookies de préférences</strong> : Langue, thème sombre/clair, accessibilité</li>
                <li><strong>Cookies de consentement</strong> : Mémorisation de vos choix de cookies</li>
              </ul>
              <p className="mt-4 text-sm">
                <strong>Durée de conservation :</strong> Session (fermeture navigateur) à 30 jours maximum
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">2.2 Cookies Analytics (Avec Consentement)</h3>
            <p className="mb-4">
              Ces cookies nous permettent d'analyser la fréquentation et l'utilisation du site pour l'améliorer. 
              Ils nécessitent votre consentement explicite.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Vercel Analytics</strong> : Statistiques de visite anonymisées</li>
                <li><strong>Google Analytics</strong> : Analyse du comportement des visiteurs (si activé)</li>
              </ul>
              <p className="mt-4 text-sm">
                <strong>Durée de conservation :</strong> 13 mois maximum
              </p>
              <p className="mt-2 text-sm">
                <strong>Anonymisation :</strong> Les adresses IP sont masquées et aucun identifiant personnel n'est collecté
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">2.3 Cookies Marketing (Avec Consentement)</h3>
            <p className="mb-4">
              Ces cookies sont utilisés pour la publicité ciblée et le remarketing. Ils nécessitent votre consentement explicite.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Facebook Pixel</strong> : Suivi des conversions publicitaires (si activé)</li>
                <li><strong>Cookies de remarketing</strong> : Affichage de publicités personnalisées</li>
              </ul>
              <p className="mt-4 text-sm">
                <strong>Durée de conservation :</strong> 13 mois maximum
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">3. Gestion de vos Préférences</h2>
            <p className="mb-4">
              Vous pouvez modifier vos préférences de cookies à tout moment en utilisant l'outil ci-dessous 
              ou en cliquant sur le lien "Gérer les cookies" présent en bas de chaque page.
            </p>
            
            <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-6 mb-6 border border-primary/20">
              <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">
                Modifier vos préférences de cookies
              </h3>
              <CookieConsentSettings />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">4. Configuration de votre Navigateur</h2>
            <p className="mb-4">
              Vous pouvez également configurer votre navigateur pour refuser les cookies. 
              Voici les liens vers les pages d'aide des principaux navigateurs :
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <a 
                  href="https://support.google.com/chrome/answer/95647" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a 
                  href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies-preferences" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a 
                  href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Safari
                </a>
              </li>
              <li>
                <a 
                  href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>
            <p className="mb-4 text-amber-600 dark:text-amber-400">
              <strong>Attention :</strong> La désactivation des cookies peut affecter le fonctionnement 
              de certaines fonctionnalités du site, notamment l'authentification et la personnalisation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">5. Cookies Tiers</h2>
            <p className="mb-4">
              Certains cookies sont déposés par des services tiers (réseaux sociaux, analytics, etc.). 
              Ces cookies sont soumis aux politiques de confidentialité de ces tiers.
            </p>
            <p className="mb-4">
              Nous n'avons pas accès à ces cookies et ne pouvons pas les contrôler. 
              Pour plus d'informations, consultez les politiques de confidentialité des services concernés.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">6. Durée de Conservation</h2>
            <p className="mb-4">Les cookies sont conservés pour les durées suivantes :</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Cookies de session</strong> : Supprimés à la fermeture du navigateur</li>
              <li><strong>Cookies d'authentification "Remember me"</strong> : 30 jours maximum</li>
              <li><strong>Cookies de consentement</strong> : 13 mois (durée légale maximale)</li>
              <li><strong>Cookies analytics</strong> : 13 mois maximum (avec consentement)</li>
              <li><strong>Cookies marketing</strong> : 13 mois maximum (avec consentement)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">7. Contact</h2>
            <p className="mb-4">
              Pour toute question concernant notre utilisation des cookies, vous pouvez nous contacter :
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p>
                Email :{' '}
                <a 
                  href="mailto:privacy@phuong-long-vo-dao.fr" 
                  className="text-primary hover:underline"
                >
                  privacy@phuong-long-vo-dao.fr
                </a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">8. Plus d'Informations</h2>
            <p className="mb-4">
              Pour en savoir plus sur vos droits concernant les données personnelles et les cookies :
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                Consultez notre{' '}
                <Link href="/legal/privacy" className="text-primary hover:underline">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                Visitez le site de la{' '}
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  CNIL
                </a>
                {' '}(Commission Nationale de l'Informatique et des Libertés)
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Container>
  );
}

