import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour retarder l'exécution d'une valeur (ex: pour la recherche).
 * Permet de ne pas déclencher une requête à chaque frappe de clavier.
 * 
 * @param value La valeur à debouncer
 * @param delay Le délai en millisecondes (ex: 500)
 * @returns La valeur debouncée
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Met à jour debouncedValue après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annule le timeout si la valeur change avant la fin du délai (ou au démontage)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
