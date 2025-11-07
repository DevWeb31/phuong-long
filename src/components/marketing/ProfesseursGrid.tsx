/**
 * ProfesseursGrid Component
 * 
 * Grille de fiches des professeurs/coaches
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, Badge } from '@/components/common';
import type { Coach, Club } from '@/lib/types';
import { Award, MapPin, Calendar } from 'lucide-react';

interface ProfesseursGridProps {
  coaches: Array<Coach & { club: Pick<Club, 'id' | 'name' | 'city' | 'slug'> | null }>;
}

export function ProfesseursGrid({ coaches }: ProfesseursGridProps) {
  if (coaches.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">👨‍🏫</div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Aucun professeur pour le moment
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Les fiches des instructeurs seront bientôt disponibles.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Notre Équipe Pédagogique
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Des instructeurs diplômés et passionnés, dévoués à votre progression
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coaches.map((coach) => (
          <Card
            key={coach.id}
            hoverable
            className="overflow-hidden group"
          >
            <CardContent padding="none">
              {/* Photo du coach */}
              <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                {coach.photo_url ? (
                  <img
                    src={coach.photo_url}
                    alt={coach.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-8xl">👨‍🏫</div>
                  </div>
                )}
                
                {/* Overlay gradient au hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Informations */}
              <div className="p-6 space-y-4">
                {/* Nom */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {coach.name}
                  </h3>
                  
                  {/* Club */}
                  {coach.club && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-primary" />
                      <Link
                        href={`/clubs/${coach.club.slug}`}
                        className="hover:text-primary hover:underline transition-colors"
                      >
                        {coach.club.name}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Expérience */}
                {coach.years_experience && (
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Calendar className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {coach.years_experience} ans d'expérience
                      </p>
                    </div>
                  </div>
                )}

                {/* Spécialités */}
                {coach.specialties && coach.specialties.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-secondary" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Spécialités
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(coach.specialties as string[]).map((specialty, index) => (
                        <Badge
                          key={index}
                          className="bg-secondary/10 text-secondary-dark border-secondary/30 text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {coach.bio && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
                      {coach.bio}
                    </p>
                  </div>
                )}

                {/* Badge club en bas */}
                {coach.club && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Link
                      href={`/clubs/${coach.club.slug}`}
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Voir le club de {coach.club.city}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      {coaches.length > 0 && (
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Envie de rejoindre notre équipe ?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Nos clubs recherchent régulièrement de nouveaux instructeurs passionnés
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              ✉️ Nous contacter
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

