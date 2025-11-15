/**
 * Cart Page - Panier
 * 
 * Page du panier d'achat avec récapitulatif et checkout
 * 
 * @version 1.0
 * @date 2025-11-05 02:20
 */

'use client';

import Link from 'next/link';
import { useCart } from '@/lib/contexts/CartContext';
import { Container, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/common';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { ShoppingCart, ShoppingBag, CheckCircle2, Lightbulb, Lock } from 'lucide-react';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, itemsCount } = useCart();

  if (items.length === 0) {
    return (
      <>
        {/* Hero */}
        <section className="bg-gray-50 dark:bg-gray-900 py-12">
          <Container>
            <h1 className="text-3xl font-bold dark:text-gray-100">Panier</h1>
          </Container>
        </section>

        {/* Empty Cart */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6 flex justify-center">
                <ShoppingCart className="w-24 h-24 text-gray-300 dark:text-gray-700" />
              </div>
              <h2 className="text-2xl font-bold dark:text-gray-100 mb-4">
                Votre panier est vide
              </h2>
              <p className="text-gray-600 dark:text-gray-500 mb-8">
                Découvrez nos produits et équipez-vous pour votre pratique du Vo Dao !
              </p>
              <Link href="/shop">
                <Button variant="primary" size="lg">
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Voir la boutique
                </Button>
              </Link>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-50 dark:bg-gray-900 py-12 border-b dark:border-gray-800">
        <Container>
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Panier</h1>
          <p className="text-gray-600 dark:text-gray-500">{itemsCount} article{itemsCount > 1 ? 's' : ''}</p>
        </Container>
      </section>

      {/* Cart Content */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} variant="bordered">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/shop/${item.slug}`}
                          className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        {item.size && (
                          <p className="text-sm dark:text-gray-500 mt-1">Taille : {item.size}</p>
                        )}
                        <p className="text-lg font-bold mt-2">
                          {item.price.toFixed(2)} €
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-4">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 transition-colors p-2"
                          title="Supprimer"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border dark:border-gray-700 rounded hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border dark:border-gray-700 rounded hover:bg-gray-100 dark:bg-gray-800 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-sm font-semibold dark:text-gray-100">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card variant="bordered" className="sticky top-4">
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-500">Sous-total</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{total.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-500">Livraison</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {total >= 50 ? (
                          <span className="text-green-600 flex items-center gap-1">
                            Gratuite <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          '5.00 €'
                        )}
                      </span>
                    </div>
                    <div className="border-t dark:border-gray-800 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          {(total + (total >= 50 ? 0 : 5)).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>

                  {total < 50 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Plus que {(50 - total).toFixed(2)} € pour la livraison gratuite !</span>
                    </div>
                  )}

                  <Link href="/checkout">
                    <Button variant="primary" size="lg" className="w-full mb-3 flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      Passer commande
                    </Button>
                  </Link>

                  <Link href="/shop">
                    <Button variant="ghost" size="md" className="w-full">
                      ← Continuer mes achats
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

