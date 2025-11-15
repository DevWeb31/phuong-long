/**
 * SessionsList Component
 * 
 * Affichage des sessions d'un événement (dates/horaires multiples)
 * 
 * @version 1.0
 * @date 2025-11-08
 */

'use client';

import { Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/common';
import type { EventSession } from '@/lib/types';

interface SessionsListProps {
  sessions: EventSession[];
  className?: string;
}

export function SessionsList({ sessions, className = '' }: SessionsListProps) {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  // Grouper par date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.session_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, EventSession[]>);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        Dates et horaires
      </h3>

      <div className="space-y-4">
        {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
          <Card key={date} variant="bordered" className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 capitalize flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(date)}
                </h4>
                <Badge variant="primary" size="sm">
                  {dateSessions.length} session{dateSessions.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {dateSessions.map((session, idx) => (
                  <div
                    key={session.id}
                    className={`pb-3 ${idx < dateSessions.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {/* Horaires */}
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{formatTime(session.start_time)}</span>
                        {session.end_time && (
                          <>
                            <span className="text-gray-400">→</span>
                            <span>{formatTime(session.end_time)}</span>
                          </>
                        )}
                      </div>

                      {/* Lieu spécifique */}
                      {session.location && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{session.location}</span>
                        </div>
                      )}

                      {/* Capacité */}
                      {session.max_attendees && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{session.max_attendees} places max</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {session.notes && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{session.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

