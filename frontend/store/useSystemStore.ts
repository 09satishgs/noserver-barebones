import { create } from 'zustand';
import { api } from '../../backend/client/apiClient';
import { SystemStatus } from '../../backend/types/models';
import { useOverlayStore } from './useOverlayStore';

export type SystemPhase = 'idle' | 'downloading' | 'extracting' | 'ready' | 'error' | 'no_remote_url';

interface SystemState {
  phase: SystemPhase;
  progressText: string;
  errorMessage: string | null;
  statusInfo: SystemStatus | null;
  isSyncing: boolean;
  isUploading: boolean;
  initApp: () => void;
  syncDatabase: (url?: string) => Promise<boolean>;
  uploadDatabase: (file: File) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set, get) => ({
  phase: 'idle',
  progressText: 'Initializing in-browser SQLite runtime...',
  errorMessage: null,
  statusInfo: null,
  isSyncing: false,
  isUploading: false,

  initApp: () => {
    // Listen to worker events
    api.onEvent((event) => {
      switch (event.event) {
        case 'DB_INIT_START':
          set({ phase: 'downloading', progressText: 'Connecting to remote database repository...' });
          break;
        case 'DB_DOWNLOADING':
          set({
            phase: 'downloading',
            progressText: event.data?.detail,
          });
          break;
        case 'DB_EXTRACTING':
          set({
            phase: 'extracting',
            progressText: event.data?.detail,
          });
          break;
        case 'DB_NO_REMOTE_URL':
          set({
            phase: 'no_remote_url',
            progressText: 'No remote database URL configured.',
          });
          break;
        case 'DB_READY':
          set({ phase: 'ready', progressText: 'Ready', errorMessage: null });
          get().refreshStatus();
          break;
        case 'DB_ERROR':
          set({
            phase: 'error',
            errorMessage: event.data?.error,
            progressText: 'Error occurred during database initialization',
          });
          break;
      }
    });
  },

  refreshStatus: async () => {
    try {
      const res = await api.system.getStatus();
      if (res.status === 200 && res.data) {
        set({ statusInfo: res.data });
      }
    } catch (e: any) {
      console.error('Failed to load system status:', e);
    }
  },

  syncDatabase: async (url?: string) => {
    const { addToast } = useOverlayStore.getState();
    set({ isSyncing: true });
    addToast('Starting database synchronization...', 'info');

    try {
      const res = await api.system.sync(url);
      if (res.status === 200 && res.data) {
        set({ statusInfo: res.data, isSyncing: false, phase: 'ready' });
        addToast('Database successfully synchronized and updated!', 'success');
        return true;
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      set({ isSyncing: false });
      addToast(e.message, 'error');
      return false;
    }
  },

  uploadDatabase: async (file: File) => {
    const { addToast } = useOverlayStore.getState();
    set({ isUploading: true });
    addToast(`Reading and uploading ${file.name}...`, 'info');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const res = await api.system.upload(arrayBuffer);
      if (res.status === 200 && res.data) {
        set({ statusInfo: res.data, isUploading: false, phase: 'ready' });
        addToast('Database successfully uploaded and mounted to OPFS!', 'success');
        return true;
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      set({ isUploading: false });
      addToast(e.message, 'error');
      return false;
    }
  },
}));
