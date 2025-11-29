/**
 * Data Page - Mes Données (RGPD)
 * 
 * Page pour gérer les données personnelles : export et suppression
 * Conforme RGPD Articles 15, 17, 20
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/common';
import { Download, Trash2, AlertTriangle, Shield, FileJson, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function DataPage() {
  const { user, loading } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/users/me/export');
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      // Télécharger le fichier JSON
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rgpd-export-${user?.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({
        type: 'success',
        text: 'Vos données ont été exportées avec succès. Le fichier JSON a été téléchargé.',
      });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({
        type: 'error',
        text: 'Une erreur est survenue lors de l\'export de vos données. Veuillez réessayer.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      setMessage({
        type: 'success',
        text: 'Votre demande de suppression de compte a été enregistrée. Vous allez être déconnecté...',
      });

      // Rediriger vers la page d'accueil après 2 secondes
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression de votre compte.',
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">
          Mes Données Personnelles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos données personnelles conformément au RGPD
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/50'
            : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${
            message.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Export Data Card */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Export de vos Données</CardTitle>
              <CardDescription>
                Téléchargez toutes vos données personnelles au format JSON (Droit d'accès RGPD - Art. 15)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous pouvez demander l'export de toutes vos données personnelles stockées sur notre plateforme. 
              Le fichier JSON contiendra :
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li>Vos informations de profil</li>
              <li>Vos consentements RGPD</li>
              <li>Vos commentaires et publications</li>
              <li>Vos favoris</li>
              <li>Vos inscriptions aux événements</li>
              <li>Vos commandes (si applicable)</li>
              <li>Vos logs d'activité</li>
            </ul>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Export en cours...
                  </>
                ) : (
                  <>
                    <FileJson className="w-4 h-4" />
                    Exporter mes données
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rights Information */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Vos Droits RGPD</CardTitle>
              <CardDescription>
                Informations sur vos droits concernant vos données personnelles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Droit d'accès (Art. 15)</strong> : Vous pouvez demander quelles données nous détenons sur vous</li>
              <li><strong>Droit de rectification (Art. 16)</strong> : Vous pouvez corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement (Art. 17)</strong> : Vous pouvez demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité (Art. 20)</strong> : Vous pouvez recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition (Art. 21)</strong> : Vous pouvez vous opposer au traitement de vos données</li>
            </ul>
            <p className="pt-2">
              Pour plus d'informations, consultez notre{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Politique de Confidentialité
              </Link>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card variant="bordered" className="border-red-200 dark:border-red-800/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-red-900 dark:text-red-100">Supprimer mon Compte</CardTitle>
              <CardDescription>
                Demander la suppression définitive de votre compte et de vos données personnelles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-semibold mb-2">⚠️ Attention : Cette action est irréversible</p>
                  <p className="mb-2">La suppression de votre compte entraînera :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>La suppression de votre profil utilisateur</li>
                    <li>L'anonymisation de vos commentaires et publications</li>
                    <li>La suppression de vos favoris et inscriptions aux événements</li>
                    <li>La conservation des données de commandes pendant 10 ans (obligation légale comptable)</li>
                    <li>La suppression définitive après une période de conservation de 6 mois (délai légal)</li>
                  </ul>
                </div>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer mon compte
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800/50"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Suppression en cours...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Confirmer la suppression
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

