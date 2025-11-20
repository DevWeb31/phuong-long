/**
 * Admin Shop Orders Page - Gestion des commandes
 * 
 * Page de gestion des commandes de la boutique
 * 
 * @version 1.0
 * @date 2025-11-05 02:45
 */

'use client';

import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin';
import { Badge } from '@/components/common';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  shipping_cents: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  items_count: number;
  created_at: string;
}

// Données de démonstration
const mockOrders: Order[] = [
  {
    id: '1',
    order_number: 'CMD-2025-001',
    customer_name: 'Jean Dupont',
    customer_email: 'jean.dupont@example.com',
    total_cents: 8900,
    shipping_cents: 500,
    status: 'delivered',
    items_count: 3,
    created_at: '2025-10-15T10:30:00',
  },
  {
    id: '2',
    order_number: 'CMD-2025-002',
    customer_name: 'Marie Martin',
    customer_email: 'marie.martin@example.com',
    total_cents: 5400,
    shipping_cents: 0,
    status: 'shipped',
    items_count: 2,
    created_at: '2025-10-20T14:45:00',
  },
  {
    id: '3',
    order_number: 'CMD-2025-003',
    customer_name: 'Pierre Leroy',
    customer_email: 'pierre.leroy@example.com',
    total_cents: 12300,
    shipping_cents: 0,
    status: 'paid',
    items_count: 5,
    created_at: '2025-10-25T09:15:00',
  },
  {
    id: '4',
    order_number: 'CMD-2025-004',
    customer_name: 'Sophie Dubois',
    customer_email: 'sophie.dubois@example.com',
    total_cents: 3200,
    shipping_cents: 500,
    status: 'pending',
    items_count: 1,
    created_at: '2025-11-01T16:20:00',
  },
  {
    id: '5',
    order_number: 'CMD-2025-005',
    customer_name: 'Thomas Bernard',
    customer_email: 'thomas.bernard@example.com',
    total_cents: 7800,
    shipping_cents: 0,
    status: 'delivered',
    items_count: 4,
    created_at: '2025-10-18T11:00:00',
  },
  {
    id: '6',
    order_number: 'CMD-2025-006',
    customer_name: 'Lucas Petit',
    customer_email: 'lucas.petit@example.com',
    total_cents: 2100,
    shipping_cents: 500,
    status: 'cancelled',
    items_count: 1,
    created_at: '2025-10-12T13:40:00',
  },
];

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const statusColors: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  paid: 'info',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'danger',
};

export default function AdminShopOrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);

  const columns: DataTableColumn<Order>[] = [
    {
      key: 'order_number',
      label: 'N° Commande',
      sortable: true,
      render: (value) => <span className="font-mono text-sm font-medium dark:text-gray-100">{value}</span>,
    },
    {
      key: 'customer_name',
      label: 'Client',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{value}</div>
          <div className="text-sm dark:text-gray-500">{row.customer_email}</div>
        </div>
      ),
      width: 'min-w-[200px]',
    },
    {
      key: 'items_count',
      label: 'Articles',
      sortable: true,
      render: (value) => (
        <Badge variant="default" size="sm">
          {value} article{value > 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      key: 'total_cents',
      label: 'Total',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {((value + row.shipping_cents) / 100).toFixed(2)} €
          </div>
          {row.shipping_cents > 0 && (
            <div className="text-xs dark:text-gray-500">
              dont {(row.shipping_cents / 100).toFixed(2)} € livraison
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={statusColors[value]} size="sm">
          {statusLabels[value]}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <div>
            <div className="text-sm dark:text-gray-100">
              {date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="text-xs dark:text-gray-500">
              {date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        );
      },
    },
  ];

  const handleEdit = (order: Order) => {
    console.log('Edit order:', order);
    // TODO: Ouvrir modal ou page détails commande
  };

  const handleView = (order: Order) => {
    console.log('View order:', order);
    // TODO: Ouvrir modal détails commande
  };

  return (
    <div className="space-y-6">

      {/* DataTable */}
      <DataTable
        data={orders}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        searchPlaceholder="Rechercher une commande..."
        emptyMessage="Aucune commande trouvée"
      />
    </div>
  );
}

