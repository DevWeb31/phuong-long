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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestion du Contenu
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifiez le contenu des pages statiques de votre site
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <Link key={page.slug} href={page.href}>
              <Card hoverable className="h-full transition-all duration-300 hover:shadow-xl">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                    page.color === 'primary' ? 'bg-primary/10 text-primary' :
                    page.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                    'bg-accent/10 text-accent'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{page.name}</CardTitle>
                  <CardDescription className="text-sm">
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

