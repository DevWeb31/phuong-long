/**
 * CoachFormModal Component
 * 
 * Modal multi-étapes pour créer/éditer un coach/instructeur
 * 
 * @version 2.0
 * @date 2025-11-18
 */

'use client';

import { useState, useEffect, Fragment } from 'react';
import { Modal } from './Modal';
import { Button, Badge } from '@/components/common';
import { ImageCropper } from './ImageCropper';
import { User as UserIcon, Image as ImageIcon, FileText, CheckCircle, CheckCircle2, Info, AlertCircle, XCircle, Plus, X } from 'lucide-react';

export interface Coach {
  id?: string;
  name: string;
  bio?: string | null;
  photo_url?: string | null;
  specialties?: string[] | null;
  years_experience: number;
  active: boolean;
  club_id?: string | null;
}

interface Club {
  id: string;
  name: string;
  city: string;
}

interface CoachFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coach: Partial<Coach>) => Promise<void>;
  coach?: Coach | null;
  isLoading?: boolean;
}

type Step = 'info' | 'photo' | 'bio' | 'status';

interface StepConfig {
  id: Step;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: 'info', label: 'Informations', icon: <UserIcon className="w-4 h-4" /> },
  { id: 'photo', label: 'Photo', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'bio', label: 'Biographie & Spécialités', icon: <FileText className="w-4 h-4" /> },
  { id: 'status', label: 'Statut', icon: <CheckCircle className="w-4 h-4" /> },
];

