/**
 * ContactInfo Component
 * 
 * Affiche les informations de contact (email, téléphone, horaires, adresse)
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ContactInfoProps {
  email: string;
  phone: string;
  hours: string; // JSON string
  address: string; // JSON string
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

export function ContactInfo({ email, phone, hours, address }: ContactInfoProps) {
  // Parser les horaires
  let hoursData: Record<string, string> = {};
  try {
    hoursData = hours ? JSON.parse(hours) : {};
  } catch {
    // Fallback si ce n'est pas du JSON
    const lines = hours.split('\n');
    hoursData = {
      monday: lines[0]?.replace(/^[^:]+:\s*/, '') || '',
      tuesday: lines[0]?.replace(/^[^:]+:\s*/, '') || '',
      wednesday: lines[0]?.replace(/^[^:]+:\s*/, '') || '',
      thursday: lines[0]?.replace(/^[^:]+:\s*/, '') || '',
      friday: lines[0]?.replace(/^[^:]+:\s*/, '') || '',
      saturday: lines[1]?.replace(/^[^:]+:\s*/, '') || '',
      sunday: lines[2]?.replace(/^[^:]+:\s*/, '') || 'Fermé',
    };
  }

  // Parser l'adresse
  let addressData: { street?: string; postal_code?: string; city?: string; country?: string } = {};
  try {
    addressData = address ? JSON.parse(address) : {};
  } catch {
    // Fallback si ce n'est pas du JSON
    const lines = address.split('\n');
    addressData = {
      street: lines[0] || '',
      postal_code: lines[1]?.match(/\d{5}/)?.[0] || '',
      city: lines[1]?.replace(/\d{5}\s*/, '') || lines[2] || '',
      country: lines[2] || lines[3] || 'France',
    };
  }

  // Vérifier si les horaires contiennent des données valides
  const hasHours = Object.values(hoursData).some(value => value && value.trim() !== '');

  // Vérifier si l'adresse contient des données valides
  const hasAddress = addressData.street || addressData.postal_code || addressData.city || addressData.country;

  return (
    <div className="space-y-6">
      {/* Email */}
      {email && email.trim() !== '' && (
        <Card variant="bordered">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <EnvelopeIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Email</CardTitle>
            <CardDescription>
              <a href={`mailto:${email}`} className="text-primary hover:underline">
                {email}
              </a>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Téléphone */}
      {phone && phone.trim() !== '' && (
        <Card variant="bordered">
          <CardHeader>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <PhoneIcon className="w-6 h-6 text-secondary" />
            </div>
            <CardTitle className="text-lg">Téléphone</CardTitle>
            <CardDescription>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-primary hover:underline">
                {phone}
              </a>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Horaires */}
      {hasHours && (
        <Card variant="bordered">
          <CardHeader>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <ClockIcon className="w-6 h-6 text-accent" />
            </div>
            <CardTitle className="text-lg">Horaires</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="space-y-1">
                {Object.entries(DAY_LABELS).map(([key, label]) => (
                  <div key={key}>
                    {label} : {hoursData[key] || 'Fermé'}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Adresse Siège */}
      {hasAddress && (
        <Card variant="bordered">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <MapPinIcon className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Siège Social</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {addressData.street && <div>{addressData.street}</div>}
              {(addressData.postal_code || addressData.city) && (
                <div>
                  {addressData.postal_code} {addressData.city}
                </div>
              )}
              {addressData.country && <div>{addressData.country}</div>}
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

