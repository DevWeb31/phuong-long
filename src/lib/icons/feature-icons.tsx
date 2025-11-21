/**
 * Feature Icons Mapping
 * 
 * Mapping des icônes pour les cartes de valeurs (utilisable côté serveur)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { 
  Bolt, Trophy, Users, Shield, Target, Zap, Flame, Star,
  Award, Medal, Crown, Gem, Sword, ShieldCheck, Crosshair,
  Heart, Sparkles, Activity, TrendingUp, Brain, Dumbbell,
  BookOpen, GraduationCap, UserCheck, Handshake, ThumbsUp,
  History,
  type LucideIcon
} from 'lucide-react';

// Mapping des icônes disponibles
export const FEATURE_ICONS: Record<string, LucideIcon> = {
  'Bolt': Bolt,
  'Trophy': Trophy,
  'Users': Users,
  'Shield': Shield,
  'Target': Target,
  'Zap': Zap,
  'Flame': Flame,
  'Star': Star,
  'Award': Award,
  'Medal': Medal,
  'Crown': Crown,
  'Gem': Gem,
  'Sword': Sword,
  'ShieldCheck': ShieldCheck,
  'Crosshair': Crosshair,
  'Heart': Heart,
  'Sparkles': Sparkles,
  'Activity': Activity,
  'TrendingUp': TrendingUp,
  'Brain': Brain,
  'Dumbbell': Dumbbell,
  'BookOpen': BookOpen,
  'GraduationCap': GraduationCap,
  'UserCheck': UserCheck,
  'Handshake': Handshake,
  'ThumbsUp': ThumbsUp,
  'History': History,
};

// Fonction pour obtenir l'icône par son nom (utilisable côté serveur)
export function getFeatureIcon(name: string): LucideIcon {
  return FEATURE_ICONS[name] ?? FEATURE_ICONS['Bolt']!;
}

