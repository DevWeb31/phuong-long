/**
 * UserFormModal Component - Version avec étapes
 * 
 * Modal pour modifier un utilisateur avec navigation par étapes
 * Note: Ne permet PAS de modifier nom, email ou mot de passe
 * 
 * @version 2.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect, Fragment } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';
import { 
  Info, 
  Shield, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  ToggleLeft
} from 'lucide-react';

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  club: string | null;
  club_city?: string | null;
  favorite_club_id?: string | null;
  user_roles?: Array<{
    role_id: string;
    role_name: string;
    club_id: string | null;
    club_name: string | null;
  }>;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  level: number;
}

interface Club {
  id: string;
  name: string;
  city: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    role_id: string | null;
    club_id: string | null;
    username?: string;
    bio?: string;
    avatar_url?: string;
  }) => Promise<void>;
  user: User | null;
  clubs?: Club[];
  isLoading?: boolean;
}

type Step = 'info' | 'role' | 'club' | 'status';

interface StepConfig {
  id: Step;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: 'info', label: 'Informations', icon: <Info className="w-4 h-4" /> },
  { id: 'role', label: 'Rôle', icon: <Shield className="w-4 h-4" /> },
  { id: 'club', label: 'Club', icon: <Building2 className="w-4 h-4" /> },
  { id: 'status', label: 'Statut', icon: <ToggleLeft className="w-4 h-4" /> },
];

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  clubs = [],
  isLoading = false,
}: UserFormModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<{
    role_id: string;
    club_id: string;
  }>({
    role_id: '',
    club_id: '',
  });
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
      // Réinitialiser à la première étape quand on ouvre la modale
      setCurrentStep('info');
      setCompletedSteps(new Set());
      setShowValidationErrors(false);
      setValidationErrors({});
    }
  }, [isOpen]);

  // Initialiser les données du formulaire quand l'utilisateur change ou quand les rôles sont chargés
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    
    if (!user) {
      setFormData({
        role_id: '',
        club_id: '',
      });
      return;
    }
    
    // Si les rôles sont déjà chargés et les clubs sont disponibles, initialiser immédiatement
    if (roles.length > 0 && !loadingRoles && clubs.length > 0) {
      initializeFormData(user, roles);
    }
    // Sinon, l'initialisation se fera dans loadRoles après le chargement
  }, [user, roles, loadingRoles, isOpen, clubs]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        // Exclure le rôle "developer"
        const filteredRoles = data.filter((r: Role) => r.name !== 'developer');
        setRoles(filteredRoles);
        
        // Initialiser les données du formulaire après le chargement des rôles
        // (les clubs doivent déjà être chargés depuis la page parente)
        if (user && clubs.length > 0) {
          initializeFormData(user, filteredRoles);
        }
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const initializeFormData = (currentUser: User, availableRoles: Role[]) => {
    const primaryRole = currentUser.user_roles?.[0];
    
    // Priorité 1: favorite_club_id (peut venir de user_profiles ou club_membership_requests)
    // Priorité 2: club_id du rôle (user_roles)
    // Priorité 3: chercher par nom de club
    let clubId = currentUser.favorite_club_id || primaryRole?.club_id || '';
    
    console.log('[UserFormModal] Initialisation formData:', {
      favorite_club_id: currentUser.favorite_club_id,
      role_club_id: primaryRole?.club_id,
      club_name: currentUser.club,
      club_city: currentUser.club_city,
      initial_clubId: clubId,
    });
    
    // Si on n'a pas de club_id mais qu'on a un nom de club, chercher le club correspondant
    if (!clubId && (currentUser.club || currentUser.club_city) && clubs.length > 0) {
      // Le champ "club" peut contenir le nom de la ville ou "Nom - Ville"
      const clubCity = currentUser.club_city || currentUser.club;
      const clubParts = (currentUser.club || '').split(' - ');
      const clubName = clubParts[0];
      
      console.log('[UserFormModal] Recherche du club par nom/ville:', {
        clubCity,
        clubName,
        club: currentUser.club,
      });
      
      // Chercher par ville d'abord (plus fiable)
      let foundClub = clubs.find(c => c.city === clubCity);
      
      // Si pas trouvé par ville, chercher par nom
      if (!foundClub && clubName) {
        foundClub = clubs.find(c => c.name === clubName);
      }
      
      // Si toujours pas trouvé, chercher par format complet "Nom - Ville"
      if (!foundClub && currentUser.club) {
        foundClub = clubs.find(c => `${c.name} - ${c.city}` === currentUser.club);
      }
      
      if (foundClub) {
        clubId = foundClub.id;
        console.log('[UserFormModal] Club trouvé:', foundClub);
      } else {
        console.warn('[UserFormModal] Club not found:', {
          clubName: currentUser.club,
          clubCity: currentUser.club_city,
          favorite_club_id: currentUser.favorite_club_id,
          role_club_id: primaryRole?.club_id,
          availableClubs: clubs.map(c => ({ id: c.id, name: c.name, city: c.city })),
        });
      }
    }
    
    // Vérifier que le role_id existe dans la liste des rôles
    let validRoleId = '';
    
    // Si on a un role_id depuis user_roles, l'utiliser
    if (primaryRole?.role_id) {
      const roleExists = availableRoles.some(r => r.id === primaryRole.role_id);
      if (roleExists) {
        validRoleId = primaryRole.role_id;
      }
    } 
    // Sinon, si on a un primary_role (nom du rôle), chercher le role_id correspondant
    else if (currentUser.role) {
      const roleByName = availableRoles.find(r => r.name === currentUser.role);
      if (roleByName) {
        validRoleId = roleByName.id;
      }
    }
    
    setFormData({
      role_id: validRoleId,
      club_id: clubId,
    });
  };

  // Validation des étapes avec messages d'erreur
  const validateStep = (step: Step, showErrors = false): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 'role':
        if (!formData.role_id?.trim()) {
          errors.role_id = 'Le rôle est obligatoire';
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
    const roleValidation = validateStep('role', true);
    if (!roleValidation.isValid) {
      setCurrentStep('role');
      setShowValidationErrors(true);
      const form = document.querySelector('form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
      return;
    }

    // Normaliser les valeurs : convertir les chaînes vides en null
    const normalizedClubId = formData.club_id && formData.club_id.trim() !== '' ? formData.club_id : null;
    const normalizedRoleId = formData.role_id && formData.role_id.trim() !== '' ? formData.role_id : null;
    
    console.log('[UserFormModal] Données avant soumission:', {
      formData_club_id: formData.club_id,
      formData_role_id: formData.role_id,
      normalized_club_id: normalizedClubId,
      normalized_role_id: normalizedRoleId,
    });
    
    await onSubmit({
      role_id: normalizedRoleId,
      club_id: normalizedClubId,
    });
  };

  const handleSubmitAndClose = async () => {
    await handleSubmit();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log('[UserFormModal] handleChange:', { name, value, type: typeof value });
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      console.log('[UserFormModal] Nouveau formData:', newData);
      return newData;
    });
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `Modifier l'Utilisateur - ${user.full_name || user.email}` : 'Nouvel Utilisateur'}
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
            {user && !isLastStep && (
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
                {user ? 'Mettre à jour' : 'Créer'}
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
        {/* Step 1: Informations (non modifiables) */}
        {currentStep === 'info' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Informations de base de l'utilisateur. Ces champs ne peuvent pas être modifiés depuis cette interface.</span>
              </p>
            </div>

            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={user?.full_name || 'N/A'}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Non modifiable
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Non modifiable
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Rôle */}
        {currentStep === 'role' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Sélectionnez le rôle de l'utilisateur. Le rôle détermine les permissions et l'accès aux fonctionnalités de la plateforme.</span>
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

            <div>
              <label htmlFor="role_id" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Rôle <span className="text-red-500">*</span>
              </label>
              {loadingRoles ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                  Chargement des rôles...
                </div>
              ) : (
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.role_id
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                >
                  <option value="">Sélectionner un rôle</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.description && `- ${role.description}`}
                    </option>
                  ))}
                </select>
              )}
              {showValidationErrors && validationErrors.role_id && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.role_id}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Club */}
        {currentStep === 'club' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Associez l'utilisateur à un club spécifique. Ce champ est optionnel et dépend du rôle sélectionné.</span>
              </p>
            </div>

            <div>
              <label htmlFor="club_id" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Club
              </label>
              <select
                id="club_id"
                name="club_id"
                value={formData.club_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Aucun club</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name} - {club.city}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Optionnel. Laissez vide si le rôle n'est pas lié à un club spécifique.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Statut */}
        {currentStep === 'status' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <ToggleLeft className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Résumé des modifications apportées à l'utilisateur. Cliquez sur "Mettre à jour" pour enregistrer les changements.</span>
              </p>
            </div>

            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Rôle sélectionné</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formData.role_id ? (
                      roles.find(r => r.id === formData.role_id)?.name || 'N/A'
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">Aucun</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Club associé</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formData.club_id ? (
                      clubs.find(c => c.id === formData.club_id)?.name || 'N/A'
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">Aucun</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
