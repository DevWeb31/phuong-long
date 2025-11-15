/**
 * Club Not Found Page
 * 
 * Page 404 personnalisée pour clubs non trouvés
 * 
 * @version 2.0
 * @date 2025-11-06
 */

import Link from 'next/link';
import { Container, Button, ParallaxBackground } from '@/components/common';
import { Shield, MapPin, Home } from 'lucide-react';

export default function ClubNotFound() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-20 lg:py-32 overflow-hidden min-h-[70vh] flex items-center">
        {/* Parallax Background */}
        <ParallaxBackground>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </ParallaxBackground>
        
        {/* Gradient Overlay pour profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Icône */}
            <div className="mb-8 animate-fade-in flex justify-center">
              <Shield className="w-32 h-32 text-gray-300 dark:text-gray-700" />
            </div>
            
            {/* Titre */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up tracking-tight">
              Club Non Trouvé
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 mb-12 leading-relaxed animate-fade-in">
              Désolé, ce club n'existe pas ou n'est plus actif. Découvrez nos autres clubs actifs en France.
            </p>
            
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link href="/clubs">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-2xl shadow-black/20 hover:shadow-white/30 min-w-[200px] font-semibold flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Voir Tous les Clubs
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" className="border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-xl min-w-[200px] font-semibold flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  Retour à l'Accueil
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

