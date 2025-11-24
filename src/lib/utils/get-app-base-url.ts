/**
 * Retourne l'URL de base publique utilisée dans les emails.
 * Force le domaine personnalisé en production pour éviter les liens vercel.app.
 */
export function getAppBaseUrl() {
  const customProdDomain = 'https://phuong-long-vo-dao.com';
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;

  const isProd = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'development';

  if (isProd) {
    return customProdDomain;
  }

  return envUrl || 'http://localhost:3000';
}


