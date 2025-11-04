/**
 * Supabase Client - Client Side
 * 
 * Client Supabase pour utilisation côté client (browser)
 * Utiliser dans les Client Components avec "use client"
 * 
 * @version 1.1
 * @date 2025-11-05 02:50
 * @updated Fixed to use @supabase/ssr instead of deprecated auth-helpers
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * Créer un nouveau client Supabase pour le navigateur
 * 
 * @example
 * ```tsx
 * 'use client';
 * 
 * import { createClient } from '@/lib/supabase/client';
 * 
 * export function MyComponent() {
 *   const supabase = createClient();
 *   const handleClick = async () => {
 *     const { data } = await supabase.from('clubs').select('*');
 *   };
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

