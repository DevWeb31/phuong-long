/**
 * DataTable Component
 * 
 * Table de données réutilisable avec tri, filtrage, pagination et actions
 * 
 * @version 1.0
 * @date 2025-11-05 01:00
 */

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  show?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  canEdit?: (row: T) => boolean;
  canDelete?: (row: T) => boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  minItemsPerPage?: number;
  emptyMessage?: string;
  newItemLabel?: string;
  newItemHref?: string;
  onNewItemClick?: () => void;
  newItemDisabled?: boolean;
  newItemTooltip?: string;
  isLoading?: boolean;
  defaultSortColumn?: keyof T | string;
  defaultSortDirection?: 'asc' | 'desc';
  selectable?: boolean;
  onBulkDelete?: (ids: (string | number)[]) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  actions,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  itemsPerPage = 8,
  minItemsPerPage,
  emptyMessage = 'Aucune donnée disponible',
  newItemLabel,
  newItemHref,
  onNewItemClick,
  newItemDisabled = false,
  newItemTooltip,
  isLoading = false,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  selectable = false,
  onBulkDelete,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCardMode, setIsCardMode] = useState(false);
  const [calculatedItemsPerPage, setCalculatedItemsPerPage] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // Détecter la largeur de la fenêtre et calculer le nombre d'items par page
  useEffect(() => {
    const handleResize = () => {
      setIsCardMode(window.innerWidth < 1050);
      
      // Si minItemsPerPage est spécifié, utiliser cette valeur
      if (minItemsPerPage) {
        setCalculatedItemsPerPage(minItemsPerPage);
      } else if (window.innerWidth >= 1050) {
        // Calculer dynamiquement pour desktop
        setCalculatedItemsPerPage(itemsPerPage);
      } else {
        setCalculatedItemsPerPage(null);
      }
    };

    // Initialiser au montage
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [minItemsPerPage, itemsPerPage]);

  // Filtrer les données
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        const value = row[column.key as keyof T];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Trier les données
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination - utiliser calculatedItemsPerPage si disponible
  const effectiveItemsPerPage = calculatedItemsPerPage !== null ? calculatedItemsPerPage : itemsPerPage;
  const totalPages = sortedData.length > 0 ? Math.ceil(sortedData.length / effectiveItemsPerPage) : 0;
  
  // Réinitialiser à la page 1 quand on filtre ou trie
  const prevSearchTermRef = useRef(searchTerm);
  const prevSortRef = useRef({ column: sortColumn, direction: sortDirection });
  
  useEffect(() => {
    const searchChanged = prevSearchTermRef.current !== searchTerm;
    const sortChanged = prevSortRef.current.column !== sortColumn || prevSortRef.current.direction !== sortDirection;
    
    if (searchChanged || sortChanged) {
      setCurrentPage(1);
      prevSearchTermRef.current = searchTerm;
      prevSortRef.current = { column: sortColumn, direction: sortDirection };
    }
  }, [searchTerm, sortColumn, sortDirection]);
  
  // S'assurer que currentPage ne dépasse pas totalPages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);
  
  const safeCurrentPage = totalPages > 0 ? Math.min(Math.max(1, currentPage), totalPages) : 1;
  const startIndex = (safeCurrentPage - 1) * effectiveItemsPerPage;
  const endIndex = startIndex + effectiveItemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column.key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    if (targetPage !== currentPage && totalPages > 0) {
      setCurrentPage(targetPage);
    }
  };

  // Actions par défaut
  const defaultActions: DataTableAction<T>[] = [];
  
  // Supprimer l'action "Voir" (onView n'est plus utilisé)

  if (onEdit) {
    defaultActions.push({
      label: 'Modifier',
      icon: <PencilIcon className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'primary',
      show: canEdit || (() => true), // Utiliser canEdit si fourni, sinon toujours afficher
    });
  }

  if (onDelete) {
    defaultActions.push({
      label: 'Supprimer',
      icon: <TrashIcon className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'danger',
      show: canDelete || (() => true), // Utiliser canDelete si fourni, sinon toujours afficher
    });
  }

  const allActions = [...defaultActions, ...(actions || [])];

  // Gestion de la sélection
  const toggleSelection = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((row) => row.id)));
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  // Réinitialiser la sélection quand on change de page ou filtre
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, searchTerm, sortColumn, sortDirection]);

  const allSelected = paginatedData.length > 0 && selectedIds.size === paginatedData.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < paginatedData.length;

  // Mettre à jour l'état indeterminate de la checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between flex-shrink-0">
        {/* Search */}
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Bulk Delete Button */}
          {selectable && selectedIds.size > 0 && onBulkDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Supprimer ({selectedIds.size})
            </Button>
          )}

          {/* New Item Button */}
          {newItemLabel && (newItemHref || onNewItemClick) && (
            <>
              {newItemHref ? (
                <Link href={newItemHref}>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    disabled={newItemDisabled}
                    title={newItemTooltip}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {newItemLabel}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={onNewItemClick}
                  disabled={newItemDisabled}
                  title={newItemTooltip}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  {newItemLabel}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Table - Desktop */}
      <div className={isCardMode ? 'hidden' : 'block border dark:border-gray-800 rounded-lg overflow-hidden'}>
        <div 
          className="overflow-x-auto"
        >
          <table className="min-w-full divide-y dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
              <tr>
                {selectable && (
                  <th className="px-4 py-2 w-12">
                    <input
                      type="checkbox"
                      ref={selectAllCheckboxRef}
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </th>
                )}
                {columns.map((column) => {
                  const alignClass = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
                  return (
                    <th
                      key={String(column.key)}
                      className={`px-4 py-2 ${alignClass} text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider ${
                        column.sortable ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                      } ${column.width || ''}`}
                      onClick={() => column.sortable && handleSort(column)}
                    >
                      <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                        {column.label}
                        {column.sortable && (
                          <div className="flex flex-col">
                            <ChevronUpIcon
                              className={`w-3 h-3 ${
                                sortColumn === column.key && sortDirection === 'asc'
                                  ? 'text-primary'
                                  : 'text-gray-400'
                              }`}
                            />
                            <ChevronDownIcon
                              className={`w-3 h-3 -mt-1 ${
                                sortColumn === column.key && sortDirection === 'desc'
                                  ? 'text-primary'
                                  : 'text-gray-400'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
                {allActions.length > 0 && (
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider w-24 min-w-[96px] max-w-[120px]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y dark:divide-gray-800">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (allActions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)}
                  className="px-6 py-8 text-center dark:text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Chargement...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (allActions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)}
                  className="px-6 py-8 text-center dark:text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {selectable && (
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelection(row.id)}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = row[column.key as keyof T];
                    const alignClass = column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left';
                    return (
                      <td key={String(column.key)} className={`px-4 py-2 whitespace-nowrap ${alignClass}`}>
                        {column.render ? column.render(value, row) : String(value)}
                      </td>
                    );
                  })}
                  {allActions.length > 0 && (
                    <td className="px-4 py-2 whitespace-nowrap text-right font-medium w-24 min-w-[96px] max-w-[120px]">
                      <div className="flex items-center justify-end gap-2">
                        {allActions.map((action, actionIndex) => {
                          if (action.show && !action.show(row)) return null;

                          return (
                            <div key={actionIndex} className="relative group">
                              <button
                                onClick={() => action.onClick(row)}
                                className={`inline-flex items-center justify-center p-2 rounded text-xs font-medium transition-colors ${
                                  action.variant === 'danger'
                                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : action.variant === 'secondary'
                                    ? 'text-gray-600 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    : 'text-primary hover:bg-primary/5 dark:hover:bg-primary/10'
                                }`}
                                title={action.label}
                              >
                                {action.icon}
                              </button>
                              {/* Tooltip */}
                              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                {action.label}
                                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-800"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Cards - Mobile/Tablette */}
      <div className={isCardMode ? 'flex-1 min-h-0 overflow-y-auto space-y-4' : 'hidden'}>
        {isLoading ? (
          <div className="text-center py-12 border dark:border-gray-800 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="dark:text-gray-500">Chargement...</span>
            </div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center py-12 border dark:border-gray-800 rounded-lg dark:text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((row) => {
            // Trouver la colonne image (cover_image_url ou colonne contenant "image")
            const imageColumn = columns.find(
              (col) => String(col.key).includes('image') || String(col.key) === 'cover_image_url'
            );
            const imageUrl = imageColumn ? (row[imageColumn.key as keyof T] as string | undefined) : undefined;
            
            // Colonnes à afficher (exclure la colonne image)
            const displayColumns = columns.filter(
              (col) => !String(col.key).includes('image') && String(col.key) !== 'cover_image_url'
            );

            return (
              <div
                key={row.id}
                className={`relative rounded-lg overflow-hidden border dark:border-gray-800 ${
                  imageUrl ? 'min-h-[200px]' : 'bg-white dark:bg-gray-900'
                }`}
                style={
                  imageUrl
                    ? {
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }
                    : undefined
                }
              >
                {/* Overlay pour améliorer la lisibilité */}
                {imageUrl && (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95"></div>
                )}
                
                {/* Contenu de la carte */}
                <div className={`relative p-4 space-y-3 ${imageUrl ? 'text-white' : ''}`}>
                  {displayColumns.map((column) => {
                    const value = row[column.key as keyof T];
                    return (
                      <div 
                        key={String(column.key)} 
                        className={`flex items-start gap-3 ${
                          imageUrl ? 'bg-black/90 backdrop-blur-md rounded-lg p-3 shadow-lg' : ''
                        }`}
                      >
                        <div className={`text-xs font-bold uppercase tracking-wider min-w-[80px] ${
                          imageUrl 
                            ? 'text-white drop-shadow-lg' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {column.label}:
                        </div>
                        <div className={`flex-1 text-sm font-bold ${
                          imageUrl 
                            ? (String(column.key) === 'name' || String(column.key) === 'title')
                              ? 'text-cyan-300 drop-shadow-lg [&>*]:!text-cyan-300'
                              : 'text-white drop-shadow-lg'
                            : 'dark:text-gray-100'
                        }`}>
                          {column.render ? column.render(value, row) : String(value || '-')}
                        </div>
                      </div>
                    );
                  })}
                  {allActions.length > 0 && (
                    <div className={`flex items-center justify-end gap-2 pt-3 ${
                      imageUrl 
                        ? 'border-t border-white/20' 
                        : 'border-t dark:border-gray-800'
                    }`}>
                      {allActions.map((action, actionIndex) => {
                        if (action.show && !action.show(row)) return null;

                        return (
                          <div key={actionIndex} className="relative group">
                            <button
                              onClick={() => action.onClick(row)}
                              className={`inline-flex items-center justify-center p-2 rounded text-xs font-medium transition-colors ${
                                action.variant === 'danger'
                                  ? imageUrl
                                    ? 'text-red-300 hover:bg-red-500/30'
                                    : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : action.variant === 'secondary'
                                  ? imageUrl
                                    ? 'text-white/90 hover:bg-white/20'
                                    : 'text-gray-600 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  : imageUrl
                                  ? 'text-white hover:bg-white/20'
                                  : 'text-primary hover:bg-primary/5 dark:hover:bg-primary/10'
                              }`}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                            {/* Tooltip */}
                            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                              {action.label}
                              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-800"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
            <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> sur{' '}
            <span className="font-medium">{sortedData.length}</span> résultat{sortedData.length > 1 ? 's' : ''}
            {totalPages > 1 && (
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                (Page {safeCurrentPage} sur {totalPages})
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-300"
              >
                Précédent
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (safeCurrentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (safeCurrentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = safeCurrentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={safeCurrentPage === pageNumber ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className={`min-w-[40px] ${safeCurrentPage !== pageNumber ? 'text-gray-900 dark:text-gray-300' : ''}`}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-300"
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

