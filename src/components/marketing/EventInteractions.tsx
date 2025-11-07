/**
 * EventInteractions Component
 * 
 * Boutons d'interaction pour les événements (Like + Participation)
 * Style Facebook avec compteurs
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';
import { Heart, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface EventInteractionsProps {
  eventId: string;
  initialLikesCount: number;
  initialAttendeesCount: number;
  initialUserLiked: boolean;
  initialUserAttending: boolean;
  isAuthenticated: boolean;
}

export function EventInteractions({
  eventId,
  initialLikesCount,
  initialAttendeesCount,
  initialUserLiked,
  initialUserAttending,
  isAuthenticated,
}: EventInteractionsProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [attendeesCount, setAttendeesCount] = useState(initialAttendeesCount);
  const [userLiked, setUserLiked] = useState(initialUserLiked);
  const [userAttending, setUserAttending] = useState(initialUserAttending);
  const [isLiking, setIsLiking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsLiking(true);
    
    try {
      const method = userLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/events/${eventId}/like`, { method });
      
      if (response.ok) {
        setUserLiked(!userLiked);
        setLikesCount(prev => userLiked ? prev - 1 : prev + 1);
      } else if (response.status === 401) {
        router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname));
      }
    } catch (error) {
      console.error('Error liking event:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAttend = async () => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsRegistering(true);
    
    try {
      const method = userAttending ? 'DELETE' : 'POST';
      const response = await fetch(`/api/events/${eventId}/attend`, { method });
      
      if (response.ok) {
        setUserAttending(!userAttending);
        setAttendeesCount(prev => userAttending ? prev - 1 : prev + 1);
      } else if (response.status === 401) {
        router.push('/signin?redirect=' + encodeURIComponent(window.location.pathname));
      } else if (response.status === 400) {
        alert('Désolé, cet événement est complet.');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Compteurs style Facebook */}
      <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
        {likesCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-medium">
              {likesCount} {likesCount === 1 ? 'personne aime' : 'personnes aiment'}
            </span>
          </div>
        )}
        
        {attendeesCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-r from-primary to-primary-dark rounded-full">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium">
              {attendeesCount} {attendeesCount === 1 ? 'personne intéressée' : 'personnes intéressées'}
            </span>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        {/* Bouton J'aime */}
        <Button
          onClick={handleLike}
          variant="ghost"
          disabled={isLiking}
          className={cn(
            'flex items-center justify-center gap-2 transition-all',
            userLiked
              ? 'text-pink-600 hover:text-pink-700 bg-pink-50 dark:bg-pink-950/30'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          {isLiking ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Heart
              className={cn(
                'w-5 h-5 transition-transform',
                userLiked && 'fill-pink-600 scale-110'
              )}
            />
          )}
          <span className="font-semibold">
            {userLiked ? 'J\'aime' : 'J\'aime'}
          </span>
        </Button>

        {/* Bouton Je serai là ! */}
        <Button
          onClick={handleAttend}
          variant="ghost"
          disabled={isRegistering}
          className={cn(
            'flex items-center justify-center gap-2 transition-all',
            userAttending
              ? 'text-primary hover:text-primary-dark bg-primary/10 dark:bg-primary/20'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          {isRegistering ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Check
              className={cn(
                'w-5 h-5 transition-transform',
                userAttending && 'scale-110'
              )}
            />
          )}
          <span className="font-semibold">
            {userAttending ? 'Je serai là !' : 'Je serai là !'}
          </span>
        </Button>
      </div>

      {/* Message pour utilisateurs non connectés */}
      {!isAuthenticated && (
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
          💡 Connectez-vous pour interagir avec cet événement
        </p>
      )}
    </div>
  );
}

