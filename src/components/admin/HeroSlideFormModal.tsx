/**
 * HeroSlideFormModal Component - Version avec étapes
 * 
 * Modal pour créer/éditer un slide du carousel hero avec navigation par étapes
 * 
 * @version 2.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect, Fragment } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';
import { 
  FileText, 
  Video, 
  MousePointerClick, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  XCircle
} from 'lucide-react';
import type { HeroSlide } from '@/components/marketing/HeroCarousel';

interface HeroSlideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slide: Partial<HeroSlide>) => Promise<void>;
  slide?: HeroSlide | null;
  isLoading?: boolean;
}

type Step = 'content' | 'video' | 'cta' | 'settings';

interface StepConfig {
  id: Step;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: 'content', label: 'Contenu', icon: <FileText className="w-4 h-4" /> },
  { id: 'video', label: 'Vidéo', icon: <Video className="w-4 h-4" /> },
  { id: 'cta', label: 'Bouton CTA', icon: <MousePointerClick className="w-4 h-4" /> },
  { id: 'settings', label: 'Paramètres', icon: <Settings className="w-4 h-4" /> },
];

export function HeroSlideFormModal({ isOpen, onClose, onSubmit, slide, isLoading = false }: HeroSlideFormModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('content');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    description: '',
    youtube_video_id: '',
    cta_text: '',
    cta_link: '',
    overlay_opacity: 0.5,
    active: true,
    display_order: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (slide && slide.id) {
        setFormData({
          ...slide,
        });
      } else {
        setFormData({
          title: '',
          subtitle: '',
          description: '',
          youtube_video_id: '',
          cta_text: '',
          cta_link: '',
          overlay_opacity: 0.5,
          active: true,
          display_order: 0,
        });
      }
    }
    // Réinitialiser à la première étape quand on ouvre la modale
    if (isOpen) {
      setCurrentStep('content');
      setCompletedSteps(new Set());
    }
  }, [slide, isOpen]);

  // Validation des étapes avec messages d'erreur
  const validateStep = (step: Step, showErrors = false): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 'content':
        if (!formData.title?.trim()) {
          errors.title = 'Le titre est obligatoire';
        }
        break;
      case 'video':
        if (!formData.youtube_video_id?.trim()) {
          errors.youtube_video_id = 'L\'ID de la vidéo YouTube est obligatoire';
        } else if (formData.youtube_video_id.length !== 11 && !formData.youtube_video_id.includes('youtube.com') && !formData.youtube_video_id.includes('youtu.be')) {
          errors.youtube_video_id = 'Format d\'ID YouTube invalide';
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
    const contentValidation = validateStep('content', true);
    const videoValidation = validateStep('video', true);
    if (!contentValidation.isValid || !videoValidation.isValid) {
      if (!contentValidation.isValid) setCurrentStep('content');
      else if (!videoValidation.isValid) setCurrentStep('video');
      setShowValidationErrors(true);
      const form = document.querySelector('form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
      return;
    }

    await onSubmit(formData);
  };

  const handleSubmitAndClose = async () => {
    await handleSubmit();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (name === 'display_order' || name === 'overlay_opacity') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
      return;
    }
    
    if (name === 'active') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Extraire l'ID YouTube depuis une URL complète pour l'affichage
  const extractYouTubeId = (input: string): string => {
    if (!input) return '';
    
    // Si c'est déjà un ID simple (11 caractères, pas d'espaces)
    if (input.length === 11 && !input.includes(' ') && !input.includes('youtube.com') && !input.includes('youtu.be')) {
      return input;
    }
    
    // Extraire depuis une URL complète
    let id = input;
    if (input.includes('youtube.com/watch?v=')) {
      id = input.split('v=')[1]?.split('&')[0] || input;
    } else if (input.includes('youtu.be/')) {
      id = input.split('youtu.be/')[1]?.split('?')[0] || input;
    } else if (input.includes('youtube.com/embed/')) {
      id = input.split('embed/')[1]?.split('?')[0] || input;
    }
    
    return id;
  };

  const handleYouTubeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const extractedId = extractYouTubeId(e.target.value);
    setFormData(prev => ({
      ...prev,
      youtube_video_id: extractedId,
    }));
    // Effacer l'erreur si elle existe
    if (validationErrors.youtube_video_id) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.youtube_video_id;
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
      title={slide ? `Modifier le Slide - ${slide.title}` : 'Nouveau Slide'}
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
            {slide && !isLastStep && (
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
                {slide ? 'Mettre à jour' : 'Créer'}
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
        {/* Step 1: Contenu */}
        {currentStep === 'content' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Remplissez le contenu textuel du slide. Le titre est obligatoire, les autres champs sont optionnels.</span>
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

            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  showValidationErrors && validationErrors.title
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                    : 'dark:border-gray-700'
                }`}
                placeholder="Phuong Long Vo Dao"
              />
              {showValidationErrors && validationErrors.title && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Sous-titre */}
            <div>
              <label htmlFor="subtitle" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Sous-titre / Badge
              </label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Cours d'essai gratuit"
              />
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
                rows={3}
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="L'art martial vietnamien traditionnel"
              />
            </div>
          </div>
        )}

        {/* Step 2: Vidéo */}
        {currentStep === 'video' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Video className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Ajoutez l'ID de la vidéo YouTube qui sera utilisée comme arrière-plan du slide. Vous pouvez coller l'URL complète ou juste l'ID.</span>
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

            {/* YouTube Video ID */}
            <div>
              <label htmlFor="youtube_video_id" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                ID Vidéo YouTube <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="youtube_video_id"
                name="youtube_video_id"
                value={formData.youtube_video_id}
                onChange={handleYouTubeIdChange}
                required
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  showValidationErrors && validationErrors.youtube_video_id
                    ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                    : 'dark:border-gray-700'
                }`}
                placeholder="dQw4w9WgXcQ ou https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vous pouvez coller l'URL complète ou juste l'ID de la vidéo
              </p>
              {showValidationErrors && validationErrors.youtube_video_id && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.youtube_video_id}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Bouton CTA */}
        {currentStep === 'cta' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <MousePointerClick className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Configurez le bouton d'appel à l'action (CTA) qui apparaîtra sur le slide. Ces champs sont optionnels.</span>
              </p>
            </div>

            {/* CTA Text */}
            <div>
              <label htmlFor="cta_text" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Texte du bouton CTA
              </label>
              <input
                type="text"
                id="cta_text"
                name="cta_text"
                value={formData.cta_text || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Trouver un Club"
              />
            </div>

            {/* CTA Link */}
            <div>
              <label htmlFor="cta_link" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Lien du bouton CTA
              </label>
              <input
                type="text"
                id="cta_link"
                name="cta_link"
                value={formData.cta_link || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="/clubs"
              />
            </div>
          </div>
        )}

        {/* Step 4: Paramètres */}
        {currentStep === 'settings' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Settings className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Configurez les paramètres d'affichage du slide : opacité de l'overlay, ordre d'affichage et statut d'activation.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Overlay Opacity */}
              <div>
                <label htmlFor="overlay_opacity" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Opacité de l'overlay ({Math.round((formData.overlay_opacity || 0) * 100)}%)
                </label>
                <input
                  type="range"
                  id="overlay_opacity"
                  name="overlay_opacity"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.overlay_opacity || 0.5}
                  onChange={handleChange}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Contrôle la visibilité du texte sur la vidéo
                </p>
              </div>

              {/* Display Order */}
              <div>
                <label htmlFor="display_order" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Plus petit = affiché en premier
                </p>
              </div>
            </div>

            {/* Actif */}
            <div className="flex items-center gap-3 border-t dark:border-gray-700 pt-6">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active ?? true}
                onChange={handleChange}
                className="w-5 h-5 text-primary border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-semibold dark:text-gray-300">
                Slide actif (le slide sera visible sur le site si cette case est cochée)
              </label>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
