/**
 * Email Service
 * 
 * Service pour envoyer des emails via Resend
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import { Resend } from 'resend';

// Initialiser Resend avec la clé API
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@phuong-long-vo-dao.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'Phuong Long Vo Dao';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoyer un email via Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  if (!resend) {
    throw new Error('RESEND_API_KEY n\'est pas configurée');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Extraire le texte du HTML
    });

    if (error) {
      console.error('[EMAIL] Erreur Resend:', error);
      throw new Error(`Erreur d'envoi d'email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi:', error);
    throw error;
  }
}

/**
 * Envoyer un email de confirmation de changement d'email
 */
export async function sendEmailChangeConfirmation(
  to: string,
  oldEmail: string,
  newEmail: string,
  confirmationUrl: string
) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmez votre changement d'adresse email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; line-height: 1.6;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
<tr>
<td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

<tr>
<td style="background-color: #dc2626; padding: 40px 30px; text-align: center;">
<h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">Phuong Long Vo Dao</h1>
<p style="color: #fee2e2; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">Arts martiaux traditionnels vietnamiens</p>
</td>
</tr>

<tr>
<td style="padding: 40px 30px; background-color: #ffffff;">
<h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px; font-weight: 600; line-height: 1.3;">Confirmez votre changement d'adresse email</h2>
<p style="color: #1f2937; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Bonjour,</p>
<p style="color: #1f2937; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">Une demande de changement d'adresse email a été effectuée pour votre compte <strong style="color: #dc2626; font-weight: 600;">Phuong Long Vo Dao</strong>.</p>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
<tr>
<td>
<p style="color: #374151; margin: 0 0 8px 0; font-size: 14px; font-weight: 500; line-height: 1.5;">Ancienne adresse email :</p>
<p style="color: #6b7280; margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; font-family: 'Courier New', monospace;">${oldEmail}</p>
<p style="color: #374151; margin: 0 0 8px 0; font-size: 14px; font-weight: 500; line-height: 1.5;">Nouvelle adresse email :</p>
<p style="color: #dc2626; margin: 0; font-size: 14px; line-height: 1.5; font-family: 'Courier New', monospace; font-weight: 600;">${newEmail}</p>
</td>
</tr>
</table>

<p style="color: #1f2937; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">Pour confirmer ce changement et activer votre nouvelle adresse email, veuillez cliquer sur le bouton ci-dessous :</p>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td align="center" style="padding: 0 0 24px 0;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
<tr>
<td align="center" style="background-color: #dc2626; border-radius: 8px; padding: 0;">
<a href="${confirmationUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; border: none; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);">Confirmer le changement</a>
</td>
</tr>
</table>
</td>
</tr>
</table>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
<tr>
<td>
<p style="color: #374151; margin: 0 0 12px 0; font-size: 14px; font-weight: 500; line-height: 1.5;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
<p style="color: #6b7280; margin: 0; font-size: 12px; word-break: break-all; line-height: 1.5; font-family: 'Courier New', monospace;">${confirmationUrl}</p>
</td>
</tr>
</table>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 2px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
<tr>
<td>
<p style="color: #1f2937; margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;"><strong style="color: #dc2626; font-weight: 600;">⏰ Important :</strong> Ce lien expirera dans 24 heures pour des raisons de sécurité.</p>
<p style="color: #374151; margin: 0 0 8px 0; font-size: 14px; line-height: 1.6;">Après confirmation, votre ancienne adresse email ne pourra plus être utilisée pour vous connecter à votre compte.</p>
<p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.6;">Si vous n'avez pas demandé ce changement, veuillez immédiatement ignorer cet email et contacter notre support.</p>
</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 2px solid #e5e7eb;">
<p style="color: #6b7280; margin: 0 0 8px 0; font-size: 12px; line-height: 1.5;">© Phuong Long Vo Dao. Tous droits réservés.</p>
<p style="color: #9ca3af; margin: 0; font-size: 12px; line-height: 1.5;">Vous recevez cet email car une demande de changement d'adresse email a été effectuée sur votre compte.</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: 'Confirmation de changement d\'adresse email - Phuong Long Vo Dao',
    html,
  });
}


