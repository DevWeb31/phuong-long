/**
 * Admin Page Content Editor
 * 
 * Éditeur de contenu pour une page spécifique
 * 
 * @version 1.0
 * @date 2025-01-XX
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { IconPicker } from '@/components/admin/IconPicker';
import { HoursEditor } from '@/components/admin/HoursEditor';
import { AddressEditor } from '@/components/admin/AddressEditor';
import { PhoneInput } from '@/components/admin/PhoneInput';
import { TimelineEditor } from '@/components/admin/TimelineEditor';
import { ValuesEditor } from '@/components/admin/ValuesEditor';
import { getFeatureIcon } from '@/lib/icons/feature-icons';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';

interface PageContent {
  id: string;
  page_slug: string;
  section_key: string;
  content_type: 'text' | 'html' | 'json';
  content: string;
  label: string | null;
  description: string | null;
  display_order: number;
}

const pageNames: Record<string, string> = {
  'home': 'Accueil',
  'contact': 'Contact',
  'notre-histoire': 'Notre Histoire',
};

export default function PageContentEditor() {
  const params = useParams();
  const router = useRouter();
  const pageSlug = params.pageSlug as string;
  const [content, setContent] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/pages/${pageSlug}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du contenu');
        }

        const data = await response.json();
        setContent(data);
        
        // Initialiser editedContent avec les valeurs actuelles
        const initial: Record<string, string> = {};
        data.forEach((item: PageContent) => {
          initial[item.section_key] = item.content || '';
        });
        
        // Pour "notre-histoire", s'assurer que timeline et values existent
        if (pageSlug === 'notre-histoire') {
          if (!initial['timeline']) {
            initial['timeline'] = '[]';
          }
          if (!initial['values']) {
            initial['values'] = '[]';
          }
        }
        
        setEditedContent(initial);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    if (pageSlug) {
      fetchContent();
    }
  }, [pageSlug]);

  // Auto-fermer la snackbar après 4 secondes
  useEffect(() => {
    if (!snackbar) {
      return;
    }
    const timer = setTimeout(() => setSnackbar(null), 4000);
    return () => clearTimeout(timer);
  }, [snackbar]);

  const handleContentChange = (sectionKey: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [sectionKey]: value,
    }));
  };

  // Fonction de validation d'email
  const isValidEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return true; // Email vide est valide (optionnel)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Valider le format email si le champ email est modifié
      if (pageSlug === 'contact' && editedContent['email']) {
        if (!isValidEmail(editedContent['email'])) {
          setError('Le format de l\'email n\'est pas valide. Format attendu : exemple@domaine.com');
          setSaving(false);
          return;
        }
      }

      // Sauvegarder chaque section modifiée
      const savePromises = Object.entries(editedContent).map(([sectionKey, contentValue]) => {
        const originalItem = content.find(item => item.section_key === sectionKey);
        if (!originalItem || originalItem.content === contentValue) {
          return Promise.resolve(); // Pas de changement
        }

        // Déterminer le content_type selon la section
        let contentType = originalItem.content_type;
        if (sectionKey === 'hours' || sectionKey === 'address' || sectionKey === 'timeline' || sectionKey === 'values') {
          contentType = 'json';
        }

        return fetch('/api/admin/pages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_slug: pageSlug,
            section_key: sectionKey,
            content: contentValue,
            content_type: contentType,
          }),
        });
      });

      await Promise.all(savePromises);

      // Recharger le contenu
      const response = await fetch(`/api/admin/pages/${pageSlug}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
        
        // Réinitialiser editedContent
        const updated: Record<string, string> = {};
        data.forEach((item: PageContent) => {
          updated[item.section_key] = item.content;
        });
        setEditedContent(updated);
        
        // Afficher la snackbar de succès
        setSnackbar({ message: 'Contenu enregistré avec succès', type: 'success' });
      } else {
        setSnackbar({ message: 'Erreur lors de la sauvegarde. Merci de réessayer.', type: 'error' });
      }
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
      setSnackbar({ message: 'Erreur lors de la sauvegarde. Merci de réessayer.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(editedContent).some(key => {
    const originalItem = content.find(item => item.section_key === key);
    return originalItem && originalItem.content !== editedContent[key];
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && content.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <p className="text-red-800 dark:text-red-200 font-semibold">Erreur</p>
          <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/content')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {pageNames[pageSlug] || pageSlug}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Modifiez le contenu de cette page
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Content Editor */}
      <div className={
        pageSlug === 'home' 
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
          : pageSlug === 'contact'
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
          : 'space-y-6'
      }>
        {pageSlug === 'home' ? (
          <>
            {/* Section Valeurs - Titre et Sous-titre */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Section Valeurs</CardTitle>
                <CardDescription>Configuration de la section principale des valeurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre de la section
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({(editedContent['features_title'] || '').length} / 50 caractères)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editedContent['features_title'] || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, 50);
                      handleContentChange('features_title', newValue);
                    }}
                    maxLength={50}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Titre de la section..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sous-titre de la section
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({(editedContent['features_subtitle'] || '').length} / 80 caractères)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editedContent['features_subtitle'] || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, 80);
                      handleContentChange('features_subtitle', newValue);
                    }}
                    maxLength={80}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Sous-titre de la section..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Valeur 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {(() => {
                    const IconComponent = getFeatureIcon(editedContent['feature_1_icon'] || 'Bolt');
                    return <IconComponent className="w-5 h-5 text-primary" />;
                  })()}
                  Valeur 1
                </CardTitle>
                <CardDescription>Première carte de valeur affichée sur la page d'accueil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icône
                  </label>
                  <IconPicker
                    value={editedContent['feature_1_icon'] || ''}
                    onChange={(newValue) => handleContentChange('feature_1_icon', newValue)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({(editedContent['feature_1_title'] || '').length} / 30 caractères)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editedContent['feature_1_title'] || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, 30);
                      handleContentChange('feature_1_title', newValue);
                    }}
                    maxLength={30}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Titre de la valeur..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={editedContent['feature_1_description'] || ''}
                    onChange={(newValue) => handleContentChange('feature_1_description', newValue)}
                    placeholder="Saisissez votre texte, sélectionnez-le et choisissez une couleur..."
                    rows={4}
                    maxLength={130}
                    showHelpText={false}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Valeur 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {(() => {
                    const IconComponent = getFeatureIcon(editedContent['feature_2_icon'] || 'Trophy');
                    return <IconComponent className="w-5 h-5 text-secondary" />;
                  })()}
                  Valeur 2
                </CardTitle>
                <CardDescription>Deuxième carte de valeur affichée sur la page d'accueil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icône
                  </label>
                  <IconPicker
                    value={editedContent['feature_2_icon'] || ''}
                    onChange={(newValue) => handleContentChange('feature_2_icon', newValue)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({(editedContent['feature_2_title'] || '').length} / 30 caractères)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editedContent['feature_2_title'] || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, 30);
                      handleContentChange('feature_2_title', newValue);
                    }}
                    maxLength={30}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Titre de la valeur..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={editedContent['feature_2_description'] || ''}
                    onChange={(newValue) => handleContentChange('feature_2_description', newValue)}
                    placeholder="Saisissez votre texte, sélectionnez-le et choisissez une couleur..."
                    rows={4}
                    maxLength={130}
                    showHelpText={false}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Valeur 3 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {(() => {
                    const IconComponent = getFeatureIcon(editedContent['feature_3_icon'] || 'Users');
                    return <IconComponent className="w-5 h-5 text-accent" />;
                  })()}
                  Valeur 3
                </CardTitle>
                <CardDescription>Troisième carte de valeur affichée sur la page d'accueil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icône
                  </label>
                  <IconPicker
                    value={editedContent['feature_3_icon'] || ''}
                    onChange={(newValue) => handleContentChange('feature_3_icon', newValue)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({(editedContent['feature_3_title'] || '').length} / 30 caractères)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editedContent['feature_3_title'] || ''}
                    onChange={(e) => {
                      const newValue = e.target.value.slice(0, 30);
                      handleContentChange('feature_3_title', newValue);
                    }}
                    maxLength={30}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Titre de la valeur..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={editedContent['feature_3_description'] || ''}
                    onChange={(newValue) => handleContentChange('feature_3_description', newValue)}
                    placeholder="Saisissez votre texte, sélectionnez-le et choisissez une couleur..."
                    rows={4}
                    maxLength={130}
                    showHelpText={false}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        ) : pageSlug === 'notre-histoire' ? (
          // Organisation spéciale pour "Notre Histoire"
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Titre Introduction */}
            {content.find(item => item.section_key === 'intro_title') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Titre introduction</CardTitle>
                  <CardDescription>Titre de la section d'introduction</CardDescription>
                </CardHeader>
                <CardContent>
                  <input
                    type="text"
                    value={editedContent['intro_title'] || ''}
                    onChange={(e) => handleContentChange('intro_title', e.target.value)}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Titre introduction..."
                  />
                </CardContent>
              </Card>
            )}

            {/* Texte Introduction */}
            {content.find(item => item.section_key === 'intro_text') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Texte introduction</CardTitle>
                  <CardDescription>Contenu de la section d'introduction</CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={editedContent['intro_text'] || ''}
                    onChange={(newValue) => handleContentChange('intro_text', newValue)}
                    placeholder="Saisissez votre texte, sélectionnez-le et choisissez une couleur..."
                    rows={6}
                  />
                </CardContent>
              </Card>
            )}

            {/* Section Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Timeline - Étapes de l'histoire</CardTitle>
                <CardDescription>Gérez les étapes de la timeline (maximum 10 étapes)</CardDescription>
              </CardHeader>
              <CardContent>
                <TimelineEditor
                  value={editedContent['timeline'] ?? content.find(item => item.section_key === 'timeline')?.content ?? '[]'}
                  onChange={(newValue) => {
                    // S'assurer que la section timeline existe dans editedContent
                    if (!editedContent['timeline'] && content.find(item => item.section_key === 'timeline')) {
                      handleContentChange('timeline', newValue);
                    } else {
                      handleContentChange('timeline', newValue);
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Section Valeurs Fondamentales */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Nos Valeurs Fondamentales</CardTitle>
                <CardDescription>Gérez les 3 valeurs fondamentales de l'association</CardDescription>
              </CardHeader>
              <CardContent>
                <ValuesEditor
                  value={editedContent['values'] ?? content.find(item => item.section_key === 'values')?.content ?? '[]'}
                  onChange={(newValue) => {
                    if (!editedContent['values'] && content.find(item => item.section_key === 'values')) {
                      handleContentChange('values', newValue);
                    } else {
                      handleContentChange('values', newValue);
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          // Pour les autres pages, garder l'affichage par section
          // Filtrer les sections non modifiables pour la page "contact"
          content
            .filter((item) => {
              if (pageSlug === 'contact') {
                // Exclure les sections non modifiables
                const excludedKeys = ['hero_title', 'hero_subtitle', 'form_title', 'form_description'];
                return !excludedKeys.includes(item.section_key);
              }
              return true;
            })
            .map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.label || item.section_key}</CardTitle>
                {item.description && (
                  <CardDescription>{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {item.section_key === 'hours' ? (
                  <HoursEditor
                    value={editedContent[item.section_key] || ''}
                    onChange={(newValue) => handleContentChange(item.section_key, newValue)}
                  />
                ) : item.section_key === 'timeline' ? (
                  <TimelineEditor
                    value={editedContent[item.section_key] || '[]'}
                    onChange={(newValue) => handleContentChange(item.section_key, newValue)}
                  />
                ) : item.section_key === 'address' ? (
                  <AddressEditor
                    value={editedContent[item.section_key] || ''}
                    onChange={(newValue) => handleContentChange(item.section_key, newValue)}
                  />
                ) : item.section_key === 'phone' ? (
                  <div>
                    <PhoneInput
                      value={editedContent[item.section_key] || ''}
                      onChange={(newValue) => handleContentChange(item.section_key, newValue)}
                      className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                ) : item.section_key === 'email' ? (
                  <div>
                    <input
                      type="email"
                      value={editedContent[item.section_key] || ''}
                      onChange={(e) => handleContentChange(item.section_key, e.target.value.slice(0, 100))}
                      maxLength={100}
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="contact@example.com"
                    />
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                      {(editedContent[item.section_key] || '').length} / 100 caractères
                    </div>
                  </div>
                ) : item.section_key.includes('_icon') ? (
                  <IconPicker
                    value={editedContent[item.section_key] || ''}
                    onChange={(newValue) => handleContentChange(item.section_key, newValue)}
                    label="Icône"
                  />
                ) : item.content_type === 'html' ? (
                  <RichTextEditor
                    value={editedContent[item.section_key] || ''}
                    onChange={(newValue) => handleContentChange(item.section_key, newValue)}
                    placeholder="Saisissez votre texte, sélectionnez-le et choisissez une couleur..."
                    rows={6}
                  />
                ) : (
                  <input
                    type="text"
                    value={editedContent[item.section_key] || ''}
                    onChange={(e) => handleContentChange(item.section_key, e.target.value)}
                    className="w-full px-4 py-2 border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Contenu..."
                  />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="flex items-center gap-2 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-6 py-3 h-auto"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="hidden sm:inline">Sauvegarde...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span className="hidden sm:inline">Enregistrer les modifications</span>
              <span className="sm:hidden">Enregistrer</span>
            </>
          )}
        </Button>
      </div>

      {/* Snackbar */}
      {snackbar && (
        <div
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg border
            flex items-center gap-3 text-sm font-medium z-50
            ${snackbar.type === 'success'
              ? 'bg-green-500 text-white border-green-600'
              : 'bg-red-500 text-white border-red-600'}
          `}
        >
          <span>{snackbar.message}</span>
          <button
            type="button"
            onClick={() => setSnackbar(null)}
            className="p-1 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

