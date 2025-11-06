/**
 * Admin Shop Products Page - Gestion des produits
 * 
 * Page de gestion des produits de la boutique
 * 
 * @version 1.0
 * @date 2025-11-05 02:40
 */

'use client';

import { useState, useEffect } from 'react';
import { DataTable, DataTableColumn, ConfirmModal } from '@/components/admin';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { Badge, Button } from '@/components/common';

interface Product {
  id: string;
  name: string;
  category: string;
  price_cents: number;
  stock_quantity: number;
  active: boolean;
  created_at: string;
  slug?: string;
}

const categoryLabels: Record<string, string> = {
  equipement: 'Équipement',
  vetements: 'Vêtements',
  protection: 'Protections',
  accessoires: 'Accessoires',
  armes: 'Armes',
};

export default function AdminShopProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Produit',
      sortable: true,
      render: (value) => <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>,
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
        <span className="font-semibold text-gray-900 dark:text-gray-100">
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
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleView = (product: Product) => {
    window.open(`/shop/${product.slug || product.id}`, '_blank');
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (productData: any) => {
    try {
      setIsSubmitting(true);
      
      if (selectedProduct) {
        const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      } else {
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Erreur lors de la création');
      }

      await loadProducts();
      setIsFormOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await loadProducts();
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-gray-100 mb-2">Gestion des Produits</h1>
          <p className="text-gray-600 dark:text-gray-500">
            Gérez le catalogue, les stocks et les prix de la boutique
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateNew}>
          ➕ Nouveau Produit
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 dark:border-gray-800"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-500">Chargement...</p>
        </div>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Rechercher un produit..."
          emptyMessage="Aucun produit trouvé"
        />
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSubmit}
        product={selectedProduct as any}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedProduct?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

