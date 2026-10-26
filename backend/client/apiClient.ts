import {
  ApiRequest,
  ApiResponse,
  MainToWorkerMessage,
  WorkerEventMessage,
  WorkerToMainMessage,
} from '../types/api';
import { SystemStatus } from '../types/models';
import {
  TableSummary,
  ColumnInfo,
  TableDataResult,
} from '../repositories/explorer.repository';

// Non-generic imports commented out:
// import { Character, CharacterListQuery } from '../types/models';

type EventListener = (event: WorkerEventMessage) => void;

class ApiClient {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    { resolve: (value: any) => void; reject: (reason: any) => void }
  >();
  private eventListeners: Set<EventListener> = new Set();
  private requestIdCounter = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined') return;

    this.worker = new Worker(new URL('../worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = (event: MessageEvent<WorkerToMainMessage>) => {
      const msg = event.data;

      if (msg.type === 'EVENT') {
        this.eventListeners.forEach((listener) => listener(msg));
        return;
      }

      if (msg.type === 'API_RESPONSE') {
        const pending = this.pendingRequests.get(msg.id);
        if (pending) {
          this.pendingRequests.delete(msg.id);
          pending.resolve(msg.payload);
        }
      }
    };

    this.worker.onerror = (err) => {
      console.error('Fatal Web Worker Error:', err);
      this.eventListeners.forEach((listener) =>
        listener({
          type: 'EVENT',
          event: 'DB_ERROR',
          data: { error: err.message },
        })
      );
    };
  }

  public onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  public async request<TData = any, TBody = any, TQuery = any>(
    request: ApiRequest<TBody, TQuery>
  ): Promise<ApiResponse<TData>> {
    if (!this.worker) {
      throw new Error('Web Worker is not initialized');
    }

    const id = `req_${++this.requestIdCounter}_${Date.now()}`;
    const message: MainToWorkerMessage = {
      id,
      type: 'API_REQUEST',
      payload: request,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker!.postMessage(message);
    });
  }

  // Non-generic character API helpers commented out for reference:
  /*
  public characters = {
    list: async (query?: CharacterListQuery) => {
      return this.request<{ items: Character[]; total: number }, undefined, CharacterListQuery>({
        method: 'GET',
        path: '/api/characters',
        query,
      });
    },
    getById: async (id: string) => {
      return this.request<Character>({
        method: 'GET',
        path: `/api/characters/${encodeURIComponent(id)}`,
      });
    },
  };
  */

  public explorer = {
    getTables: async () => {
      return this.request<TableSummary[]>({
        method: 'GET',
        path: '/api/explorer/tables',
      });
    },
    getSchema: async (tableName: string) => {
      return this.request<ColumnInfo[], undefined, { table: string }>({
        method: 'GET',
        path: '/api/explorer/schema',
        query: { table: tableName },
      });
    },
    getData: async (
      tableName: string,
      options?: { limit?: number; offset?: number; search?: string }
    ) => {
      return this.request<TableDataResult, undefined, { table: string; limit?: number; offset?: number; search?: string }>({
        method: 'GET',
        path: '/api/explorer/data',
        query: { table: tableName, ...options },
      });
    },
  };

  public system = {
    getStatus: async () => {
      return this.request<SystemStatus>({
        method: 'GET',
        path: '/api/system/status',
      });
    },
    sync: async (url?: string) => {
      return this.request<SystemStatus, { url?: string }>({
        method: 'POST',
        path: '/api/system/sync',
        body: { url },
      });
    },
    upload: async (buffer: Uint8Array | ArrayBuffer) => {
      return this.request<SystemStatus, { buffer: Uint8Array | ArrayBuffer }>({
        method: 'POST',
        path: '/api/system/upload',
        body: { buffer },
      });
    },
  };
}

export const api = new ApiClient();
