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

// Singleton pour le client Supabase côté client
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Créer ou récupérer le client Supabase pour le navigateur
 * Utilise un singleton pour éviter de créer plusieurs instances
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
  // Créer le client une seule fois (singleton)
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}

