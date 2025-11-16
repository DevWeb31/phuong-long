/**
 * Contact Page - Formulaire de Contact
 * 
 * Page avec formulaire de contact complet et informations
 * 
 * @version 1.0
 * @date 2025-11-04 23:10
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, ParallaxBackground } from '@/components/common';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ContactHeroContent } from '@/components/marketing/ContactHeroContent';
import { CheckCircle2, XCircle, HelpCircle, Loader2, Send } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    club: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormState('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          club: '',
          subject: '',
          message: '',
        });
      } else {
        setFormState('error');
      }
    } catch (error) {
      setFormState('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {/* Hero Section with Parallax */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-[#E6110A] py-12 lg:py-16 overflow-hidden">
        {/* Parallax Background */}
        <ParallaxBackground>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </ParallaxBackground>
        
        {/* Gradient Overlay pour profondeur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        <Container className="relative z-10">
          <ContactHeroContent />
        </Container>
      </section>

      {/* Contact Content */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Email */}
              <Card variant="bordered">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <EnvelopeIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Email</CardTitle>
                  <CardDescription>
                    <a href="mailto:contact@phuong-long-vo-dao.fr" className="text-primary hover:underline">
                      contact@phuong-long-vo-dao.fr
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Téléphone */}
              <Card variant="bordered">
                <CardHeader>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <PhoneIcon className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg">Téléphone</CardTitle>
                  <CardDescription>
                    <a href="tel:+33123456789" className="text-primary hover:underline">
                      01 23 45 67 89
                    </a>
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Horaires */}
              <Card variant="bordered">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <ClockIcon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Horaires</CardTitle>
                  <CardDescription>
                    Lun - Ven : 9h - 18h<br />
                    Sam : 10h - 16h<br />
                    Dim : Fermé
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Adresse Siège */}
              <Card variant="bordered">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <MapPinIcon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Siège Social</CardTitle>
                  <CardDescription>
                    123 Rue Example<br />
                    75001 Paris<br />
                    France
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* CTA Clubs */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 border">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Contacter un club directement
                </h3>
                <p className="text-sm dark:text-gray-500 mb-4">
                  Pour des questions spécifiques à un club (horaires, essai gratuit), contactez-le directement.
                </p>
                <Link href="/clubs">
                  <Button variant="primary" size="sm" className="w-full">
                    Voir les clubs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {formState === 'success' ? (
                    <div className="bg-green-50 border rounded-lg p-6 text-center">
                      <div className="mb-4 flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Message envoyé avec succès !
                      </h3>
                      <p className="text-green-700 mb-4">
                        Nous avons bien reçu votre message et vous répondrons dans les 24-48h.
                      </p>
                      <Button onClick={() => setFormState('idle')} variant="primary">
                        Envoyer un autre message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Jean Dupont"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="jean.dupont@example.com"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="06 12 34 56 78"
                        />
                      </div>

                      {/* Club */}
                      <div>
                        <label htmlFor="club" className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Club concerné
                        </label>
                        <select
                          id="club"
                          name="club"
                          value={formData.club}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">-- Sélectionnez un club --</option>
                          <option value="marseille">Marseille Centre</option>
                          <option value="paris">Paris Bastille</option>
                          <option value="nice">Nice Promenade</option>
                          <option value="creteil">Créteil Université</option>
                          <option value="strasbourg">Strasbourg Centre</option>
                          <option value="autre">Autre / Question générale</option>
                        </select>
                      </div>

                      {/* Subject */}
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Sujet <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Demande d'informations"
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium dark:text-gray-300 mb-2">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          placeholder="Votre message..."
                        />
                      </div>

                      {/* Error Message */}
                      {formState === 'error' && (
                        <div className="bg-red-50 border rounded-lg p-4 text-red-700 flex items-center gap-2">
                          <XCircle className="w-5 h-5 flex-shrink-0" />
                          <span>Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.</span>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full flex items-center justify-center gap-2"
                        disabled={formState === 'loading'}
                      >
                        {formState === 'loading' ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                        ) : (
                          <><Send className="w-4 h-4" /> Envoyer le message</>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold dark:text-gray-100 mb-4">
              Consultez notre FAQ
            </h2>
            <p className="text-lg dark:text-gray-500 mb-8">
              La réponse à votre question s'y trouve peut-être déjà !
            </p>
            <div className="flex justify-center">
              <Link href="/faq">
                <Button size="lg" variant="secondary" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Voir la FAQ
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

