// Non-generic Character Store (commented out for barebones reference; use in forked apps):
/*
import { create } from 'zustand';
import { api } from '../../backend/client/apiClient';
import { Character } from '../../backend/types/models';
import { useOverlayStore } from './useOverlayStore';

interface CharacterState {
  characters: Character[];
  total: number;
  isLoading: boolean;
  searchQuery: string;
  selectedCharacter: Character | null;
  isLoadingDetail: boolean;
  setSearchQuery: (query: string) => void;
  fetchCharacters: (search?: string) => Promise<void>;
  fetchCharacterById: (id: string) => Promise<Character | null>;
  clearSelected: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  total: 0,
  isLoading: false,
  searchQuery: '',
  selectedCharacter: null,
  isLoadingDetail: false,

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchCharacters(query);
  },

  fetchCharacters: async (search?: string) => {
    set({ isLoading: true });
    try {
      const res = await (api as any).characters.list({ search });
      if (res.status === 200 && res.data) {
        set({
          characters: res.data.items,
          total: res.data.total,
          isLoading: false,
        });
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      set({ isLoading: false });
      useOverlayStore.getState().addToast(e.message, 'error');
    }
  },

  fetchCharacterById: async (id: string) => {
    set({ isLoadingDetail: true });
    try {
      const res = await (api as any).characters.getById(id);
      if (res.status === 200 && res.data) {
        set({ selectedCharacter: res.data, isLoadingDetail: false });
        return res.data;
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      set({ isLoadingDetail: false });
      useOverlayStore.getState().addToast(e.message, 'error');
      return null;
    }
  },

  clearSelected: () => {
    set({ selectedCharacter: null });
  },
}));
*/
export {};
