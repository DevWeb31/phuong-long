/**
 * Blog Post Not Found - 404 Article
 * 
 * Page 404 personnalisée pour les articles de blog
 * 
 * @version 1.0
 * @date 2025-11-04 22:40
 */

import Link from 'next/link';
import { Container, Button } from '@/components/common';

export default function BlogPostNotFound() {
  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">📰❌</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Article introuvable
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Désolé, l'article que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <Button size="lg" variant="primary">
                Voir tous les articles
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="ghost">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

