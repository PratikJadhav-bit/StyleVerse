import { useCallback } from 'react';

let toastFn = null;

export function registerToast(fn) { toastFn = fn; }

export function useToast() {
  const showToast = useCallback((message, type = 'info') => {
    if (toastFn) toastFn(message, type);
    else console.log(`[Toast] ${message}`);
  }, []);
  return { showToast };
}
