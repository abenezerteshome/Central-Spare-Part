// src/hooks/useToast.ts
import { useToastContext } from '../context/ToastContext';

export const useToast = () => {
  const context = useToastContext(); // ✅ Must be inside functional component
  return {
    success: (msg: string) => context.addToast('success', msg),
    error: (msg: string) => context.addToast('error', msg),
    info: (msg: string) => context.addToast('info', msg),
  };
};
