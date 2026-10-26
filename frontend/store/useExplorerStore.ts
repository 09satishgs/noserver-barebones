import { create } from 'zustand';
import { api } from '../../backend/client/apiClient';
import {
  TableSummary,
  ColumnInfo,
} from '../../backend/repositories/explorer.repository';
import { useOverlayStore } from './useOverlayStore';

interface ExplorerState {
  tables: TableSummary[];
  activeTable: string | null;
  schema: ColumnInfo[];
  columns: string[];
  rows: Record<string, any>[];
  total: number;
  limit: number;
  offset: number;
  search: string;
  isLoadingTables: boolean;
  isLoadingData: boolean;

  fetchTables: () => Promise<void>;
  selectTable: (tableName: string) => Promise<void>;
  setSearch: (search: string) => void;
  setPage: (newOffset: number) => void;
  refreshData: () => Promise<void>;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  tables: [],
  activeTable: null,
  schema: [],
  columns: [],
  rows: [],
  total: 0,
  limit: 25,
  offset: 0,
  search: '',
  isLoadingTables: false,
  isLoadingData: false,

  fetchTables: async () => {
    set({ isLoadingTables: true });
    try {
      const res = await api.explorer.getTables();
      if (res.status === 200 && res.data) {
        set({ tables: res.data, isLoadingTables: false });
        // Automatically select first table if none selected
        if (!get().activeTable && res.data.length > 0) {
          get().selectTable(res.data[0].name);
        }
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      set({ isLoadingTables: false });
      useOverlayStore.getState().addToast(e.message, 'error');
    }
  },

  selectTable: async (tableName: string) => {
    set({
      activeTable: tableName,
      offset: 0,
      search: '',
      isLoadingData: true,
    });

    try {
      const [schemaRes, dataRes] = await Promise.all([
        api.explorer.getSchema(tableName),
        api.explorer.getData(tableName, { limit: get().limit, offset: 0, search: '' }),
      ]);

      if (schemaRes.status === 200 && schemaRes.data && dataRes.status === 200 && dataRes.data) {
        set({
          schema: schemaRes.data,
          columns: dataRes.data.columns,
          rows: dataRes.data.rows,
          total: dataRes.data.total,
          isLoadingData: false,
        });
      } else {
        throw new Error(schemaRes.error || dataRes.error);
      }
    } catch (e: any) {
      set({ isLoadingData: false });
      useOverlayStore.getState().addToast(e.message, 'error');
    }
  },

  setSearch: (search: string) => {
    set({ search, offset: 0 });
    get().refreshData();
  },

  setPage: (newOffset: number) => {
    set({ offset: newOffset });
    get().refreshData();
  },

  refreshData: async () => {
    const { activeTable, limit, offset, search } = get();
    if (!activeTable) return;

    set({ isLoadingData: true });
    try {
      const res = await api.explorer.getData(activeTable, { limit, offset, search });
      if (res.status === 200 && res.data) {
        set({
          columns: res.data.columns,
          rows: res.data.rows,
          total: res.data.total,
          isLoadingData: false,
        });
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      set({ isLoadingData: false });
      useOverlayStore.getState().addToast(e.message, 'error');
    }
  },
}));
