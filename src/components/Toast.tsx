import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const getStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        icon: 'text-emerald-600',
      };
    case 'error':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
      };
    case 'info':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
      };
  }
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const styles = getStyles(toast.type);

  useEffect(() => {
    if (toast.duration) {
      const timeout = setTimeout(onRemove, toast.duration);
      return () => clearTimeout(timeout);
    }
  }, [toast.duration, onRemove]);

  const Icon = toast.type === 'success' ? CheckCircle : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${styles.bg} ${styles.border}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${styles.icon}`} />
      <p className={`text-sm font-medium ${styles.text}`}>{toast.message}</p>
      <button
        onClick={onRemove}
        className={`ml-2 hover:opacity-70 transition-opacity ${styles.icon}`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-auto">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