export function CoachFormModal({ isOpen, onClose, onSubmit, coach, isLoading = false }: CoachFormModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [formData, setFormData] = useState<Partial<Coach>>({
    name: '',
    bio: '',
    photo_url: '',
    specialties: [],
    years_experience: 0,
    active: true,
    club_id: null,
  });

  // Charger les clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        }
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
      }
    };
    
    if (isOpen) {
      fetchClubs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (coach) {
      setFormData({
        ...coach,
        specialties: coach.specialties || [],
      });
      
      // Parser le nom complet en prénom et nom
      if (coach.name) {
        const nameParts = coach.name.trim().split(/\s+/);
        if (nameParts.length > 1) {
          setFirstName(nameParts.slice(0, -1).join(' '));
          setLastName(nameParts[nameParts.length - 1] || '');
        } else {
          setFirstName(nameParts[0] || '');
          setLastName('');
        }
      } else {
        setFirstName('');
        setLastName('');
      }
    } else {
      setFormData({
        name: '',
        bio: '',
        photo_url: '',
        specialties: [],
        years_experience: 0,
        active: true,
        club_id: null,
      });
      setFirstName('');
      setLastName('');
    }
    // Réinitialiser à la première étape quand on ouvre la modale
    if (isOpen) {
      setCurrentStep('info');
      setCompletedSteps(new Set());
      setValidationErrors({});
      setShowValidationErrors(false);
    }
  }, [coach, isOpen]);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const validateStep = (step: Step, showErrors = false): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 'info':
        if (!firstName || firstName.trim() === '') {
          errors.firstName = 'Le prénom est obligatoire';
        }
        if (!lastName || lastName.trim() === '') {
          errors.lastName = 'Le nom est obligatoire';
        }
        if (!formData.years_experience || formData.years_experience < 0) {
          errors.years_experience = 'Les années d\'expérience doivent être supérieures ou égales à 0';
        }
        break;
      case 'photo':
        // Photo est optionnelle, pas de validation
        break;
      case 'bio':
        // Bio et spécialités sont optionnels, pas de validation
        break;
      case 'status':
        // Statut a toujours une valeur par défaut, pas de validation
        break;
    }
    
    if (showErrors) {
      setValidationErrors(errors);
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleStepChange = (step: Step) => {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const validation = validateStep(currentStep, true);
    if (!validation.isValid) {
      setShowValidationErrors(true);
      const form = document.querySelector('form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
      return;
    }

    // Valider toutes les étapes avant de soumettre
    for (const step of STEPS) {
      const stepValidation = validateStep(step.id);
      if (!stepValidation.isValid) {
        setCurrentStep(step.id);
        setShowValidationErrors(true);
        setValidationErrors(stepValidation.errors);
        return;
      }
    }

    // Préparer les données à envoyer
    // Combiner prénom et nom en un seul champ name
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    const dataToSend: Partial<Coach> = {
      name: fullName,
      bio: formData.bio && formData.bio.trim() !== '' ? formData.bio : null,
      photo_url: formData.photo_url && formData.photo_url.trim() !== '' ? formData.photo_url : null,
      specialties: formData.specialties || [],
      years_experience: formData.years_experience || 0,
      active: formData.active ?? true,
      club_id: formData.club_id || null,
    };

    await onSubmit(dataToSend);
  };

  const handleSubmitAndClose = async () => {
    await handleSubmit();
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

  const addSpecialty = () => {
    if (newSpecialty.trim() && (formData.specialties || []).length < 3) {
      setFormData(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty.trim().slice(0, 30)],
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: (prev.specialties || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coach ? `Modifier le Coach - ${firstName && lastName ? `${firstName} ${lastName}` : coach.name}` : 'Nouveau Coach'}
      size="lg"
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
            {coach && !isLastStep && (
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
                {coach ? 'Mettre à jour' : 'Créer'}
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
        {/* Step 1: Informations */}
        {currentStep === 'info' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Remplissez les informations essentielles du coach. Les champs marqués d'un astérisque (*) sont obligatoires.</span>
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
              {/* Prénom */}
              <div>
                <label htmlFor="firstName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setFirstName(value);
                    }
                  }}
                  required
                  maxLength={50}
                  className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Maître Nguyen"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {firstName.length}/50 caractères
                </p>
                {showValidationErrors && validationErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.firstName}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setLastName(value);
                    }
                  }}
                  required
                  maxLength={50}
                  className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Van"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {lastName.length}/50 caractères
                </p>
                {showValidationErrors && validationErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.lastName}
                  </p>
                )}
              </div>

              {/* Club */}
              <div>
                <label htmlFor="club_id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Club
                </label>
                <select
                  id="club_id"
                  name="club_id"
                  value={formData.club_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, club_id: e.target.value || null }))}
                  className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                >
                  <option value="">-- Tous les clubs --</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name} ({club.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Années d'expérience */}
              <div>
                <label htmlFor="years_experience" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Années d'expérience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="years_experience"
                  name="years_experience"
                  value={formData.years_experience || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value, 10) || 0 }))}
                  required
                  min="0"
                  className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="15"
                />
                {showValidationErrors && validationErrors.years_experience && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.years_experience}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Photo */}
        {currentStep === 'photo' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <ImageIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Ajoutez une photo du professeur. Cette photo sera affichée sur la page du club et dans les listes.</span>
              </p>
            </div>

            <ImageCropper
              key={`${isOpen ? (coach?.id ?? 'new') : 'closed'}`}
              value={formData.photo_url || ''}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, photo_url: url }));
              }}
              circular={true}
              bucket="coaches"
              imageType="avatar"
            />
          </div>
        )}

        {/* Step 3: Biographie & Spécialités */}
        {currentStep === 'bio' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Ajoutez une biographie et les spécialités du professeur pour enrichir son profil.</span>
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Biographie
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 120) {
                    setFormData(prev => ({ ...prev, bio: value }));
                  }
                }}
                rows={4}
                maxLength={120}
                className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Parcours, expérience, philosophie..."
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${
                  (formData.bio || '').length >= 100 
                    ? 'text-amber-500' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {(formData.bio || '').length} / 120 caractères
                </span>
              </div>
            </div>

            {/* Spécialités */}
            <div className="border-t dark:border-slate-700 pt-6">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Spécialités
              </label>
              
              {/* Spécialités existantes */}
              {(formData.specialties || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {(formData.specialties || []).map((specialty, index) => (
                    <Badge
                      key={index}
                      className="bg-secondary/20 text-secondary-dark border-secondary/30 flex items-center gap-1.5"
                    >
                      <span>{specialty}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecialty(index)}
                        className="hover:scale-125 transition-transform"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Ajouter une spécialité */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 30) {
                        setNewSpecialty(value);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                    placeholder="Ex: Combat, Armes, Kata..."
                    maxLength={30}
                    disabled={(formData.specialties || []).length >= 3}
                    className="w-full px-3 py-2 text-sm border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {newSpecialty.length}/30 caractères
                    </p>
                    {(formData.specialties || []).length >= 3 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Maximum 3 spécialités atteint
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={addSpecialty}
                  disabled={!newSpecialty.trim() || (formData.specialties || []).length >= 3}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Appuyez sur Entrée ou cliquez sur + pour ajouter (maximum 3 spécialités)
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Statut */}
        {currentStep === 'status' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Définissez le statut du coach. Un coach actif sera visible sur le site.</span>
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active ?? true}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                className="w-5 h-5 text-primary border-slate-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Coach actif (visible sur le site)
              </label>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
