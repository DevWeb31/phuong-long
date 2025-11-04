/**
 * Types Index - Phuong Long Vo Dao
 * 
 * Export centralisé de tous les types du projet
 * 
 * @version 1.0
 * @date 2025-11-04 20:30
 */

// Re-export all database types
export * from './database';

// Additional UI types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ToastOptions {
  title?: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

