/**
 * Contact API Route
 * 
 * Endpoint pour traiter les soumissions du formulaire de contact
 * Envoie un email au club sélectionné via Resend
 * 
 * @version 2.0
 * @date 2025-01-XX
 * @updated Intégration Resend avec template
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAPIClient } from '@/lib/supabase/server';
import { sendContactEmail } from '@/lib/services/email';

// Schema de validation Zod
const phoneRegex = /^0[1-9](?: [0-9]{2}){4}$/;

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Le téléphone doit être au format 01 02 03 04 05',
    }),
  club: z.string().optional(),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validation des données (déclenche une erreur Zod si invalide)
    const validatedData = contactSchema.parse(body);

    // Récupérer l'email du club sélectionné
    let clubEmail: string | null = null;
    let clubName: string | null = null;
    
    if (validatedData.club && validatedData.club !== 'autre') {
      const supabase = await createAPIClient();
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('email, name')
        .eq('id', validatedData.club)
        .eq('active', true)
        .single<{ email: string | null; name: string }>();

      if (!clubError && clubData) {
        clubEmail = clubData.email;
        clubName = clubData.name;
      }
    }

    // Email de destination : club sélectionné ou email par défaut
    const recipientEmail = clubEmail || process.env.RESEND_CONTACT_DEFAULT_EMAIL || process.env.RESEND_FROM_EMAIL;
    
    if (!recipientEmail) {
      console.error('[CONTACT] Aucune adresse email de destination configurée');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Configuration email manquante' 
        },
        { status: 500 }
      );
    }

    // Envoyer l'email via Resend
    const templateId = process.env.RESEND_CONTACT_TEMPLATE_ID;
    
    await sendContactEmail({
      to: recipientEmail,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      clubName: clubName || undefined,
      subject: validatedData.subject,
      message: validatedData.message,
      templateId: templateId || undefined,
    });

    // TODO: Enregistrer le message dans Supabase (table contact_messages si elle existe)
    // const supabase = await createAPIClient();
    // await supabase.from('contact_messages').insert({
    //   name: validatedData.name,
    //   email: validatedData.email,
    //   phone: validatedData.phone || null,
    //   club_id: validatedData.club && validatedData.club !== 'autre' ? validatedData.club : null,
    //   subject: validatedData.subject,
    //   message: validatedData.message,
    //   status: 'new',
    // });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message envoyé avec succès' 
      },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('[ERROR] Erreur API contact:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur' 
      },
      { status: 500 }
    );
  }
}

