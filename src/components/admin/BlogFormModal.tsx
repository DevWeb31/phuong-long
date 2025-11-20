/**
 * BlogFormModal Component - Version avec étapes
 * 
 * Modal pour créer/éditer un article de blog avec navigation par étapes
 * 
 * @version 3.0
 * @date 2025-11-05
 */

'use client';

import React, { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';
import { CoverImageUploader } from './CoverImageUploader';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CalendarIcon,
  ClockIcon,
  TagIcon,
  LinkIcon,
  PhotoIcon,
  ListBulletIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { 
  Info, 
  Image as ImageIcon, 
  Tag as TagIconLucide, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  ToggleLeft
} from 'lucide-react';
import { BlogTableOfContents } from '@/components/blog/BlogTableOfContents';
import { BlogArticleContent } from '@/components/blog/BlogArticleContent';

export interface BlogPost {
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  cover_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  author_id?: string;
  published_at?: string;
  reading_time_minutes?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
}

interface BlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<BlogPost>) => Promise<void>;
  post?: BlogPost | null;
  isLoading?: boolean;
}

type Step = 'info' | 'cover' | 'tags' | 'content' | 'seo' | 'publish';

interface StepConfig {
  id: Step;
  label: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  { id: 'info', label: 'Informations', icon: <Info className="w-4 h-4" /> },
  { id: 'cover', label: 'Image de couverture', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'tags', label: 'Tags', icon: <TagIconLucide className="w-4 h-4" /> },
  { id: 'content', label: 'Contenu', icon: <FileText className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },
  { id: 'publish', label: 'Publication', icon: <ToggleLeft className="w-4 h-4" /> },
];

// Fonction pour calculer le temps de lecture (mots/minute)
function calculateReadingTime(content: string): number {
  if (!content) return 0;
  
  // Compter les mots (supprimer HTML tags pour compter uniquement le texte)
  const textContent = content.replace(/<[^>]*>/g, ' ').trim();
  const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
  
  // Vitesse de lecture moyenne : 200 mots/minute
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readingTime); // Minimum 1 minute
}

// Fonction pour convertir Markdown en HTML (version améliorée)
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Si le contenu contient déjà des balises HTML, le retourner tel quel
  // (cas des articles existants déjà en HTML)
  if (markdown.includes('<') && markdown.match(/<[^>]+>/)) {
    return markdown;
  }
  
  let html = markdown;
  
  // Code blocks (doit être fait avant les autres transformations)
  html = html.replace(/```([\w]*)\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>');
  
  // Headers (doit être fait avant les autres transformations)
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  // Lists (unordered)
  const lines = html.split('\n');
  let inList = false;
  let listItems: string[] = [];
  const processedLines: string[] = [];
  
  lines.forEach((line, _index) => {
    const listMatch = line.match(/^[\*\-\+] (.+)$/);
    if (listMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(`<li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        processedLines.push(`<ul>${listItems.join('\n')}</ul>`);
        listItems = [];
        inList = false;
      }
      processedLines.push(line);
    }
  });
  
  if (inList && listItems.length > 0) {
    processedLines.push(`<ul>${listItems.join('\n')}</ul>`);
  }
  
  html = processedLines.join('\n');
  
  // Ordered lists
  html = html.replace(/^(\d+)\. (.+)$/gim, '<li>$2</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/gim, (match) => {
    if (!match.includes('<ul>')) {
      return `<ol>${match}</ol>`;
    }
    return match;
  });
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*([^*]+)\*/gim, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/gim, '<em>$1</em>');
  
  // Inline code (après les autres transformations)
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // Paragraphs (pour les lignes qui ne sont pas déjà des balises)
  html = html.split('\n\n').map(para => {
    const trimmed = para.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return trimmed;
    return `<p>${trimmed}</p>`;
  }).filter(Boolean).join('\n');
  
  // Line breaks dans les paragraphes
  html = html.replace(/\n/gim, '<br>');
  
  return html;
}

