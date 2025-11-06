/**
 * ProductFormModal Component
 * 
 * Modal pour créer/éditer un produit
 * 
 * @version 1.0
 * @date 2025-11-05
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from '@/components/common';

export interface Product {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  price_cents: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
  active: boolean;
  created_at?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<Product>) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

export function ProductFormModal({ isOpen, onClose, onSubmit, product, isLoading = false }: ProductFormModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    price_cents: 0,
    category: 'equipement',
    image_url: '',
    stock_quantity: 0,
    active: true,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        price_cents: 0,
        category: 'equipement',
        image_url: '',
        stock_quantity: 0,
        active: true,
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value ? parseInt(value) : 0) : value,
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({ ...prev, name, slug }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Modifier le Produit' : 'Nouveau Produit'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {product ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Nom du produit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="equipement">Équipement</option>
              <option value="vetements">Vêtements</option>
              <option value="protection">Protections</option>
              <option value="accessoires">Accessoires</option>
              <option value="armes">Armes Traditionnelles</option>
            </select>
          </div>

          <div>
            <label htmlFor="price_cents" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Prix (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price_cents"
              name="price_cents"
              value={formData.price_cents ? formData.price_cents / 100 : 0}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, price_cents: parseFloat(e.target.value) * 100 }));
              }}
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="image_url" className="block text-sm font-semibold dark:text-gray-300 mb-2">
              Image (URL)
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 border dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="w-5 h-5 text-primary border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-primary"
          />
          <label htmlFor="active" className="text-sm font-semibold dark:text-gray-300">
            Produit actif
          </label>
        </div>
      </form>
    </Modal>
  );
}

