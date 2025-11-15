/**
 * Checkout Page - Paiement
 * 
 * Page de checkout avec intégration Stripe
 * 
 * @version 1.0
 * @date 2025-11-05 02:30
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/contexts/CartContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { Container, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/common';
import { ShoppingCart, Lightbulb, XCircle, Loader2, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shippingData, setShippingData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
  });

  const shippingCost = total >= 50 ? 0 : 5;
  const totalWithShipping = total + shippingCost;

  if (items.length === 0) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <ShoppingCart className="w-24 h-24 text-gray-300 dark:text-gray-700" />
            </div>
            <h1 className="text-2xl font-bold dark:text-gray-100 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 dark:text-gray-500 mb-8">
              Ajoutez des produits avant de passer commande.
            </p>
            <Link href="/shop">
              <Button variant="primary" size="lg">
                Voir la boutique
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implémenter l'intégration Stripe
      // const response = await fetch('/api/stripe/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     items,
      //     shipping: shippingData,
      //   }),
      // });
      
      // const { url } = await response.json();
      // if (url) {
      //   window.location.href = url; // Redirection vers Stripe Checkout
      // }

      // Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Checkout Stripe sera intégré prochainement !');
      setLoading(false);
      
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-50 dark:bg-gray-900 py-12 border-b dark:border-gray-800">
        <Container>
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Paiement</h1>
          <p className="text-gray-600 dark:text-gray-500">Finalisez votre commande</p>
        </Container>
      </section>

      {/* Checkout Form */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <Container>
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* User Info */}
                {!user && (
                  <Card variant="bordered" className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <p className="text-sm flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span><Link href="/signin" className="font-semibold hover:underline">Connectez-vous</Link> pour un checkout plus rapide !</span>
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card variant="bordered">
                  <CardHeader>
                    <CardTitle>Informations de livraison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={shippingData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Adresse <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={shippingData.address}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Ville <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingData.city}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Code postal <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingData.postalCode}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card variant="bordered" className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Récapitulatif de commande</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Items List */}
                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                            <p className="text-gray-500 dark:text-gray-500">Qté : {item.quantity}</p>
                            {item.size && <p className="text-gray-500 dark:text-gray-500">Taille : {item.size}</p>}
                          </div>
                          <p className="font-medium">{(item.price * item.quantity).toFixed(2)} €</p>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 border-t dark:border-gray-800 pt-4 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-500">Sous-total</span>
                        <span className="font-medium">{total.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-500">Livraison</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? (
                            <span className="text-green-600">Gratuite</span>
                          ) : (
                            `${shippingCost.toFixed(2)} €`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t dark:border-gray-800 pt-2">
                        <span>Total</span>
                        <span className="text-primary">{totalWithShipping.toFixed(2)} €</span>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border rounded-lg p-3 mb-4 text-sm flex items-start gap-2">
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full mb-3 flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Payer maintenant</>
                      )}
                    </Button>

                    <Link href="/cart">
                      <Button variant="ghost" size="md" className="w-full">
                        ← Retour au panier
                      </Button>
                    </Link>

                    <p className="text-xs dark:text-gray-500 mt-4">
                      Paiement sécurisé par Stripe
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Container>
      </section>
    </>
  );
}

