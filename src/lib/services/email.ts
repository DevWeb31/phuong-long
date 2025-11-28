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
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
}

function renderEmailLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Phuong Long Vo Dao</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f3f4f6;line-height:1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f3f4f6;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color:#dc2626;padding:40px 30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:32px;font-weight:700;letter-spacing:-0.5px;text-shadow:0 2px 4px rgba(0,0,0,0.2);">Phuong Long Vo Dao</h1>
              <p style="color:#fee2e2;margin:8px 0 0 0;font-size:14px;font-weight:400;">Arts martiaux traditionnels vietnamiens</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;background-color:#ffffff;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:24px 30px;text-align:center;border-top:2px solid #e5e7eb;">
              <p style="color:#6b7280;margin:0 0 8px 0;font-size:12px;line-height:1.5;">© Phuong Long Vo Dao. Tous droits réservés.</p>
              <p style="color:#9ca3af;margin:0;font-size:12px;line-height:1.5;">Vous recevez cet email car une action a été effectuée sur votre compte.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function renderActionButton(label: string, url: string) {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr>
    <td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center" style="background-color:#dc2626;border-radius:8px;padding:0;">
            <a href="${url}" style="display:inline-block;background-color:#dc2626;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;text-align:center;border:none;box-shadow:0 4px 12px rgba(220,38,38,0.4);">
              ${label}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}

