/**
 * Test Page - Route de test pour vérifier que /auth/* fonctionne
 * 
 * Cette page permet de vérifier que les routes /auth/* sont bien accessibles sur Vercel
 */

export default function AuthTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Route /auth/* fonctionne !</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Si vous voyez cette page, les routes /auth/* sont bien déployées sur Vercel.
        </p>
      </div>
    </div>
  );
}

