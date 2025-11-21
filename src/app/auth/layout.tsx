/**
 * Auth Layout
 * 
 * Layout pour les routes /auth/* (hors groupe (auth))
 * Utilisé pour /auth/confirm
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Phuong Long Vo Dao',
    default: 'Confirmation Email',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