function renderLinkFallback(url: string, message = 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :') {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
  <tr>
    <td>
      <p style="color:#374151;margin:0 0 12px 0;font-size:14px;font-weight:500;line-height:1.5;">${message}</p>
      <p style="color:#6b7280;margin:0;font-size:12px;word-break:break-all;line-height:1.5;font-family:'Courier New',monospace;">${url}</p>
    </td>
  </tr>
</table>
`;
}

/**
 * Envoyer un email via Resend
 * Supporte deux modes :
 * - HTML inline (options.html)
 * - Template Resend (options.templateId + options.templateData)
 */
export async function sendEmail(options: SendEmailOptions) {
  if (!resend) {
    throw new Error('RESEND_API_KEY n\'est pas configurée');
  }

  try {
    // Mode template Resend
    if (options.templateId) {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        template: {
          id: options.templateId,
          variables: (options.templateData || {}) as Record<string, string | number>,
        },
      });

      if (error) {
        console.error('[EMAIL] Erreur Resend:', error);
        throw new Error(`Erreur d'envoi d'email: ${error.message}`);
      }

      return data;
    }

    // Mode HTML inline (fallback)
    if (!options.html) {
      throw new Error('Either html or templateId must be provided');
    }

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
export async function sendEmailChangeConfirmation(options: {
  to: string;
  oldEmail: string;
  newEmail: string;
  confirmationUrl: string;
  templateId?: string;
  templateData?: Record<string, string | number>;
}) {
  const { to, oldEmail, newEmail, confirmationUrl, templateId, templateData } = options;
  const content = `
<h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;line-height:1.3;">Confirmez votre changement d'adresse email</h2>
<p style="color:#1f2937;margin:0 0 16px 0;font-size:16px;line-height:1.6;">Bonjour,</p>
<p style="color:#1f2937;margin:0 0 24px 0;font-size:16px;line-height:1.6;">Une demande de modification a été effectuée pour votre compte <strong style="color:#dc2626;font-weight:600;">Phuong Long Vo Dao</strong>.</p>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
  <tr>
    <td>
      <p style="color:#374151;margin:0 0 8px 0;font-size:14px;font-weight:500;line-height:1.5;">Ancienne adresse :</p>
      <p style="color:#6b7280;margin:0 0 16px 0;font-size:14px;line-height:1.5;font-family:'Courier New',monospace;">${oldEmail}</p>
      <p style="color:#374151;margin:0 0 8px 0;font-size:14px;font-weight:500;line-height:1.5;">Nouvelle adresse :</p>
      <p style="color:#dc2626;margin:0;font-size:14px;line-height:1.5;font-family:'Courier New',monospace;font-weight:600;">${newEmail}</p>
    </td>
  </tr>
</table>

<p style="color:#1f2937;margin:0 0 24px 0;font-size:16px;line-height:1.6;">Cliquez sur le bouton ci-dessous pour confirmer cette modification.</p>
${renderActionButton('Confirmer le changement', confirmationUrl)}
${renderLinkFallback(confirmationUrl)}

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:2px solid #e5e7eb;padding-top:24px;margin-top:24px;">
  <tr>
    <td>
      <p style="color:#1f2937;margin:0 0 12px 0;font-size:14px;line-height:1.6;"><strong style="color:#dc2626;font-weight:600;">⏰ Important :</strong> Ce lien expirera dans 24&nbsp;heures.</p>
      <p style="color:#374151;margin:0 0 8px 0;font-size:14px;line-height:1.6;">Après confirmation, l'ancienne adresse ne permettra plus d'accéder à votre compte.</p>
      <p style="color:#374151;margin:0;font-size:14px;line-height:1.6;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et contactez le support.</p>
    </td>
  </tr>
</table>
`;

  // Mode template Resend
  if (templateId) {
    return sendEmail({
      to,
      subject: 'Confirmation de changement d\'adresse email - Phuong Long Vo Dao',
      templateId,
      templateData: {
        oldEmail,
        newEmail,
        confirmationUrl,
        expiryHours: 24,
        ...templateData, // Allow overriding or adding more data
      },
    });
  }

  // Mode HTML inline (fallback)
  const html = renderEmailLayout(content);

  return sendEmail({
    to,
    subject: 'Confirmation de changement d\'adresse email - Phuong Long Vo Dao',
    html,
  });
}

export async function sendSignupVerificationEmail(options: {
  to: string;
  fullName?: string;
  confirmationUrl: string;
  useTemplate?: boolean;
  templateId?: string;
}) {
  const { to, fullName, confirmationUrl, useTemplate, templateId } = options;

  // Mode template Resend
  if (useTemplate && templateId) {
    return sendEmail({
      to,
      subject: 'Activez votre compte Phuong Long Vo Dao',
      templateId,
      templateData: {
        fullName: fullName || 'Utilisateur',
        confirmationUrl,
        expiryHours: 24,
      },
    });
  }

  // Mode HTML inline (fallback)
  const content = `
<h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;line-height:1.3;">Activez votre compte</h2>
<p style="color:#1f2937;margin:0 0 16px 0;font-size:16px;line-height:1.6;">Bonjour${fullName ? ` ${fullName}` : ''},</p>
<p style="color:#1f2937;margin:0 0 24px 0;font-size:16px;line-height:1.6;">Bienvenue dans la communauté Phuong Long Vo Dao&nbsp;! Pour finaliser votre inscription et accéder à votre espace membre, confirmez votre adresse email&nbsp;:</p>
${renderActionButton('Activer mon compte', confirmationUrl)}
${renderLinkFallback(confirmationUrl)}
<p style="color:#374151;margin:24px 0 0 0;font-size:14px;line-height:1.6;">Ce lien expirera dans 24&nbsp;heures pour des raisons de sécurité.</p>
`;

  return sendEmail({
    to,
    subject: 'Activez votre compte Phuong Long Vo Dao',
    html: renderEmailLayout(content),
  });
}

export async function sendPasswordResetEmail(options: {
  to: string;
  resetUrl: string;
}) {
  const { to, resetUrl } = options;

  const content = `
<h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;line-height:1.3;">Réinitialisez votre mot de passe</h2>
<p style="color:#1f2937;margin:0 0 24px 0;font-size:16px;line-height:1.6;">Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.</p>
${renderActionButton('Choisir un nouveau mot de passe', resetUrl)}
${renderLinkFallback(resetUrl)}
<p style="color:#374151;margin:24px 0 0 0;font-size:14px;line-height:1.6;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email. Pour des raisons de sécurité, ce lien expirera dans 1&nbsp;heure.</p>
`;

  return sendEmail({
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: renderEmailLayout(content),
  });
}

/**
 * Envoyer un email de contact depuis le formulaire
 * Supporte les templates Resend ou HTML inline
 */
export async function sendContactEmail(options: {
  to: string;
  name: string;
  email: string;
  phone?: string;
  clubName?: string;
  subject: string;
  message: string;
  templateId?: string;
}) {
  const { to, name, email, phone, clubName, subject, message, templateId } = options;

  // Mode template Resend
  if (templateId) {
    return sendEmail({
      to,
      subject: `[Contact] ${subject}`,
      templateId,
      templateData: {
        name,
        email,
        phone: phone || 'Non renseigné',
        clubName: clubName || 'Question générale',
        subject,
        message,
      },
    });
  }

  // Mode HTML inline (fallback)
  const content = `
<h2 style="color:#1f2937;margin:0 0 24px 0;font-size:24px;font-weight:600;line-height:1.3;">Nouveau message de contact</h2>
<p style="color:#1f2937;margin:0 0 16px 0;font-size:16px;line-height:1.6;">Vous avez reçu un nouveau message depuis le formulaire de contact du site Phuong Long Vo Dao.</p>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
  <tr>
    <td>
      <p style="color:#374151;margin:0 0 8px 0;font-size:14px;font-weight:500;line-height:1.5;">Nom :</p>
      <p style="color:#1f2937;margin:0 0 16px 0;font-size:14px;line-height:1.5;font-weight:600;">${name}</p>
      
      <p style="color:#374151;margin:0 0 8px 0;font-size:14px;font-weight:500;line-height:1.5;">Email :</p>
      <p style="color:#1f2937;margin:0 0 16px 0;font-size:14px;line-height:1.5;font-family:'Courier New',monospace;">${email}</p>
      
      ${phone ? `
      <p style="color:#374151;margin:0 0 8px 0;font-size:14px;font-weight:500;line-height:1.5;">Téléphone :</p>
      <p style="color:#1f2937;margin:0 0 16px 0;font-size:14px;line-height:1.5;">${phone}</p>
      ` : ''}
      
      ${clubName ? `
      <p style="color:#374151;margin:0 0 8px 0;font-size:14px;font-weight:500;line-height:1.5;">Club concerné :</p>
      <p style="color:#dc2626;margin:0 0 16px 0;font-size:14px;line-height:1.5;font-weight:600;">${clubName}</p>
      ` : ''}
      
      <p style="color:#374151;margin:0 0 8px 0;font-size:14px;font-weight:500;line-height:1.5;">Sujet :</p>
      <p style="color:#1f2937;margin:0 0 16px 0;font-size:14px;line-height:1.5;font-weight:600;">${subject}</p>
    </td>
  </tr>
</table>

<p style="color:#374151;margin:0 0 8px 0;font-size:14px;font-weight:500;line-height:1.5;">Message :</p>
<div style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
  <p style="color:#1f2937;margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
</div>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:2px solid #e5e7eb;padding-top:24px;margin-top:24px;">
  <tr>
    <td>
      <p style="color:#6b7280;margin:0;font-size:12px;line-height:1.6;">Pour répondre à ce message, utilisez l'adresse email : <strong style="color:#dc2626;">${email}</strong></p>
    </td>
  </tr>
</table>
`;

  return sendEmail({
    to,
    subject: `[Contact] ${subject}`,
    html: renderEmailLayout(content),
  });
}


