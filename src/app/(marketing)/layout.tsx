/**
 * Marketing Layout
 * 
 * Layout pour les pages marketing publiques
 * Inclut Header et Footer
 * 
 * @version 1.0
 * @date 2025-11-04 20:50
 */

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

