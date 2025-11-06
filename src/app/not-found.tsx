/**
 * 404 Not Found Page
 * 
 * Page d'erreur 404 personnalisée avec le thème du site
 * 
 * @version 1.0
 * @date 2025-11-06
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Button, ParallaxBackground } from '@/components/common';
import { HomeIcon, MapPinIcon, EnvelopeIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: '404 - Page non trouvée',
  description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
};

export default function NotFoundPage() {
  return (
    <>
      {/* Hero Section 404 */}
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
            <div className="inline-flex items-center px-5 py-2.5 mb-8 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full shadow-xl shadow-black/10 animate-fade-in">
              <span className="text-accent mr-2.5">⚠️</span>
              <span className="font-semibold text-sm tracking-wide">Erreur 404</span>
            </div>

            {/* Grand 404 stylisé */}
            <div className="mb-8 animate-slide-up">
              <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent to-white">
                  404
                </span>
              </h1>
            </div>

            {/* Message d'erreur */}
            <div className="mb-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                Page non trouvée
              </h2>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                La page que vous recherchez n'existe pas ou a été déplacée. 
                Pas de panique, nous sommes là pour vous aider !
              </p>
            </div>

            {/* Liens rapides */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 animate-scale-in">
              <Link href="/" className="group">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                  <HomeIcon className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-base">Accueil</h3>
                </div>
              </Link>
              
              <Link href="/clubs" className="group">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                  <MapPinIcon className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-base">Clubs</h3>
                </div>
              </Link>
              
              <Link href="/contact" className="group">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                  <EnvelopeIcon className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-base">Contact</h3>
                </div>
              </Link>
              
              <Link href="/faq" className="group">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                  <QuestionMarkCircleIcon className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-base">FAQ</h3>
                </div>
              </Link>
            </div>

            {/* Boutons CTA principaux */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link href="/">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-2xl shadow-black/20 hover:shadow-white/30 min-w-[200px] font-semibold">
                  🏠 Retour à l'Accueil
                </Button>
              </Link>
              <Link href="/clubs">
                <Button size="lg" className="border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-xl min-w-[200px] font-semibold">
                  🥋 Nos Clubs
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
              Si vous pensez qu'il s'agit d'une erreur ou si vous avez besoin d'assistance, n'hésitez pas à nous contacter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="primary" size="lg">
                  ✉️ Nous Contacter
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="ghost" size="lg">
                  ❓ Consulter la FAQ
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

