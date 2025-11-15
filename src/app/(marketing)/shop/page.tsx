/**
 * Shop Page - Boutique
 * 
 * Catalogue de produits avec filtres par catégorie
 * 
 * @version 1.0
 * @date 2025-11-05 01:55
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, ParallaxBackground } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types/database';
import { ShopHeroContent } from '@/components/marketing/ShopHeroContent';
import { Shield, Shirt, ShieldCheck, Backpack, Swords, ShoppingBag, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Boutique - Équipements & Vêtements | Phuong Long Vo Dao',
  description: 'Achetez vos équipements de Vo Dao : tenues, protections, accessoires. Livraison rapide en France.',
  openGraph: {
    title: 'Boutique Phuong Long Vo Dao',
    description: 'Équipements et vêtements pour arts martiaux vietnamiens',
    type: 'website',
  },
};

interface ShopPageSearchParams {
  category?: string;
}

interface Props {
  searchParams: Promise<ShopPageSearchParams>;
}

const categories = [
  { id: 'equipement', name: 'Équipement', IconComponent: Shield },
  { id: 'vetements', name: 'Vêtements', IconComponent: Shirt },
  { id: 'protection', name: 'Protections', IconComponent: ShieldCheck },
  { id: 'accessoires', name: 'Accessoires', IconComponent: Backpack },
  { id: 'armes', name: 'Armes Traditionnelles', IconComponent: Swords },
];

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedCategory = params.category;

  const supabase = await createServerClient();

  // Construire la requête
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('name');

  if (selectedCategory) {
    query = query.eq('category', selectedCategory);
  }

  const { data: products } = await query;
  const typedProducts = (products || []) as unknown as Product[];

  return (
    <>
      {/* Hero Section with Parallax */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#B91C1C] py-12 lg:py-16 overflow-hidden">
        <ParallaxBackground>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </ParallaxBackground>

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

        <Container className="relative z-10">
          <ShopHeroContent totalProducts={typedProducts.length} />
        </Container>
      </section>

      {/* Categories Filter */}
      <section className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-6">
        <Container>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium dark:text-gray-300 mr-2">Catégories :</span>
            <Link href="/shop">
              <Badge 
                variant={!selectedCategory ? 'primary' : 'default'} 
                size="md"
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                Tous les produits
              </Badge>
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.id}`}>
                <Badge 
                  variant={selectedCategory === category.id ? 'primary' : 'default'} 
                  size="md"
                  className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
                >
                  <category.IconComponent className="w-4 h-4" />
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Products Grid */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          {typedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-4 flex justify-center">
                <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-700" />
              </div>
              <p className="text-xl dark:text-gray-500 mb-4">
                {selectedCategory 
                  ? `Aucun produit dans cette catégorie pour le moment`
                  : 'La boutique sera bientôt disponible'}
              </p>
              {selectedCategory && (
                <Link href="/shop">
                  <Button variant="primary">Voir tous les produits</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {typedProducts.map((product) => (
                <Link key={product.id} href={`/shop/${product.slug}`} className="group">
                  <Card variant="bordered" hoverable className="h-full flex flex-col">
                    {/* Product Image */}
                    {product.images && product.images.length > 0 ? (
                      <div className="relative w-full h-64 overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="warning" size="sm">
                              Plus que {product.stock_quantity}
                            </Badge>
                          </div>
                        )}
                        {product.stock_quantity === 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="danger" size="sm">
                              Rupture
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                        <ShoppingBag className="w-24 h-24 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}

                    <CardHeader className="flex-1">
                      {/* Category Badge */}
                      {product.category && (
                        <Badge variant="default" size="sm" className="mb-2">
                          {product.category}
                        </Badge>
                      )}

                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>

                      {product.description && (
                        <CardDescription className="line-clamp-2 mt-2">
                          {product.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {(product.price_cents / 100).toFixed(2)} €
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm"
                          disabled={product.stock_quantity === 0}
                        >
                          {product.stock_quantity === 0 ? 'Rupture' : 'Ajouter'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold dark:text-gray-100 mb-4">
              Besoin d'aide pour choisir ?
            </h2>
            <p className="text-lg dark:text-gray-500 mb-8">
              Nos experts sont là pour vous conseiller sur le meilleur équipement selon votre niveau et pratique.
            </p>
            <Link href="/contact">
              <Button size="lg" variant="ghost" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Nous contacter
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

