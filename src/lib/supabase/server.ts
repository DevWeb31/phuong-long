/**
 * Supabase Server - Server Side
 * 
 * Clients Supabase pour utilisation côté serveur
 * - Server Components (Next.js 15 App Router)
 * - API Routes
 * - Server Actions
 * 
 * @version 1.1
 * @date 2025-11-04 22:05
 * @updated Next.js 15 compatibility - cookies() must be awaited
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

/**
 * Client pour Server Components (Next.js 15 compatible)
 * IMPORTANT: cookies() doit être awaité dans Next.js 15
 * 
 * @example
 * ```tsx
 * import { createServerClient } from '@/lib/supabase/server';
 * 
 * export default async function Page() {
 *   const supabase = await createServerClient();
 *   const { data } = await supabase.from('clubs').select('*');
 *   
 *   return <div>{data.map(...)}</div>;
 * }
 * ```
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }
  
  return createSupabaseServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - setAll ignoré (lecture seule)
          }
        },
      },
    }
  );
}

/**
 * Client pour API Routes (Next.js 15 compatible)
 * 
 * @example
 * ```tsx
 * import { createAPIClient } from '@/lib/supabase/server';
 * 
 * export async function GET(request: Request) {
 *   const supabase = await createAPIClient();
 *   const { data } = await supabase.from('clubs').select('*');
 *   
 *   return Response.json(data);
 * }
 * ```
 */
export async function createAPIClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }
  
  return createSupabaseServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Les erreurs setAll sont ignorées
          }
        },
      },
    }
  );
}

/**
 * Client Admin avec Service Role Key
 * [WARNING] À UTILISER AVEC PRÉCAUTION - Bypass RLS
 * Uniquement pour opérations admin côté serveur
 * 
 * @example
 * ```tsx
 * import { createAdminClient } from '@/lib/supabase/server';
 * 
 * export async function POST(request: Request) {
 *   const supabase = createAdminClient();
 *   // Opérations admin qui bypass RLS
 *   const { data } = await supabase.from('users').select('*');
 * }
 * ```
 */
export function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

