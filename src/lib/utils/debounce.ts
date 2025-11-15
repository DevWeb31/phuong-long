/**
 * Debounce Utility
 * 
 * Retarde l'exécution d'une fonction jusqu'à ce qu'un certain temps
 * se soit écoulé depuis le dernier appel
 * 
 * @version 1.0
 * @date 2025-11-11
 */

/**
 * Crée une fonction debounced qui retarde l'invocation de func
 * jusqu'à ce que delay millisecondes se soient écoulées
 * 
 * @param func - La fonction à debouncer
 * @param delay - Le délai en millisecondes
 * @returns La fonction debouncée
 * 
 * @example
 * const debouncedSearch = debounce((value: string) => {
 *   console.log('Searching for:', value);
 * }, 500);
 * 
 * debouncedSearch('test'); // N'exécute pas immédiatement
 * debouncedSearch('test2'); // Annule le précédent, attend 500ms
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

