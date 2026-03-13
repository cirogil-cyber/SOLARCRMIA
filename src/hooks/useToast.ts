import { useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/Toast';
import { v4 as uuidv4 } from 'uuid';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast(message, 'success', 3000), [addToast]);
  const error = useCallback((message: string) => addToast(message, 'error', 4000), [addToast]);
  const info = useCallback((message: string) => addToast(message, 'info', 3000), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  };
};
