/**
 * BlogFormModal Component - Version améliorée
 * 
 * Modal pour créer/éditer un article de blog avec :
 * - Éditeur Markdown avec prévisualisation
 * - Calcul automatique du temps de lecture
 * - Gestion de la date de publication
 * - Tags avec autocomplete
 * - Champs SEO
 * - Prévisualisation de la table des matières
 * - Slug éditable
 * - Image de couverture avec prévisualisation
 * 
 * @version 2.0
 * @date 2025-11-11
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CalendarIcon,
  ClockIcon,
  TagIcon,
  LinkIcon,
  PhotoIcon,
  SparklesIcon,
  ListBulletIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
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
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
    setShowPreview(false);
    setActiveTab('edit');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, title, slug }));
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

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, slug }));
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

  // Fonction pour gérer l'upload d'image
  const handleImageFile = (file: File) => {
    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 5MB)');
      return;
    }
    
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }
    
    // Créer une URL temporaire pour prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ 
        ...prev, 
        cover_image_url: reader.result as string 
      }));
    };
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post ? 'Modifier l\'Article' : 'Nouvel Article'}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {readingTime > 0 && (
              <div className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                <span>{readingTime} min de lecture</span>
              </div>
            )}
            {formData.content && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs">
                  {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} mots
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
              {post ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="space-y-6">
            {/* Titre et Slug */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
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
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Titre de l'article"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Slug (URL)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleSlugChange}
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
                  placeholder="titre-de-l-article"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  /blog/{formData.slug || 'titre-de-l-article'}
                </p>
              </div>
            </div>

            {/* Statut et Date de publication */}
            <div className="grid md:grid-cols-2 gap-4">
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
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

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
                  className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {formData.status === 'published' && !formData.published_at && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    La date actuelle sera utilisée si non spécifiée
                  </p>
                )}
              </div>
            </div>

            {/* Image de couverture - Version améliorée */}
            <div>
              <label className="block text-sm font-semibold dark:text-gray-300 mb-2">
                <PhotoIcon className="w-4 h-4 inline mr-1" />
                Image de couverture
              </label>
              
              {/* Prévisualisation de l'image */}
              {formData.cover_image_url ? (
                <div className="mb-4">
                  <div className="relative group aspect-video rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <img
                      src={formData.cover_image_url}
                      alt="Aperçu de l'image de couverture"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                              <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="text-sm">Image invalide</p>
                            </div>
                          `;
                        }
                      }}
                    />
                    {/* Bouton supprimer */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cover_image_url: '' }))}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Supprimer l'image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                /* Zone de drop / Upload */
                <div className="mb-4">
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all bg-gray-50 dark:bg-gray-800/50 ${
                      isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-gray-300 dark:border-gray-700 hover:border-primary'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        handleImageFile(file);
                      } else {
                        alert('Veuillez déposer une image valide');
                      }
                    }}
                  >
                    <PhotoIcon className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                      isDragging ? 'text-primary' : 'text-gray-400 dark:text-gray-600'
                    }`} />
                    <p className={`text-sm mb-2 transition-colors ${
                      isDragging ? 'text-primary font-semibold' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {isDragging ? 'Déposez l\'image ici' : 'Glissez-déposez une image ou cliquez pour sélectionner'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                      Formats acceptés : JPG, PNG, WebP (max 5MB)
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <label className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Choisir un fichier
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageFile(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-gray-400 dark:text-gray-600 self-center">ou</span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Collez l\'URL de l\'image (ex: Unsplash, Cloudinary, etc.)');
                          if (url) {
                            setFormData(prev => ({ ...prev, cover_image_url: url }));
                          }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Utiliser une URL
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Champ URL (optionnel, pour édition manuelle) */}
              <div>
                <label htmlFor="cover_image_url" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Ou entrez directement l'URL de l'image
                </label>
                <input
                  type="url"
                  id="cover_image_url"
                  name="cover_image_url"
                  value={formData.cover_image_url || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  💡 Astuce : Vous pouvez utiliser des images depuis Unsplash, Cloudinary, ou tout autre service
                </p>
              </div>
            </div>

            {/* Extrait */}
            <div>
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
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="Résumé court de l'article (max 300 caractères)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(formData.excerpt || '').length}/300 caractères
              </p>
            </div>

            {/* Tags */}
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
                className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              
              {/* Suggestions de tags */}
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagSuggestionClick(tag)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
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
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Champs SEO */}
            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold dark:text-gray-300">Optimisation SEO</h3>
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
                    className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
                    className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Description optimisée pour les moteurs de recherche"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(formData.seo_description || '').length}/160 caractères
                    {!formData.seo_description && ' (l\'extrait sera utilisé par défaut)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu Markdown */}
            <div>
              <label htmlFor="content" className="block text-sm font-semibold dark:text-gray-300 mb-2">
                Contenu (Markdown) <span className="text-red-500">*</span>
              </label>
              
              {/* Barre d'outils Markdown */}
              <div className="border dark:border-gray-700 border-b-0 rounded-t-xl bg-gray-50 dark:bg-gray-800/50 p-2 flex flex-wrap items-center gap-1">
                {/* Formatage de texte */}
                <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2 mr-2">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**', 'texte en gras')}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold"
                    title="Gras (Ctrl+B)"
                  >
                    <span className="text-sm">B</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*', 'texte en italique')}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors italic"
                    title="Italique (Ctrl+I)"
                  >
                    <span className="text-sm">I</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('`', '`', 'code')}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-mono text-xs"
                    title="Code inline"
                  >
                    &lt;/&gt;
                  </button>
                </div>

                {/* Titres */}
                <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2 mr-2">
                  <button
                    type="button"
                    onClick={() => insertMarkdownBlock('# ', '', true)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-bold"
                    title="Titre 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownBlock('## ', '', true)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-semibold"
                    title="Titre 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownBlock('### ', '', true)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs"
                    title="Titre 3"
                  >
                    H3
                  </button>
                </div>

                {/* Listes */}
                <div className="flex items-center gap-1 border-r dark:border-gray-700 pr-2 mr-2">
                  <button
                    type="button"
                    onClick={() => insertMarkdownBlock('- ', '', true)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Liste à puces"
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownBlock('1. ', '', true)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Image"
                  >
                    <PhotoIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownBlock('> ', '', true)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Citation"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownBlock('---', true, true)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                  className="w-full px-4 py-3 border-0 focus:ring-2 focus:ring-primary focus:outline-none resize-none font-mono text-sm leading-relaxed bg-transparent text-gray-900 dark:text-gray-100"
                  placeholder="# Titre de l'article&#10;&#10;## Sous-titre&#10;&#10;Contenu en **markdown**..."
                  style={{ minHeight: '400px' }}
                />
              </div>

              {/* Informations et actions */}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
