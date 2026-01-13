import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearAll: () => set({ toasts: [] }),
}));

export function toast(
  type: ToastType,
  message: string,
  options?: { action?: Toast['action']; duration?: number }
): string {
  return useToastStore.getState().addToast({
    type,
    message,
    action: options?.action,
    duration: options?.duration ?? 5000,
  });
}

toast.success = (message: string, options?: { action?: Toast['action']; duration?: number }) =>
  toast('success', message, options);
toast.error = (message: string, options?: { action?: Toast['action']; duration?: number }) =>
  toast('error', message, options);
toast.warning = (message: string, options?: { action?: Toast['action']; duration?: number }) =>
  toast('warning', message, options);
toast.info = (message: string, options?: { action?: Toast['action']; duration?: number }) =>
  toast('info', message, options);
