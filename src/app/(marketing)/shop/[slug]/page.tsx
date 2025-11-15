/**
 * Product Detail Page - Détail Produit
 * 
 * Page de détail d'un produit avec ajout au panier
 * 
 * @version 1.0
 * @date 2025-11-05 02:00
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Badge, Button } from '@/components/common';
import { createServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types/database';
import { ShoppingCartIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { ShoppingBag, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  const typedProduct = product as unknown as Product;

  return {
    title: `${typedProduct.name} - Boutique Phuong Long Vo Dao`,
    description: typedProduct.description || `Achetez ${typedProduct.name} sur notre boutique officielle`,
    openGraph: {
      title: typedProduct.name,
      description: typedProduct.description || '',
      images: typedProduct.images && typedProduct.images.length > 0 ? typedProduct.images : [],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!product) {
    notFound();
  }

  const typedProduct = product as unknown as Product;

  const price = (typedProduct.price_cents / 100).toFixed(2);
  const isOutOfStock = typedProduct.stock_quantity === 0;
  const isLowStock = typedProduct.stock_quantity > 0 && typedProduct.stock_quantity <= 5;

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-gray-50 dark:bg-gray-900 py-4 border-b dark:border-gray-800">
        <Container>
          <div className="flex items-center gap-2 text-sm dark:text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary transition-colors">
              Boutique
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">{typedProduct.name}</span>
          </div>
        </Container>
      </section>

      {/* Product Detail */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                {typedProduct.images && typedProduct.images.length > 0 ? (
                  <img
                    src={typedProduct.images[0]}
                    alt={typedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-32 h-32 text-gray-300 dark:text-gray-700" />
                  </div>
                )}
                
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="danger" size="lg">
                      Rupture de stock
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {typedProduct.images && typedProduct.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {typedProduct.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity">
                      <img
                        src={image}
                        alt={`${typedProduct.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Category Badge */}
              {typedProduct.category && (
                <Badge variant="default" size="md" className="mb-4">
                  {typedProduct.category}
                </Badge>
              )}

              <h1 className="text-4xl font-bold dark:text-gray-100 mb-4">
                {typedProduct.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold">{price} €</span>
                <span className="text-sm dark:text-gray-500">TTC</span>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <Badge variant="danger" size="md" className="flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    Rupture de stock
                  </Badge>
                ) : isLowStock ? (
                  <Badge variant="warning" size="md" className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Plus que {typedProduct.stock_quantity} en stock
                  </Badge>
                ) : (
                  <Badge variant="success" size="md" className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    En stock
                  </Badge>
                )}
              </div>

              {/* Description */}
              {typedProduct.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold dark:text-gray-100 mb-3">Description</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {typedProduct.description}
                  </p>
                </div>
              )}

              {/* Sizes */}
              {typedProduct.sizes && typedProduct.sizes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold dark:text-gray-100 mb-3">Taille</h3>
                  <div className="flex flex-wrap gap-2">
                    {typedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        className="px-4 py-2 border-2 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-medium"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <div className="mb-8">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                  disabled={isOutOfStock}
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  {isOutOfStock ? 'Produit indisponible' : 'Ajouter au panier'}
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-3 border-t dark:border-gray-800 pt-6">
                <div className="flex items-center gap-3 text-sm dark:text-gray-500">
                  <TruckIcon className="w-5 h-5 text-primary" />
                  <span>Livraison gratuite dès 50€</span>
                </div>
                <div className="flex items-center gap-3 text-sm dark:text-gray-500">
                  <ShieldCheckIcon className="w-5 h-5 text-primary" />
                  <span>Garantie satisfait ou remboursé 30 jours</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <Container>
          <h2 className="text-3xl font-bold dark:text-gray-100 mb-8">
            Produits similaires
          </h2>
          <div className="text-center py-12 dark:text-gray-500">
            <p>Recommandations à venir</p>
          </div>
        </Container>
      </section>
    </>
  );
}