export function BlogFormModal({ isOpen, onClose, onSubmit, post, isLoading = false }: BlogFormModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image_url: '',
    status: 'draft',
    tags: [],
    published_at: '',
    reading_time_minutes: null,
    seo_title: '',
    seo_description: '',
  });
  
  const [tagsInput, setTagsInput] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Charger les tags existants depuis l'API
  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/blog/tags')
        .then(res => res.json())
        .then(data => setAvailableTags(data || []))
        .catch(() => setAvailableTags([]));
    }
  }, [isOpen]);

  // Initialiser le formulaire
  useEffect(() => {
    if (post) {
      const publishedDate = post.published_at 
        ? new Date(post.published_at).toISOString().split('T')[0]
        : '';
      
      setFormData({
        ...post,
        published_at: publishedDate,
      });
      setTagsInput(post.tags?.join(', ') || '');
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        cover_image_url: '',
        status: 'draft',
        tags: [],
        published_at: '',
        reading_time_minutes: null,
        seo_title: '',
        seo_description: '',
      });
      setTagsInput('');
    }
    setActiveTab('edit');
    // Réinitialiser à la première étape quand on ouvre la modale
    if (isOpen) {
      setCurrentStep('info');
      setCompletedSteps(new Set());
    }
  }, [post, isOpen]);

  // Calculer le temps de lecture automatiquement
  const readingTime = useMemo(() => {
    if (!formData.content) return 0;
    return calculateReadingTime(formData.content);
  }, [formData.content]);

  // Mettre à jour le temps de lecture dans formData
  useEffect(() => {
    if (formData.content && readingTime > 0) {
      setFormData(prev => ({ ...prev, reading_time_minutes: readingTime }));
    }
  }, [readingTime, formData.content]);

  // Fermer la modale de prévisualisation avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreviewModal) {
        setShowPreviewModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showPreviewModal]);

  // Générer le HTML pour la prévisualisation
  const previewHtml = useMemo(() => {
    if (!formData.content) return '';
    return markdownToHtml(formData.content);
  }, [formData.content]);

  // Gérer les suggestions de tags
  useEffect(() => {
    if (tagsInput.trim()) {
      const inputTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const lastTag = inputTags[inputTags.length - 1] || '';
      
      if (lastTag.length > 0) {
        const suggestions = availableTags
          .filter(tag => 
            tag.toLowerCase().includes(lastTag.toLowerCase()) &&
            !inputTags.includes(tag)
          )
          .slice(0, 5);
        setTagSuggestions(suggestions);
        setShowTagSuggestions(suggestions.length > 0);
      } else {
        setShowTagSuggestions(false);
      }
    } else {
      setShowTagSuggestions(false);
    }
  }, [tagsInput, availableTags]);

  // Validation des étapes avec messages d'erreur
  const validateStep = (step: Step, showErrors = false): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 'info':
        if (!formData.title?.trim()) errors.title = 'Le titre est obligatoire';
        else if (formData.title.length > 200) errors.title = 'Le titre ne doit pas dépasser 200 caractères';
        if (!formData.slug?.trim()) errors.slug = 'Le slug est obligatoire';
        else if (!/^[a-z0-9-]+$/.test(formData.slug)) errors.slug = 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets';
        if (formData.excerpt && formData.excerpt.length > 300) {
          errors.excerpt = 'L\'extrait ne doit pas dépasser 300 caractères';
        }
        break;
      case 'content':
        if (!formData.content?.trim()) errors.content = 'Le contenu est obligatoire';
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
    const contentValidation = validateStep('content', true);
    if (!infoValidation.isValid || !contentValidation.isValid) {
      if (!infoValidation.isValid) setCurrentStep('info');
      else if (!contentValidation.isValid) setCurrentStep('content');
      setShowValidationErrors(true);
      const form = document.querySelector('form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
      return;
    }

    // Convertir les tags
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    // Formater la date de publication
    let publishedAt: string | undefined = undefined;
    if (formData.published_at) {
      const date = new Date(formData.published_at);
      if (formData.status === 'published' && !isNaN(date.getTime())) {
        publishedAt = date.toISOString();
      }
    } else if (formData.status === 'published') {
      // Si publié sans date, utiliser la date actuelle
      publishedAt = new Date().toISOString();
    }

    // Convertir le contenu Markdown en HTML avant l'envoi
    const htmlContent = formData.content ? markdownToHtml(formData.content) : '';

    await onSubmit({ 
      ...formData, 
      content: htmlContent, // Envoyer le HTML converti
      tags,
      published_at: publishedAt,
      reading_time_minutes: readingTime || formData.reading_time_minutes,
    });
    
    // Mettre à jour l'URL originale après la sauvegarde
  };

  const handleSubmitAndClose = async () => {
    await handleSubmit();
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value.slice(0, 200); // Limiter à 200 caractères
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, title, slug }));
    // Effacer l'erreur si elle existe
    if (validationErrors.title || validationErrors.slug) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.title;
        delete newErrors.slug;
        return newErrors;
      });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, slug }));
    // Effacer l'erreur si elle existe
    if (validationErrors.slug) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.slug;
        return newErrors;
      });
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  const handleTagSuggestionClick = (tag: string) => {
    const currentTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const lastTagIndex = tagsInput.lastIndexOf(currentTags[currentTags.length - 1] || '');
    
    if (lastTagIndex >= 0) {
      const before = tagsInput.substring(0, lastTagIndex);
      const after = tagsInput.substring(lastTagIndex + (currentTags[currentTags.length - 1]?.length || 0));
      setTagsInput(`${before}${tag}${after ? ', ' + after : ''}`);
    } else {
      setTagsInput(tagsInput ? `${tagsInput}, ${tag}` : tag);
    }
    setShowTagSuggestions(false);
  };

  // Fonctions pour insérer du Markdown dans le textarea
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content || '';
    const selectedText = text.substring(start, end);
    const replacement = selectedText || placeholder;

    const newText = 
      text.substring(0, start) + 
      before + replacement + after + 
      text.substring(end);

    setFormData(prev => ({ ...prev, content: newText }));

    // Repositionner le curseur
    setTimeout(() => {
      const newPosition = start + before.length + replacement.length + after.length;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertMarkdownBlock = (markdown: string, newLineBefore: boolean = true, newLineAfter: boolean = true) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = formData.content || '';
    const beforeText = text.substring(0, start);
    const afterText = text.substring(start);
    
    const newLine = '\n';
    const prefix = newLineBefore && !beforeText.endsWith('\n') ? newLine : '';
    const suffix = newLineAfter ? newLine : '';

    const newText = beforeText + prefix + markdown + suffix + afterText;
    setFormData(prev => ({ ...prev, content: newText }));

    // Repositionner le curseur après le bloc inséré
    setTimeout(() => {
      const newPosition = start + prefix.length + markdown.length + suffix.length;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post ? `Modifier l'Article - ${post.title}` : 'Nouvel Article'}
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
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {readingTime > 0 && (
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4" />
                  <span>{readingTime} min</span>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose} 
              disabled={isLoading}
              className="flex-1 sm:flex-initial text-gray-900 dark:text-gray-100"
            >
              Annuler
            </Button>
            {/* Bouton "Mettre à jour et fermer" uniquement en mode modification et pas sur la dernière étape */}
            {post && !isLastStep && (
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
                {post ? 'Mettre à jour' : 'Créer'}
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
                <span>Remplissez les informations essentielles de l'article. Les champs marqués d'un astérisque (*) sont obligatoires.</span>
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
                  maxLength={200}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.title
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="Titre de l'article"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(formData.title || '').length}/200 caractères
                </p>
                {showValidationErrors && validationErrors.title && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.title}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="sm:col-span-2">
                <label htmlFor="slug" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleSlugChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.slug
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="titre-de-l-article"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  /blog/{formData.slug || 'titre-de-l-article'}
                </p>
                {showValidationErrors && validationErrors.slug && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.slug}
                  </p>
                )}
              </div>

              {/* Extrait */}
              <div className="sm:col-span-2">
                <label htmlFor="excerpt" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Extrait (résumé)
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt || ''}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                    showValidationErrors && validationErrors.excerpt
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
                      : 'dark:border-gray-700'
                  }`}
                  placeholder="Résumé court de l'article (max 300 caractères)"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {(formData.excerpt || '').length}/300 caractères
                </p>
                {showValidationErrors && validationErrors.excerpt && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.excerpt}
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
                <span>Ajoutez une image de couverture pour votre article. Cette image sera affichée sur la page de l'article et dans les listes.</span>
              </p>
            </div>

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
                }}
                error={showValidationErrors ? validationErrors.cover_image_url : undefined}
              />
            </div>
          </div>
        )}

        {/* Step 3: Tags */}
        {currentStep === 'tags' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <TagIconLucide className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Ajoutez des tags pour catégoriser votre article. Les tags permettent aux lecteurs de trouver facilement vos articles.</span>
              </p>
            </div>

            <div className="relative">
              <label htmlFor="tags" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                <TagIcon className="w-4 h-4 inline mr-1" />
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                id="tags"
                value={tagsInput}
                onChange={handleTagInputChange}
                onFocus={() => {
                  if (tagSuggestions.length > 0) setShowTagSuggestions(true);
                }}
                placeholder="technique, débutant, compétition"
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              
              {/* Suggestions de tags */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagSuggestionClick(tag)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Tags existants */}
              {availableTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Tags disponibles :</span>
                  {availableTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const currentTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
                        if (!currentTags.includes(tag)) {
                          setTagsInput(tagsInput ? `${tagsInput}, ${tag}` : tag);
                        }
                      }}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-gray-100"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Contenu */}
        {currentStep === 'content' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Rédigez le contenu de votre article en Markdown. Utilisez la barre d'outils pour insérer du formatage.</span>
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

            {/* Tabs Edit/Preview */}
            <div className="flex items-center gap-2 border-b dark:border-gray-700">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'edit'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Éditer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'preview'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <EyeIcon className="w-4 h-4 inline mr-1" />
                Prévisualisation
              </button>
            </div>

            {activeTab === 'edit' ? (
              <div className="space-y-4">
                {/* Barre d'outils Markdown */}
                <div className="border dark:border-gray-700 border-b-0 rounded-t-xl bg-gray-50 dark:bg-gray-800/50 p-2 flex flex-wrap items-center gap-1">
                  {/* Formatage de texte */}
                  <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('**', '**', 'texte en gras')}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold text-gray-900 dark:text-gray-100"
                      title="Gras (Ctrl+B)"
                    >
                      <span className="text-sm">B</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('*', '*', 'texte en italique')}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors italic text-gray-900 dark:text-gray-100"
                      title="Italique (Ctrl+I)"
                    >
                      <span className="text-sm">I</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('`', '`', 'code')}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-mono text-xs text-gray-900 dark:text-gray-100"
                      title="Code inline"
                    >
                      &lt;/&gt;
                    </button>
                  </div>

                  {/* Titres */}
                  <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => insertMarkdownBlock('# ', false, true)}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-bold text-gray-900 dark:text-gray-100"
                      title="Titre 1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownBlock('## ', false, true)}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-semibold text-gray-900 dark:text-gray-100"
                      title="Titre 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownBlock('### ', false, true)}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs text-gray-900 dark:text-gray-100"
                      title="Titre 3"
                    >
                      H3
                    </button>
                  </div>

                  {/* Listes */}
                  <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => insertMarkdownBlock('- ', false, true)}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      title="Liste à puces"
                    >
                      <ListBulletIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownBlock('1. ', false, true)}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      title="Liste numérotée"
                    >
                      <span className="text-xs font-mono">1.</span>
                    </button>
                  </div>

                  {/* Autres éléments */}
                  <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2 mr-2">
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('URL du lien:', 'https://');
                        const text = prompt('Texte du lien:', 'lien');
                        if (url && text) {
                          insertMarkdown(`[${text}](`, ')', url);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      title="Lien"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('URL de l\'image:', 'https://');
                        const alt = prompt('Texte alternatif:', '');
                        if (url) {
                          insertMarkdownBlock(`![${alt || ''}](${url})`, true, true);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      title="Image"
                    >
                      <PhotoIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownBlock('> ', false, true)}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      title="Citation"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdownBlock('---', true, true)}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      title="Ligne horizontale"
                    >
                      <Bars3Icon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Aide */}
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const help = `# Guide Markdown

## Formatage
- **Gras** : **texte**
- *Italique* : *texte*
- \`Code\` : \`code\`

## Titres
# Titre 1
## Titre 2
### Titre 3

## Listes
- Liste à puces
- Item 2

1. Liste numérotée
2. Item 2

## Liens et Images
[Texte du lien](https://url.com)
![Alt texte](https://url-image.com)

## Citation
> Citation

## Ligne horizontale
---`;
                        insertMarkdownBlock(help, true, true);
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Insérer un guide Markdown"
                    >
                      📖 Guide
                    </button>
                  </div>
                </div>

                {/* Zone d'édition */}
                <div className="border dark:border-gray-700 rounded-b-xl overflow-hidden bg-white dark:bg-gray-900">
                  <textarea
                    ref={textareaRef}
                    id="content"
                    name="content"
                    value={formData.content || ''}
                    onChange={handleChange}
                    required
                    rows={20}
                    className={`w-full px-4 py-3 border-0 focus:ring-2 focus:ring-primary focus:outline-none resize-none font-mono text-sm leading-relaxed bg-transparent text-gray-900 dark:text-gray-100 ${
                      showValidationErrors && validationErrors.content
                        ? 'focus:ring-red-500'
                        : ''
                    }`}
                    placeholder="# Titre de l'article&#10;&#10;## Sous-titre&#10;&#10;Contenu en **markdown**..."
                    style={{ minHeight: '400px' }}
                  />
                </div>
                {showValidationErrors && validationErrors.content && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.content}
                  </p>
                )}

                {/* Informations et actions */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>💡 Astuce : Utilisez ## pour créer des sections (table des matières)</span>
                    {formData.content && (
                      <span className="text-gray-400 dark:text-gray-500">
                        {formData.content.split('\n').length} lignes
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-1 text-primary hover:underline"
                    disabled={!formData.content}
                  >
                    <EyeIcon className="w-4 h-4" />
                    Afficher la prévisualisation
                  </button>
                </div>
              </div>
            ) : (
              /* Mode Prévisualisation */
              <div className="space-y-6">
                {formData.content ? (
                  <>
                    {/* Prévisualisation de la table des matières */}
                    <div className="border dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <ListBulletIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold dark:text-gray-300">Table des matières</h3>
                      </div>
                      <BlogTableOfContents content={previewHtml} />
                    </div>

                    {/* Prévisualisation du contenu */}
                    <div className="border dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900">
                      <div className="prose dark:prose-invert max-w-none">
                        <BlogArticleContent content={previewHtml} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>Aucun contenu à prévisualiser</p>
                    <p className="text-sm mt-2">Rédigez votre article dans l'onglet "Éditer"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 5: SEO */}
        {currentStep === 'seo' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <Search className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Optimisez votre article pour les moteurs de recherche. Ces champs sont optionnels mais recommandés pour améliorer le référencement.</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="seo_title" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Titre SEO (optionnel)
                </label>
                <input
                  type="text"
                  id="seo_title"
                  name="seo_title"
                  value={formData.seo_title || ''}
                  onChange={handleChange}
                  maxLength={60}
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Titre optimisé pour les moteurs de recherche"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(formData.seo_title || '').length}/60 caractères
                  {!formData.seo_title && ' (le titre sera utilisé par défaut)'}
                </p>
              </div>

              <div>
                <label htmlFor="seo_description" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Description SEO (optionnel)
                </label>
                <textarea
                  id="seo_description"
                  name="seo_description"
                  value={formData.seo_description || ''}
                  onChange={handleChange}
                  rows={2}
                  maxLength={160}
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Description optimisée pour les moteurs de recherche"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(formData.seo_description || '').length}/160 caractères
                  {!formData.seo_description && ' (l\'extrait sera utilisé par défaut)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Publication */}
        {currentStep === 'publish' && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <ToggleLeft className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Définissez le statut de publication de votre article et la date de publication si nécessaire.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Statut */}
              <div>
                <label htmlFor="status" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              {/* Date de publication */}
              <div>
                <label htmlFor="published_at" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  Date de publication
                </label>
                <input
                  type="date"
                  id="published_at"
                  name="published_at"
                  value={formData.published_at || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                {formData.status === 'published' && !formData.published_at && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    La date actuelle sera utilisée si non spécifiée
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Modal de prévisualisation plein écran */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPreviewModal(false);
          }
        }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
              <div className="flex items-center gap-3">
                <EyeIcon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold dark:text-gray-100">Prévisualisation de l'article</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Fermer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {formData.content ? (
                <div className="max-w-4xl mx-auto">
                  {/* En-tête de l'article */}
                  {formData.title && (
                    <div className="mb-8">
                      <h1 className="text-4xl md:text-5xl font-bold dark:text-gray-100 mb-4">
                        {formData.title}
                      </h1>
                      {formData.excerpt && (
                        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                          {formData.excerpt}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Image de couverture */}
                  {formData.cover_image_url && (
                    <div className="mb-8 rounded-xl overflow-hidden">
                      <img
                        src={formData.cover_image_url}
                        alt={formData.title || 'Image de couverture'}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Table des matières */}
                  {formData.content && (
                    <div className="mb-8 border dark:border-gray-800 rounded-xl p-6 bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2 mb-4">
                        <ListBulletIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold dark:text-gray-300">Table des matières</h3>
                      </div>
                      <BlogTableOfContents content={previewHtml} />
                    </div>
                  )}

                  {/* Contenu de l'article */}
                  <div className="prose dark:prose-invert prose-lg max-w-none">
                    <BlogArticleContent content={previewHtml} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <EyeSlashIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Aucun contenu à prévisualiser</p>
                    <p className="text-sm mt-2">Rédigez votre article pour voir la prévisualisation</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {readingTime > 0 && (
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4" />
                    <span>{readingTime} min de lecture</span>
                  </div>
                )}
                {formData.content && (
                  <div className="flex items-center gap-1.5">
                    <span>
                      {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} mots
                    </span>
                  </div>
                )}
              </div>
              <Button variant="primary" onClick={() => setShowPreviewModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
