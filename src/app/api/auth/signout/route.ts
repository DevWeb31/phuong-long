/**
 * API Route - Sign Out
 *
 * Invalide la session Supabase côté serveur afin de supprimer les cookies httpOnly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const signOutSchema = z.object({}).strict();

export async function POST(request: NextRequest) {
  try {
    // Même si nous n'attendons aucun payload, on valide pour respecter les règles du projet
    if (request.headers.get('content-type')?.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      signOutSchema.parse(body);
    } else {
      signOutSchema.parse({});
    }

    const cookieStore = await cookies();
    const response = NextResponse.json({ success: true });

    const supabaseCookieNames = cookieStore
      .getAll()
      .map((cookie) => cookie.name)
      .filter((name) => name.startsWith('sb-') || name.includes('supabase'));

    supabaseCookieNames.forEach((name) => {
      response.cookies.set({
        name,
        value: '',
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 0,
      });
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload invalide',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de la déconnexion',
      },
      { status: 500 }
    );
  }
}

