/**
 * Footer Component
 * 
 * Footer du site avec liens et informations
 * 
 * @version 1.0
 * @date 2025-11-04 20:45
 */

import Link from 'next/link';
import { Container } from '@/components/common';
import { Facebook, Instagram, Youtube } from 'lucide-react';

const navigation = {
  clubs: [
    { name: 'Club Marseille', href: '/clubs/marseille-centre' },
    { name: 'Club Paris', href: '/clubs/paris-bastille' },
    { name: 'Club Nice', href: '/clubs/nice-promenade' },
    { name: 'Club Créteil', href: '/clubs/creteil-universite' },
    { name: 'Club Strasbourg', href: '/clubs/strasbourg-centre' },
  ],
  ressources: [
    { name: 'Blog', href: '/blog' },
    { name: 'Événements', href: '/events' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ],
  boutique: [
    { name: 'Équipements', href: '/shop?category=equipement' },
    { name: 'Vêtements', href: '/shop?category=vetements' },
    { name: 'Accessoires', href: '/shop?category=accessoires' },
    { name: 'Protection', href: '/shop?category=protection' },
  ],
  legal: [
    { name: 'Mentions Légales', href: '/legal/mentions' },
    { name: 'Politique de Confidentialité', href: '/legal/privacy' },
    { name: 'CGU', href: '/legal/terms' },
    { name: 'Cookies', href: '/legal/cookies' },
  ],
};

// Liens réseaux sociaux - À mettre à jour avec vraies URLs
const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200/60">
      <Container>
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Clubs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Nos Clubs
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.clubs.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-base text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Ressources
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.ressources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-base text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Boutique */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Boutique
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.boutique.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-base text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Légal
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-base text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-16 border-t border-gray-200/60 pt-12">
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                📧 Newsletter
              </h3>
              <p className="mt-2 text-base text-gray-600 mb-6">
                Recevez nos actualités, événements et promotions.
              </p>
            </div>
            <form className="mt-4 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="w-full min-w-0 px-4 py-2 text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Votre email"
              />
              <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-base font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  S'inscrire
                </button>
              </div>
            </form>
          </div>

          {/* Bottom */}
          <div className="mt-12 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-4 md:order-2">
              <span className="text-xs text-gray-500">Suivez-nous</span>
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.name}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
            <p className="mt-8 text-sm text-gray-500 md:mt-0 md:order-1">
              &copy; {currentYear} Phuong Long Vo Dao. Tous droits réservés.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

