import { useEffect, useState } from 'react';

/**
 * Hook to detect when component has mounted on client side
 * Useful for preventing hydration mismatches when accessing browser-only APIs
 */
export const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};

/**
 * Hook to safely access localStorage only on client side
 * Returns null during SSR to prevent hydration mismatches
 */
export const useLocalStorage = (key: string): string | null => {
  const [value, setValue] = useState<string | null>(null);
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (hasMounted && typeof window !== 'undefined' && localStorage) {
      setValue(localStorage.getItem(key));
    }
  }, [key, hasMounted]);

  return hasMounted ? value : null;
}; 