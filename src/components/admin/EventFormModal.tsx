/**
 * EventFormModal Component
 * 
 * Modal pour créer/éditer un événement avec navigation par étapes
 * 
 * @version 2.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect, Fragment } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';
import { ImagesEditor } from './ImagesEditor';
import { SessionsEditor } from './SessionsEditor';
import { CoverImageUploader } from './CoverImageUploader';
import { 
  Image as ImageIcon, 
  Info, 
  Euro, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Images,
  Clock,
  ToggleLeft
} from 'lucide-react';
import type { EventImage, EventSession } from '@/lib/types';

export interface Event {
  id?: string;
  title: string;
  slug?: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
  club_id?: string;
  max_attendees?: number;
  registration_deadline?: string;
  cover_image_url?: string;
  price_cents: number;
  active: boolean;
  created_at?: string;
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Partial<Event>) => Promise<void>;
  event?: Event | null;
  clubs?: Array<{ id: string; name: string; city: string }>;
  isLoading?: boolean;
}

type Step = 'info' | 'cover' | 'images' | 'sessions' | 'pricing' | 'status';

interface StepConfig {
  id: Step;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: 'info', label: 'Informations', icon: <Info className="w-4 h-4" /> },
  { id: 'cover', label: 'Image de couverture', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'images', label: 'Galerie', icon: <Images className="w-4 h-4" /> },
  { id: 'sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
  { id: 'pricing', label: 'Tarifs & Places', icon: <Euro className="w-4 h-4" /> },
  { id: 'status', label: 'Statut', icon: <ToggleLeft className="w-4 h-4" /> },
];

export function EventFormModal({ isOpen, onClose, onSubmit, event, clubs = [], isLoading = false }: EventFormModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    slug: '',
    event_type: 'stage',
    start_date: '',
    end_date: '',
    location: '',
    description: '',
    club_id: '',
    max_attendees: undefined,
    registration_deadline: '',
    cover_image_url: '',
    price_cents: 0,
    active: true,
  });

  const [images, setImages] = useState<Partial<EventImage>[]>([]);
  const [sessions, setSessions] = useState<Partial<EventSession>[]>([]);

  useEffect(() => {
    if (event) {
      setFormData(event);
      // Charger les images et sessions existantes si on édite un événement
      if (event.id) {
        loadEventImages(event.id);
        loadEventSessions(event.id);
      }
    } else {
      setFormData({
        title: '',
        slug: '',
        event_type: 'stage',
        start_date: '',
        end_date: '',
        location: '',
        description: '',
        club_id: '',
        max_attendees: undefined,
        registration_deadline: '',
        cover_image_url: '',
        price_cents: 0,
        active: true,
      });
      setImages([]);
      setSessions([]);
    }
    // Réinitialiser à la première étape quand on ouvre la modale
    if (isOpen) {
      setCurrentStep('info');
      setCompletedSteps(new Set());
    }
  }, [event, isOpen]);

  const loadEventImages = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const loadEventSessions = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  // Validation des étapes avec messages d'erreur
  const validateStep = (step: Step, showErrors = false): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 'info':
        if (!formData.title?.trim()) errors.title = 'Le titre est obligatoire';
        else if (formData.title.length > 100) errors.title = 'Le titre ne doit pas dépasser 100 caractères';
        if (!formData.event_type?.trim()) errors.event_type = 'Le type d\'événement est obligatoire';
        if (!formData.start_date?.trim()) errors.start_date = 'La date de début est obligatoire';
        if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
          errors.end_date = 'La date de fin doit être après la date de début';
        }
        break;
      case 'pricing':
        if (formData.price_cents === undefined || formData.price_cents < 0) {
          errors.price_cents = 'Le prix doit être un nombre positif ou zéro';
        }
        if (formData.max_attendees !== undefined && formData.max_attendees < 0) {
          errors.max_attendees = 'Le nombre de places doit être positif';
        }
        if (formData.registration_deadline && formData.start_date && new Date(formData.registration_deadline) > new Date(formData.start_date)) {
          errors.registration_deadline = 'La date limite d\'inscription doit être avant la date de début';
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
    const cleanedData = {
      ...formData,
      club_id: formData.club_id || undefined,
      registration_deadline: formData.registration_deadline || undefined,
      cover_image_url: formData.cover_image_url?.trim() || undefined,
      end_date: formData.end_date || undefined,
      max_attendees: formData.max_attendees || undefined,
      location: formData.location?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      // Ajouter les images et sessions pour le parent
      images: images.filter(img => img.image_url?.trim()),
      sessions: sessions.filter(s => s.session_date && s.start_time),
    };
    
    // @ts-ignore - images et sessions sont gérés séparément par le parent
    await onSubmit(cleanedData);
    
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
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value.slice(0, 100); // Limiter à 100 caractères
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, title, slug }));
    // Effacer l'erreur si elle existe
    if (validationErrors.title) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.title;
        return newErrors;
      });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const priceCents = value ? parseInt(value) * 100 : 0;
    setFormData(prev => ({ ...prev, price_cents: priceCents }));
    // Effacer l'erreur si elle existe
    if (validationErrors.price_cents) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.price_cents;
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
      title={event ? `Modifier l'Événement - ${event.title}` : 'Nouvel Événement'}
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
            {event && !isLastStep && (
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
                {event ? 'Mettre à jour' : 'Créer'}
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
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Remplissez les informations essentielles de l'événement. Les champs marqués d'un astérisque (*) sont obligatoires.</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Titre */}
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  maxLength={100}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.title
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="Ex: Stage d'été 2025"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(formData.title || '').length}/100 caractères
                </p>
                {showValidationErrors && validationErrors.title && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label htmlFor="event_type" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="event_type"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.event_type
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                >
                  <option value="stage">Stage</option>
                  <option value="competition">Compétition</option>
                  <option value="demonstration">Démonstration</option>
                  <option value="seminar">Séminaire</option>
                </select>
                {showValidationErrors && validationErrors.event_type && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.event_type}
                  </p>
                )}
              </div>

              {/* Club */}
              <div>
                <label htmlFor="club_id" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Club
                </label>
                <select
                  id="club_id"
                  name="club_id"
                  value={formData.club_id || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Tous les clubs</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name} - {club.city}</option>
                  ))}
                </select>
              </div>

              {/* Date de début */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Date de début <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date?.slice(0, 16) || ''}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.start_date
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                />
                {showValidationErrors && validationErrors.start_date && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.start_date}
                  </p>
                )}
              </div>

              {/* Date de fin */}
              <div>
                <label htmlFor="end_date" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Date de fin
                </label>
                <input
                  type="datetime-local"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date?.slice(0, 16) || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.end_date
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                />
                {showValidationErrors && validationErrors.end_date && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.end_date}
                  </p>
                )}
              </div>

              {/* Lieu */}
              <div className="sm:col-span-2">
                <label htmlFor="location" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: Dojo principal, 12 Rue de la République, Marseille"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Décrivez l'événement, le programme, les activités..."
                />
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
                <span>Ajoutez une image de couverture ou une affiche pour votre événement. Cette image sera affichée sur la page de l'événement et dans les listes.</span>
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
                Image de couverture / Affiche
              </label>
              <CoverImageUploader
                value={formData.cover_image_url || ''}
                onChange={(url) => {
                  setFormData(prev => ({
                    ...prev,
                    cover_image_url: url,
                  }));
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

        {/* Step 3: Galerie d'images */}
        {currentStep === 'images' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Images className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Ajoutez plusieurs images pour créer une galerie. Les images seront affichées dans un carousel sur la page de l'événement. Utilisez l'étoile pour définir l'image de couverture.</span>
              </p>
            </div>

            <ImagesEditor
              images={images}
              onChange={setImages}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Step 4: Sessions */}
        {currentStep === 'sessions' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Ajoutez plusieurs sessions si l'événement se déroule sur plusieurs jours ou avec des horaires différents.</span>
              </p>
            </div>

            <SessionsEditor
              sessions={sessions}
              onChange={setSessions}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Step 5: Tarifs & Places */}
        {currentStep === 'pricing' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Euro className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Configurez le prix de l'événement, le nombre maximum de places et la date limite d'inscription.</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Prix */}
              <div>
                <label htmlFor="price_cents" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Prix (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price_cents"
                  name="price_cents"
                  value={formData.price_cents ? formData.price_cents / 100 : 0}
                  onChange={handlePriceChange}
                  min="0"
                  step="1"
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.price_cents
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                />
                {showValidationErrors && validationErrors.price_cents && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.price_cents}
                  </p>
                )}
              </div>

              {/* Places max */}
              <div>
                <label htmlFor="max_attendees" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Places max
                </label>
                <input
                  type="number"
                  id="max_attendees"
                  name="max_attendees"
                  value={formData.max_attendees || ''}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.max_attendees
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="Illimité"
                />
                {showValidationErrors && validationErrors.max_attendees && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.max_attendees}
                  </p>
                )}
              </div>

              {/* Date limite d'inscription */}
              <div className="sm:col-span-2">
                <label htmlFor="registration_deadline" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Inscription jusqu'au
                </label>
                <input
                  type="datetime-local"
                  id="registration_deadline"
                  name="registration_deadline"
                  value={formData.registration_deadline?.slice(0, 16) || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.registration_deadline
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                />
                {showValidationErrors && validationErrors.registration_deadline && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.registration_deadline}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Statut */}
        {currentStep === 'status' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <ToggleLeft className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Définissez le statut d'activation de l'événement. Un événement actif sera visible sur le site.</span>
              </p>
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
                Événement actif (l'événement sera visible sur le site si cette case est cochée)
              </label>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
