import { redirect } from 'next/navigation';

/**
 * Redirige automatiquement vers la page dédiée /dashboard/home.
 * Permet de garder une URL unique pour l'élément "Tableau de bord".
 */
export default function DashboardPage() {
  redirect('/dashboard/home');
}
