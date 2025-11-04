/**
 * Dashboard Page - Tableau de bord
 * 
 * Page principale du dashboard utilisateur
 * 
 * @version 1.0
 * @date 2025-11-05 00:10
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/common';
import Link from 'next/link';
import { 
  UserIcon, 
  CalendarIcon, 
  ShoppingBagIcon, 
  BookOpenIcon 
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue, {user.user_metadata?.full_name || user.email?.split('@')[0]} ! 👋
        </h1>
        <p className="text-gray-600">
          Gérez votre compte, vos inscriptions et votre progression.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profil */}
        <Card variant="bordered" hoverable>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <UserIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Mon Profil</CardTitle>
            <CardDescription>
              Complétez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/profile" className="text-sm text-primary hover:underline font-medium">
              Voir le profil →
            </Link>
          </CardContent>
        </Card>

        {/* Événements */}
        <Card variant="bordered" hoverable>
          <CardHeader>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6 text-secondary" />
            </div>
            <CardTitle className="text-lg">Mes Événements</CardTitle>
            <CardDescription>
              <Badge variant="default" size="sm">0 inscription</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/events" className="text-sm text-primary hover:underline font-medium">
              Voir les événements →
            </Link>
          </CardContent>
        </Card>

        {/* Commandes */}
        <Card variant="bordered" hoverable>
          <CardHeader>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBagIcon className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-lg">Mes Commandes</CardTitle>
            <CardDescription>
              <Badge variant="default" size="sm">Aucune commande</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/shop" className="text-sm text-primary hover:underline font-medium">
              Voir la boutique →
            </Link>
          </CardContent>
        </Card>

        {/* Blog */}
        <Card variant="bordered" hoverable>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpenIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Blog</CardTitle>
            <CardDescription>
              Découvrez nos derniers articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blog" className="text-sm text-primary hover:underline font-medium">
              Lire les articles →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>
            Vos dernières actions sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p>Aucune activité pour le moment</p>
            <p className="text-sm mt-2">Inscrivez-vous à un événement ou passez une commande pour commencer !</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

