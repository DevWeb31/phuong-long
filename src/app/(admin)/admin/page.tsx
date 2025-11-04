/**
 * Admin Dashboard - Tableau de bord administrateur
 * 
 * Dashboard principal avec analytics et statistiques
 * 
 * @version 1.0
 * @date 2025-11-05 00:50
 */

'use client';

import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import Link from 'next/link';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  NewspaperIcon,
  ShoppingBagIcon,
  EyeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">
          Vue d'ensemble de votre plateforme Phuong Long Vo Dao
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Utilisateurs"
          value="248"
          description="Inscrits sur la plateforme"
          icon={<UsersIcon className="w-6 h-6" />}
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />

        <StatsCard
          title="Clubs Actifs"
          value="5"
          description="Clubs opérationnels"
          icon={<BuildingOfficeIcon className="w-6 h-6" />}
          color="secondary"
        />

        <StatsCard
          title="Événements"
          value="12"
          description="À venir ce mois"
          icon={<CalendarIcon className="w-6 h-6" />}
          color="accent"
          trend={{ value: 8, isPositive: true }}
        />

        <StatsCard
          title="Articles Blog"
          value="34"
          description="Publiés au total"
          icon={<NewspaperIcon className="w-6 h-6" />}
          color="success"
        />

        <StatsCard
          title="Commandes"
          value="89"
          description="Ce mois-ci"
          icon={<ShoppingBagIcon className="w-6 h-6" />}
          color="warning"
          trend={{ value: 23, isPositive: true }}
        />

        <StatsCard
          title="Vues Totales"
          value="12.5k"
          description="Ce mois-ci"
          icon={<EyeIcon className="w-6 h-6" />}
          color="primary"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>Accédez rapidement aux fonctions principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/clubs/new"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
              >
                <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">Nouveau Club</div>
              </Link>

              <Link
                href="/admin/events/new"
                className="p-4 border border-gray-200 rounded-lg hover:border-secondary hover:bg-secondary/5 transition-colors text-center"
              >
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <div className="text-sm font-medium">Nouvel Événement</div>
              </Link>

              <Link
                href="/admin/blog/new"
                className="p-4 border border-gray-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-center"
              >
                <NewspaperIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-sm font-medium">Nouvel Article</div>
              </Link>

              <Link
                href="/admin/users"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
              >
                <UsersIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">Gérer Utilisateurs</div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Nouvel utilisateur inscrit</p>
                  <p className="text-xs text-gray-500">Il y a 5 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm">📝</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Article publié</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 text-sm">📅</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Événement créé</p>
                  <p className="text-xs text-gray-500">Il y a 5 heures</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-sm">🛒</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Nouvelle commande</p>
                  <p className="text-xs text-gray-500">Hier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Vue d'ensemble des performances</CardTitle>
          <CardDescription>Statistiques des 30 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-sm">Graphiques à venir</p>
              <p className="text-xs mt-1">(Recharts ou Chart.js)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

