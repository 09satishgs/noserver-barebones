import { create } from 'zustand';
import { ReactNode } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

export interface ModalConfig {
  title?: string;
  content: ReactNode;
  onClose?: () => void;
}

interface OverlayState {
  toasts: ToastItem[];
  modal: ModalConfig | null;
  addToast: (message: string, type?: ToastType, durationMs?: number) => void;
  removeToast: (id: string) => void;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  toasts: [],
  modal: null,

  addToast: (message: string, type: ToastType = 'info', durationMs: number = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, durationMs);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  openModal: (config: ModalConfig) => {
    set({ modal: config });
  },

  closeModal: () => {
    set((state) => {
      state.modal?.onClose?.();
      return { modal: null };
    });
  },
}));
