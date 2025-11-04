/**
 * Supabase Client - Client Side
 * 
 * Client Supabase pour utilisation côté client (browser)
 * Utiliser dans les Client Components avec "use client"
 * 
 * @version 1.0
 * @date 2025-11-04 20:35
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

/**
 * Crée une instance du client Supabase pour le navigateur
 * À utiliser dans les Client Components
 * 
 * @example
 * ```tsx
 * 'use client';
 * 
 * import { supabase } from '@/lib/supabase/client';
 * 
 * export function MyComponent() {
 *   const handleClick = async () => {
 *     const { data } = await supabase.from('clubs').select('*');
 *   };
 * }
 * ```
 */
export const supabase = createClientComponentClient<Database>();

/**
 * Créer un nouveau client (utile pour tests ou contexts isolés)
 */
export function createClient() {
  return createClientComponentClient<Database>();
}

