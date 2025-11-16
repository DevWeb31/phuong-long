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
import { Facebook, Instagram, Youtube, Mail } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import type { Club } from '@/lib/types';
import { FooterShopSection } from './FooterShopSection';

const navigation = {
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

export async function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Récupérer les clubs actifs depuis la base de données
  const supabase = await createServerClient();
  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, name, slug, city')
    .eq('active', true)
    .order('city');
  
  const typedClubs = (clubs || []) as unknown as Pick<Club, 'id' | 'name' | 'slug' | 'city'>[];

  // Vérifier si la boutique est masquée
  let isShopHidden = false;
  try {
    const { data: shopSetting } = await supabase
      .from('developer_settings')
      .select('value')
      .eq('key', 'shop.hidden')
      .maybeSingle();
    
    // Vérifier si value est true (booléen) ou "true" (string JSON)
    const shopSettingTyped = shopSetting as { value: unknown } | null | undefined;
    isShopHidden = (shopSettingTyped?.value === true || shopSettingTyped?.value === 'true' || shopSettingTyped?.value === '"true"') ?? false;
  } catch (error) {
    // En cas d'erreur (table n'existe pas encore, etc.), considérer que la boutique n'est pas masquée
    console.error('Error checking shop visibility in footer:', error);
    isShopHidden = false;
  }

  // Vérifier si l'utilisateur est développeur
  let isDeveloper = false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id, roles!inner(name)')
        .eq('user_id', user.id);
      
      const roles = (userRoles as any[])?.map(ur => ur.roles?.name).filter(Boolean) || [];
      isDeveloper = roles.includes('developer');
    }
  } catch (error) {
    // En cas d'erreur, considérer que l'utilisateur n'est pas développeur
    console.error('Error checking developer role in footer:', error);
    isDeveloper = false;
  }

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
      <Container>
        <div className="py-16 lg:py-20">
          <div className={`grid grid-cols-2 gap-8 lg:gap-12 ${isShopHidden && !isDeveloper ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
            {/* Clubs */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1">
                Nos Clubs
              </h3>
              <ul className="mt-4 space-y-3">
                {typedClubs.map((club) => (
                  <li key={club.id}>
                    <Link
                      href={`/clubs/${club.slug}`}
                      className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors text-sm"
                    >
                      {club.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h3 className="text-sm font-semibold dark:text-gray-100 uppercase tracking-wider">
                Ressources
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.ressources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-base dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Boutique - Conditionnel */}
            {(!isShopHidden || isDeveloper) && (
              <FooterShopSection 
                navigation={navigation.boutique}
                isShopHidden={isShopHidden}
                isDeveloper={isDeveloper}
              />
            )}

            {/* Légal */}
            <div>
              <h3 className="text-sm font-semibold dark:text-gray-100 uppercase tracking-wider">
                Légal
              </h3>
              <ul className="mt-4 space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-base dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-16 border-t dark:border-gray-800/60 pt-12">
            <div className="max-w-md">
              <h3 className="text-lg font-bold dark:text-gray-100 mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Newsletter
              </h3>
              <p className="mt-2 text-base dark:text-gray-500 mb-6">
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
                className="w-full min-w-0 px-4 py-2 text-base dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Votre email"
              />
              <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-base font-medium bg-primary border rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary transition-colors"
                >
                  S'inscrire
                </button>
              </div>
            </form>
          </div>

          {/* Bottom */}
          <div className="mt-12 border-t dark:border-gray-800 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-4 md:order-2">
              <span className="text-xs dark:text-gray-500">Suivez-nous</span>
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.name}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
            <p className="mt-8 text-sm dark:text-gray-500 md:mt-0 md:order-1">
              &copy; {currentYear} Phuong Long Vo Dao. Tous droits réservés.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

