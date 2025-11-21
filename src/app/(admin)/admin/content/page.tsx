/**
 * Admin Content Page - Gestion du contenu des pages statiques
 * 
 * Page principale pour accéder à l'édition des pages statiques
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common';
import { Home, Mail, History } from 'lucide-react';

const pages = [
  {
    slug: 'home',
    name: 'Accueil',
    description: 'Gérer le contenu de la page d\'accueil (titres, valeurs, descriptions)',
    icon: Home,
    href: '/admin/content/home',
    color: 'primary',
  },
  {
    slug: 'contact',
    name: 'Contact',
    description: 'Modifier les informations de contact (email, téléphone, adresse, horaires)',
    icon: Mail,
    href: '/admin/content/contact',
    color: 'secondary',
  },
  {
    slug: 'notre-histoire',
    name: 'Notre Histoire',
    description: 'Éditer le contenu de la page Notre Histoire (timeline, valeurs, textes)',
    icon: History,
    href: '/admin/content/notre-histoire',
    color: 'accent',
  },
];

export default function AdminContentPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Gestion du Contenu
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Modifiez le contenu des pages statiques de votre site
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Link key={page.slug} href={page.href}>
              <Card hoverable className="h-full transition-all duration-300 hover:shadow-xl border dark:border-gray-800">
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-2 border-primary/30 dark:border-primary/20 shadow-sm shadow-primary/10">
                    <Icon className="w-8 h-8 text-primary dark:text-primary-light" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {page.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    {page.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

