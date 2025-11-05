/**
 * Admin Dashboard Redirect
 * 
 * Redirige /admin/dashboard vers /admin
 * 
 * @version 1.0
 * @date 2025-11-05
 */

import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  redirect('/admin');
}

