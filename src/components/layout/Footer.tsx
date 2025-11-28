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

// Configuration des réseaux sociaux
const socialMediaConfig = [
  { name: 'Facebook', icon: Facebook, key: 'social.facebook' },
  { name: 'Instagram', icon: Instagram, key: 'social.instagram' },
  { name: 'YouTube', icon: Youtube, key: 'social.youtube' },
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

  // Récupérer les réseaux sociaux depuis la base de données
  let socialLinks: Array<{ name: string; icon: typeof Facebook; href: string }> = [];
  try {
    const { data: socialSettings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', socialMediaConfig.map((c) => c.key))
      .returns<Array<{ key: string; value: unknown }>>();

    if (socialSettings) {
      socialLinks = socialMediaConfig
        .map((config) => {
          const setting = socialSettings.find((s) => s.key === config.key);
          const href = setting?.value ? String(setting.value) : null;
          return href ? { name: config.name, icon: config.icon, href } : null;
        })
        .filter((link): link is { name: string; icon: typeof Facebook; href: string } => link !== null);
    }
  } catch (error) {
    console.error('Error loading social media in footer:', error);
    // En cas d'erreur, utiliser un tableau vide (pas de liens sociaux affichés)
    socialLinks = [];
  }

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
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-sm dark:text-gray-500">
                &copy; {currentYear} Phuong Long Vo Dao. Tous droits réservés.
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-600 opacity-60">
                Conçu par{' '}
                <a
                  href="https://www.devweb31.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary dark:hover:text-primary-light transition-colors"
                  title="DevWeb31 - Concepteur Développeur d'Applications"
                >
                  DevWeb31
                </a>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

