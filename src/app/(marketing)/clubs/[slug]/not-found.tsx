/**
 * Club Not Found Page
 * 
 * Page 404 personnalisée pour clubs non trouvés
 * 
 * @version 1.0
 * @date 2025-11-04 21:45
 */

import Link from 'next/link';
import { Container, Button } from '@/components/common';

export default function ClubNotFound() {
  return (
    <section className="py-20 lg:py-32">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🥋</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Club Non Trouvé
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Désolé, ce club n'existe pas ou n'est plus actif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/clubs">
              <Button size="lg">
                Voir Tous les Clubs
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="ghost">
                Retour à l'Accueil
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

