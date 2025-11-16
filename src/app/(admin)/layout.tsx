/**
 * Admin Layout
 * 
 * Layout pour le panel d'administration avec sidebar avancée
 * 
 * @version 1.1
 * @date 2025-11-05 00:40
 * @updated Added mobile menu toggle button
 */

import type { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: {
    template: '%s | Admin - Phuong Long Vo Dao',
    default: 'Admin Panel',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

