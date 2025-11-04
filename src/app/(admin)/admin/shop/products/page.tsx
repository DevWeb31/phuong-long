/**
 * Admin Shop Products Page - Gestion des produits
 * 
 * Page de gestion des produits de la boutique
 * 
 * @version 1.0
 * @date 2025-11-05 02:40
 */

'use client';

import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/admin';
import { Badge } from '@/components/common';

interface Product {
  id: string;
  name: string;
  category: string;
  price_cents: number;
  stock_quantity: number;
  active: boolean;
  created_at: string;
}

// Données de démonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Vo Phuc Traditionnel - Adulte',
    category: 'vetements',
    price_cents: 4500,
    stock_quantity: 25,
    active: true,
    created_at: '2024-01-10',
  },
  {
    id: '2',
    name: 'Gants de Combat Renforcés',
    category: 'protection',
    price_cents: 2900,
    stock_quantity: 15,
    active: true,
    created_at: '2024-02-15',
  },
  {
    id: '3',
    name: 'Ceinture Noire 1er Dan',
    category: 'equipement',
    price_cents: 1200,
    stock_quantity: 8,
    active: true,
    created_at: '2024-01-20',
  },
  {
    id: '4',
    name: 'Protège-tibias Pro',
    category: 'protection',
    price_cents: 3500,
    stock_quantity: 12,
    active: true,
    created_at: '2024-03-05',
  },
  {
    id: '5',
    name: 'Sac de Sport Brodé',
    category: 'accessoires',
    price_cents: 2800,
    stock_quantity: 20,
    active: true,
    created_at: '2024-02-28',
  },
  {
    id: '6',
    name: 'Nunchaku Bois',
    category: 'armes',
    price_cents: 1800,
    stock_quantity: 0,
    active: false,
    created_at: '2023-11-12',
  },
];

const categoryLabels: Record<string, string> = {
  equipement: 'Équipement',
  vetements: 'Vêtements',
  protection: 'Protections',
  accessoires: 'Accessoires',
  armes: 'Armes',
};

export default function AdminShopProductsPage() {
  const [products] = useState<Product[]>(mockProducts);

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Produit',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900">{value}</span>,
      width: 'min-w-[200px]',
    },
    {
      key: 'category',
      label: 'Catégorie',
      sortable: true,
      render: (value) => (
        <Badge variant="default" size="sm">
          {categoryLabels[value] || value}
        </Badge>
      ),
    },
    {
      key: 'price_cents',
      label: 'Prix',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900">
          {(value / 100).toFixed(2)} €
        </span>
      ),
    },
    {
      key: 'stock_quantity',
      label: 'Stock',
      sortable: true,
      render: (value) => {
        const variant = value === 0 ? 'danger' : value <= 10 ? 'warning' : 'success';
        return (
          <Badge variant={variant} size="sm">
            {value} en stock
          </Badge>
        );
      },
    },
    {
      key: 'active',
      label: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'success' : 'default'} size="sm">
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Créé le',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  const handleEdit = (product: Product) => {
    console.log('Edit product:', product);
    // TODO: Rediriger vers /admin/shop/products/[id]/edit
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      console.log('Delete product:', product);
      // TODO: Implémenter la suppression
    }
  };

  const handleView = (product: Product) => {
    console.log('View product:', product);
    // TODO: Rediriger vers /shop/[slug]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Produits</h1>
        <p className="text-gray-600">
          Gérez le catalogue, les stocks et les prix de la boutique
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        data={products}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Rechercher un produit..."
        newItemLabel="Nouveau Produit"
        newItemHref="/admin/shop/products/new"
        emptyMessage="Aucun produit trouvé"
      />
    </div>
  );
}

