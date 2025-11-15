/**
 * Global Error Boundary
 * 
 * Page d'erreur globale pour capturer les erreurs non gérées
 * dans les Server Components et les Client Components
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container, Button, ParallaxBackground } from '@/components/common';
import { AlertTriangle, Home, RefreshCw, Mail, HelpCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log l'erreur pour le debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <>
      {/* Hero Section Error */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-20 lg:py-32 overflow-hidden min-h-[80vh] flex items-center">
        {/* Parallax Background */}
        <ParallaxBackground>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </ParallaxBackground>
        
        {/* Gradient Overlay pour profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge d'erreur */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full shadow-xl shadow-black/10 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span className="font-semibold text-sm tracking-wide">Erreur Application</span>
            </div>

            {/* Message d'erreur */}
            <div className="mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Une erreur est survenue
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto mb-4">
                Désolé, une erreur inattendue s'est produite. Notre équipe a été notifiée et travaille à résoudre le problème.
              </p>
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-left max-w-2xl mx-auto">
                  <p className="text-sm text-white/90 font-mono break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-white/60 mt-2">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button
                onClick={reset}
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-50 shadow-2xl shadow-black/20 hover:shadow-white/30 min-w-[200px] font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </Button>
              <Link href="/">
                <Button
                  size="lg"
                  className="border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-xl min-w-[200px] font-semibold flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Retour à l'Accueil
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Section d'aide supplémentaire */}
      <section className="py-16 lg:py-20 bg-white dark:bg-slate-900">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Besoin d'aide ?
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Si le problème persiste, n'hésitez pas à nous contacter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="primary" size="lg" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Nous Contacter
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="ghost" size="lg" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Consulter la FAQ
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

