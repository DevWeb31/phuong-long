/**
 * ClubFormModal Component
 * 
 * Modal pour créer/éditer un club
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect, Fragment } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';
import { ScheduleEditor } from './ScheduleEditor';
import { PricingEditor } from './PricingEditor';
import { LocationMapPicker } from './LocationMapPicker';
import { CityAutocomplete } from './CityAutocomplete';
import { CoverImageUploader } from './CoverImageUploader';
import { Image as ImageIcon, Map as MapIcon, Calendar as CalendarIcon, Euro, Facebook, Instagram, Youtube, CheckCircle2, Info, AlertCircle, XCircle } from 'lucide-react';

export interface CourseSession {
  time: string;
  type?: string;
  level?: string;
  instructor?: string;
  instructors?: string[];
}

export interface Club {
  id?: string;
  name: string;
  slug?: string;
  city: string;
  address: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  description?: string;
  cover_image_url?: string;
  latitude?: number | null;
  longitude?: number | null;
  schedule?: Record<string, CourseSession[]> | null;
  pricing?: Record<string, number> | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  } | null;
  active: boolean;
  members_count?: number;
  created_at?: string;
}

interface ClubFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (club: Partial<Club>) => Promise<void>;
  club?: Club | null;
  isLoading?: boolean;
}

type Step = 'info' | 'cover' | 'location' | 'schedule' | 'pricing' | 'social';

interface StepConfig {
  id: Step;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: 'info', label: 'Informations', icon: <Info className="w-4 h-4" /> },
  { id: 'cover', label: 'Image de couverture', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'location', label: 'Localisation', icon: <MapIcon className="w-4 h-4" /> },
  { id: 'schedule', label: 'Horaires', icon: <CalendarIcon className="w-4 h-4" /> },
  { id: 'pricing', label: 'Tarifs', icon: <Euro className="w-4 h-4" /> },
  { id: 'social', label: 'Réseaux & Statut', icon: <Facebook className="w-4 h-4" /> },
];

export function ClubFormModal({ isOpen, onClose, onSubmit, club, isLoading = false }: ClubFormModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [originalCoverImageUrl, setOriginalCoverImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Club>>({
    name: '',
    slug: '',
    city: '',
    address: '',
    postal_code: '',
    phone: '',
    email: '',
    description: '',
    cover_image_url: '',
    latitude: null,
    longitude: null,
    schedule: null,
    pricing: null,
    social_media: {
      facebook: '',
      instagram: '',
      youtube: '',
    },
    active: true,
  });

  useEffect(() => {
    if (club) {
      setFormData({
        ...club,
        social_media: club.social_media || {
          facebook: '',
          instagram: '',
          youtube: '',
        },
      });
      // Mémoriser l'URL de l'image originale pour pouvoir la supprimer si nécessaire
      setOriginalCoverImageUrl(club.cover_image_url || null);
    } else {
      setFormData({
        name: '',
        slug: '',
        city: '',
        address: '',
        postal_code: '',
        phone: '',
        email: '',
        description: '',
        cover_image_url: '',
        latitude: null,
        longitude: null,
        schedule: null,
        pricing: null,
        social_media: {
          facebook: '',
          instagram: '',
          youtube: '',
        },
        active: true,
      });
      setOriginalCoverImageUrl(null);
    }
    // Réinitialiser à la première étape quand on ouvre la modale
    if (isOpen) {
      setCurrentStep('info');
      setCompletedSteps(new Set());
    }
  }, [club, isOpen]);

  // Validation des étapes avec messages d'erreur
  const validateStep = (step: Step, showErrors = false): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 'info':
        if (!formData.name?.trim()) errors.name = 'Le nom du club est obligatoire';
        else if (formData.name.length > 50) errors.name = 'Le nom du club ne doit pas dépasser 50 caractères';
        if (!formData.slug?.trim()) errors.slug = 'Le slug est obligatoire';
        else if (!/^[a-z0-9-]+$/.test(formData.slug)) errors.slug = 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets';
        if (!formData.city?.trim()) errors.city = 'La ville est obligatoire';
        if (!formData.address?.trim()) errors.address = 'L\'adresse est obligatoire';
        if (!formData.postal_code?.trim()) errors.postal_code = 'Le code postal est obligatoire';
        else if (!/^\d{5}$/.test(formData.postal_code)) errors.postal_code = 'Le code postal doit contenir 5 chiffres';
        if (formData.phone && formData.phone.replace(/\D/g, '').length !== 10) {
          errors.phone = 'Le numéro de téléphone doit contenir 10 chiffres';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Format d\'email invalide';
        }
        if (formData.description && formData.description.length > 400) {
          errors.description = 'La description ne doit pas dépasser 400 caractères';
        }
        break;
      case 'location':
        // La localisation est optionnelle, mais si une coordonnée est remplie, l'autre doit l'être aussi
        if ((formData.latitude !== null && formData.latitude !== undefined) && 
            (formData.longitude === null || formData.longitude === undefined)) {
          errors.longitude = 'La longitude est requise si la latitude est renseignée';
        }
        if ((formData.longitude !== null && formData.longitude !== undefined) && 
            (formData.latitude === null || formData.latitude === undefined)) {
          errors.latitude = 'La latitude est requise si la longitude est renseignée';
        }
        if (formData.latitude !== null && formData.latitude !== undefined && 
            (formData.latitude < -90 || formData.latitude > 90)) {
          errors.latitude = 'La latitude doit être entre -90 et 90';
        }
        if (formData.longitude !== null && formData.longitude !== undefined && 
            (formData.longitude < -180 || formData.longitude > 180)) {
          errors.longitude = 'La longitude doit être entre -180 et 180';
        }
        break;
      case 'schedule':
        // Les horaires sont optionnels
        break;
      case 'pricing':
        // Les tarifs sont optionnels
        break;
      case 'social':
        // Validation des URLs si renseignées
        if (formData.social_media?.facebook && !/^https?:\/\/.+/.test(formData.social_media.facebook)) {
          errors.social_facebook = 'L\'URL Facebook doit commencer par http:// ou https://';
        }
        if (formData.social_media?.instagram && !/^https?:\/\/.+/.test(formData.social_media.instagram)) {
          errors.social_instagram = 'L\'URL Instagram doit commencer par http:// ou https://';
        }
        if (formData.social_media?.youtube && !/^https?:\/\/.+/.test(formData.social_media.youtube)) {
          errors.social_youtube = 'L\'URL YouTube doit commencer par http:// ou https://';
        }
        break;
    }
    
    if (showErrors) {
      setValidationErrors(errors);
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleStepChange = (step: Step) => {
    // Vérifier si l'étape précédente est complétée
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    const targetIndex = STEPS.findIndex(s => s.id === step);
    
    // Permettre de revenir en arrière ou d'avancer si l'étape actuelle est complète
    if (targetIndex <= currentIndex || validateStep(currentStep)) {
      setCurrentStep(step);
      if (validateStep(currentStep)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      }
    }
  };

  const handleNext = () => {
    const validation = validateStep(currentStep, true);
    if (!validation.isValid) {
      setShowValidationErrors(true);
      // Animation de shake sur le formulaire
      const form = document.querySelector('form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
      return;
    }

    setShowValidationErrors(false);
    setValidationErrors({});
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep.id);
      }
      // Scroll vers le haut de la modale
      const modalContent = document.querySelector('[class*="max-h-[calc(100vh-200px)]"]');
      if (modalContent) {
        modalContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const previousStep = STEPS[currentIndex - 1];
      if (previousStep) {
        setCurrentStep(previousStep.id);
      }
    }
  };

  const isStepCompleted = (step: Step): boolean => {
    return completedSteps.has(step);
  };

  const isStepValid = (step: Step): boolean => {
    return validateStep(step).isValid;
  };
  
  // Compter les champs remplis pour l'étape info
  const getInfoFieldsProgress = (): { filled: number; total: number } => {
    const requiredFields = ['name', 'slug', 'city', 'address', 'postal_code'];
    const optionalFields = ['phone', 'email', 'description'];
    const allFields = [...requiredFields, ...optionalFields];
    
    const filled = allFields.filter(field => {
      const value = formData[field as keyof Club];
      return value !== null && value !== undefined && value !== '';
    }).length;
    
    return { filled, total: allFields.length };
  };

  const canGoToStep = (step: Step): boolean => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    const targetIndex = STEPS.findIndex(s => s.id === step);
    
    // Toujours permettre de revenir en arrière
    if (targetIndex < currentIndex) return true;
    
    // Pour avancer, toutes les étapes précédentes doivent être complètes
    if (targetIndex > currentIndex) {
      for (let i = 0; i < targetIndex; i++) {
        const step = STEPS[i];
        if (step && !isStepCompleted(step.id) && !validateStep(step.id).isValid) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Raccourcis clavier
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
        const isLast = currentStepIndex === STEPS.length - 1;
        if (isLast) {
          // Appel direct de handleSubmit via le formulaire
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        } else {
          handleNext();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentStep]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Vérifier que toutes les étapes obligatoires sont complètes
    const infoValidation = validateStep('info', true);
    if (!infoValidation.isValid) {
      setCurrentStep('info');
      setShowValidationErrors(true);
      const form = document.querySelector('form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
      return;
    }
    
    // Nettoyer les données : convertir les chaînes vides en undefined pour les champs optionnels
    const cleanedSocialMedia = formData.social_media ? {
      facebook: formData.social_media.facebook?.trim() || undefined,
      instagram: formData.social_media.instagram?.trim() || undefined,
      youtube: formData.social_media.youtube?.trim() || undefined,
    } : undefined;
    
    // Retirer les valeurs undefined du social_media
    const cleanedSocialMediaFiltered = cleanedSocialMedia ? Object.fromEntries(
      Object.entries(cleanedSocialMedia).filter(([_, v]) => v !== undefined && v !== '')
    ) : undefined;
    
    // Si cover_image_url est vide ou null, envoyer null explicitement pour supprimer l'image
    const coverImageUrl = formData.cover_image_url?.trim();
    const finalCoverImageUrl = coverImageUrl && coverImageUrl.length > 0 ? coverImageUrl : null;
    
    // Supprimer l'ancienne image du storage si elle existe et que l'image a été supprimée
    if (originalCoverImageUrl && !finalCoverImageUrl && originalCoverImageUrl.includes('/storage/v1/object/public/clubs/')) {
      try {
        console.log('🗑️ Suppression de l\'ancienne image lors de la sauvegarde:', originalCoverImageUrl);
        const deleteResponse = await fetch('/api/admin/delete-image', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: originalCoverImageUrl,
          }),
        });

        if (deleteResponse.ok) {
          console.log('✅ Ancienne image supprimée du storage avec succès');
        } else {
          const errorData = await deleteResponse.json();
          console.warn('⚠️ Erreur lors de la suppression de l\'ancienne image:', errorData);
          // Ne pas bloquer la sauvegarde si la suppression échoue
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la suppression de l\'ancienne image:', error);
        // Ne pas bloquer la sauvegarde si la suppression échoue
      }
    }
    
    const cleanedData: Partial<Club> = {
      ...formData,
      cover_image_url: finalCoverImageUrl || undefined,
      description: formData.description?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      email: formData.email?.trim() || undefined,
      social_media: cleanedSocialMediaFiltered && Object.keys(cleanedSocialMediaFiltered).length > 0 
        ? cleanedSocialMediaFiltered as { facebook?: string; instagram?: string; youtube?: string }
        : undefined,
    };
    
    console.log('📤 Envoi des données du club:', { 
      ...cleanedData, 
      cover_image_url: finalCoverImageUrl === null ? 'NULL (suppression)' : finalCoverImageUrl 
    });
    
    await onSubmit(cleanedData);
    
    // Mettre à jour l'URL originale après la sauvegarde
    if (finalCoverImageUrl) {
      setOriginalCoverImageUrl(finalCoverImageUrl);
    } else {
      setOriginalCoverImageUrl(null);
    }
  };

  const handleSubmitAndClose = async () => {
    await handleSubmit();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Conversion pour les nombres (latitude/longitude)
    if (name === 'latitude' || name === 'longitude') {
      const numValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Auto-générer le slug depuis le nom
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.slice(0, 50); // Limiter à 50 caractères
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, name, slug }));
  };

  // Formater le téléphone au format "01 02 03 04 05" (chiffres uniquement)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ne garder que les chiffres
    const digitsOnly = value.replace(/\D/g, '');
    // Limiter à 10 chiffres (format français)
    const limitedDigits = digitsOnly.slice(0, 10);
    // Formater au format "01 02 03 04 05"
    let formatted = '';
    for (let i = 0; i < limitedDigits.length; i++) {
      if (i > 0 && i % 2 === 0) {
        formatted += ' ';
      }
      formatted += limitedDigits[i];
    }
    
    setFormData(prev => ({ ...prev, phone: formatted }));
    // Effacer l'erreur de validation si elle existe
    if (validationErrors.phone) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={club ? `Modifier le Club - ${club.name}` : 'Nouveau Club'}
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center justify-start">
            {!isFirstStep && (
              <Button 
                variant="ghost" 
                onClick={handlePrevious} 
                disabled={isLoading}
                className="w-full sm:w-auto text-gray-900 dark:text-gray-100"
              >
                Précédent
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial justify-end">
            <Button 
              variant="ghost" 
              onClick={onClose} 
              disabled={isLoading}
              className="flex-1 sm:flex-initial text-gray-900 dark:text-gray-100"
            >
              Annuler
            </Button>
            {/* Bouton "Mettre à jour et fermer" uniquement en mode modification et pas sur la dernière étape */}
            {club && !isLastStep && (
              <Button 
                variant="secondary" 
                onClick={handleSubmitAndClose} 
                isLoading={isLoading}
                disabled={!validateStep(currentStep).isValid}
                className="flex-1 sm:flex-initial"
              >
                Mettre à jour et fermer
              </Button>
            )}
            {isLastStep ? (
              <Button 
                variant="primary" 
                onClick={() => handleSubmit()} 
                isLoading={isLoading}
                disabled={!validateStep(currentStep).isValid}
                className="flex-1 sm:flex-initial"
              >
                {club ? 'Mettre à jour' : 'Créer'}
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={handleNext}
                disabled={!validateStep(currentStep).isValid}
                className="flex-1 sm:flex-initial"
              >
                Suivant
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Steps Navigation */}
      <div className="mb-6 sm:mb-8">
        {/* Mobile: Steps vertical scrollable */}
        <div className="block sm:hidden mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = isStepCompleted(step.id);
              const canGo = canGoToStep(step.id);
              
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => canGo && handleStepChange(step.id)}
                  disabled={!canGo || isLoading}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0
                    ${isActive 
                      ? 'bg-green-600 text-white shadow-md' 
                      : canGo 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' 
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 opacity-50'
                    }
                  `}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isActive || isCompleted 
                      ? isActive ? 'bg-white text-green-600' : 'bg-white text-primary' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }
                  `}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className="text-xs font-semibold whitespace-nowrap">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Desktop: Steps horizontal */}
        <div className="hidden sm:flex items-center justify-evenly w-full">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isValid = isStepValid(step.id);
            const canGo = canGoToStep(step.id);
            
            return (
              <Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => canGo && handleStepChange(step.id)}
                  disabled={!canGo || isLoading}
                  className={`
                    flex flex-col items-center gap-2 relative flex-shrink-0
                    ${isActive ? 'cursor-default' : canGo ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                    transition-all duration-200
                  `}
                >
                  {/* Step Circle */}
                  <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-200 relative
                    ${isActive 
                      ? 'border-green-600 bg-green-600 text-white' 
                      : isCompleted 
                        ? 'border-primary bg-primary text-white' 
                        : isValid && !isCompleted
                          ? 'border-primary text-primary bg-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <div className="w-4 h-4 sm:w-4 sm:h-4">{step.icon}</div>
                    )}
                    
                    {/* Step Number */}
                    <span className={`
                      absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[10px] sm:text-xs flex items-center justify-center font-bold
                      ${isActive
                        ? 'bg-green-600 text-white'
                        : isCompleted
                          ? 'bg-primary text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }
                    `}>
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Step Label */}
                  <span className={`
                    text-[10px] sm:text-xs font-semibold text-center leading-tight max-w-[80px] sm:max-w-[100px]
                    ${isActive 
                      ? 'text-green-600 dark:text-green-500' 
                      : isCompleted 
                        ? 'text-primary dark:text-primary-light'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {step.label}
                  </span>
                </button>
                
                {/* Connector Line */}
                {index < STEPS.length - 1 && (
                  <div className={`
                    h-0.5 flex-1 max-w-[60px] sm:max-w-[80px] mx-2 sm:mx-3 transition-all duration-200
                    ${isActive || (index < currentStepIndex && isCompleted)
                      ? 'bg-green-600'
                      : isCompleted || (index < currentStepIndex)
                        ? 'bg-primary'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `} />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Step 1: Informations de base */}
        {currentStep === 'info' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-2">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2 flex-1">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Remplissez les informations essentielles du club. Les champs marqués d'un astérisque (*) sont obligatoires.</span>
                </p>
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded self-start sm:self-auto">
                  {getInfoFieldsProgress().filled}/{getInfoFieldsProgress().total} champs
                </div>
              </div>
            </div>
            
            {/* Message d'erreur global */}
            {showValidationErrors && Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      Veuillez corriger les erreurs suivantes :
                    </p>
                    <ul className="text-xs sm:text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                      {Object.entries(validationErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Nom */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Nom du club <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  maxLength={50}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.name
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="Ex: Marseille Centre"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.name?.length || 0}/50 caractères
                </p>
                {showValidationErrors && validationErrors.name && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  readOnly
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 cursor-not-allowed ${
                    showValidationErrors && validationErrors.slug
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="marseille-centre"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Généré automatiquement depuis le nom du club
                </p>
                {showValidationErrors && validationErrors.slug && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.slug}
                  </p>
                )}
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Adresse complète <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  showValidationErrors && validationErrors.address
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                    : 'dark:border-gray-700'
                }`}
                placeholder="12 Rue de la République"
              />
              {showValidationErrors && validationErrors.address && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Ville */}
              <div>
                <label htmlFor="city" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Ville <span className="text-red-500">*</span>
                </label>
                <CityAutocomplete
                  value={formData.city || ''}
                  onChange={(city, postalCode) => {
                    console.log('ClubFormModal - onChange:', { city, postalCode });
                    setFormData(prev => {
                      const newData = {
                        ...prev,
                        city,
                        postal_code: postalCode,
                      };
                      console.log('ClubFormModal - new formData:', newData);
                      return newData;
                    });
                    // Effacer les erreurs de validation si elles existent
                    if (validationErrors.city || validationErrors.postal_code) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.city;
                        delete newErrors.postal_code;
                        return newErrors;
                      });
                    }
                  }}
                  error={showValidationErrors ? validationErrors.city : undefined}
                  required
                />
              </div>

              {/* Code postal */}
              <div>
                <label htmlFor="postal_code" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Code postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  key={`postal_code-${formData.postal_code || 'empty'}`}
                  value={formData.postal_code || ''}
                  readOnly
                  required
                  maxLength={5}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 cursor-not-allowed ${
                    showValidationErrors && validationErrors.postal_code
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="Sélectionnez une ville..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Auto-complété lors de la sélection de la ville
                </p>
                {showValidationErrors && validationErrors.postal_code && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.postal_code}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Téléphone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handlePhoneChange}
                  maxLength={14}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.phone
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="01 02 03 04 05"
                />
                {showValidationErrors && validationErrors.phone && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.email
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="club@phuonglong.fr"
                />
                {showValidationErrors && validationErrors.email && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
                maxLength={400}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  showValidationErrors && validationErrors.description
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                    : 'dark:border-gray-700'
                }`}
                placeholder="Décrivez le club..."
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(formData.description || '').length}/400 caractères
                </p>
                {showValidationErrors && validationErrors.description && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Image de couverture */}
        {currentStep === 'cover' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <ImageIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Ajoutez une image de couverture pour votre club. Cette image sera affichée sur la page du club et dans les listes.</span>
              </p>
            </div>

            {/* Message d'erreur global */}
            {showValidationErrors && Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      Veuillez corriger les erreurs suivantes :
                    </p>
                    <ul className="text-xs sm:text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                      {Object.entries(validationErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Image de couverture */}
            <div>
              <label className="block text-sm font-semibold dark:text-gray-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                Image de couverture
              </label>
              <CoverImageUploader
                value={formData.cover_image_url || ''}
                onChange={(url) => {
                  setFormData(prev => ({
                    ...prev,
                    cover_image_url: url,
                  }));
                  // Mettre à jour l'URL originale si une nouvelle image est uploadée
                  if (url && url.includes('/storage/v1/object/public/clubs/')) {
                    setOriginalCoverImageUrl(url);
                  }
                  // Effacer l'erreur de validation si elle existe
                  if (validationErrors.cover_image_url) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.cover_image_url;
                      return newErrors;
                    });
                  }
                }}
                error={showValidationErrors ? validationErrors.cover_image_url : undefined}
              />
            </div>
          </div>
        )}

        {/* Step 3: Localisation */}
        {currentStep === 'location' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <MapIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Les coordonnées GPS sont optionnelles mais permettent d'afficher le club sur la carte interactive du site. Cliquez sur la carte pour les définir automatiquement.</span>
              </p>
            </div>
            
            {/* Message d'erreur global */}
            {showValidationErrors && Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      Veuillez corriger les erreurs suivantes :
                    </p>
                    <ul className="text-xs sm:text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                      {Object.entries(validationErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Carte interactive pour sélectionner les coordonnées */}
            <LocationMapPicker
              latitude={formData.latitude ?? null}
              longitude={formData.longitude ?? null}
              onLocationChange={(lat, lng) => {
                setFormData(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }));
                // Effacer les erreurs de validation si elles existent
                if (validationErrors.latitude || validationErrors.longitude) {
                  setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.latitude;
                    delete newErrors.longitude;
                    return newErrors;
                  });
                }
              }}
            />

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  ou saisissez manuellement
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Latitude */}
              <div>
                <label htmlFor="latitude" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude ?? ''}
                  onChange={handleChange}
                  step="0.000001"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.latitude
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="47.765663"
                />
                {showValidationErrors && validationErrors.latitude && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.latitude}
                  </p>
                )}
              </div>

              {/* Longitude */}
              <div>
                <label htmlFor="longitude" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude ?? ''}
                  onChange={handleChange}
                  step="0.000001"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.longitude
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="-3.358848"
                />
                {showValidationErrors && validationErrors.longitude && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.longitude}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Horaires */}
        {currentStep === 'schedule' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <CalendarIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Définissez les horaires des cours par jour de la semaine. Vous pouvez ajouter plusieurs créneaux par jour.</span>
              </p>
            </div>

            <ScheduleEditor
              value={formData.schedule as Record<string, CourseSession[]> | null}
              onChange={(schedule) => setFormData(prev => ({ ...prev, schedule: schedule as Record<string, CourseSession[]> }))}
              clubId={formData.id}
            />
          </div>
        )}

        {/* Step 5: Tarifs */}
        {currentStep === 'pricing' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Euro className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Configurez les tarifs annuels par catégorie (adultes, enfants, étudiants, etc.).</span>
              </p>
            </div>

            <PricingEditor
              value={formData.pricing as Record<string, number> | null}
              onChange={(pricing) => setFormData(prev => ({ ...prev, pricing }))}
            />
          </div>
        )}

        {/* Step 6: Réseaux sociaux & Statut */}
        {currentStep === 'social' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Facebook className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Ajoutez les liens vers les réseaux sociaux du club et définissez son statut d'activation.</span>
              </p>
            </div>
            
            {/* Message d'erreur global */}
            {showValidationErrors && Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      Veuillez corriger les erreurs suivantes :
                    </p>
                    <ul className="text-xs sm:text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                      {Object.entries(validationErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Réseaux sociaux */}
            <div className="space-y-4">
              {/* Facebook */}
              <div>
                <label htmlFor="social_facebook" className="block text-sm font-semibold dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="url"
                  id="social_facebook"
                  value={formData.social_media?.facebook || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      social_media: {
                        ...prev.social_media,
                        facebook: e.target.value,
                      } as Club['social_media'],
                    }));
                    // Effacer l'erreur si elle existe
                    if (validationErrors.social_facebook) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.social_facebook;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 ${
                    showValidationErrors && validationErrors.social_facebook
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="https://www.facebook.com/phuonglongvodao"
                />
                {showValidationErrors && validationErrors.social_facebook && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.social_facebook}
                  </p>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label htmlFor="social_instagram" className="block text-sm font-semibold dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  Instagram
                </label>
                <input
                  type="url"
                  id="social_instagram"
                  value={formData.social_media?.instagram || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      social_media: {
                        ...prev.social_media,
                        instagram: e.target.value,
                      } as Club['social_media'],
                    }));
                    // Effacer l'erreur si elle existe
                    if (validationErrors.social_instagram) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.social_instagram;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 ${
                    showValidationErrors && validationErrors.social_instagram
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="https://www.instagram.com/phuonglongvodao"
                />
                {showValidationErrors && validationErrors.social_instagram && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.social_instagram}
                  </p>
                )}
              </div>

              {/* YouTube */}
              <div>
                <label htmlFor="social_youtube" className="block text-sm font-semibold dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-600" />
                  YouTube
                </label>
                <input
                  type="url"
                  id="social_youtube"
                  value={formData.social_media?.youtube || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      social_media: {
                        ...prev.social_media,
                        youtube: e.target.value,
                      } as Club['social_media'],
                    }));
                    // Effacer l'erreur si elle existe
                    if (validationErrors.social_youtube) {
                      setValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.social_youtube;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 ${
                    showValidationErrors && validationErrors.social_youtube
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="https://www.youtube.com/@phuonglongvodao"
                />
                {showValidationErrors && validationErrors.social_youtube && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.social_youtube}
                  </p>
                )}
              </div>
            </div>

            {/* Actif */}
            <div className="flex items-center gap-3 border-t dark:border-gray-700 pt-6">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-5 h-5 text-primary border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-semibold dark:text-gray-300">
                Club actif (le club sera visible sur le site si cette case est cochée)
              </label>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

