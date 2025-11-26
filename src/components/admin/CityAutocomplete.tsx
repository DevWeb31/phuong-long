/**
 * CityAutocomplete Component
 * 
 * Sélecteur éditable avec auto-complétion pour les villes françaises
 * Auto-complète le code postal quand une ville est sélectionnée
 * 
 * @version 1.0
 * @date 2025-11-06
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, XCircle } from 'lucide-react';

interface City {
  nom: string;
  codePostal: string;
  codeCommune: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string, postalCode: string) => void;
  onPostalCodeChange?: (postalCode: string) => void;
  error?: string;
  required?: boolean;
}

export function CityAutocomplete({ 
  value, 
  onChange, 
  onPostalCodeChange,
  error,
  required = false 
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Synchroniser la valeur externe avec l'input interne
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Rechercher les villes via l'API Géo
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Utiliser l'API Géo du gouvernement français avec codesPostaux au lieu de codePostal
      const response = await fetch(
        `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codesPostaux,code&limit=10`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Grouper par nom de ville et combiner les codes postaux
        const cityMap = new Map<string, City>();
        
        data.forEach((commune: any) => {
          const nom = commune.nom;
          
          // L'API retourne codesPostaux (au pluriel) comme array
          let codesPostaux: string[] = [];
          if (Array.isArray(commune.codesPostaux) && commune.codesPostaux.length > 0) {
            codesPostaux = commune.codesPostaux.filter((cp: any) => cp != null && cp !== '');
          } else if (commune.codePostal) {
            // Fallback sur codePostal si codesPostaux n'existe pas
            if (Array.isArray(commune.codePostal)) {
              codesPostaux = commune.codePostal.filter((cp: any) => cp != null && cp !== '');
            } else if (commune.codePostal != null && commune.codePostal !== '') {
              codesPostaux = [commune.codePostal];
            }
          }
          
          // Si pas de code postal, on crée quand même une entrée
          if (codesPostaux.length === 0) {
            const key = `${nom}-no-cp`;
            if (!cityMap.has(key)) {
              cityMap.set(key, {
                nom,
                codePostal: '',
                codeCommune: commune.code || '',
              });
            }
          } else {
            codesPostaux.forEach((cp: any) => {
              const cpStr = String(cp).trim();
              if (cpStr) {
                const key = `${nom}-${cpStr}`;
                if (!cityMap.has(key)) {
                  const city: City = {
                    nom,
                    codePostal: cpStr,
                    codeCommune: commune.code || '',
                  };
                  cityMap.set(key, city);
                }
              }
            });
          }
        });

        const suggestionsList = Array.from(cityMap.values());
        setSuggestions(suggestionsList);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de villes:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer le changement de l'input avec debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);

    // Debounce pour éviter trop de requêtes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (newValue.length >= 2) {
        searchCities(newValue);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  // Sélectionner une ville
  const selectCity = (city: City) => {
    setInputValue(city.nom);
    setShowSuggestions(false);
    setSuggestions([]);
    const postalCode = city.codePostal ? String(city.codePostal).trim() : '';
    // Appeler onChange avec la ville et le code postal
    onChange(city.nom, postalCode);
    // Appeler aussi onPostalCodeChange si fourni (même si vide)
    if (onPostalCodeChange) {
      onPostalCodeChange(postalCode);
    }
    inputRef.current?.blur();
  };

  // Gérer les touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const city = suggestions[selectedIndex];
          if (city) {
            selectCity(city);
          }
        } else if (suggestions.length === 1) {
          const city = suggestions[0];
          if (city) {
            selectCity(city);
          }
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id="city"
          name="city"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          required={required}
          className={`w-full px-4 py-2.5 pl-10 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
            error
              ? 'border-red-500 dark:border-red-500 focus:ring-red-500'
              : 'dark:border-gray-700'
          }`}
          placeholder="Rechercher une ville..."
          autoComplete="off"
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin" />
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto scrollbar-thin"
        >
          {suggestions.map((city, index) => (
            <button
              key={`${city.nom}-${city.codePostal}-${city.codeCommune}`}
              type="button"
              onClick={() => selectCity(city)}
              className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                index === selectedIndex
                  ? 'bg-gray-50 dark:bg-gray-700'
                  : ''
              } ${
                index === 0 ? 'rounded-t-xl' : ''
              } ${
                index === suggestions.length - 1 ? 'rounded-b-xl' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {city.nom}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {city.codePostal}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

