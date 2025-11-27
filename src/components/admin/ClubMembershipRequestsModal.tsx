/**
 * ClubMembershipRequestsModal Component
 * 
 * Modal pour afficher et gérer les demandes d'adhésion d'un club
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button, Card } from '@/components/common';
import { Loader2, CheckCircle2, XCircle, User, Mail, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MembershipRequest {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  requestedAt: string;
}

interface ClubMembershipRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string | null;
  clubName: string | null;
  onRequestUpdated?: () => void;
}

export function ClubMembershipRequestsModal({
  isOpen,
  onClose,
  clubId,
  clubName,
  onRequestUpdated,
}: ClubMembershipRequestsModalProps) {
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && clubId) {
      fetchRequests();
    } else {
      setRequests([]);
      setError(null);
    }
  }, [isOpen, clubId]);

  const fetchRequests = async () => {
    if (!clubId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/clubs/${clubId}/membership-requests`);
      
      if (!response.ok) {
        // Si la réponse n'est pas OK, essayer de parser le JSON pour obtenir le message d'erreur
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Si ce n'est pas du JSON, utiliser le message par défaut
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors du chargement des demandes');
      }

      setRequests(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingRequestId(requestId);

    try {
      const response = await fetch(`/api/admin/clubs/membership-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      // Retirer la demande de la liste
      setRequests(requests.filter(r => r.id !== requestId));

      // Notifier le parent pour rafraîchir les statistiques
      if (onRequestUpdated) {
        onRequestUpdated();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Demandes d'adhésion - ${clubName || 'Club'}`}
      size="lg"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchRequests}>
              Réessayer
            </Button>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Aucune demande en attente pour ce club
            </p>
          </div>
        ) : (
          <>
            {/* Version Desktop - Tableau */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Nom Prénom
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Adresse email
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Date de demande
                    </th>
                    <th className="text-right py-3.5 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {requests.map((request, index) => (
                    <tr
                      key={request.id}
                      className={cn(
                        "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                        index % 2 === 0 && "bg-white dark:bg-gray-900",
                        index % 2 === 1 && "bg-gray-50/50 dark:bg-gray-900/50"
                      )}
                    >
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {request.fullName}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {request.email}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(request.requestedAt)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAction(request.id, 'approve')}
                            isLoading={processingRequestId === request.id}
                            disabled={processingRequestId !== null}
                            className="flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Accepter
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleAction(request.id, 'reject')}
                            isLoading={processingRequestId === request.id}
                            disabled={processingRequestId !== null}
                            className="flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            Refuser
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Version Mobile - Cards */}
            <div className="md:hidden space-y-3">
              {requests.map((request) => (
                <Card
                  key={request.id}
                  variant="bordered"
                  padding="md"
                  className="border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30 transition-colors"
                >
                  <div className="space-y-4">
                    {/* Header avec nom */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary dark:text-primary-light" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {request.fullName}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="space-y-2 pl-13">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                          {request.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatDate(request.requestedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction(request.id, 'approve')}
                        isLoading={processingRequestId === request.id}
                        disabled={processingRequestId !== null}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accepter
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleAction(request.id, 'reject')}
                        isLoading={processingRequestId === request.id}
                        disabled={processingRequestId !== null}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

