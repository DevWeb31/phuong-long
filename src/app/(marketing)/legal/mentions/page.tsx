/**
 * Mentions Légales Page
 * 
 * Mentions légales conformes à la législation française
 * 
 * @version 1.0
 */

import { Container } from '@/components/common';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions Légales | Phuong Long Vo Dao',
  description: 'Mentions légales du site Phuong Long Vo Dao',
  robots: 'index, follow',
};

export default function MentionsLegalesPage() {
  // TODO: Remplacer par les informations réelles de l'organisation
  const organizationName = 'ECOLE DU COBRA THIEU LAM AMVM';
  const directorName = 'François Codine';
  const headquartersAddress = '481 chemin de Bouconne, 31530 Montaigut Sur Save';
  const siret = '513 779 298 00019';
  const hostName = 'Vercel Inc.';
  const hostAddress = '340 S Lemon Ave #4133, Walnut, CA 91789, USA';

  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 dark:text-gray-100">
          Mentions Légales
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">1. Éditeur du Site</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
              <p className="font-semibold mb-2">{organizationName}</p>
              <p className="mb-2">{headquartersAddress}</p>
              {siret && (
                <p className="mb-2">SIRET : {siret}</p>
              )}
              <p className="mb-2">
                Contact : <Link href="/contact" className="text-primary hover:underline">Page de contact</Link>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">2. Directeur de Publication</h2>
            <p className="mb-4">
              Le directeur de publication est : <strong>{directorName}</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">3. Hébergement</h2>
            <p className="mb-4">Le site est hébergé par :</p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-4">
              <p className="font-semibold mb-2">{hostName}</p>
              <p className="mb-2">{hostAddress}</p>
              <p>
                Site web :{' '}
                <a 
                  href="https://vercel.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  vercel.com
                </a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">4. Contact</h2>
            <p className="mb-4">
              Pour toute question ou demande d'information, vous pouvez nous contacter :
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <p className="mb-2">
                Contact : <Link href="/contact" className="text-primary hover:underline">Page de contact</Link>
              </p>
              <p className="mb-2">Adresse : {headquartersAddress}</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">5. Propriété Intellectuelle</h2>
            
            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">5.1 Propriété du Code Source et de la Structure</h3>
            <p className="mb-4">
              Le code source, l'architecture technique, la structure, le design et l'ensemble des fonctionnalités 
              de cette plateforme web sont la <strong>propriété intellectuelle exclusive</strong> de :
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="font-semibold mb-1">Damien Oriente</p>
              <p className="text-sm mb-1">Développeur - DevWeb31</p>
              <p className="text-sm">
                Site web :{' '}
                <a 
                  href="https://www.devweb31.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.devweb31.fr
                </a>
              </p>
            </div>
            
            <p className="mb-4">
              Cette plateforme est protégée par les lois françaises et internationales relatives à la propriété 
              intellectuelle, notamment le droit d'auteur et le Code de la Propriété Intellectuelle.
            </p>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">5.2 Interdictions Stricte</h3>
            <p className="mb-4">
              <strong>Il est strictement interdit</strong>, sans autorisation écrite préalable et explicite de DevWeb31, de :
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Reproduire, copier, dupliquer ou cloner tout ou partie du code source, de la structure ou du design de cette plateforme</li>
              <li>Adapter, modifier, transformer ou créer des œuvres dérivées à partir de cette plateforme</li>
              <li>Distribuer, diffuser, communiquer au public, vendre, louer ou concéder sous licence tout ou partie de cette plateforme</li>
              <li>Extraire ou réutiliser de manière systématique tout ou partie substantiel du contenu de cette plateforme</li>
              <li>Effectuer une ingénierie inverse du code source ou de la structure de la plateforme</li>
              <li>S'approprier, revendiquer la paternité ou attribuer à un tiers la propriété de cette plateforme</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">5.3 Contenu Editorial</h3>
            <p className="mb-4">
              Le contenu éditorial de ce site (textes, images, vidéos, logos de {organizationName}) 
              reste la propriété de {organizationName} ou de ses partenaires. Cependant, ce contenu 
              est hébergé et affiché via une plateforme technique qui est et demeure la propriété exclusive de DevWeb31.
            </p>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">5.4 Utilisation par Phuong Long Vo Dao</h3>
            <p className="mb-4">
              {organizationName} utilise cette plateforme en tant que client/utilisateur licencié. 
              Cette utilisation ne confère à {organizationName} <strong>aucun droit de propriété </strong> 
              sur le code source, la structure, le design ou les fonctionnalités techniques de la plateforme.
            </p>
            <p className="mb-4">
              {organizationName} ne peut pas reproduire, copier, dupliquer ou créer des versions similaires 
              de cette plateforme, ni en céder l'usage à des tiers sans autorisation expresse de DevWeb31.
            </p>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">5.5 Commercialisation Multi-Client</h3>
            <p className="mb-4">
              Cette plateforme est un produit logiciel développé par DevWeb31 qui peut être commercialisé 
              et utilisé par plusieurs clients. Chaque client bénéficie d'une licence d'utilisation pour 
              son propre usage, mais ne peut en aucun cas s'approprier la propriété intellectuelle du code source.
            </p>

            <h3 className="text-xl font-semibold mb-3 dark:text-gray-100">5.6 Sanctions</h3>
            <p className="mb-4">
              Toute violation de ces dispositions engage la responsabilité civile et pénale de son auteur. 
              DevWeb31 se réserve le droit d'intenter toute action en justice, notamment pour contrefaçon, 
              et de réclamer des dommages et intérêts ainsi que la cessation de toute utilisation non autorisée.
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold mb-2">
                ⚠️ Avertissement
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Pour toute demande d'utilisation, de reproduction ou de licence concernant cette plateforme, 
                veuillez contacter DevWeb31 via{' '}
                <a 
                  href="https://www.devweb31.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  www.devweb31.fr
                </a>
                {' '}ou via notre{' '}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  page de contact
                </Link>.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">6. Protection des Données Personnelles</h2>
            <p className="mb-4">
              Conformément à la loi Informatique et Libertés et au Règlement Général sur la Protection des Données (RGPD), 
              vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="mb-4">
              Pour exercer ces droits ou pour toute question sur le traitement de vos données personnelles, 
              consultez notre{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>
              {' '}ou contactez-nous via notre{' '}
              <Link href="/contact" className="text-primary hover:underline">
                page de contact
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">7. Liens Externes</h2>
            <p className="mb-4">
              Le site peut contenir des liens vers d'autres sites web. {organizationName} n'exerce 
              aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu 
              ou à leur accessibilité.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">8. Cookies</h2>
            <p className="mb-4">
              Le site utilise des cookies pour améliorer votre expérience de navigation. 
              Consultez notre{' '}
              <Link href="/legal/cookies" className="text-primary hover:underline">
                politique des cookies
              </Link>
              {' '}pour plus d'informations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">9. Limitation de Responsabilité</h2>
            <p className="mb-4">
              {organizationName} s'efforce d'assurer l'exactitude et la mise à jour des informations 
              diffusées sur ce site, dont elle se réserve le droit de corriger, à tout moment et sans préavis, 
              le contenu.
            </p>
            <p className="mb-4">
              Toutefois, {organizationName} ne peut garantir l'exactitude, la précision ou l'exhaustivité 
              des informations mises à disposition sur ce site. En conséquence, {organizationName} décline 
              toute responsabilité :
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Pour toute imprécision, inexactitude ou omission concernant les informations disponibles sur le site</li>
              <li>Pour tout dommage résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification 
              des informations mises à disposition sur le site</li>
              <li>Et plus généralement pour tous dommages, directs ou indirects, quelles qu'en soient les causes, 
              origines, naturelles ou conséquences, provoqués à raison de l'accès de quiconque au site ou de 
              l'impossibilité d'y accéder</li>
            </ul>
          </section>
        </div>
      </div>
    </Container>
  );
}

