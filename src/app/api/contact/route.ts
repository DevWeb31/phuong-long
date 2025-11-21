/**
 * Contact API Route
 * 
 * Endpoint pour traiter les soumissions du formulaire de contact
 * 
 * @version 1.0
 * @date 2025-11-04 23:15
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
    
    // Validation des données
    const validatedData = contactSchema.parse(body);

    // TODO: Implémenter l'envoi d'email
    // Options possibles :
    // - Resend (https://resend.com)
    // - SendGrid
    // - AWS SES
    // - Nodemailer avec SMTP
    
    // Pour l'instant, on simule un succès et on log les données
    console.log('[EMAIL] Nouveau message de contact:', {
      from: validatedData.email,
      name: validatedData.name,
      subject: validatedData.subject,
      timestamp: new Date().toISOString(),
    });

    // TODO: Enregistrer le message dans Supabase (table contact_messages)
    // const supabase = await createServerClient();
    // await supabase.from('contact_messages').insert({
    //   name: validatedData.name,
    //   email: validatedData.email,
    //   phone: validatedData.phone || null,
    //   club: validatedData.club || null,
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

